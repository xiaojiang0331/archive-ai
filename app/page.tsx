"use client";

import {
  ChangeEvent,
  DragEvent,
  FormEvent,
  KeyboardEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

type ArchiveStatus = "Analyzed" | "Needs review" | "Archived";
type AnalysisStatus = "pending" | "processing" | "completed" | "failed";

type ArchiveRecord = {
  id: string;
  name: string;
  status: ArchiveStatus;
  documentType: string;
  category: string;
  confidence: number;
  amount: string;
  uploadedAt: string;
  filePath?: string;
  analysisStatus?: AnalysisStatus;
  summary?: string;
  extractedText?: string;
};

type ArchiveEditDraft = {
  documentType: string;
  category: string;
  amount: string;
  summary: string;
  extractedText: string;
};

type AnalysisResult = {
  documentType: string;
  category: string;
  confidence: number;
  fileSize: string;
  nextAction: string;
  amount: string;
  extractedText: string;
  summary: string;
};

type ServerAnalysis = Omit<AnalysisResult, "fileSize" | "nextAction">;

type AnalysisApiResponse = {
  analysis?: ServerAnalysis;
  error?: string;
};

type SupabaseArchiveRow = {
  id: string;
  user_id: string;
  file_name: string;
  file_path: string | null;
  file_size: number | null;
  document_type: string;
  category: string;
  confidence: number;
  status: ArchiveStatus;
  amount: string;
  created_at: string;
  analysis_status?: AnalysisStatus;
  analysis_summary?: string | null;
  extracted_text?: string | null;
};

type SupabaseUser = {
  id: string;
  email?: string;
};

type AuthSession = {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: SupabaseUser;
};

type AuthResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  expires_at?: number;
  user?: SupabaseUser;
  error?: string;
  error_description?: string;
  msg?: string;
};

type Language = "en" | "zh";

const uiCopy = {
  en: {
    product: "Archive AI",
    tagline: "Upload, analyze, archive",
    signup: "Sign up",
    signin: "Sign in",
    signout: "Sign out",
    language: "中文",
    current: "Current face",
    next: "Next face",
    previous: "Previous face",
    account: "Account",
    identity: "Identity gate",
    status: "Backend status",
    upload: "Upload window",
    analysis: "Analysis window",
    archive: "Archive window",
    principles: "Principles",
    privateMode: "Private Supabase mode",
    signInRequired: "Supabase sign-in required",
    localMode: "Local fallback mode",
    archiveRecords: "Archive records displayed",
    loaded: "Loaded",
    loading: "Loading",
    refreshReads: "Refresh reads from",
    supabase: "Supabase",
    localStorage: "localStorage",
    addEnv: "Add .env.local with Supabase URL, anon key, and bucket name, then restart the dev server to switch this app to backend mode.",
    dragTitle: "Drag image into the workflow",
    input: "Input",
    release: "Release to upload",
    drop: "Drop file here",
    choose: "Choose image",
    saving: "Saving...",
    preview: "Preview",
    waiting: "Waiting for an image",
    review: "Review",
    mockAnalysis: "Local mock analysis",
    documentType: "Document type",
    category: "Category",
    fileSize: "File size",
    confidence: "Confidence",
    nextAction: "Next action",
    uploadFirst: "Upload an image first. This panel will show a local simulated analysis before we connect real OCR or AI extraction.",
    reviewQueue: "Review queue",
    latest: "Latest record",
    noneYet: "None yet",
    refresh: "Refresh from backend",
    reset: "Reset local archive",
    principleText: "React state is the live page memory. Supabase Storage is the file warehouse. Supabase Database is the archive ledger. Refreshing the page reads that ledger again.",
    accountTitle: "Your private archive",
    accountText: "Each account gets its own database rows and Storage folder. Refreshing the page restores this session.",
    email: "Email",
    password: "Password",
    working: "Working...",
    register: "Register",
    needAccount: "Need an account? Register",
    alreadyRegistered: "Already registered? Sign in",
    guide: "Use the arrows or keyboard to rotate the six faces.",
  },
  zh: {
    product: "Archive AI",
    tagline: "上传、分析、归档",
    signup: "注册",
    signin: "登录",
    signout: "退出",
    language: "EN",
    current: "当前面",
    next: "下一面",
    previous: "上一面",
    account: "账户",
    identity: "身份验证",
    status: "后端状态",
    upload: "上传窗口",
    analysis: "分析窗口",
    archive: "归档窗口",
    principles: "原理",
    privateMode: "Supabase 私有模式",
    signInRequired: "需要登录 Supabase",
    localMode: "本地回退模式",
    archiveRecords: "当前显示的归档记录",
    loaded: "已加载",
    loading: "加载中",
    refreshReads: "刷新读取来源：",
    supabase: "Supabase",
    localStorage: "localStorage",
    addEnv: "请在 .env.local 中加入 Supabase URL、anon key 和 bucket 名称，然后重启开发服务器以切换到后端模式。",
    dragTitle: "把图片拖进工作流",
    input: "输入",
    release: "松开鼠标开始上传",
    drop: "将文件拖到这里",
    choose: "选择图片",
    saving: "保存中...",
    preview: "预览",
    waiting: "等待图片",
    review: "复核",
    mockAnalysis: "本地模拟分析",
    documentType: "文档类型",
    category: "分类",
    fileSize: "文件大小",
    confidence: "置信度",
    nextAction: "下一步",
    uploadFirst: "请先上传图片。本面板会先展示本地模拟分析，之后再接入真实 OCR 或 AI 提取。",
    reviewQueue: "复核队列",
    latest: "最新记录",
    noneYet: "暂无",
    refresh: "从后端刷新",
    reset: "重置本地归档",
    principleText: "React state 是页面的即时记忆；Supabase Storage 是文件仓库；Supabase Database 是归档账本。刷新页面时，会重新读取这本账本。",
    accountTitle: "你的私有归档空间",
    accountText: "每个账户都有独立的数据库记录和 Storage 文件夹。刷新页面后会恢复当前会话。",
    email: "邮箱",
    password: "密码",
    working: "处理中...",
    register: "注册",
    needAccount: "还没有账户？注册",
    alreadyRegistered: "已经注册？登录",
    guide: "使用左右箭头或键盘方向键旋转六个面。",
  },
} as const;

