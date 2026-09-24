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

export type PaymentMethod = "CreditCard" | "DebitCard" | "Pix" | "Boleto";

export type DonationStatus = "Pending" | "PaymentProcessing" | "Approved" | "Rejected";

// Espelha DonationResponse (Application/DTOs) — DonorId vem do token no
// backend (não é mais enviado pelo cliente, ver CreateDonationCommand).
export interface DonationResponse {
  id: string;
  campaignId: string;
  donorId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: DonationStatus;
  createdAt: string;
}

// Espelha DonationReceiptResponse (Application/DTOs) — usada em GET /api/v1/Donation/me.
export interface DonationReceiptResponse {
  donationId: string;
  campaignId: string;
  campaignTitle: string;
  campaignStatus: CampaignStatus;
  amount: number;
  paymentMethod: PaymentMethod;
  status: DonationStatus;
  createdAt: string;
}

// Espelha CreateUserCommand / LoginUserCommand (usuario-api,
// Application/UserFeature/Commands) — serviço separado, emissor do JWT real.
// cpf: só dígitos (User.ValidateCPF exige 11 dígitos numéricos). image é a URL
// que volta de POST /users/api/v1/User/images (opcional, ver uploadUserImage).
export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  cpf: string;
  image?: string | null;
}

// Espelha UploadUserImageResponse (usuario-api, Contract/Dto/Response).
export interface UploadUserImageResponse {
  url: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

// Espelha LoginResponse (usuario-api, Contract/Dto/Response).
export interface LoginResponse {
  sessionId: string;
  idToken: string;
  refreshToken: string;
  expiresIn: number;
  email: string;
}
