import { Link } from "react-router-dom";
import { PageWidth } from "../components/PageWidth";

export function NotFound() {
  return (
    <PageWidth className="py-16">
      <p className="text-sm text-muted">Erro 404</p>
      <h1 className="font-display mt-2 text-3xl text-ink">Página não encontrada</h1>
      <p className="mt-3 max-w-md text-sm text-muted">
        O endereço que você abriu não existe ou foi movido.
      </p>
      <Link
        to="/"
        className="mt-6 inline-block rounded-full bg-magenta px-5 py-2.5 text-sm text-paper transition-opacity hover:opacity-90"
      >
        Voltar ao painel
      </Link>
    </PageWidth>
  );
}
