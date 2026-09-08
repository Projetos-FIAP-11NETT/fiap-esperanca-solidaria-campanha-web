// Espelha FiapEsperancaSolidaria.Campanha.Application.DTOs

export type CampaignStatus = "Scheduled" | "Active" | "Completed" | "Cancelled";

export interface PublicCampaignResponse {
  id: string;
  title: string;
  description: string;
  image: string | null;
  financialGoal: number;
  totalRaised: number;
}

export interface CampaignResponse {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  image: string | null;
  financialGoal: number;
  status: CampaignStatus;
  totalRaised: number;
}

// Espelha CreateCampaignCommand / UpdateCampaignRequest (Api/Controllers/CampaignController.cs)
export interface CampaignFormPayload {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  financialGoal: number;
  image: string | null;
}
