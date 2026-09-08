import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createCampaign, getCampaignById, updateCampaign, uploadCampaignImage } from "../api/campaigns";
import { ApiError } from "../api/client";
import { PageWidth } from "../components/PageWidth";

function toDateInput(isoDate: string) {
  return isoDate.slice(0, 10);
}

export function ManagerCampaignForm() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [financialGoal, setFinancialGoal] = useState("");
  const [image, setImage] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: existing, isLoading } = useQuery({
    queryKey: ["campaign", id],
    queryFn: () => getCampaignById(id!),
    enabled: isEditing,
  });

  useEffect(() => {
    if (!existing) return;
    setTitle(existing.title);
    setDescription(existing.description);
    setStartDate(toDateInput(existing.startDate));
    setEndDate(toDateInput(existing.endDate));
    setFinancialGoal(String(existing.financialGoal));
    setImage(existing.image ?? "");
  }, [existing]);

  const mutation = useMutation({
    mutationFn: () => {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        startDate: `${startDate}T00:00:00Z`,
        endDate: `${endDate}T00:00:00Z`,
        financialGoal: Number(financialGoal),
        image: image.trim() || null,
      };

      return isEditing ? updateCampaign(id!, payload) : createCampaign(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["public-campaigns"] });
      navigate("/gestor");
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : "Não foi possível salvar a campanha.");
    },
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    mutation.mutate();
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploadError(null);
    setUploadingImage(true);
    try {
      const { url } = await uploadCampaignImage(file);
      setImage(url);
    } catch (err) {
      setUploadError(err instanceof ApiError ? err.message : "Não foi possível enviar a imagem.");
    } finally {
      setUploadingImage(false);
    }
  }

  if (isEditing && isLoading) {
    return <PageWidth className="py-10 text-muted">Carregando campanha…</PageWidth>;
  }

  return (
    <PageWidth className="py-10">
      <div className="max-w-xl">
        <Link to="/gestor" className="text-sm text-muted hover:text-magenta">
          Voltar ao painel do gestor
        </Link>

        <h1 className="font-display mt-4 text-2xl text-ink sm:text-3xl">
          {isEditing ? "Editar campanha" : "Nova campanha"}
        </h1>

        <form className="mt-8 flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-1 text-sm text-ink">
            Título
            <input
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink outline-none focus-visible:border-magenta"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-ink">
            Descrição
            <textarea
              required
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink outline-none focus-visible:border-magenta"
            />
          </label>

          <div className="flex gap-4">
            <label className="flex flex-1 flex-col gap-1 text-sm text-ink">
              Início
              <input
                type="date"
                required
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink outline-none focus-visible:border-magenta"
              />
            </label>

            <label className="flex flex-1 flex-col gap-1 text-sm text-ink">
              Fim
              <input
                type="date"
                required
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink outline-none focus-visible:border-magenta"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1 text-sm text-ink">
            Meta financeira (R$)
            <input
              type="number"
              min="0.01"
              step="0.01"
              required
              value={financialGoal}
              onChange={(event) => setFinancialGoal(event.target.value)}
              className="rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink outline-none focus-visible:border-magenta"
            />
          </label>

          <div className="flex flex-col gap-2 text-sm text-ink">
            Imagem de capa (opcional)

            {image && (
              <div className="relative aspect-video w-full max-w-xs overflow-hidden rounded-lg border border-line">
                <img src={image} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImage("")}
                  className="absolute right-2 top-2 rounded-full bg-ink/70 px-2 py-1 text-xs text-paper"
                >
                  Remover
                </button>
              </div>
            )}

            {!image && (
              <label className="flex w-full max-w-xs cursor-pointer items-center justify-center rounded-lg border border-dashed border-line px-3 py-6 text-sm text-muted hover:border-magenta hover:text-magenta">
                {uploadingImage ? "Enviando…" : "Escolher arquivo"}
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploadingImage}
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}

            {uploadError && <p className="text-sm text-danger">{uploadError}</p>}
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <button
            type="submit"
            disabled={mutation.isPending || uploadingImage}
            className="mt-2 rounded-full bg-magenta px-4 py-2.5 text-sm text-paper transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {mutation.isPending ? "Salvando…" : isEditing ? "Salvar alterações" : "Criar campanha"}
          </button>
        </form>
      </div>
    </PageWidth>
  );
}
