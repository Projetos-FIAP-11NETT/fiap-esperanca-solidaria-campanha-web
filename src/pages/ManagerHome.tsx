import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { cancelCampaign, listCampaigns } from "../api/campaigns";
import { ApiError } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { ManagerCampaignRow } from "../components/ManagerCampaignRow";
import { PageWidth } from "../components/PageWidth";

export function ManagerHome() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["campaigns"],
    queryFn: listCampaigns,
  });

  const cancelMutation = useMutation({
    mutationFn: cancelCampaign,
    onSuccess: () => {
      setError(null);
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["public-campaigns"] });
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : "Não foi possível cancelar a campanha.");
    },
  });

  return (
    <PageWidth className="py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-ink sm:text-3xl">Painel do gestor</h1>
          <p className="mt-1 text-sm text-muted">Logado como {session?.email}</p>
        </div>
        <Link
          to="/gestor/nova"
          className="rounded-full bg-magenta px-4 py-2.5 text-sm text-paper transition-opacity hover:opacity-90"
        >
          Nova campanha
        </Link>
      </div>

      {error && <p className="mt-6 text-sm text-danger">{error}</p>}

      {isLoading && <p className="mt-10 text-muted">Carregando campanhas…</p>}
      {isError && <p className="mt-10 text-magenta">Não foi possível carregar as campanhas.</p>}
      {data && data.length === 0 && <p className="mt-10 text-muted">Nenhuma campanha cadastrada ainda.</p>}

      {data && data.length > 0 && (
        <div className="mt-8">
          {data.map((campaign) => (
            <ManagerCampaignRow
              key={campaign.id}
              campaign={campaign}
              onCancel={(id) => cancelMutation.mutate(id)}
              cancelling={cancelMutation.isPending && cancelMutation.variables === campaign.id}
            />
          ))}
        </div>
      )}
    </PageWidth>
  );
}
