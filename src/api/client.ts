import { isTokenExpired } from "../auth/sessionStorage";

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
