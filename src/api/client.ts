const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5054";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// O usuario-api (emissor do JWT real) ainda não existe. Enquanto isso, em dev,
// a campanha-api aceita um header X-Dev-Role no lugar de um token (ver
// AuthConfig.cs/DevAuthHandler.cs no backend) — nunca disponível fora de
// Development. Reaproveitamos a sessão local do AuthContext (mesma chave de
// localStorage) só pra anexar esse header quando existir um gestor "logado".
function devAuthHeaders(): Record<string, string> {
  if (!import.meta.env.DEV) return {};

  try {
    const raw = localStorage.getItem("gestor-session");
    if (!raw) return {};
    const session = JSON.parse(raw) as { email?: string };
    if (!session.email) return {};
    return { "X-Dev-Role": "GestorONG", "X-Dev-User": session.email };
  } catch {
    return {};
  }
}

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

export async function apiGet<T>(path: string, params?: Record<string, string | undefined>): Promise<T> {
  const url = new URL(path, BASE_URL);
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value) url.searchParams.set(key, value);
  }

  const response = await fetch(url, {
    headers: { Accept: "application/json", ...devAuthHeaders() },
  });

  return handle<T>(response, path);
}

async function send<T>(method: string, path: string, body?: unknown): Promise<T> {
  const response = await fetch(new URL(path, BASE_URL), {
    method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...devAuthHeaders(),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  return handle<T>(response, path);
}

export const apiPost = <T>(path: string, body?: unknown) => send<T>("POST", path, body);
export const apiPut = <T>(path: string, body?: unknown) => send<T>("PUT", path, body);

export async function apiUpload<T>(path: string, formData: FormData): Promise<T> {
  const response = await fetch(new URL(path, BASE_URL), {
    method: "POST",
    // Sem Content-Type manual: o browser define o multipart/form-data com o
    // boundary certo sozinho a partir do FormData.
    headers: { Accept: "application/json", ...devAuthHeaders() },
    body: formData,
  });

  return handle<T>(response, path);
}
