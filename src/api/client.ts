import { isTokenExpired, storedAuthHeaders } from "../auth/sessionStorage";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5054";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// 401 (token ausente/inválido) sempre derruba a sessão. 403 é ambíguo: o
// authorizer do gateway nega com "explicit deny" tanto token vencido quanto
// role insuficiente. Só é sessão vencida se o token realmente venceu; com token
// válido é falta de permissão (ex.: conta sem a role Doador) e entrar de novo
// não resolve — as telas mostram isso em vez de mandar o usuário pro login.
export function isSessionRejected(error: unknown, idToken: string): boolean {
  if (!(error instanceof ApiError)) return false;
  return error.status === 401 || (error.status === 403 && isTokenExpired(idToken));
}

export function isPermissionDenied(error: unknown, idToken: string): boolean {
  return error instanceof ApiError && error.status === 403 && !isTokenExpired(idToken);
}

export const PERMISSION_DENIED_MESSAGE =
  "Sua conta não tem permissão para essa ação. Doar exige uma conta com perfil de doador.";

function extractMessage(body: unknown, fallback: string): string {
  if (!body || typeof body !== "object") return fallback;
  const parsed = body as { error?: string; title?: string; errors?: Record<string, string[]> };

  if (parsed.errors) {
    const messages = Object.values(parsed.errors).flat();
    if (messages.length > 0) return messages.join(" ");
  }

  return parsed.error ?? parsed.title ?? fallback;
}

async function handle<T>(response: Response, path: string): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ApiError(response.status, extractMessage(body, `Falha ao chamar ${path}: ${response.status}`));
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function apiGet<T>(
  path: string,
  params?: Record<string, string | undefined>,
  extraHeaders?: Record<string, string>,
): Promise<T> {
  const url = new URL(path, BASE_URL);
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value) url.searchParams.set(key, value);
  }

  const response = await fetch(url, {
    headers: { Accept: "application/json", ...storedAuthHeaders(), ...extraHeaders },
  });

  return handle<T>(response, path);
}

async function send<T>(
  method: string,
  path: string,
  body?: unknown,
  extraHeaders?: Record<string, string>,
): Promise<T> {
  const response = await fetch(new URL(path, BASE_URL), {
    method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...storedAuthHeaders(),
      ...extraHeaders,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  return handle<T>(response, path);
}

export const apiPost = <T>(path: string, body?: unknown, extraHeaders?: Record<string, string>) =>
  send<T>("POST", path, body, extraHeaders);
export const apiPut = <T>(path: string, body?: unknown) => send<T>("PUT", path, body);

export async function apiUpload<T>(path: string, formData: FormData): Promise<T> {
  const response = await fetch(new URL(path, BASE_URL), {
    method: "POST",
    // Sem Content-Type manual: o browser define o multipart/form-data com o
    // boundary certo sozinho a partir do FormData.
    headers: { Accept: "application/json", ...storedAuthHeaders() },
    body: formData,
  });

  return handle<T>(response, path);
}
