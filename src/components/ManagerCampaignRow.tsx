import { useState } from "react";
import { Link } from "react-router-dom";
import { formatCurrency, formatDate, progressPercent } from "../lib/format";
import { StatusBadge } from "./StatusBadge";
import type { CampaignResponse } from "../api/types";

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
            <Link
              to={`/gestor/campanhas/${campaign.id}/editar`}
              className="rounded-full border border-line px-4 py-2 text-sm text-ink transition-colors hover:border-magenta hover:text-magenta"
            >
              Editar
            </Link>
            {canCancel && (
              <button
                type="button"
                onClick={() => setConfirming(true)}
                className="text-sm text-muted transition-colors hover:text-danger"
              >
                Cancelar
              </button>
            )}
          </>
        )}

        {canCancel && confirming && (
          <>
            <span className="text-sm text-muted">Cancelar campanha?</span>
            <button
              type="button"
              disabled={cancelling}
              onClick={() => onCancel(campaign.id)}
              className="rounded-full bg-danger px-4 py-2 text-sm text-paper disabled:opacity-50"
            >
              {cancelling ? "Cancelando…" : "Confirmar"}
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
