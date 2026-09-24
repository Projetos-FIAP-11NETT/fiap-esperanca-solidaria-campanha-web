import { useState } from "react";
import { Link } from "react-router-dom";
import { formatCurrency, formatDate, progressPercent } from "../lib/format";
import { StatusBadge } from "./StatusBadge";
import type { CampaignResponse } from "../api/types";

// Espelha Campaign.Cancel() (Domain/Aggregates/CampaignAggregate/Campaign.cs): se a meta
// já foi atingida, cancelar não gera Cancelled — o backend conclui a campanha (Completed).
// O botão reflete isso: quando a meta já bateu, oferece "Finalizar" em vez de "Cancelar",
// pra não sugerir que a campanha vai ser marcada como malsucedida.
function goalReached(campaign: CampaignResponse) {
  return campaign.totalRaised >= campaign.financialGoal;
}

export function ManagerCampaignRow({
  campaign,
  onCancel,
  cancelling,
}: {
  campaign: CampaignResponse;
  onCancel: (id: string) => void;
  cancelling: boolean;
}) {
  const [confirming, setConfirming] = useState(false);
  const percent = progressPercent(campaign.totalRaised, campaign.financialGoal);
  const canCancel = campaign.status === "Active" || campaign.status === "Scheduled";
  // Campanha concluída ou cancelada é histórico: editar já feito faria menos sentido
  // que preencher um rascunho novo a partir dela.
  const canEdit = canCancel;
  const finalizing = canCancel && goalReached(campaign);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line py-5">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-display text-lg text-ink">{campaign.title}</h3>
          <StatusBadge status={campaign.status} />
        </div>
        <p className="mt-1 text-sm text-muted">
          {formatDate(campaign.startDate)} até {formatDate(campaign.endDate)} ·{" "}
          <span className="tabular-nums">{formatCurrency(campaign.totalRaised)}</span> de{" "}
          <span className="tabular-nums">{formatCurrency(campaign.financialGoal)}</span> (
          <span className="tabular-nums">{percent}%</span>)
        </p>
      </div>

      <div className="flex items-center gap-3">
        {!(canCancel && confirming) && (
          <>
            {canEdit ? (
              <Link
                to={`/gestor/campanhas/${campaign.id}/editar`}
                className="rounded-full border border-line px-4 py-2 text-sm text-ink transition-colors hover:border-magenta hover:text-magenta"
              >
                Editar
              </Link>
            ) : (
              <Link
                to="/gestor/nova"
                state={{ duplicateFrom: campaign }}
                className="rounded-full border border-line px-4 py-2 text-sm text-ink transition-colors hover:border-magenta hover:text-magenta"
              >
                Duplicar
              </Link>
            )}
            {canCancel && (
              <button
                type="button"
                onClick={() => setConfirming(true)}
                className={`text-sm text-muted transition-colors ${finalizing ? "hover:text-goal" : "hover:text-danger"}`}
              >
                {finalizing ? "Finalizar campanha" : "Cancelar"}
              </button>
            )}
          </>
        )}

        {canCancel && confirming && (
          <>
            <span className="text-sm text-muted">
              {finalizing ? "A meta já foi atingida. Finalizar campanha?" : "Cancelar campanha?"}
            </span>
            <button
              type="button"
              disabled={cancelling}
              onClick={() => onCancel(campaign.id)}
              className={`rounded-full px-4 py-2 text-sm text-paper disabled:opacity-50 ${finalizing ? "bg-goal" : "bg-danger"}`}
            >
              {cancelling ? (finalizing ? "Finalizando…" : "Cancelando…") : "Confirmar"}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="text-sm text-muted hover:text-ink"
            >
              Voltar
            </button>
          </>
        )}
      </div>
    </div>
  );
}
