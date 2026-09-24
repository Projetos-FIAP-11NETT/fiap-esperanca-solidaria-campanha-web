import type { ReactNode } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { PageWidth } from "../components/PageWidth";
import { useAuth } from "./AuthContext";

export function RequireGestor({ children }: { children: ReactNode }) {
  const { session, isGestor } = useAuth();
  const location = useLocation();

  if (!session) {
    return <Navigate to="/entrar" replace state={{ from: location.pathname }} />;
  }

  if (!isGestor) {
    return (
      <PageWidth className="py-16">
        <h1 className="font-display text-2xl text-ink">Acesso restrito</h1>
        <p className="mt-2 text-sm text-muted">
          A conta <strong>{session.email}</strong> não tem perfil de gestor de ONG. Se acabou de
          receber a permissão, saia e entre de novo pra atualizar o acesso.
        </p>
        <Link to="/" className="mt-6 inline-block text-sm text-muted hover:text-magenta">
          Voltar ao painel
        </Link>
      </PageWidth>
    );
  }

  return children;
}
