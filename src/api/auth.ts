import { gatewayDelete, gatewayPost, gatewayUpload } from "./gatewayClient";
import type { LoginPayload, LoginResponse, SignupPayload, UploadUserImageResponse } from "./types";

// POST /User/Doador (não /User — a usuario-api separou o cadastro público de
// doador do de gestor, que exige estar logado como GestorONG: ver UserController).
export function signup(payload: SignupPayload) {
  return gatewayPost<void>("/users/api/v1/User/Doador", payload);
}

// Anônimo de propósito (ver UserController.UploadImageAsync na usuario-api): no
// cadastro ainda não existe conta pra autenticar contra, então a foto sobe antes
// do POST /User/Doador e a URL devolvida aqui entra no campo `image` do signup.
export function uploadUserImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return gatewayUpload<UploadUserImageResponse>("/users/api/v1/User/images", formData);
}

export function login(payload: LoginPayload) {
  return gatewayPost<LoginResponse>("/users/api/v1/User/Login", payload);
}

// Sem Bearer de propósito — a credencial aqui é o par sessionId+refreshToken no
// corpo, não o idToken (que já pode estar vencido, é o que estamos renovando). Cada
// chamada também renova a sessão no servidor por mais 1h (SessionLifetime.Duration
// na usuario-api), então renovar antes do idToken vencer evita o logout forçado.
export function refreshToken(sessionId: string, refreshToken: string) {
  return gatewayPost<LoginResponse>("/users/api/v1/User/RefreshToken", { sessionId, refreshToken });
}

export function logoutSession(sessionId: string, idToken: string) {
  return gatewayDelete<void>(`/users/api/v1/User/Session/${sessionId}`, {
    Authorization: `Bearer ${idToken}`,
  });
}
