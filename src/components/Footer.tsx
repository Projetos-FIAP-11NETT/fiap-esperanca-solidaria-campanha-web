import { Link } from "react-router-dom";
import { Logo } from "./Logo";
import { PageWidth } from "./PageWidth";

export function Footer() {
  return (
    <footer className="mt-16 bg-indigo text-paper/70">
      <PageWidth className="grid gap-10 py-12 sm:grid-cols-3">
        <div>
          <div className="flex items-center gap-2.5">
            <Logo className="h-6 w-6 shrink-0" />
            <span className="font-display text-lg text-paper">Conexão Solidária</span>
          </div>
          <p className="mt-3 max-w-xs text-sm">
            Painel público da ONG Esperança Solidária: toda campanha ativa, sua meta e o quanto já
            foi arrecadado, sem letra miúda.
          </p>
        </div>

        <div>
          <h2 className="text-sm text-paper">Navegação</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/" className="hover:text-paper">
                Painel de transparência
              </Link>
            </li>
            <li>
              <Link to="/login" className="hover:text-paper">
                Área do gestor
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm text-paper">Contato</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>contato@esperancasolidaria.org</li>
            <li>São Paulo, SP</li>
          </ul>
        </div>
      </PageWidth>

      <div className="border-t border-paper/10">
        <PageWidth className="py-5 text-xs text-paper/50">
          ONG Esperança Solidária · projeto do Hackathon FIAP Pós Tech
        </PageWidth>
      </div>
    </footer>
  );
}
