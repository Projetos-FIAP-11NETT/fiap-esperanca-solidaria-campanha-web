import { formatCurrency } from "../lib/format";
import { PageWidth } from "./PageWidth";
import type { PublicCampaignResponse } from "../api/types";

export function StatsBar({ campaigns }: { campaigns: PublicCampaignResponse[] }) {
  const totalRaised = campaigns.reduce((sum, c) => sum + c.totalRaised, 0);
  const reachedGoal = campaigns.filter((c) => c.totalRaised >= c.financialGoal).length;

  return (
    <div className="relative overflow-hidden bg-indigo">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-magenta opacity-20 blur-3xl"
      />

      <PageWidth className="relative py-12 sm:py-16">
        <p className="text-sm text-paper/70 sm:text-base">Isso é o que sua comunidade já construiu</p>
        <p className="mt-2 font-display text-4xl leading-tight text-paper sm:text-5xl md:text-6xl">
          <span className="tabular-nums text-magenta">{formatCurrency(totalRaised)}</span>
          <br className="sm:hidden" /> arrecadados
        </p>
        <p className="mt-3 text-sm text-paper/70 sm:text-base">
          <span className="tabular-nums text-paper">{campaigns.length}</span> campanha
          {campaigns.length === 1 ? "" : "s"} ativa{campaigns.length === 1 ? "" : "s"}
          {reachedGoal > 0 && (
            <>
              {" · "}
              <span className="tabular-nums text-goal">{reachedGoal}</span> com meta atingida
            </>
          )}
        </p>
      </PageWidth>
    </div>
  );
}
