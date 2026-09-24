import { getJwtExpiry } from "../lib/jwt";

// Sessão única do app (doador e gestor são o mesmo login; o papel vem no token).
export const SESSION_STORAGE_KEY = "auth-session";

export interface Session {
  email: string;
  name: string;
  idToken: string;
  refreshToken: string;
  sessionId: string;
}

export function isTokenExpired(token: string): boolean {
  const expiry = getJwtExpiry(token);
  return expiry !== null && expiry <= Date.now();
}

// Lida direto do localStorage (e não do React) pra que o cliente HTTP consiga
// anexar o Bearer mesmo em chamadas disparadas antes do provider montar.
export function readStoredSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function storedAuthHeaders(): Record<string, string> {
  const session = readStoredSession();
  if (!session || isTokenExpired(session.idToken)) return {};
  return { Authorization: `Bearer ${session.idToken}` };
}
