import { Link } from "react-router-dom";
import { formatCurrency, progressPercent } from "../lib/format";
import { Logo } from "./Logo";
import { ProgressBar } from "./ProgressBar";
import type { PublicCampaignResponse } from "../api/types";

export function CampaignCard({ campaign }: { campaign: PublicCampaignResponse }) {
  const percent = progressPercent(campaign.totalRaised, campaign.financialGoal);
  const reached = percent >= 100;

  return (
    <Link
      to={`/campanhas/${campaign.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-canvas transition-shadow hover:shadow-[0_8px_30px_rgba(15,14,23,0.08)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-indigo">
        {campaign.image ? (
          <img
            src={campaign.image}
            alt=""
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo to-magenta">
            <Logo className="h-10 w-10 opacity-70" />
          </div>
        )}

        {reached && (
          <span className="absolute left-3 top-3 rounded-full bg-goal px-3 py-1 text-xs text-paper">
            Meta atingida
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg text-ink group-hover:text-magenta">{campaign.title}</h3>
        <p className="mt-1.5 line-clamp-2 text-sm text-muted">{campaign.description}</p>

        <div className="mt-4">
          <ProgressBar raised={campaign.totalRaised} goal={campaign.financialGoal} />
        </div>

        <div className="mt-2 flex items-baseline justify-between gap-2">
          <span className="tabular-nums text-sm text-ink">{formatCurrency(campaign.totalRaised)}</span>
          <span className={`tabular-nums text-xs ${reached ? "text-goal" : "text-muted"}`}>
            {percent}% de {formatCurrency(campaign.financialGoal)}
          </span>
        </div>
      </div>
    </Link>
  );
}