const zhRuntimeMessages: Record<string, string> = {
  "Checking Supabase login session...": "正在检查 Supabase 登录会话……",
  "Supabase is not configured yet. Running in local fallback mode.":
    "尚未配置 Supabase，当前使用本地回退模式。",
  "Sign in to load your private archive records.":
    "请登录后读取你的私有归档记录。",
  "Reading your private archive from Supabase.":
    "正在从 Supabase 读取你的私有归档。",
  "Supabase read failed. Check your RLS policies.":
    "Supabase 读取失败，请检查 RLS 权限策略。",
  "Saved to your private Storage folder and archive table.":
    "已保存到你的私有 Storage 文件夹和归档表。",
  "Image saved. AI analysis is starting.":
    "图片已保存，AI 分析正在启动。",
  "AI analysis completed and was saved to Supabase.":
    "AI 分析已完成，并已写入 Supabase。",
  "Image saved, but AI analysis needs attention.":
    "图片已经保存，但 AI 分析需要处理。",
  "Saved locally. Add Supabase env values to use backend.":
    "已保存到本地；配置 Supabase 环境变量后即可使用后端。",
  "Save failed. Check Supabase bucket, table, and policies.":
    "保存失败，请检查 Supabase bucket、数据表和权限策略。",
  "Reloaded from localStorage fallback.": "已从 localStorage 重新加载。",
  "Sign in to refresh your private archive.": "请登录后刷新私有归档。",
  "Reloaded your private archive from Supabase.":
    "已从 Supabase 重新加载你的私有归档。",
  "Local fallback archive was reset.": "本地回退归档已重置。",
  "Signed out. Sign in to access your private archive.":
    "已退出；请重新登录以访问私有归档。",
  "You are signed out.": "你已退出登录。",
  "Registration complete. You are now signed in.":
    "注册完成，你现在已经登录。",
  "Registration submitted. Check your email to confirm the account, then sign in.":
    "注册已提交，请检查邮箱并确认账户，然后登录。",
  "Signed in. Your private archive is loading.":
    "登录成功，正在加载你的私有归档。",
  "Review extracted fields, then save it to the permanent archive database.":
    "复核提取字段，然后保存到永久归档数据库。",
};

function localizeRuntimeMessage(message: string, language: Language) {
  return language === "zh" ? (zhRuntimeMessages[message] ?? message) : message;
}

const STORAGE_KEY = "archive-ai-records";
const AUTH_STORAGE_KEY = "archive-ai-auth-session";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_BUCKET =
  process.env.NEXT_PUBLIC_SUPABASE_BUCKET ?? "archive-uploads";
const HAS_SUPABASE_CONFIG = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const initialRecords: ArchiveRecord[] = [
  {
    id: "sample-1",
    name: "Office receipt",
    status: "Archived",
    documentType: "Receipt",
    category: "Office supplies",
    confidence: 92,
    amount: "$128.40",
    uploadedAt: "Sample",
  },
  {
    id: "sample-2",
    name: "SaaS invoice",
    status: "Needs review",
    documentType: "Invoice",
    category: "Software",
    confidence: 84,
    amount: "$49.00",
    uploadedAt: "Sample",
  },
  {
    id: "sample-3",
    name: "Travel expense",
    status: "Analyzed",
    documentType: "Receipt",
    category: "Transport",
    confidence: 88,
    amount: "$36.20",
    uploadedAt: "Sample",
  },
];

