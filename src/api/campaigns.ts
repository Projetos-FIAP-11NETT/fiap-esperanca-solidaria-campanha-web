import { apiGet, apiPost, apiPut, apiUpload } from "./client";
import { gatewayGet } from "./gatewayClient";
import type { CampaignFormPayload, CampaignResponse, PublicCampaignResponse } from "./types";

// Leitura pública passa pelo API Gateway (ver fiap-esperanca-solidaria-infra
// terraform/k8s/main.tf) — as rotas GET de /api/v1/campanhas(/{id}) não
// exigem auth. CRUD de gestor continua direto no campanha-api: o gateway
// ainda não tem rota nenhuma pra listagem admin, cancelamento ou upload de
// imagem. Essas chamadas levam o Bearer do login (papel GestorONG no token).
export function listPublicCampaigns(title?: string) {
  return gatewayGet<PublicCampaignResponse[]>("/api/v1/campanhas", { title });
}

export function getCampaignById(id: string) {
  return gatewayGet<CampaignResponse>(`/api/v1/campanhas/${id}`);
}

export function listCampaigns() {
  return apiGet<CampaignResponse[]>("/api/v1/Campaign");
}

export function createCampaign(payload: CampaignFormPayload) {
  return apiPost<CampaignResponse>("/api/v1/Campaign", payload);
}

export function updateCampaign(id: string, payload: CampaignFormPayload) {
  return apiPut<CampaignResponse>(`/api/v1/Campaign/${id}`, payload);
}

export function cancelCampaign(id: string) {
  return apiPost<CampaignResponse>(`/api/v1/Campaign/${id}/cancel`);
}

export function uploadCampaignImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return apiUpload<{ url: string }>("/api/v1/Campaign/images", formData);
}
