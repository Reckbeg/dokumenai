/**
 * API key for authenticated requests.
 * Set NEXT_PUBLIC_API_KEY in .env to enable.
 * When empty, requests go through without auth header (dev mode).
 */
export const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';

export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  if (API_KEY) {
    headers['Authorization'] = `Bearer ${API_KEY}`;
  }

  return fetch(url, { ...options, headers });
}
