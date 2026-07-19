import nextEnv from "@next/env";
import { createWorker } from "tesseract.js";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

const imagePath = process.argv[2];
const apiKey = process.env.DEEPSEEK_API_KEY;
const model = process.env.DEEPSEEK_TEXT_MODEL ?? "deepseek-v4-flash";

if (!imagePath) {
  throw new Error("Usage: npm.cmd run verify:ocr-deepseek -- <image-path>");
}

const worker = await createWorker("eng");

try {
  const result = await worker.recognize(imagePath);
  const extractedText = result.data.text.trim();

  if (extractedText.length < 20) {
    throw new Error("OCR returned too little readable text for acceptance.");
  }

  if (!apiKey) {
    console.log(
      JSON.stringify({
        accepted: false,
        deepseekAccepted: false,
        ocrAccepted: true,
        ocrCharacters: extractedText.length,
        reason: "DEEPSEEK_API_KEY is not configured in .env.local.",
      }),
    );
    process.exitCode = 2;
  } else {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content:
            "Return raw JSON only with documentType, category, confidence, amount, extractedText, summary. Do not use markdown.",
        },
        { role: "user", content: `OCR text:\n${extractedText}` },
      ],
      stream: false,
    }),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(payload?.error?.message ?? "DeepSeek request failed.");
    }

    const raw = payload?.choices?.[0]?.message?.content;

    if (typeof raw !== "string") {
      throw new Error("DeepSeek did not return analysis text.");
    }

    const analysis = JSON.parse(raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, ""));
    const requiredFields = [
      "documentType",
      "category",
      "confidence",
      "amount",
      "extractedText",
      "summary",
    ];
    const missingFields = requiredFields.filter((field) => !(field in analysis));

    if (missingFields.length) {
      throw new Error(`DeepSeek analysis is missing: ${missingFields.join(", ")}`);
    }

    console.log(
      JSON.stringify({
        accepted: true,
        model,
        ocrCharacters: extractedText.length,
        analysisFields: requiredFields,
      }),
    );
  }
} finally {
  await worker.terminate();
}
