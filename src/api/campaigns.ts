import { storedAuthHeaders } from "../auth/sessionStorage";
import { gatewayGet, gatewayPost, gatewayPut, gatewayUpload } from "./gatewayClient";
import type { CampaignFormPayload, CampaignResponse, PublicCampaignResponse } from "./types";

// Tudo passa pelo API Gateway (ver fiap-esperanca-solidaria-infra
// terraform/k8s/main.tf). As leituras públicas (GET /api/v1/campanhas e
// /{id}) são authorization=NONE; o CRUD do gestor é CUSTOM — o Lambda
// authorizer exige o papel GestorONG no Bearer do login.
export function listPublicCampaigns(title?: string) {
  return gatewayGet<PublicCampaignResponse[]>("/api/v1/campanhas", { title });
}

export function getCampaignById(id: string) {
  return gatewayGet<CampaignResponse>(`/api/v1/campanhas/${id}`);
}

export function listCampaigns() {
  return gatewayGet<CampaignResponse[]>("/api/v1/campanhas/gestao", undefined, storedAuthHeaders());
}

export function createCampaign(payload: CampaignFormPayload) {
  return gatewayPost<CampaignResponse>("/api/v1/campanhas", payload, storedAuthHeaders());
}

export function updateCampaign(id: string, payload: CampaignFormPayload) {
  return gatewayPut<CampaignResponse>(`/api/v1/campanhas/${id}`, payload, storedAuthHeaders());
}

export function cancelCampaign(id: string) {
  return gatewayPost<CampaignResponse>(`/api/v1/campanhas/${id}/cancel`, undefined, storedAuthHeaders());
}

export function uploadCampaignImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return gatewayUpload<{ url: string }>("/api/v1/campanhas/images", formData, storedAuthHeaders());
}
