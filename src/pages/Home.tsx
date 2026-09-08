import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { listPublicCampaigns } from "../api/campaigns";
import { CampaignCard } from "../components/CampaignCard";
import { PageWidth } from "../components/PageWidth";
import { StatsBar } from "../components/StatsBar";

export function Home() {
  const [searchInput, setSearchInput] = useState("");
  const [title, setTitle] = useState<string | undefined>(undefined);

  useEffect(() => {
    const timeout = setTimeout(() => setTitle(searchInput.trim() || undefined), 300);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["public-campaigns", title],
    queryFn: () => listPublicCampaigns(title),
  });

  return (
    <div>
      {data && <StatsBar campaigns={data} />}

      <PageWidth className="py-10">
        <input
          type="search"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Buscar campanha"
          className="w-full rounded-full border border-line bg-canvas px-4 py-2.5 text-sm text-ink outline-none placeholder:text-muted focus-visible:border-magenta sm:max-w-sm"
        />

        {isLoading && <p className="mt-10 text-muted">Carregando campanhas…</p>}

        {isError && (
          <p className="mt-10 text-magenta">
            Não foi possível carregar as campanhas agora. Tente novamente em instantes.
          </p>
        )}

        {data && data.length === 0 && (
          <p className="mt-10 text-muted">
            {title ? `Nenhuma campanha encontrada para "${title}".` : "Nenhuma campanha ativa no momento."}
          </p>
        )}

        {data && data.length > 0 && (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        )}
      </PageWidth>
    </div>
  );
}
