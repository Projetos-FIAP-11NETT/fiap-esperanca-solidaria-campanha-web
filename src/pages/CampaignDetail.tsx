import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { getCampaignById } from "../api/campaigns";
import { DonationForm } from "../components/DonationForm";
import { Logo } from "../components/Logo";
import { PageWidth } from "../components/PageWidth";
import { ProgressBar } from "../components/ProgressBar";
import { formatCurrency, formatDate, progressPercent, statusLabel } from "../lib/format";

export function CampaignDetail() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["campaign", id],
    queryFn: () => getCampaignById(id!),
    enabled: Boolean(id),
  });

  if (isLoading) {
    return <PageWidth className="py-10 text-muted">Carregando campanha…</PageWidth>;
  }

  if (isError || !data) {
    return (
      <PageWidth className="py-10">
        <p className="text-magenta">Não encontramos essa campanha.</p>
        <Link to="/" className="mt-4 inline-block text-sm text-muted hover:text-magenta">
          Voltar ao painel
        </Link>
      </PageWidth>
    );
  }

  const percent = progressPercent(data.totalRaised, data.financialGoal);
  const reached = percent >= 100;

  return (
    <PageWidth className="py-8 sm:py-10">
      <Link to="/" className="text-sm text-muted hover:text-magenta">
        Voltar ao painel
      </Link>

      <h1 className="font-display mt-4 text-2xl text-ink sm:text-4xl">{data.title}</h1>

      <p className="mt-2 text-sm text-muted">
        {formatDate(data.startDate)} até {formatDate(data.endDate)} · {statusLabel(data.status)}
      </p>

      <div className="mt-6 grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="aspect-video w-full overflow-hidden rounded-2xl bg-indigo">
            {data.image ? (
              <img src={data.image} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo to-magenta">
                <Logo className="h-14 w-14 opacity-70" />
              </div>
            )}
          </div>

          <p className="mt-6 max-w-xl whitespace-pre-line text-ink/90">{data.description}</p>
        </div>

        <aside className="rounded-2xl border border-line p-7 lg:sticky lg:top-6 lg:col-span-2 lg:h-fit">
          <span className="block break-words tabular-nums text-3xl text-ink">
            {formatCurrency(data.totalRaised)}
          </span>
          <div className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-muted">
            <span>de {formatCurrency(data.financialGoal)}</span>
            <span>·</span>
            <span className={reached ? "font-medium text-goal" : undefined}>{percent}%</span>
            {reached && (
              <span className="rounded-full bg-goal/15 px-2 py-0.5 text-xs font-medium whitespace-nowrap text-goal">
                Meta atingida
              </span>
            )}
          </div>

          <div className="mt-4">
            <ProgressBar raised={data.totalRaised} goal={data.financialGoal} />
          </div>

          {data.status === "Active" ? (
            <DonationForm campaignId={data.id} />
          ) : (
            <>
              <button
                type="button"
                disabled
                className="mt-6 w-full rounded-full bg-magenta px-4 py-3 text-sm text-paper disabled:opacity-40"
              >
                Apoiar
              </button>
              <p className="mt-2 text-xs text-muted">
                Só é possível apoiar campanhas ativas — esta está {statusLabel(data.status)}.
              </p>
            </>
          )}
        </aside>
      </div>
    </PageWidth>
  );
}
