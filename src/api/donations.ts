import { gatewayGet, gatewayPost } from "./gatewayClient";
import type { DonationReceiptResponse, DonationResponse, PaymentMethod } from "./types";

export interface DonatePayload {
  campaignId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  idToken: string;
}

// Doar exige um doador logado de verdade (usuario-api) — o token vai como
// Bearer e a campanha-api extrai o DonorId dele (ver ICurrentUserService /
// CreateDonationCommandHandler no backend), não é mais enviado pelo cliente.
// Passa pelo API Gateway (/api/v1/doacoes), com CUSTOM auth via lambda
// authorizer (role Doador) — ver terraform/k8s/main.tf.
export function donate(payload: DonatePayload) {
  return gatewayPost<DonationResponse>(
    "/api/v1/doacoes",
    {
      campaignId: payload.campaignId,
      amount: payload.amount,
      paymentMethod: payload.paymentMethod,
    },
    { Authorization: `Bearer ${payload.idToken}` },
  );
}

export function getMyDonations(idToken: string) {
  return gatewayGet<DonationReceiptResponse[]>("/api/v1/doacoes/me", undefined, {
    Authorization: `Bearer ${idToken}`,
  });
}
