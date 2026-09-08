import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!email.trim() || !password.trim()) return;
    login(email.trim());
    navigate("/gestor");
  }

  return (
    <div className="mx-auto max-w-sm px-5 py-16 sm:px-10">
      <Link to="/" className="text-sm text-muted hover:text-magenta">
        Voltar ao painel
      </Link>

      <h1 className="font-display mt-6 text-2xl text-ink">Área do gestor</h1>
      <p className="mt-2 text-sm text-muted">
        O serviço de usuários (<code>usuario-api</code>) que vai emitir login de verdade ainda está
        em construção. Por enquanto, qualquer e-mail entra num modo de desenvolvimento local, só
        pra testar as telas restritas ao gestor — nada é validado num backend real.
      </p>

      <form className="mt-8 flex flex-col gap-4" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-1 text-sm text-ink">
          E-mail
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="voce@esperancasolidaria.org"
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

        <button
          type="submit"
          className="mt-2 rounded-full bg-magenta px-4 py-2.5 text-sm text-paper transition-opacity hover:opacity-90"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
