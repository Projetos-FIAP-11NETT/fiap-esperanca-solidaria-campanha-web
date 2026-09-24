// Decodifica só o payload do JWT no cliente — a assinatura nunca é
// verificada aqui (isso é papel do backend); é usado só pra ler claims
// públicas (name, email) que o token já carrega, sem round-trip extra.
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((char) => "%" + char.charCodeAt(0).toString(16).padStart(2, "0"))
        .join(""),
    );

    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

// Instante de expiração (ms desde a época) a partir da claim `exp`, ou null se
// o token não for um JWT legível / não tiver `exp`.
export function getJwtExpiry(token: string): number | null {
  const exp = decodeJwtPayload(token)?.exp;
  return typeof exp === "number" ? exp * 1000 : null;
}

// Papéis do usuário a partir da custom claim "roles" que a usuario-api grava no
// Firebase (array; aceita string solta por robustez). Só pra decidir o que
// mostrar na UI — quem autoriza de verdade é o backend.
export function getJwtRoles(token: string): string[] {
  const roles = decodeJwtPayload(token)?.roles;
  if (Array.isArray(roles)) return roles.filter((role): role is string => typeof role === "string");
  return typeof roles === "string" ? [roles] : [];
}
