import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { getCampaignById } from "../api/campaigns";
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

      <div className="mt-6 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
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

        <aside className="rounded-2xl border border-line p-6 lg:sticky lg:top-6 lg:h-fit">
          <span className="tabular-nums text-2xl text-ink">{formatCurrency(data.totalRaised)}</span>
          <p className="mt-1 text-sm text-muted">
            de {formatCurrency(data.financialGoal)} ·{" "}
            <span className={reached ? "text-goal" : undefined}>{percent}%</span>
            {reached ? " · meta atingida" : ""}
          </p>

          <div className="mt-3">
            <ProgressBar raised={data.totalRaised} goal={data.financialGoal} />
          </div>

          <button
            type="button"
            disabled
            className="mt-6 w-full rounded-full bg-magenta px-4 py-3 text-sm text-paper disabled:opacity-40"
          >
            Apoiar (em breve)
          </button>
          <p className="mt-2 text-xs text-muted">
            A intenção de doação ainda está em desenvolvimento neste projeto.
          </p>
        </aside>
      </div>
    </PageWidth>
  );
}
