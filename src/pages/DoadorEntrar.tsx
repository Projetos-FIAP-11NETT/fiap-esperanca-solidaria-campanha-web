import { useMutation } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { login } from "../api/auth";
import { ApiError } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { getJwtRoles } from "../lib/jwt";

export function DoadorEntrar() {
  const { login: setSession, sessionExpired } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => login({ email: email.trim(), password }),
    onSuccess: (response) => {
      setSession(response);
      // Gestor cai direto no painel; quem veio redirecionado volta pra onde estava.
      const isGestor = getJwtRoles(response.idToken).includes("GestorONG");
      navigate(from ?? (isGestor ? "/gestor" : "/"), { replace: true });
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : "Não foi possível entrar.");
    },
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    mutation.mutate();
  }

  return (
    <div className="mx-auto max-w-sm px-5 py-16 sm:px-10">
      <Link to="/" className="text-sm text-muted hover:text-magenta">
        Voltar ao painel
      </Link>

      <h1 className="font-display mt-6 text-2xl text-ink">Entrar</h1>
      <p className="mt-2 text-sm text-muted">Entre com sua conta de doador pra apoiar campanhas.</p>
      {sessionExpired && (
        <p role="status" className="mt-4 rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink">
          Sua sessão expirou. Entre de novo pra continuar.
        </p>
      )}

      <form className="mt-8 flex flex-col gap-4" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-1 text-sm text-ink">
          E-mail
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="voce@email.com"
            className="rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink outline-none placeholder:text-muted focus-visible:border-magenta"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-ink">
          Senha
          <input
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            className="rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink outline-none placeholder:text-muted focus-visible:border-magenta"
          />
        </label>

        {error && <p className="text-sm text-danger">{error}</p>}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="mt-2 rounded-full bg-magenta px-4 py-2.5 text-sm text-paper transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {mutation.isPending ? "Entrando…" : "Entrar"}
        </button>
      </form>

      <Link to="/cadastro" className="mt-4 inline-block text-sm text-muted hover:text-magenta">
        Não tem conta? Criar uma
      </Link>
    </div>
  );
}
