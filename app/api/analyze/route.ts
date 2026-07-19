const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_BUCKET =
  process.env.NEXT_PUBLIC_SUPABASE_BUCKET ?? "archive-uploads";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_VISION_MODEL = process.env.OPENAI_VISION_MODEL ?? "gpt-5.4-mini";
const AI_ANALYSIS_PROVIDER = process.env.AI_ANALYSIS_PROVIDER ?? "openai";
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_TEXT_MODEL = process.env.DEEPSEEK_TEXT_MODEL ?? "deepseek-v4-flash";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

type ArchiveRow = {
  id: string;
  user_id: string;
  file_name: string;
  file_path: string | null;
  file_size: number | null;
};

type VisionAnalysis = {
  documentType: string;
  category: string;
  confidence: number;
  amount: string;
  extractedText: string;
  summary: string;
};

type OpenAIResponse = {
  error?: { message?: string };
  output?: Array<{
    type?: string;
    content?: Array<{ type?: string; text?: string; refusal?: string }>;
  }>;
};

type DeepSeekResponse = {
  choices?: Array<{
    message?: { content?: string | null; refusal?: string | null };
  }>;
  error?: { message?: string };
};

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization");

  return authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : null;
}

function getSupabaseHeaders(accessToken: string, extra: HeadersInit = {}) {
  if (!SUPABASE_ANON_KEY) {
    throw new Error("Supabase anon key is not configured on the server.");
  }

  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${accessToken}`,
    ...extra,
  };
}

function getSupabaseUrl(path: string) {
  if (!SUPABASE_URL) {
    throw new Error("Supabase URL is not configured on the server.");
  }

  return `${SUPABASE_URL}${path}`;
}

function encodeStoragePath(path: string) {
  return path.split("/").map(encodeURIComponent).join("/");
}

function getOpenAIOutputText(payload: OpenAIResponse) {
  for (const item of payload.output ?? []) {
    for (const content of item.content ?? []) {
      if (content.type === "output_text" && content.text) {
        return content.text;
      }

      if (content.type === "refusal" && content.refusal) {
        throw new Error(`The model refused this image: ${content.refusal}`);
      }
    }
  }

  throw new Error("The vision model returned no structured analysis.");
}

function getDeepSeekOutputText(payload: DeepSeekResponse) {
  const message = payload.choices?.[0]?.message;

  if (message?.refusal) {
    throw new Error(`The DeepSeek model refused this OCR text: ${message.refusal}`);
  }

  if (typeof message?.content !== "string" || !message.content.trim()) {
    throw new Error("DeepSeek returned no structured analysis.");
  }

  return message.content.trim();
}

function parseJsonObject(value: string) {
  const withoutFence = value
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  return JSON.parse(withoutFence) as unknown;
}

function getAnalysisProvider() {
  if (AI_ANALYSIS_PROVIDER === "openai" || AI_ANALYSIS_PROVIDER === "deepseek") {
    return AI_ANALYSIS_PROVIDER;
  }

  throw new Error(
    "AI_ANALYSIS_PROVIDER must be either 'openai' or 'deepseek'.",
  );
}

function normalizeAnalysis(value: unknown): VisionAnalysis {
  if (!value || typeof value !== "object") {
    throw new Error("The vision model returned an invalid analysis object.");
  }

  const analysis = value as Partial<VisionAnalysis>;

  if (
    typeof analysis.documentType !== "string" ||
    typeof analysis.category !== "string" ||
    typeof analysis.confidence !== "number" ||
    typeof analysis.amount !== "string" ||
    typeof analysis.extractedText !== "string" ||
    typeof analysis.summary !== "string"
  ) {
    throw new Error("The vision model response is missing required fields.");
  }

  return {
    amount: analysis.amount.slice(0, 80),
    category: analysis.category.slice(0, 120),
    confidence: Math.max(0, Math.min(100, Math.round(analysis.confidence))),
    documentType: analysis.documentType.slice(0, 120),
    extractedText: analysis.extractedText.slice(0, 20000),
    summary: analysis.summary.slice(0, 2000),
  };
}

async function extractTextWithOcr(imageBytes: ArrayBuffer) {
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("eng");

  try {
    const result = await worker.recognize(Buffer.from(imageBytes));
    const extractedText = result.data.text.trim();

    if (!extractedText) {
      throw new Error("OCR could not read any text from this image.");
    }

    return extractedText.slice(0, 20000);
  } finally {
    await worker.terminate();
  }
}

async function analyzeOcrTextWithDeepSeek(extractedText: string) {
  if (!DEEPSEEK_API_KEY) {
    throw new Error("DEEPSEEK_API_KEY is not configured on the server.");
  }

  const response = await fetch("https://api.deepseek.com/chat/completions", {
    body: JSON.stringify({
      model: DEEPSEEK_TEXT_MODEL,
      messages: [
        {
          role: "system",
          content: [
            "You turn OCR text from uploaded business documents into a searchable archive record.",
            "Return raw JSON only, with no markdown or code fence.",
            "Use exactly these fields: documentType, category, confidence, amount, extractedText, summary.",
            "confidence must be an integer from 0 to 100.",
            "If a field is unknown, use an empty string rather than inventing it.",
            "Keep extractedText faithful to the supplied OCR text.",
          ].join(" "),
        },
        {
          role: "user",
          content: `OCR text:\n${extractedText}`,
        },
      ],
      stream: false,
    }),
    headers: {
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  const payload = (await response.json().catch(() => ({}))) as DeepSeekResponse;

  if (!response.ok) {
    throw new Error(payload.error?.message ?? "DeepSeek text analysis failed.");
  }

  const analysis = normalizeAnalysis(parseJsonObject(getDeepSeekOutputText(payload)));

  return { ...analysis, extractedText };
}

async function updateArchive(
  archiveId: string,
  accessToken: string,
  values: Record<string, unknown>,
) {
  const response = await fetch(
    getSupabaseUrl(`/rest/v1/archives?id=eq.${encodeURIComponent(archiveId)}`),
    {
      body: JSON.stringify({ ...values, updated_at: new Date().toISOString() }),
      headers: getSupabaseHeaders(accessToken, {
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      }),
      method: "PATCH",
    },
  );

  if (!response.ok) {
    throw new Error(`Supabase update failed: ${await response.text()}`);
  }
}

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const accessToken = getBearerToken(request);

  if (!accessToken) {
    return jsonError("Sign in before requesting an analysis.", 401);
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return jsonError("Supabase server configuration is incomplete.", 503);
  }

  let archiveId = "";

  try {
    const body = (await request.json()) as { archiveId?: unknown };

    if (typeof body.archiveId !== "string" || !/^[0-9a-f-]{36}$/i.test(body.archiveId)) {
      return jsonError("A valid archiveId is required.", 400);
    }

    archiveId = body.archiveId;
    const analysisProvider = getAnalysisProvider();
    const archiveResponse = await fetch(
      getSupabaseUrl(
        `/rest/v1/archives?id=eq.${encodeURIComponent(archiveId)}&select=id,user_id,file_name,file_path,file_size&limit=1`,
      ),
      { headers: getSupabaseHeaders(accessToken) },
    );

    if (!archiveResponse.ok) {
      return jsonError("Unable to read this archive record.", archiveResponse.status);
    }

    const rows = (await archiveResponse.json()) as ArchiveRow[];
    const archive = rows[0];

    if (!archive?.file_path) {
      return jsonError("Archive record or stored image was not found.", 404);
    }

    if (analysisProvider === "openai" && !OPENAI_API_KEY) {
      return jsonError("OPENAI_API_KEY is not configured on the server.", 503);
    }

    if (analysisProvider === "deepseek" && !DEEPSEEK_API_KEY) {
      return jsonError("DEEPSEEK_API_KEY is not configured on the server.", 503);
    }

    if (archive.file_size && archive.file_size > MAX_IMAGE_BYTES) {
      return jsonError("The stored image exceeds the 10 MB analysis limit.", 413);
    }

    await updateArchive(archiveId, accessToken, {
      analysis_error: null,
      analysis_status: "processing",
    });

    const storageResponse = await fetch(
      getSupabaseUrl(
        `/storage/v1/object/authenticated/${encodeURIComponent(SUPABASE_BUCKET)}/${encodeStoragePath(archive.file_path)}`,
      ),
      { headers: getSupabaseHeaders(accessToken) },
    );

    if (!storageResponse.ok) {
      throw new Error(`Private image download failed: ${await storageResponse.text()}`);
    }

    const contentType = (storageResponse.headers.get("content-type") ?? "")
      .split(";")[0]
      .toLowerCase();

    if (!ALLOWED_IMAGE_TYPES.has(contentType)) {
      throw new Error("Only JPEG, PNG, and WebP images can be analyzed.");
    }

    const imageBytes = await storageResponse.arrayBuffer();

    if (imageBytes.byteLength > MAX_IMAGE_BYTES) {
      throw new Error("The downloaded image exceeds the 10 MB analysis limit.");
    }

    let analysis: VisionAnalysis;

    if (analysisProvider === "deepseek") {
      const extractedText = await extractTextWithOcr(imageBytes);
      analysis = await analyzeOcrTextWithDeepSeek(extractedText);
    } else {
      const imageDataUrl = `data:${contentType};base64,${Buffer.from(imageBytes).toString("base64")}`;
      const openAIResponse = await fetch("https://api.openai.com/v1/responses", {
        body: JSON.stringify({
          input: [
            {
              role: "user",
              content: [
                {
                  type: "input_text",
                  text: [
                    "Analyze this uploaded archive image.",
                    "Extract all readable text faithfully, including Chinese or English text.",
                    "Classify the document and give a short searchable summary.",
                    "For amount, include the currency when visible; otherwise return an empty string.",
                    "Confidence is an integer from 0 to 100 for the overall extraction.",
                  ].join(" "),
                },
                { type: "input_image", image_url: imageDataUrl, detail: "high" },
              ],
            },
          ],
          model: OPENAI_VISION_MODEL,
          store: false,
          text: {
            format: {
              name: "archive_image_analysis",
              strict: true,
              type: "json_schema",
              schema: {
                type: "object",
                additionalProperties: false,
                properties: {
                  documentType: { type: "string" },
                  category: { type: "string" },
                  confidence: { type: "integer", minimum: 0, maximum: 100 },
                  amount: { type: "string" },
                  extractedText: { type: "string" },
                  summary: { type: "string" },
                },
                required: [
                  "documentType",
                  "category",
                  "confidence",
                  "amount",
                  "extractedText",
                  "summary",
                ],
              },
            },
          },
        }),
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const openAIPayload = (await openAIResponse.json().catch(() => ({}))) as OpenAIResponse;

      if (!openAIResponse.ok) {
        throw new Error(openAIPayload.error?.message ?? "OpenAI vision analysis failed.");
      }

      analysis = normalizeAnalysis(parseJsonObject(getOpenAIOutputText(openAIPayload)));
    }

    await updateArchive(archiveId, accessToken, {
      amount: analysis.amount || "$--.--",
      analysis_error: null,
      analysis_json: analysis,
      analysis_status: "completed",
      analysis_summary: analysis.summary,
      analyzed_at: new Date().toISOString(),
      category: analysis.category,
      confidence: analysis.confidence,
      document_type: analysis.documentType,
      extracted_text: analysis.extractedText,
      status: "Analyzed",
    });

    return Response.json({ analysis });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Image analysis failed.";

    if (archiveId) {
      await updateArchive(archiveId, accessToken, {
        analysis_error: message.slice(0, 1000),
        analysis_status: "failed",
        status: "Needs review",
      }).catch(() => undefined);
    }

    return jsonError(message, 500);
  }
}
