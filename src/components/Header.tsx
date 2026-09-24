import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Logo } from "./Logo";
import { PageWidth } from "./PageWidth";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  const navigate = useNavigate();
  const { session, isGestor, logout } = useAuth();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="border-b border-line bg-canvas">
      <PageWidth className="flex items-center justify-between gap-4 py-4">
        <Link to="/" className="flex items-center gap-2.5">
          <Logo className="h-7 w-7 shrink-0" />
          <span className="font-display text-lg text-ink sm:text-xl">Conexão Solidária</span>
        </Link>

        <div className="flex shrink-0 items-center gap-3">
          <ThemeToggle />

          {isGestor && (
            <Link
              to="/gestor"
              className="rounded-full border border-line px-4 py-2 text-sm text-ink transition-colors hover:border-magenta hover:text-magenta"
            >
              Área do gestor
            </Link>
          )}

          {session ? (
            <>
              <Link
                to="/perfil"
                className="hidden max-w-[12rem] truncate text-sm text-muted transition-colors hover:text-magenta sm:inline"
              >
                {session.name}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="text-sm text-muted transition-colors hover:text-magenta"
              >
                Sair
              </button>
            </>
          ) : (
            <Link
              to="/entrar"
              className="rounded-full border border-line px-4 py-2 text-sm text-ink transition-colors hover:border-magenta hover:text-magenta"
            >
              Entrar
            </Link>
          )}
        </div>
      </PageWidth>
    </header>
  );
}
