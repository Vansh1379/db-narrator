// API Client for Backend Integration
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://jellyfish-app-z7mbn.ondigitalocean.app";

export class ApiError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(message: string, statusCode: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

type AuthGetter = () => Promise<string | null>;

type RequestOptions = Omit<RequestInit, "headers"> & {
  headers?: HeadersInit;
  requiresAuth?: boolean;
};

async function request<T>(
  path: string,
  getToken: AuthGetter | null,
  { headers, requiresAuth = true, ...init }: RequestOptions = {}
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  const finalHeaders = new Headers(headers ?? {});

  if (requiresAuth) {
    if (!getToken) {
      throw new ApiError("Authentication required", 401);
    }
    const token = await getToken();
    if (!token) {
      throw new ApiError("Missing authentication token", 401);
    }
    finalHeaders.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...init,
    headers: finalHeaders,
  });

  const isJson = response.headers
    .get("content-type")
    ?.includes("application/json");
  const body = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      typeof body === "object" && body && "message" in body
        ? (body as { message: string }).message
        : response.statusText || "Request failed";
    throw new ApiError(message, response.status, body);
  }

  return body as T;
}

// ============ Type Definitions ============

export interface UploadSqlResponse {
  status: string;
  sessionId: string;
  tables: string[];
  message?: string;
}

export interface SchemaColumn {
  name: string;
  type: string;
  pk: boolean;
  notNull: boolean;
  defaultValue: string | null;
}

export interface ForeignKey {
  id: number;
  table: string;
  from: string;
  to: string;
  onUpdate: string;
  onDelete: string;
}

export interface SchemaTable {
  name: string;
  columns: SchemaColumn[];
  foreignKeys?: ForeignKey[];
  rowCount?: number;
  sampleRows?: Record<string, unknown>[];
}

export interface SchemaResponse {
  sessionId: string;
  tables: SchemaTable[];
}

export interface QueryRequestBody {
  query: string;
  topK?: number;
}

export interface QueryResponse {
  sql: string;
  explanation: string;
  rows: Record<string, unknown>[];
  totalRows?: number;
  executionTime?: number;
  chartData?: {
    type: "bar" | "line" | "pie";
    xKey: string;
    yKey: string;
    data?: Record<string, unknown>[];
  };
  sources: Array<{
    id: string;
    type?: string;
    text: string;
    score?: number;
    meta?: Record<string, unknown>;
  }>;
  confidence?: number;
  tables_used?: string[];
}

export interface SessionsResponse {
  sessions: Array<{
    sessionId: string;
    fileName: string;
    tables: string[];
    uploadedAt: string;
  }>;
}

// ============ API Functions ============

export async function uploadSqlFile(
  getToken: AuthGetter,
  file: File,
  options: { name?: string } = {}
) {
  const formData = new FormData();
  formData.append("file", file);
  if (options.name) {
    formData.append("name", options.name);
  }

  return request<UploadSqlResponse>("/api/upload-sql", getToken, {
    method: "POST",
    body: formData,
  });
}

export function fetchSchema(getToken: AuthGetter, sessionId: string) {
  return request<SchemaResponse>(`/api/schema/${sessionId}`, getToken, {
    method: "GET",
  });
}

export function fetchSessions(getToken: AuthGetter) {
  return request<SessionsResponse>("/api/sessions", getToken, {
    method: "GET",
  });
}

export function deleteSession(getToken: AuthGetter, sessionId: string) {
  return request<{ status: string; message: string }>(
    `/api/sessions/${sessionId}`,
    getToken,
    {
      method: "DELETE",
    }
  );
}

export function runQuery(
  getToken: AuthGetter,
  sessionId: string,
  body: QueryRequestBody
) {
  return request<QueryResponse>(`/api/query/${sessionId}`, getToken, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

export { API_BASE_URL };
