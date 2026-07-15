"use client";

import {
  ChangeEvent,
  DragEvent,
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

type ArchiveStatus = "Analyzed" | "Needs review" | "Archived";

type ArchiveRecord = {
  id: string;
  name: string;
  status: ArchiveStatus;
  category: string;
  amount: string;
  uploadedAt: string;
  filePath?: string;
};

type AnalysisResult = {
  documentType: string;
  category: string;
  confidence: number;
  fileSize: string;
  nextAction: string;
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

const STORAGE_KEY = "archive-ai-records";
const AUTH_STORAGE_KEY = "archive-ai-auth-session";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_BUCKET =
  process.env.NEXT_PUBLIC_SUPABASE_BUCKET ?? "archive-uploads";
const HAS_SUPABASE_CONFIG = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

const initialRecords: ArchiveRecord[] = [
  {
    id: "sample-1",
    name: "Office receipt",
    status: "Archived",
    category: "Office supplies",
    amount: "$128.40",
    uploadedAt: "Sample",
  },
  {
    id: "sample-2",
    name: "SaaS invoice",
    status: "Needs review",
    category: "Software",
    amount: "$49.00",
    uploadedAt: "Sample",
  },
  {
    id: "sample-3",
    name: "Travel expense",
    status: "Analyzed",
    category: "Transport",
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
    nextAction:
      "Review extracted fields, then save it to the permanent archive database.",
  };
}

function createLocalRecord(file: File, analysis: AnalysisResult): ArchiveRecord {
  return {
    id: `${file.name}-${file.lastModified}`,
    name: file.name,
    status: "Needs review",
    category: analysis.category,
    amount: "$--.--",
    uploadedAt: "Just now",
  };
}

function mapSupabaseRow(row: SupabaseArchiveRow): ArchiveRecord {
  return {
    id: row.id,
    name: row.file_name,
    status: row.status,
    category: row.category,
    amount: row.amount,
    uploadedAt: new Date(row.created_at).toLocaleString(),
    filePath: row.file_path ?? undefined,
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
  analysis: AnalysisResult,
  userId: string,
  accessToken: string,
) {
  const response = await fetch(getSupabaseUrl("/rest/v1/archives"), {
    body: JSON.stringify({
      amount: "$--.--",
      category: analysis.category,
      confidence: analysis.confidence,
      document_type: analysis.documentType,
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

export default function Home() {
  const [records, setRecords] = useState<ArchiveRecord[]>(
    HAS_SUPABASE_CONFIG ? [] : initialRecords,
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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

  const uploadStatus = useMemo(() => {
    if (HAS_SUPABASE_CONFIG && !session) {
      return "Sign in above before uploading to your private archive.";
    }

    if (isSaving) {
      return HAS_SUPABASE_CONFIG
        ? "Uploading image to Supabase Storage, then writing a database row."
        : "Saving to the browser fallback store.";
    }

    if (isDragging) {
      return "Drop the file here to start the archive loop.";
    }

    if (selectedFile) {
      return `${selectedFile.name} is staged for review.`;
    }

    return "Drag an image here, or choose one from your computer.";
  }, [isDragging, isSaving, selectedFile, session]);

  async function processFile(file: File) {
    if (HAS_SUPABASE_CONFIG && !session) {
      setErrorMessage("Please sign in before uploading an image.");
      return;
    }

    const nextPreviewUrl = URL.createObjectURL(file);
    const nextAnalysis = analyzeFile(file);

    setSelectedFile(file);
    setPreviewUrl((currentPreviewUrl) => {
      if (currentPreviewUrl) {
        URL.revokeObjectURL(currentPreviewUrl);
      }

      return nextPreviewUrl;
    });
    setAnalysis(nextAnalysis);
    setIsSaving(true);
    setErrorMessage(null);

    try {
      if (HAS_SUPABASE_CONFIG) {
        if (!session) {
          throw new Error("Your login session is missing. Please sign in again.");
        }

        const filePath = await uploadFileToStorage(
          file,
          session.user.id,
          session.access_token,
        );
        const remoteRecord = await insertArchiveRow(
          file,
          filePath,
          nextAnalysis,
          session.user.id,
          session.access_token,
        );
        setRecords((currentRecords) => [remoteRecord, ...currentRecords]);
        setBackendMessage("Saved to your private Storage folder and archive table.");
      } else {
        const localRecord = createLocalRecord(file, nextAnalysis);
        setRecords((currentRecords) => [localRecord, ...currentRecords]);
        setBackendMessage("Saved locally. Add Supabase env values to use backend.");
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Upload failed");
      setBackendMessage("Save failed. Check Supabase bucket, table, and policies.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (file) {
      void processFile(file);
    }
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
    setBackendMessage("Signed out. Sign in to access your private archive.");
    setAuthMessage("You are signed out.");
  }

  return (
    <main className="min-h-screen bg-[#111827] text-slate-50">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-6">
        <nav className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-emerald-300">
              Archive AI
            </p>
            <h1 className="mt-1 text-xl font-semibold">
              Upload, analyze, archive
            </h1>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-3 text-sm">
            <a
              className="rounded-md border border-white/15 px-4 py-2 text-slate-200 transition hover:border-emerald-300 hover:text-white"
              href="#archive"
            >
              Archive
            </a>
            <a
              className="rounded-md bg-emerald-300 px-4 py-2 font-medium text-slate-950 transition hover:bg-emerald-200"
              href="#upload"
            >
              Upload file
            </a>
            {HAS_SUPABASE_CONFIG && session ? (
              <button
                className="rounded-md border border-rose-300/30 px-4 py-2 text-rose-100 transition hover:border-rose-200 hover:bg-rose-300/10"
                onClick={() => void handleSignOut()}
                type="button"
              >
                Sign out ({session.user.email ?? "user"})
              </button>
            ) : null}
          </div>
        </nav>

        {HAS_SUPABASE_CONFIG && !session ? (
          <section className="mt-8 rounded-lg border border-violet-300/25 bg-violet-950/25 p-5">
            <div className="max-w-xl">
              <p className="text-sm uppercase tracking-[0.2em] text-violet-300">
                Account gate
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                {authMode === "signin" ? "Sign in to your archive" : "Create your archive account"}
              </h2>
              <p className="mt-3 text-sm leading-6 text-violet-100/70">
                Each account gets its own database rows and Storage folder. Refreshing the page restores this session.
              </p>
              <form className="mt-5 grid gap-3 sm:grid-cols-[1fr_1fr_auto]" onSubmit={handleAuthSubmit}>
                <label className="grid gap-2 text-sm">
                  Email
                  <input
                    className="rounded-md border border-violet-300/30 bg-slate-950/70 px-3 py-2 text-slate-50 outline-none focus:border-violet-200"
                    onChange={(event) => setAuthEmail(event.target.value)}
                    placeholder="you@example.com"
                    required
                    type="email"
                    value={authEmail}
                  />
                </label>
                <label className="grid gap-2 text-sm">
                  Password
                  <input
                    className="rounded-md border border-violet-300/30 bg-slate-950/70 px-3 py-2 text-slate-50 outline-none focus:border-violet-200"
                    minLength={6}
                    onChange={(event) => setAuthPassword(event.target.value)}
                    placeholder="At least 6 characters"
                    required
                    type="password"
                    value={authPassword}
                  />
                </label>
                <button
                  className="self-end rounded-md bg-violet-300 px-4 py-2 font-medium text-violet-950 transition hover:bg-violet-200 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isAuthLoading || !authReady}
                  type="submit"
                >
                  {isAuthLoading ? "Working..." : authMode === "signin" ? "Sign in" : "Register"}
                </button>
              </form>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-violet-100/70">
                <button
                  className="underline decoration-violet-300/50 underline-offset-4 hover:text-white"
                  onClick={() => {
                    setAuthMode(authMode === "signin" ? "signup" : "signin");
                    setAuthMessage(null);
                  }}
                  type="button"
                >
                  {authMode === "signin" ? "Need an account? Register" : "Already registered? Sign in"}
                </button>
                {authMessage ? <span>{authMessage}</span> : null}
              </div>
            </div>
          </section>
        ) : null}

        <div className="grid gap-5 py-8 xl:grid-cols-[0.85fr_1.15fr_1fr]">
          <section className="rounded-lg border border-emerald-300/20 bg-emerald-950/30 p-5">
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-300">
              Backend status
            </p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight">
              {HAS_SUPABASE_CONFIG
                ? session
                  ? "Private Supabase mode"
                  : "Supabase sign-in required"
                : "Local fallback mode"}
            </h2>
            <p className="mt-4 text-sm leading-6 text-emerald-50/75">
              {backendMessage}
            </p>

            <div className="mt-6 grid gap-3">
              <div className="rounded-md bg-white/10 p-4">
                <p className="text-2xl font-semibold">{records.length}</p>
                <p className="mt-1 text-sm text-emerald-100/70">
                  Archive records displayed
                </p>
              </div>
              <div className="rounded-md bg-white/10 p-4">
                <p className="text-2xl font-semibold">
                  {hasLoaded ? "Loaded" : "Loading"}
                </p>
                <p className="mt-1 text-sm text-emerald-100/70">
                  Refresh reads from {HAS_SUPABASE_CONFIG ? "Supabase" : "localStorage"}
                </p>
              </div>
            </div>

            {!HAS_SUPABASE_CONFIG ? (
              <div className="mt-6 rounded-md border border-amber-300/30 bg-amber-300/10 p-4 text-sm leading-6 text-amber-100">
                Add `.env.local` with Supabase URL, anon key, and bucket name,
                then restart the dev server to switch this app to backend mode.
              </div>
            ) : null}
          </section>

          <section
            id="upload"
            className="rounded-lg border border-cyan-300/25 bg-cyan-950/30 p-5"
          >
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">
                  Upload window
                </p>
                <h2 className="mt-2 text-2xl font-semibold">
                  Drag image into the workflow
                </h2>
              </div>
              <div className="rounded-md bg-cyan-300 px-3 py-2 text-sm font-medium text-cyan-950">
                Input
              </div>
            </div>

            <label
              className={`relative block cursor-pointer overflow-hidden rounded-lg border border-dashed p-6 text-center transition ${
                isDragging
                  ? "border-cyan-200 bg-cyan-300/20 shadow-lg shadow-cyan-500/20"
                  : "border-cyan-300/40 bg-slate-950/60 hover:border-cyan-200"
              }`}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <span
                className={`absolute inset-x-6 top-4 h-1 rounded-full bg-cyan-300 transition ${
                  isDragging || isSaving ? "animate-pulse opacity-100" : "opacity-30"
                }`}
              />
              <span className="mt-4 block text-lg font-semibold">
                {isDragging ? "Release to upload" : "Drop file here"}
              </span>
              <span className="mt-3 block text-sm leading-6 text-cyan-50/70">
                {uploadStatus}
              </span>
              <span className="mt-6 inline-flex rounded-md bg-cyan-300 px-5 py-3 font-medium text-cyan-950">
                {isSaving ? "Saving..." : "Choose image"}
              </span>
              <input
                accept="image/*"
                className="sr-only"
                disabled={isSaving || !isAuthenticated}
                onChange={handleFileChange}
                type="file"
              />
            </label>

            <div className="mt-5 rounded-lg border border-cyan-300/15 bg-slate-950/70 p-4">
              <p className="text-sm text-cyan-200">Preview</p>
              {previewUrl ? (
                // Browser object URLs cannot be optimized by next/image.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt={selectedFile?.name ?? "Uploaded preview"}
                  className="mt-4 max-h-72 w-full rounded-md object-contain"
                  src={previewUrl}
                />
              ) : (
                <div className="mt-4 flex h-60 items-center justify-center rounded-md bg-slate-900 text-sm text-slate-500">
                  Waiting for an image
                </div>
              )}
            </div>
          </section>

          <section className="rounded-lg border border-amber-300/25 bg-amber-950/25 p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-amber-300">
                  Analysis window
                </p>
                <h2 className="mt-2 text-2xl font-semibold">
                  Local mock analysis
                </h2>
              </div>
              <div className="rounded-md bg-amber-300 px-3 py-2 text-sm font-medium text-amber-950">
                Review
              </div>
            </div>

            {analysis ? (
              <div className="space-y-3">
                <div className="rounded-md bg-white/10 p-4">
                  <p className="text-sm text-amber-100/70">Document type</p>
                  <p className="mt-1 text-xl font-semibold">
                    {analysis.documentType}
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-md bg-white/10 p-4">
                    <p className="text-sm text-amber-100/70">Category</p>
                    <p className="mt-1 font-semibold">{analysis.category}</p>
                  </div>
                  <div className="rounded-md bg-white/10 p-4">
                    <p className="text-sm text-amber-100/70">File size</p>
                    <p className="mt-1 font-semibold">{analysis.fileSize}</p>
                  </div>
                </div>
                <div className="rounded-md bg-white/10 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-amber-100/70">Confidence</span>
                    <span>{analysis.confidence}%</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-slate-950">
                    <div
                      className="h-2 rounded-full bg-amber-300"
                      style={{ width: `${analysis.confidence}%` }}
                    />
                  </div>
                </div>
                <div className="rounded-md bg-white/10 p-4">
                  <p className="text-sm text-amber-100/70">Next action</p>
                  <p className="mt-2 text-sm leading-6">{analysis.nextAction}</p>
                </div>
              </div>
            ) : (
              <div className="flex min-h-[22rem] items-center justify-center rounded-lg border border-dashed border-amber-300/25 bg-slate-950/60 p-8 text-center text-sm leading-6 text-amber-50/70">
                Upload an image first. This panel will show a local simulated
                analysis before we connect real OCR or AI extraction.
              </div>
            )}
          </section>
        </div>

        {errorMessage ? (
          <section className="mb-5 rounded-lg border border-rose-300/30 bg-rose-950/40 p-4 text-sm leading-6 text-rose-100">
            <p className="font-semibold">Backend error</p>
            <p className="mt-2 break-words">{errorMessage}</p>
          </section>
        ) : null}

        <section
          id="archive"
          className="rounded-lg border border-indigo-300/25 bg-indigo-950/25 p-5"
        >
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-indigo-300">
                Archive window
              </p>
              <h2 className="mt-2 text-2xl font-semibold">Review queue</h2>
            </div>
            <div className="flex flex-col gap-2 sm:items-end">
              <p className="text-sm text-indigo-100/70">
                Latest record: {latestRecord?.name ?? "None yet"}
              </p>
              <div className="flex gap-2">
                <button
                  className="rounded-md border border-indigo-300/30 px-3 py-2 text-sm text-indigo-100 transition hover:border-indigo-200 hover:bg-indigo-300/10"
                  onClick={() => void refreshArchive()}
                  type="button"
                >
                  Refresh from backend
                </button>
                {!HAS_SUPABASE_CONFIG ? (
                  <button
                    className="rounded-md border border-indigo-300/30 px-3 py-2 text-sm text-indigo-100 transition hover:border-indigo-200 hover:bg-indigo-300/10"
                    onClick={resetLocalArchive}
                    type="button"
                  >
                    Reset local archive
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {records.map((record) => (
              <article
                className="rounded-md border border-white/10 bg-slate-950/60 p-4"
                key={record.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-medium">{record.name}</h3>
                    <p className="mt-2 text-sm text-indigo-100/70">
                      {record.category}
                    </p>
                  </div>
                  <p className="rounded-md bg-indigo-300/15 px-2 py-1 text-xs text-indigo-100">
                    {record.status}
                  </p>
                </div>
                <div className="mt-5 flex items-center justify-between text-sm">
                  <span className="text-indigo-100/60">{record.uploadedAt}</span>
                  <span className="font-semibold text-indigo-100">
                    {record.amount}
                  </span>
                </div>
                {record.filePath ? (
                  <p className="mt-3 break-words text-xs text-indigo-100/50">
                    {record.filePath}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <section className="py-8 text-sm leading-6 text-slate-400">
          <p>
            Principle checkpoint: React state is the live page memory.
            Supabase Storage is the file warehouse. Supabase Database is the
            archive ledger. Refreshing the page should read that ledger again.
          </p>
        </section>
      </section>
    </main>
  );
}
