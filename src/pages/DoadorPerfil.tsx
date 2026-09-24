import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { isPermissionDenied, isSessionRejected, PERMISSION_DENIED_MESSAGE } from "../api/client";
import { getMyDonations } from "../api/donations";
import type { DonationStatus, PaymentMethod } from "../api/types";
import { useAuth } from "../auth/AuthContext";
import { formatCurrency, formatDate } from "../lib/format";

const statusStyles: Record<DonationStatus, string> = {
  Pending: "bg-warning/10 text-warning",
  PaymentProcessing: "bg-warning/10 text-warning",
  Approved: "bg-goal/10 text-goal",
  Rejected: "bg-danger/10 text-danger",
};

const statusLabels: Record<DonationStatus, string> = {
  Pending: "Pendente",
  PaymentProcessing: "Processando",
  Approved: "Aprovada",
  Rejected: "Rejeitada",
};

const paymentMethodLabels: Record<PaymentMethod, string> = {
  Pix: "Pix",
  CreditCard: "Cartão de crédito",
  DebitCard: "Cartão de débito",
  Boleto: "Boleto",
};

export function DoadorPerfil() {
  const { session, logout, expireSession } = useAuth();
  const navigate = useNavigate();
  // Sair daqui limpa a sessão, e a guarda abaixo (sem sessão -> /entrar) disputaria
  // com o navigate("/") — quem clica em Sair quer ir pra home, não pro login.
  const [leaving, setLeaving] = useState(false);

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["my-donations", session?.idToken],
    queryFn: () => getMyDonations(session!.idToken),
    enabled: Boolean(session),
    // Token vencido/rejeitado não se resolve tentando de novo.
    retry: (failureCount, err) =>
      isSessionRejected(err, session?.idToken ?? "") || isPermissionDenied(err, session?.idToken ?? "")
        ? false
        : failureCount < 3,
    // O worker aprova a doação de forma assíncrona: enquanto houver alguma
    // pendente, reconsulta sozinho pra o status virar Aprovada sem F5.
    refetchInterval: (query) =>
      query.state.data?.some((d) => d.status === "Pending" || d.status === "PaymentProcessing") ? 3000 : false,
  });

  const authFailed = isSessionRejected(error, session?.idToken ?? "");
  const permissionDenied = isPermissionDenied(error, session?.idToken ?? "");

  useEffect(() => {
    if (authFailed) expireSession();
  }, [authFailed, expireSession]);

  if (!session || authFailed) {
    return leaving ? null : <Navigate to="/entrar" replace />;
  }

  function handleLogout() {
    setLeaving(true);
    logout();
    navigate("/");
  }

  return (
    <div className="mx-auto max-w-xl px-5 py-16 sm:px-10">
      <Link to="/" className="text-sm text-muted hover:text-magenta">
        Voltar ao painel
      </Link>

      <h1 className="font-display mt-6 text-2xl text-ink">{session.name}</h1>
      <p className="mt-1 text-sm text-muted">{session.email}</p>

      <h2 className="mt-8 text-sm text-ink">Minhas doações</h2>

      {isPending && <p className="mt-3 text-sm text-muted">Carregando…</p>}

      {isError && (
        <p className="mt-3 text-sm text-muted">
          {permissionDenied ? PERMISSION_DENIED_MESSAGE : "Não foi possível carregar suas doações agora."}
        </p>
      )}

      {data && data.length === 0 && (
        <p className="mt-3 text-sm text-muted">Você ainda não fez nenhuma doação.</p>
      )}

      {data && data.length > 0 && (
        <ul className="mt-3 flex flex-col gap-2">
          {data.map((donation) => (
            <li
              key={donation.donationId}
              className="rounded-lg border border-line p-4 text-sm text-ink"
            >
              <div className="flex items-start justify-between gap-3">
                <Link
                  to={`/campanhas/${donation.campaignId}`}
                  className="font-medium text-ink hover:text-magenta"
                >
                  {donation.campaignTitle}
                </Link>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[donation.status]}`}
                >
                  {statusLabels[donation.status]}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted">
                {formatDate(donation.createdAt)} · {paymentMethodLabels[donation.paymentMethod]}
              </p>
              <p className="mt-2 tabular-nums text-ink">{formatCurrency(donation.amount)}</p>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={handleLogout}
        className="mt-8 text-sm text-muted transition-colors hover:text-magenta"
      >
        Sair
      </button>
    </div>
  );
}
