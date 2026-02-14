const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export interface ApiError {
  error?: string;
  errors?: { param: string; msg: string }[];
}

/**
 * Wrapper around fetch to call our backend.
 * - Automatically sets JSON headers.
 * - Sends cookies for session (credentials: 'include').
 * - Parses JSON responses.
 */
export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    // Very important for session cookies:
    credentials: "include"
  });

  const contentType = res.headers.get("Content-Type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    throw data ?? { error: "Request failed" };
  }

  return data as T;
}