function formatFileSize(size: number) {
  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))} KB`;
  }

  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function analyzeFile(file: File): AnalysisResult {
  const loweredName = file.name.toLowerCase();
  const isInvoice = loweredName.includes("invoice") || loweredName.includes("bill");
  const isReceipt = loweredName.includes("receipt");
  const isTravel = loweredName.includes("travel") || loweredName.includes("taxi");

  const category = isInvoice
    ? "Software / vendor bill"
    : isTravel
      ? "Transport"
      : isReceipt
        ? "General expense"
        : "Unsorted expense";

  return {
    documentType: isInvoice ? "Invoice" : isReceipt ? "Receipt" : "Image document",
    category,
    confidence: isInvoice || isReceipt || isTravel ? 78 : 52,
    fileSize: formatFileSize(file.size),
    amount: "$--.--",
    extractedText: "",
    summary: "Local fallback analysis based on the file name.",
    nextAction:
      "Review extracted fields, then save it to the permanent archive database.",
  };
}

function createLocalRecord(file: File, analysis: AnalysisResult): ArchiveRecord {
  return {
    id: `${file.name}-${file.lastModified}`,
    name: file.name,
    status: "Needs review",
    documentType: analysis.documentType,
    category: analysis.category,
    confidence: analysis.confidence,
    amount: "$--.--",
    uploadedAt: "Just now",
    analysisStatus: "completed",
    summary: analysis.summary,
    extractedText: analysis.extractedText,
  };
}

function mapSupabaseRow(row: SupabaseArchiveRow): ArchiveRecord {
  return {
    id: row.id,
    name: row.file_name,
    status: row.status,
    documentType: row.document_type,
    category: row.category,
    confidence: row.confidence,
    amount: row.amount,
    uploadedAt: new Date(row.created_at).toLocaleString(),
    filePath: row.file_path ?? undefined,
    analysisStatus: row.analysis_status,
    summary: row.analysis_summary ?? undefined,
    extractedText: row.extracted_text ?? undefined,
  };
}

function getPublicSupabaseHeaders(extraHeaders: Record<string, string> = {}) {
  if (!SUPABASE_ANON_KEY) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return {
    apikey: SUPABASE_ANON_KEY,
    ...extraHeaders,
  };
}

function getSupabaseHeaders(
  accessToken: string,
  extraHeaders: Record<string, string> = {},
) {
  return {
    ...getPublicSupabaseHeaders(),
    Authorization: `Bearer ${accessToken}`,
    ...extraHeaders,
  };
}

function getSupabaseUrl(path: string) {
  if (!SUPABASE_URL) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  }

  return `${SUPABASE_URL}${path}`;
}

function getSafeFilePath(file: File, userId: string) {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");

  return `${userId}/uploads/${Date.now()}-${safeName}`;
}

function parseAuthError(payload: AuthResponse) {
  return (
    payload.error_description ?? payload.msg ?? payload.error ?? "Authentication failed"
  );
}

function sessionFromAuthResponse(
  payload: AuthResponse,
  fallbackUser?: SupabaseUser,
): AuthSession | null {
  if (!payload.access_token || !payload.refresh_token) {
    return null;
  }

  const user = payload.user ?? fallbackUser;

  if (!user) {
    return null;
  }

  return {
    access_token: payload.access_token,
    refresh_token: payload.refresh_token,
    expires_at:
      payload.expires_at ??
      Math.floor(Date.now() / 1000) + (payload.expires_in ?? 3600),
    user,
  };
}

async function authRequest(path: string, body: Record<string, string>) {
  const response = await fetch(getSupabaseUrl(`/auth/v1/${path}`), {
    body: JSON.stringify(body),
    headers: getPublicSupabaseHeaders({ "Content-Type": "application/json" }),
    method: "POST",
  });
  const payload = (await response.json().catch(() => ({}))) as AuthResponse;

  if (!response.ok) {
    throw new Error(parseAuthError(payload));
  }

  return payload;
}

async function signInWithPassword(email: string, password: string) {
  const payload = await authRequest("token?grant_type=password", {
    email,
    password,
  });
  const session = sessionFromAuthResponse(payload);

  if (!session) {
    throw new Error("Supabase did not return a login session.");
  }

  return session;
}

async function signUpWithPassword(email: string, password: string) {
  const payload = await authRequest("signup", { email, password });
  return {
    session: sessionFromAuthResponse(payload),
    user: payload.user,
  };
}

async function refreshAuthSession(session: AuthSession) {
  const payload = await authRequest("token?grant_type=refresh_token", {
    refresh_token: session.refresh_token,
  });

  return sessionFromAuthResponse(payload, session.user);
}

async function signOutFromSupabase(session: AuthSession) {
  await fetch(getSupabaseUrl("/auth/v1/logout"), {
    headers: getSupabaseHeaders(session.access_token),
    method: "POST",
  });
}

async function fetchArchiveRows(accessToken: string) {
  const response = await fetch(
    getSupabaseUrl("/rest/v1/archives?select=*&order=created_at.desc"),
    {
      headers: getSupabaseHeaders(accessToken),
    },
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const rows = (await response.json()) as SupabaseArchiveRow[];

  return rows.map(mapSupabaseRow);
}

async function updateArchiveRow(
  recordId: string,
  userId: string,
  draft: ArchiveEditDraft,
  accessToken: string,
) {
  const response = await fetch(
    getSupabaseUrl(
      `/rest/v1/archives?id=eq.${encodeURIComponent(recordId)}&user_id=eq.${encodeURIComponent(userId)}`,
    ),
    {
      body: JSON.stringify({
        amount: draft.amount.trim(),
        analysis_summary: draft.summary.trim(),
        category: draft.category.trim(),
        document_type: draft.documentType.trim(),
        extracted_text: draft.extractedText.trim(),
        updated_at: new Date().toISOString(),
      }),
      headers: getSupabaseHeaders(accessToken, {
        "Content-Type": "application/json",
        Prefer: "return=representation",
      }),
      method: "PATCH",
    },
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const rows = (await response.json()) as SupabaseArchiveRow[];

  if (!rows[0]) {
    throw new Error("This archive record was not found or is not editable by this user.");
  }

  return mapSupabaseRow(rows[0]);
}

async function uploadFileToStorage(
  file: File,
  userId: string,
  accessToken: string,
) {
  const filePath = getSafeFilePath(file, userId);
  const response = await fetch(
    getSupabaseUrl(`/storage/v1/object/${SUPABASE_BUCKET}/${filePath}`),
    {
      body: file,
      headers: getSupabaseHeaders(accessToken, {
        "Content-Type": file.type || "application/octet-stream",
        "x-upsert": "false",
      }),
      method: "POST",
    },
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return filePath;
}

async function insertArchiveRow(
  file: File,
  filePath: string,
  userId: string,
  accessToken: string,
) {
  const response = await fetch(getSupabaseUrl("/rest/v1/archives"), {
    body: JSON.stringify({
      amount: "$--.--",
      analysis_status: "pending",
      category: "Uncategorized",
      confidence: 0,
      document_type: "Pending analysis",
      file_name: file.name,
      file_path: filePath,
      file_size: file.size,
      status: "Needs review",
      user_id: userId,
    }),
    headers: getSupabaseHeaders(accessToken, {
      "Content-Type": "application/json",
      Prefer: "return=representation",
    }),
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const rows = (await response.json()) as SupabaseArchiveRow[];
  return mapSupabaseRow(rows[0]);
}

async function analyzeRemoteArchive(archiveId: string, accessToken: string) {
  const response = await fetch("/api/analyze", {
    body: JSON.stringify({ archiveId }),
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  const payload = (await response.json().catch(() => ({}))) as AnalysisApiResponse;

  if (!response.ok || !payload.analysis) {
    throw new Error(payload.error ?? "AI analysis failed.");
  }

  return payload.analysis;
}

export default function Home() {
  const [language, setLanguage] = useState<Language>("en");
  const [activeFace, setActiveFace] = useState(0);
  const [pageDirection, setPageDirection] = useState<"next" | "previous">(
    "next",
  );
  const [records, setRecords] = useState<ArchiveRecord[]>(
    HAS_SUPABASE_CONFIG ? [] : initialRecords,
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [authReady, setAuthReady] = useState(!HAS_SUPABASE_CONFIG);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [backendMessage, setBackendMessage] = useState(
    HAS_SUPABASE_CONFIG
      ? "Checking Supabase login session..."
      : "Supabase is not configured yet. Running in local fallback mode.",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [archiveEditDraft, setArchiveEditDraft] =
    useState<ArchiveEditDraft | null>(null);
  const [isArchiveEditSaving, setIsArchiveEditSaving] = useState(false);
  const [archiveEditMessage, setArchiveEditMessage] = useState<string | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;

    async function restoreAuthSession() {
      if (!HAS_SUPABASE_CONFIG) {
        setAuthReady(true);
        return;
      }

      try {
        const savedSession = window.localStorage.getItem(AUTH_STORAGE_KEY);

        if (!savedSession) {
          return;
        }

        let nextSession = JSON.parse(savedSession) as AuthSession;

        if (nextSession.expires_at <= Math.floor(Date.now() / 1000) + 60) {
          const refreshedSession = await refreshAuthSession(nextSession);

          if (!refreshedSession) {
            throw new Error("Session refresh failed");
          }

          nextSession = refreshedSession;
          window.localStorage.setItem(
            AUTH_STORAGE_KEY,
            JSON.stringify(nextSession),
          );
        }

        if (!cancelled) {
          setSession(nextSession);
        }
      } catch (error) {
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
        if (!cancelled) {
          setAuthMessage(
            error instanceof Error
              ? `${error.message}. Please sign in again.`
              : "Please sign in again.",
          );
        }
      } finally {
        if (!cancelled) {
          setAuthReady(true);
        }
      }
    }

    void restoreAuthSession();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!authReady) {
      return;
    }

    if (!HAS_SUPABASE_CONFIG) {
      const savedRecords = window.localStorage.getItem(STORAGE_KEY);
      const timer = window.setTimeout(() => {
        if (savedRecords) {
          setRecords(JSON.parse(savedRecords) as ArchiveRecord[]);
        }

        setHasLoaded(true);
      }, 0);

      return () => window.clearTimeout(timer);
    }

    if (!session) {
      const timer = window.setTimeout(() => {
        setRecords([]);
        setHasLoaded(true);
        setBackendMessage("Sign in to load your private archive records.");
      }, 0);

      return () => window.clearTimeout(timer);
    }

    let cancelled = false;
    const accessToken = session.access_token;

    async function loadRecords() {
      try {
        const remoteRecords = await fetchArchiveRows(accessToken);

        if (!cancelled) {
          setRecords(remoteRecords);
          setBackendMessage("Reading your private archive from Supabase.");
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(error instanceof Error ? error.message : "Load failed");
          setBackendMessage("Supabase read failed. Check your RLS policies.");
        }
      } finally {
        if (!cancelled) {
          setHasLoaded(true);
        }
      }
    }

    void loadRecords();

    return () => {
      cancelled = true;
    };
  }, [authReady, session]);

  useEffect(() => {
    if (!HAS_SUPABASE_CONFIG && hasLoaded) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    }
  }, [hasLoaded, records]);

  const latestRecord = records[0];
  const isAuthenticated = !HAS_SUPABASE_CONFIG || Boolean(session);
  const ui = uiCopy[language];
  const faceNames = [
    ui.account,
    ui.status,
    ui.upload,
    ui.analysis,
    ui.archive,
    ui.principles,
  ];
  const faceKickers = [
    ui.identity,
    ui.status,
    ui.input,
    ui.review,
    ui.archive,
    "Archive AI",
  ];
  const nextFace = (activeFace + 1) % faceNames.length;
  const previousFace = (activeFace + faceNames.length - 1) % faceNames.length;
  function rotateCube(direction: 1 | -1) {
    setPageDirection(direction === 1 ? "next" : "previous");
    setActiveFace((currentFace) =>
      (currentFace + direction + faceNames.length) % faceNames.length,
    );
  }

  function handleCubeKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      rotateCube(1);
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      rotateCube(-1);
    }
  }

  const uploadStatus = useMemo(() => {
    if (HAS_SUPABASE_CONFIG && !session) {
      return language === "zh"
        ? "请先登录，再上传到你的私有归档空间。"
        : "Sign in above before uploading to your private archive.";
    }

    if (isSaving) {
      return HAS_SUPABASE_CONFIG
        ? language === "zh"
          ? "正在上传到 Supabase Storage，并写入数据库记录。"
          : "Uploading image to Supabase Storage, then writing a database row."
        : language === "zh"
          ? "正在保存到浏览器本地存储。"
          : "Saving to the browser fallback store.";
    }

    if (isAnalyzing) {
      return language === "zh"
        ? "AI 视觉模型正在读取图片，并把结构化结果写回数据库。"
        : "The AI vision model is reading the image and writing structured results back to the database.";
    }

    if (isDragging) {
      return language === "zh"
        ? "松开文件，开始归档循环。"
        : "Drop the file here to start the archive loop.";
    }

    if (selectedFile) {
      return language === "zh"
        ? `${selectedFile.name} 已准备好复核。`
        : `${selectedFile.name} is staged for review.`;
    }

    return language === "zh"
      ? "把图片拖到这里，或从电脑中选择一张。"
      : "Drag an image here, or choose one from your computer.";
  }, [isAnalyzing, isDragging, isSaving, language, selectedFile, session]);

  async function processFile(file: File) {
    if (HAS_SUPABASE_CONFIG && !session) {
      setErrorMessage("Please sign in before uploading an image.");
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      setErrorMessage("Only JPEG, PNG, and WebP images are supported.");
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      setErrorMessage("The image must be 10 MB or smaller.");
      return;
    }

    const nextPreviewUrl = URL.createObjectURL(file);
    const nextAnalysis = analyzeFile(file);
    const stagedAnalysis = HAS_SUPABASE_CONFIG
      ? {
          ...nextAnalysis,
          category: "Uncategorized",
          confidence: 0,
          documentType: "Pending analysis",
          extractedText: "",
          summary: "Image uploaded; waiting for AI analysis.",
          nextAction: "AI analysis is waiting to start.",
        }
      : nextAnalysis;

    setSelectedFile(file);
    setPreviewUrl((currentPreviewUrl) => {
      if (currentPreviewUrl) {
        URL.revokeObjectURL(currentPreviewUrl);
      }

      return nextPreviewUrl;
    });
    setAnalysis(stagedAnalysis);
    setIsSaving(true);
    setErrorMessage(null);

    if (!HAS_SUPABASE_CONFIG) {
      try {
        const localRecord = createLocalRecord(file, nextAnalysis);
        setRecords((currentRecords) => [localRecord, ...currentRecords]);
        setBackendMessage("Saved locally. Add Supabase env values to use backend.");
      } finally {
        setIsSaving(false);
      }
      return;
    }

    if (!session) {
      setIsSaving(false);
      setErrorMessage("Your login session is missing. Please sign in again.");
      return;
    }

    let remoteRecord: ArchiveRecord;

    try {
      const filePath = await uploadFileToStorage(
        file,
        session.user.id,
        session.access_token,
      );
      remoteRecord = await insertArchiveRow(
        file,
        filePath,
        session.user.id,
        session.access_token,
      );
      setRecords((currentRecords) => [remoteRecord, ...currentRecords]);
      setBackendMessage("Image saved. AI analysis is starting.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Upload failed");
      setBackendMessage("Save failed. Check Supabase bucket, table, and policies.");
      setIsSaving(false);
      return;
    }

    setIsSaving(false);
    setIsAnalyzing(true);

    try {
      const remoteAnalysis = await analyzeRemoteArchive(
        remoteRecord.id,
        session.access_token,
      );
      setAnalysis({
        ...remoteAnalysis,
        fileSize: formatFileSize(file.size),
        nextAction: "Review the extracted fields. You can edit them in the next feature slice.",
      });
      const remoteRecords = await fetchArchiveRows(session.access_token);
      setRecords(remoteRecords);
      setBackendMessage("AI analysis completed and was saved to Supabase.");
      setErrorMessage(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "AI analysis failed.";
      setErrorMessage(`The image was saved, but analysis failed: ${message}`);
      setBackendMessage("Image saved, but AI analysis needs attention.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (file) {
      void processFile(file);
    }

    event.currentTarget.value = "";
  }

  function handleDragOver(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];

    if (file) {
      void processFile(file);
    }
  }

  async function refreshArchive() {
    if (!HAS_SUPABASE_CONFIG) {
      const savedRecords = window.localStorage.getItem(STORAGE_KEY);
      setRecords(savedRecords ? JSON.parse(savedRecords) : initialRecords);
      setBackendMessage("Reloaded from localStorage fallback.");
      return;
    }

    if (!session) {
      setBackendMessage("Sign in to refresh your private archive.");
      return;
    }

    try {
      const remoteRecords = await fetchArchiveRows(session.access_token);
      setRecords(remoteRecords);
      setBackendMessage("Reloaded your private archive from Supabase.");
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Refresh failed");
    }
  }

  function beginArchiveEdit(record: ArchiveRecord) {
    setEditingRecordId(record.id);
    setArchiveEditDraft({
      amount: record.amount,
      category: record.category,
      documentType: record.documentType,
      extractedText: record.extractedText ?? "",
      summary: record.summary ?? "",
    });
    setArchiveEditMessage(null);
  }

  function cancelArchiveEdit() {
    if (isArchiveEditSaving) {
      return;
    }

    setEditingRecordId(null);
    setArchiveEditDraft(null);
    setArchiveEditMessage(null);
  }

  function updateArchiveDraft(
    field: keyof ArchiveEditDraft,
    value: string,
  ) {
    setArchiveEditDraft((currentDraft) =>
      currentDraft ? { ...currentDraft, [field]: value } : currentDraft,
    );
  }

  async function saveArchiveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingRecordId || !archiveEditDraft) {
      return;
    }

    const normalizedDraft: ArchiveEditDraft = {
      amount: archiveEditDraft.amount.trim().slice(0, 80),
      category: archiveEditDraft.category.trim().slice(0, 120),
      documentType: archiveEditDraft.documentType.trim().slice(0, 120),
      extractedText: archiveEditDraft.extractedText.trim().slice(0, 20000),
      summary: archiveEditDraft.summary.trim().slice(0, 2000),
    };

    if (!normalizedDraft.documentType || !normalizedDraft.category) {
      setArchiveEditMessage("Document type and category are required.");
      return;
    }

    setIsArchiveEditSaving(true);
    setArchiveEditMessage(null);
    setErrorMessage(null);

    try {
      let updatedRecord: ArchiveRecord;

      if (HAS_SUPABASE_CONFIG) {
        if (!session) {
          throw new Error("Sign in before editing your private archive.");
        }

        updatedRecord = await updateArchiveRow(
          editingRecordId,
          session.user.id,
          normalizedDraft,
          session.access_token,
        );
      } else {
        const currentRecord = records.find(
          (record) => record.id === editingRecordId,
        );

        if (!currentRecord) {
          throw new Error("Archive record not found.");
        }

        updatedRecord = {
          ...currentRecord,
          ...normalizedDraft,
        };
      }

      setRecords((currentRecords) =>
        currentRecords.map((record) =>
          record.id === updatedRecord.id ? updatedRecord : record,
        ),
      );

      if (analysis && latestRecord?.id === updatedRecord.id) {
        setAnalysis({
          ...analysis,
          amount: updatedRecord.amount,
          category: updatedRecord.category,
          documentType: updatedRecord.documentType,
          extractedText: updatedRecord.extractedText ?? "",
          summary: updatedRecord.summary ?? "",
        });
      }

      setArchiveEditMessage(
        HAS_SUPABASE_CONFIG
          ? "Changes saved to your private Supabase archive."
          : "Changes saved to the local archive.",
      );
      setBackendMessage(
        HAS_SUPABASE_CONFIG
          ? "Archive fields updated under your Supabase RLS policy."
          : "Archive fields updated in localStorage fallback.",
      );
      setEditingRecordId(null);
      setArchiveEditDraft(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Save failed";
      setArchiveEditMessage(message);
      setErrorMessage(message);
    } finally {
      setIsArchiveEditSaving(false);
    }
  }

  function resetLocalArchive() {
    setRecords(initialRecords);
    window.localStorage.removeItem(STORAGE_KEY);
    setBackendMessage("Local fallback archive was reset.");
  }

  async function handleAuthSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsAuthLoading(true);
    setAuthMessage(null);
    setErrorMessage(null);

    try {
      if (!authEmail.includes("@") || authPassword.length < 6) {
        throw new Error("Use a valid email and a password with at least 6 characters.");
      }

      if (authMode === "signup") {
        const result = await signUpWithPassword(authEmail, authPassword);

        if (result.session) {
          window.localStorage.setItem(
            AUTH_STORAGE_KEY,
            JSON.stringify(result.session),
          );
          setSession(result.session);
          setAuthMessage("Registration complete. You are now signed in.");
        } else {
          setAuthMessage(
            "Registration submitted. Check your email to confirm the account, then sign in.",
          );
        }
      } else {
        const nextSession = await signInWithPassword(authEmail, authPassword);
        window.localStorage.setItem(
          AUTH_STORAGE_KEY,
          JSON.stringify(nextSession),
        );
        setSession(nextSession);
        setAuthMessage("Signed in. Your private archive is loading.");
      }

      setAuthPassword("");
    } catch (error) {
      setAuthMessage(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setIsAuthLoading(false);
    }
  }

  async function handleSignOut() {
    if (session) {
      try {
        await signOutFromSupabase(session);
      } catch {
        // Clearing the local session still protects this browser immediately.
      }
    }

    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    setSession(null);
    setRecords([]);
    setAnalysis(null);
    setSelectedFile(null);
    setEditingRecordId(null);
    setArchiveEditDraft(null);
    setArchiveEditMessage(null);
    setBackendMessage("Signed out. Sign in to access your private archive.");
    setAuthMessage("You are signed out.");
  }

  return (
    <main className="archive-shell min-h-screen bg-[#090d1a] text-slate-50">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-5 sm:px-8 sm:py-8">
        <header className="archive-header">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">
              {ui.product}
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              {ui.tagline}
            </h1>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2 text-sm">
            <span className="hidden rounded-full border border-white/10 bg-white/5 px-3 py-2 text-slate-300 sm:inline-flex">
              {ui.current}: {faceNames[activeFace]}
            </span>
            <button
              aria-label="Toggle language / 切换语言"
              className="rounded-full border border-white/15 px-3 py-2 font-medium text-slate-100 transition hover:border-emerald-300 hover:text-emerald-200"
              onClick={() => setLanguage(language === "en" ? "zh" : "en")}
              type="button"
            >
              {ui.language}
            </button>
            {!session && HAS_SUPABASE_CONFIG ? (
              <button
                className="rounded-full bg-violet-300 px-4 py-2 font-semibold text-violet-950 transition hover:bg-violet-200"
                onClick={() => {
                  setAuthMode("signup");
                  setActiveFace(0);
                }}
                type="button"
              >
                {ui.signup}
              </button>
            ) : null}
            {session ? (
              <button
                className="rounded-full border border-rose-300/30 px-4 py-2 text-rose-100 transition hover:border-rose-200 hover:bg-rose-300/10"
                onClick={() => void handleSignOut()}
                type="button"
              >
                {ui.signout} ({session.user.email ?? "user"})
              </button>
            ) : null}
          </div>
        </header>

        <div className="cube-toolbar" aria-label="Cube navigation">
          <button
            aria-label={`${ui.previous}: ${faceNames[previousFace]}`}
            className="cube-nav-button"
            onClick={() => rotateCube(-1)}
            type="button"
          >
            ← <span className="hidden sm:inline">{faceNames[previousFace]}</span>
          </button>
          <div className="cube-preview-label">
            <span>{ui.next}</span>
            <strong>{faceNames[nextFace]}</strong>
          </div>
          <button
            aria-label={`${ui.next}: ${faceNames[nextFace]}`}
            className="cube-nav-button"
            onClick={() => rotateCube(1)}
            type="button"
          >
            <span className="hidden sm:inline">{faceNames[nextFace]}</span> →
          </button>
        </div>

        <div
          aria-label="Six-face workspace / 六面体工作台"
          className="cube-scene"
          onKeyDown={handleCubeKeyDown}
          tabIndex={0}
        >
          <div className={`page-stack page-stack-${pageDirection}`}>
            <section
              aria-hidden={activeFace !== 0}
              className={`page-face border-violet-300/25 bg-violet-950/95 ${activeFace === 0 ? "page-face-active" : ""}`}
              aria-label={faceNames[0]}
            >
              <p className="face-kicker text-violet-300">{faceKickers[0]}</p>
              <h2 className="face-title">{ui.accountTitle}</h2>
              <p className="face-description text-violet-100/70">{ui.accountText}</p>
              {session ? (
                <div className="mt-8 rounded-2xl border border-violet-200/20 bg-black/20 p-5">
                  <p className="text-sm text-violet-200/70">{ui.signin}</p>
                  <p className="mt-2 text-xl font-semibold">{session.user.email ?? "user"}</p>
                  <button
                    className="mt-6 rounded-xl border border-rose-200/30 px-4 py-2 text-rose-100 transition hover:bg-rose-300/10"
                    onClick={() => void handleSignOut()}
                    type="button"
                  >
                    {ui.signout}
                  </button>
                </div>
              ) : (
                <form className="mt-8 grid max-w-xl gap-4 sm:grid-cols-2" onSubmit={handleAuthSubmit}>
                  <label className="grid gap-2 text-sm">
                    {ui.email}
                    <input
                      className="rounded-xl border border-violet-200/20 bg-slate-950/70 px-4 py-3 text-slate-50 outline-none transition focus:border-violet-200"
                      onChange={(event) => setAuthEmail(event.target.value)}
                      placeholder="you@example.com"
                      required
                      type="email"
                      value={authEmail}
                    />
                  </label>
                  <label className="grid gap-2 text-sm">
                    {ui.password}
                    <input
                      className="rounded-xl border border-violet-200/20 bg-slate-950/70 px-4 py-3 text-slate-50 outline-none transition focus:border-violet-200"
                      minLength={6}
                      onChange={(event) => setAuthPassword(event.target.value)}
                      placeholder="At least 6 characters"
                      required
                      type="password"
                      value={authPassword}
                    />
                  </label>
                  <button
                    className="rounded-xl bg-violet-300 px-5 py-3 font-semibold text-violet-950 transition hover:bg-violet-200 disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-2 sm:justify-self-start"
                    disabled={isAuthLoading || !authReady}
                    type="submit"
                  >
                    {isAuthLoading ? ui.working : authMode === "signin" ? ui.signin : ui.register}
                  </button>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-violet-100/70 sm:col-span-2">
                    <button
                      className="underline decoration-violet-300/50 underline-offset-4 hover:text-white"
                      onClick={() => {
                        setAuthMode(authMode === "signin" ? "signup" : "signin");
                        setAuthMessage(null);
                      }}
                      type="button"
                    >
                      {authMode === "signin" ? ui.needAccount : ui.alreadyRegistered}
                    </button>
                    {authMessage ? (
                      <span>{localizeRuntimeMessage(authMessage, language)}</span>
                    ) : null}
                  </div>
                </form>
              )}
            </section>

            <section
              aria-hidden={activeFace !== 1}
              className={`page-face border-emerald-300/25 bg-emerald-950/95 ${activeFace === 1 ? "page-face-active" : ""}`}
              aria-label={faceNames[1]}
            >
              <p className="face-kicker text-emerald-300">{faceKickers[1]}</p>
              <h2 className="face-title">
                {HAS_SUPABASE_CONFIG ? (session ? ui.privateMode : ui.signInRequired) : ui.localMode}
              </h2>
              <p className="face-description text-emerald-50/75">
                {localizeRuntimeMessage(backendMessage, language)}
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="stat-card">
                  <p className="text-3xl font-semibold">{records.length}</p>
                  <p className="mt-2 text-sm text-emerald-100/70">{ui.archiveRecords}</p>
                </div>
                <div className="stat-card">
                  <p className="text-3xl font-semibold">{hasLoaded ? ui.loaded : ui.loading}</p>
                  <p className="mt-2 text-sm text-emerald-100/70">
                    {ui.refreshReads} {HAS_SUPABASE_CONFIG ? ui.supabase : ui.localStorage}
                  </p>
                </div>
              </div>
              {!HAS_SUPABASE_CONFIG ? (
                <div className="mt-6 rounded-2xl border border-amber-300/30 bg-amber-300/10 p-4 text-sm leading-6 text-amber-100">
                  {ui.addEnv}
                </div>
              ) : null}
            </section>

            <section
              aria-hidden={activeFace !== 2}
              className={`page-face border-cyan-300/25 bg-cyan-950/95 ${activeFace === 2 ? "page-face-active" : ""}`}
              aria-label={faceNames[2]}
            >
              <p className="face-kicker text-cyan-300">{faceKickers[2]}</p>
              <h2 className="face-title">{ui.dragTitle}</h2>
              <label
                className={`relative mt-8 block min-h-48 cursor-pointer overflow-hidden rounded-2xl border border-dashed p-8 text-center transition ${
                  isDragging
                    ? "border-cyan-200 bg-cyan-300/20 shadow-lg shadow-cyan-500/20"
                    : "border-cyan-300/40 bg-slate-950/60 hover:border-cyan-200"
                }`}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <span className={`absolute inset-x-10 top-5 h-1 rounded-full bg-cyan-300 transition ${isDragging || isSaving || isAnalyzing ? "animate-pulse opacity-100" : "opacity-30"}`} />
                <span className="mt-4 block text-xl font-semibold">{isDragging ? ui.release : ui.drop}</span>
                <span className="mt-3 block text-sm leading-6 text-cyan-50/70">{uploadStatus}</span>
                <span className="mt-6 inline-flex rounded-xl bg-cyan-300 px-5 py-3 font-semibold text-cyan-950">
                  {isAnalyzing ? (language === "zh" ? "AI 分析中..." : "Analyzing...") : isSaving ? ui.saving : ui.choose}
                </span>
                <input accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={isSaving || isAnalyzing || !isAuthenticated} onChange={handleFileChange} type="file" />
              </label>
              <div className="mt-5 rounded-2xl border border-cyan-300/15 bg-slate-950/70 p-4">
                <p className="text-sm text-cyan-200">{ui.preview}</p>
                {previewUrl ? (
                  // Browser object URLs cannot be optimized by next/image.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img alt={selectedFile?.name ?? "Uploaded preview"} className="mt-4 max-h-56 w-full rounded-xl object-contain" src={previewUrl} />
                ) : (
                  <div className="mt-4 flex h-40 items-center justify-center rounded-xl bg-slate-900 text-sm text-slate-500">{ui.waiting}</div>
                )}
              </div>
            </section>

            <section
              aria-hidden={activeFace !== 3}
              className={`page-face border-amber-300/25 bg-amber-950/95 ${activeFace === 3 ? "page-face-active" : ""}`}
              aria-label={faceNames[3]}
            >
              <p className="face-kicker text-amber-300">{faceKickers[3]}</p>
              <h2 className="face-title">
                {HAS_SUPABASE_CONFIG
                  ? language === "zh"
                    ? "真实 AI 分析"
                    : "Real AI analysis"
                  : ui.mockAnalysis}
              </h2>
              {analysis ? (
                <div className="mt-8 space-y-3">
                  <div className="stat-card"><p className="text-sm text-amber-100/70">{ui.documentType}</p><p className="mt-2 text-2xl font-semibold">{analysis.documentType}</p></div>
                  <div className="grid gap-3 sm:grid-cols-2"><div className="stat-card"><p className="text-sm text-amber-100/70">{ui.category}</p><p className="mt-2 font-semibold">{analysis.category}</p></div><div className="stat-card"><p className="text-sm text-amber-100/70">{ui.fileSize}</p><p className="mt-2 font-semibold">{analysis.fileSize}</p></div></div>
                  <div className="stat-card"><div className="flex items-center justify-between text-sm"><span className="text-amber-100/70">{ui.confidence}</span><span>{analysis.confidence}%</span></div><div className="mt-3 h-2 rounded-full bg-slate-950"><div className="h-2 rounded-full bg-amber-300" style={{ width: `${analysis.confidence}%` }} /></div></div>
                  <div className="stat-card"><p className="text-sm text-amber-100/70">{language === "zh" ? "摘要" : "Summary"}</p><p className="mt-2 text-sm leading-6">{analysis.summary}</p></div>
                  {analysis.extractedText ? <div className="stat-card"><p className="text-sm text-amber-100/70">{language === "zh" ? "提取文字" : "Extracted text"}</p><p className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap text-sm leading-6">{analysis.extractedText}</p></div> : null}
                  <div className="stat-card"><p className="text-sm text-amber-100/70">{ui.nextAction}</p><p className="mt-2 text-sm leading-6">{localizeRuntimeMessage(analysis.nextAction, language)}</p></div>
                </div>
              ) : (
                <div className="mt-8 flex min-h-64 items-center justify-center rounded-2xl border border-dashed border-amber-300/25 bg-slate-950/60 p-8 text-center text-sm leading-6 text-amber-50/70">
                  {HAS_SUPABASE_CONFIG
                    ? language === "zh"
                      ? "上传 JPEG、PNG 或 WebP 图片后，服务端会进行真实视觉分析，并把结果写入数据库。"
                      : "Upload a JPEG, PNG, or WebP image. The server will run real vision analysis and persist the result."
                    : ui.uploadFirst}
                </div>
              )}
            </section>

            <section
              aria-hidden={activeFace !== 4}
              className={`page-face border-indigo-300/25 bg-indigo-950/95 ${activeFace === 4 ? "page-face-active" : ""}`}
              aria-label={faceNames[4]}
            >
              <p className="face-kicker text-indigo-300">{faceKickers[4]}</p>
              <h2 className="face-title">{ui.reviewQueue}</h2>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-indigo-100/70">
                <span>{ui.latest}: {latestRecord?.name ?? ui.noneYet}</span>
                <div className="flex gap-2"><button className="rounded-xl border border-indigo-300/30 px-3 py-2 transition hover:border-indigo-200 hover:bg-indigo-300/10" onClick={() => void refreshArchive()} type="button">{ui.refresh}</button>{!HAS_SUPABASE_CONFIG ? <button className="rounded-xl border border-indigo-300/30 px-3 py-2 transition hover:border-indigo-200 hover:bg-indigo-300/10" onClick={resetLocalArchive} type="button">{ui.reset}</button> : null}</div>
              </div>
              {archiveEditMessage ? (
                <p
                  className="mt-4 rounded-xl border border-indigo-300/25 bg-indigo-300/10 px-4 py-3 text-sm text-indigo-50"
                  role="status"
                >
                  {archiveEditMessage}
                </p>
              ) : null}
              <div className="mt-6 grid gap-3 md:grid-cols-2">
                {records.map((record) => (
                  <article
                    className={`rounded-2xl border bg-slate-950/60 p-4 ${
                      editingRecordId === record.id
                        ? "border-indigo-200/50 md:col-span-2"
                        : "border-white/10"
                    }`}
                    key={record.id}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-medium">{record.name}</h3>
                        <p className="mt-2 text-sm text-indigo-100/70">
                          {record.documentType} · {record.category}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="rounded-md bg-indigo-300/15 px-2 py-1 text-xs text-indigo-100">{record.status}</p>
                        {editingRecordId !== record.id ? (
                          <button
                            aria-label={`Edit ${record.name}`}
                            className="rounded-lg border border-indigo-300/30 px-3 py-1.5 text-xs font-semibold text-indigo-50 transition hover:border-indigo-200 hover:bg-indigo-300/10"
                            disabled={isArchiveEditSaving}
                            onClick={() => beginArchiveEdit(record)}
                            type="button"
                          >
                            {language === "zh" ? "编辑" : "Edit"}
                          </button>
                        ) : null}
                      </div>
                    </div>

                    {editingRecordId === record.id && archiveEditDraft ? (
                      <form className="mt-5 grid gap-4" onSubmit={saveArchiveEdit}>
                        <div className="grid gap-4 sm:grid-cols-3">
                          <label className="grid gap-2 text-sm text-indigo-100/75">
                            <span>{language === "zh" ? "文档类型" : "Document type"}</span>
                            <input
                              className="rounded-xl border border-indigo-300/25 bg-slate-950 px-3 py-2.5 text-slate-50 outline-none transition focus:border-indigo-200"
                              maxLength={120}
                              onChange={(event) => updateArchiveDraft("documentType", event.target.value)}
                              required
                              value={archiveEditDraft.documentType}
                            />
                          </label>
                          <label className="grid gap-2 text-sm text-indigo-100/75">
                            <span>{language === "zh" ? "分类" : "Category"}</span>
                            <input
                              className="rounded-xl border border-indigo-300/25 bg-slate-950 px-3 py-2.5 text-slate-50 outline-none transition focus:border-indigo-200"
                              maxLength={120}
                              onChange={(event) => updateArchiveDraft("category", event.target.value)}
                              required
                              value={archiveEditDraft.category}
                            />
                          </label>
                          <label className="grid gap-2 text-sm text-indigo-100/75">
                            <span>{language === "zh" ? "金额" : "Amount"}</span>
                            <input
                              className="rounded-xl border border-indigo-300/25 bg-slate-950 px-3 py-2.5 text-slate-50 outline-none transition focus:border-indigo-200"
                              maxLength={80}
                              onChange={(event) => updateArchiveDraft("amount", event.target.value)}
                              value={archiveEditDraft.amount}
                            />
                          </label>
                        </div>
                        <label className="grid gap-2 text-sm text-indigo-100/75">
                          <span>{language === "zh" ? "分析摘要" : "Analysis summary"}</span>
                          <textarea
                            className="min-h-24 rounded-xl border border-indigo-300/25 bg-slate-950 px-3 py-2.5 text-slate-50 outline-none transition focus:border-indigo-200"
                            maxLength={2000}
                            onChange={(event) => updateArchiveDraft("summary", event.target.value)}
                            value={archiveEditDraft.summary}
                          />
                        </label>
                        <label className="grid gap-2 text-sm text-indigo-100/75">
                          <span>{language === "zh" ? "OCR 提取文字" : "OCR extracted text"}</span>
                          <textarea
                            className="min-h-48 rounded-xl border border-indigo-300/25 bg-slate-950 px-3 py-2.5 font-mono text-sm text-slate-50 outline-none transition focus:border-indigo-200"
                            maxLength={20000}
                            onChange={(event) => updateArchiveDraft("extractedText", event.target.value)}
                            value={archiveEditDraft.extractedText}
                          />
                        </label>
                        <div className="flex flex-wrap justify-end gap-2">
                          <button
                            aria-label={`Cancel editing ${record.name}`}
                            className="rounded-xl border border-indigo-300/30 px-4 py-2 text-sm text-indigo-50 transition hover:border-indigo-200 hover:bg-indigo-300/10 disabled:opacity-50"
                            disabled={isArchiveEditSaving}
                            onClick={cancelArchiveEdit}
                            type="button"
                          >
                            {language === "zh" ? "取消" : "Cancel"}
                          </button>
                          <button
                            aria-label={`Save ${record.name}`}
                            className="rounded-xl bg-indigo-200 px-4 py-2 text-sm font-semibold text-indigo-950 transition hover:bg-indigo-100 disabled:cursor-wait disabled:opacity-60"
                            disabled={isArchiveEditSaving}
                            type="submit"
                          >
                            {isArchiveEditSaving
                              ? language === "zh" ? "保存中..." : "Saving..."
                              : language === "zh" ? "保存修改" : "Save changes"}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="mt-5 flex items-center justify-between text-sm"><span className="text-indigo-100/60">{record.uploadedAt}</span><span className="font-semibold text-indigo-100">{record.amount}</span></div>
                        <p className="mt-3 text-xs text-indigo-200/60">Confidence: {record.confidence}%</p>
                        {record.analysisStatus ? <p className="mt-2 text-xs uppercase tracking-wide text-indigo-200/60">AI: {record.analysisStatus}</p> : null}
                        {record.summary ? <p className="mt-3 line-clamp-2 text-sm leading-6 text-indigo-100/65">{record.summary}</p> : null}
                        {record.filePath ? <p className="mt-3 break-words text-xs text-indigo-100/50">{record.filePath}</p> : null}
                      </>
                    )}
                  </article>
                ))}
              </div>
            </section>

            <section
              aria-hidden={activeFace !== 5}
              className={`page-face border-sky-300/25 bg-sky-950/95 ${activeFace === 5 ? "page-face-active" : ""}`}
              aria-label={faceNames[5]}
            >
              <p className="face-kicker text-sky-300">{faceKickers[5]}</p>
              <h2 className="face-title">{ui.principles}</h2>
              <p className="face-description text-sky-50/75">{ui.principleText}</p>
              <div className="mt-8 grid gap-3 sm:grid-cols-3"><div className="stat-card"><p className="text-sm text-sky-100/60">01</p><p className="mt-2 font-semibold">React state</p><p className="mt-2 text-sm text-sky-100/70">Live page memory</p></div><div className="stat-card"><p className="text-sm text-sky-100/60">02</p><p className="mt-2 font-semibold">Storage</p><p className="mt-2 text-sm text-sky-100/70">File warehouse</p></div><div className="stat-card"><p className="text-sm text-sky-100/60">03</p><p className="mt-2 font-semibold">Database</p><p className="mt-2 text-sm text-sky-100/70">Archive ledger</p></div></div>
              <p className="mt-8 text-sm text-sky-100/60">{ui.guide}</p>
            </section>
          </div>
          <aside className="page-peek" aria-label={`${ui.next}: ${faceNames[nextFace]}`}>
            <span>{ui.next}</span>
            <strong>{faceNames[nextFace]}</strong>
            <small>{faceKickers[nextFace]}</small>
          </aside>
        </div>

        <div className="cube-dots" aria-label="Select cube face">
          {faceNames.map((faceName, index) => (
            <button
              aria-label={`${ui.current}: ${faceName}`}
              className={`cube-dot ${index === activeFace ? "cube-dot-active" : ""}`}
              key={faceName}
              onClick={() => {
                setPageDirection(index >= activeFace ? "next" : "previous");
                setActiveFace(index);
              }}
              type="button"
            />
          ))}
        </div>

        {errorMessage ? (
          <section className="mt-5 rounded-2xl border border-rose-300/30 bg-rose-950/40 p-4 text-sm leading-6 text-rose-100">
            <p className="font-semibold">Backend error</p>
            <p className="mt-2 break-words">{errorMessage}</p>
          </section>
        ) : null}

        <footer className="mt-auto pt-8 text-sm leading-6 text-slate-500">
          <p>{ui.guide}</p>
        </footer>
      </section>
    </main>
  );
}
