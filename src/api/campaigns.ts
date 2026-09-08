import { apiGet, apiPost, apiPut, apiUpload } from "./client";
import type { CampaignFormPayload, CampaignResponse, PublicCampaignResponse } from "./types";

export function listPublicCampaigns(title?: string) {
  return apiGet<PublicCampaignResponse[]>("/api/v1/Campaign/public", { title });
}

export function getCampaignById(id: string) {
  return apiGet<CampaignResponse>(`/api/v1/Campaign/${id}`);
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
