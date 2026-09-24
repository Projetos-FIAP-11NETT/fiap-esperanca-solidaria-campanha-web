import { gatewayDelete, gatewayPost, gatewayUpload } from "./gatewayClient";
import type { LoginPayload, LoginResponse, SignupPayload, UploadUserImageResponse } from "./types";

export function signup(payload: SignupPayload) {
  return gatewayPost<void>("/users/api/v1/User", payload);
}

// Anônimo de propósito (ver UserController.UploadImageAsync na usuario-api): no
// cadastro ainda não existe conta pra autenticar contra, então a foto sobe antes
// do POST /User e a URL devolvida aqui entra no campo `image` do signup.
export function uploadUserImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return gatewayUpload<UploadUserImageResponse>("/users/api/v1/User/images", formData);
}

export function login(payload: LoginPayload) {
  return gatewayPost<LoginResponse>("/users/api/v1/User/Login", payload);
}

export function logoutSession(sessionId: string, idToken: string) {
  return gatewayDelete<void>(`/users/api/v1/User/Session/${sessionId}`, {
    Authorization: `Bearer ${idToken}`,
  });
}
