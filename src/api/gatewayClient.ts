import { ApiError } from "./client";

// Base do API Gateway (LocalStack + Lambda authorizer, ver
// fiap-esperanca-solidaria-infra/terraform/k8s/main.tf). O id da REST API muda
// a cada restart do LocalStack — `npm run gateway:sync` (também roda sozinho
// no predev) descobre o id atual e grava em .env.development.
const REQUEST_TIMEOUT_MS = 30_000;
const BASE_URL: string | undefined = import.meta.env.VITE_GATEWAY_BASE_URL;

// O gateway (authorizer) responde {"Message": "..."} com M maiúsculo; os
// backends respondem {"message": "..."}.
function extractMessage(body: unknown, fallback: string): string {
  if (!body || typeof body !== "object") return fallback;
  const entry = Object.entries(body).find(([key]) => key.toLowerCase() === "message");
  return typeof entry?.[1] === "string" && entry[1] ? entry[1] : fallback;
}

async function handle<T>(response: Response, path: string): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ApiError(response.status, extractMessage(body, `Falha ao chamar ${path}: ${response.status}`));
  }

  // Vários integration_response do gateway (e o próprio backend em POSTs
  // 201) não trazem corpo — .json() numa resposta vazia lança SyntaxError.
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

function buildUrl(path: string, params?: Record<string, string | undefined>): URL {
  if (!BASE_URL) {
    throw new Error("VITE_GATEWAY_BASE_URL não definida — rode `npm run gateway:sync` (LocalStack no ar).");
  }

  // BASE_URL termina sem "/" (ex.: ".../dev/_user_request_") — new URL exige
  // que a base termine em "/" pra resolver um path relativo corretamente.
  const url = new URL(path.replace(/^\//, ""), `${BASE_URL}/`);
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value) url.searchParams.set(key, value);
  }
  return url;
}

async function request<T>(
  method: string,
  path: string,
  options: { params?: Record<string, string | undefined>; body?: unknown; headers?: Record<string, string> } = {},
): Promise<T> {
  const hasBody = options.body !== undefined;
  let response: Response;
  try {
    response = await fetch(buildUrl(path, options.params), {
      method,
      headers: {
        Accept: "application/json",
        ...(hasBody ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
      body: hasBody ? JSON.stringify(options.body) : undefined,
      // Sem isso, um gateway/lambda pendurado deixa a tela girando pra sempre.
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") {
      throw new ApiError(504, "O servidor demorou demais para responder. Tente novamente em instantes.");
    }
    throw error;
  }
  return handle<T>(response, path);
}

// Sem Content-Type manual: o navegador define o multipart/form-data com o
// boundary certo sozinho a partir do FormData.
export async function gatewayUpload<T>(path: string, formData: FormData): Promise<T> {
  let response: Response;
  try {
    response = await fetch(buildUrl(path), {
      method: "POST",
      headers: { Accept: "application/json" },
      body: formData,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") {
      throw new ApiError(504, "O servidor demorou demais para responder. Tente novamente em instantes.");
    }
    throw error;
  }
  return handle<T>(response, path);
}

export const gatewayGet = <T>(
  path: string,
  params?: Record<string, string | undefined>,
  headers?: Record<string, string>,
) => request<T>("GET", path, { params, headers });

export const gatewayPost = <T>(path: string, body?: unknown, headers?: Record<string, string>) =>
  request<T>("POST", path, { body, headers });

export const gatewayDelete = <T>(path: string, headers?: Record<string, string>) =>
  request<T>("DELETE", path, { headers });
