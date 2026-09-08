import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Logo } from "./Logo";
import { PageWidth } from "./PageWidth";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  const { session, logout } = useAuth();

  return (
    <header className="border-b border-line bg-canvas">
      <PageWidth className="flex items-center justify-between gap-4 py-4">
        <Link to="/" className="flex items-center gap-2.5">
          <Logo className="h-7 w-7 shrink-0" />
          <span className="font-display text-lg text-ink sm:text-xl">Conexão Solidária</span>
        </Link>

        <div className="flex shrink-0 items-center gap-3">
          <ThemeToggle />

          {session ? (
            <>
              <Link
                to="/gestor"
                className="rounded-full border border-line px-4 py-2 text-sm text-ink transition-colors hover:border-magenta hover:text-magenta"
              >
                Área do gestor
              </Link>
              <button
                type="button"
                onClick={logout}
                className="text-sm text-muted transition-colors hover:text-magenta"
              >
                Sair
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-full border border-line px-4 py-2 text-sm text-ink transition-colors hover:border-magenta hover:text-magenta"
            >
              Login
            </Link>
          )}
        </div>
      </PageWidth>
    </header>
  );
}
