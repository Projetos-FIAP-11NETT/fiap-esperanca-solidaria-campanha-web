import { useMutation } from "@tanstack/react-query";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { createGestor, uploadUserImage } from "../api/auth";
import { ApiError, isPermissionDenied, isSessionRejected } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { PageWidth } from "../components/PageWidth";
import { formatCpf, onlyDigits, validateCpf } from "../lib/cpf";
import { validatePassword } from "../lib/password";

const inputClass =
  "rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink outline-none placeholder:text-muted focus-visible:border-magenta";

// Cadastro de outro gestor pelo próprio gestor (POST /User/GestorONG). Diferente do
// cadastro de doador, não entra com a conta criada: isso trocaria a sessão de quem
// está cadastrando. A pessoa nova entra depois, em /entrar, com a senha definida aqui.
export function ManagerGestorCadastro() {
  const { session, expireSession } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [image, setImage] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      createGestor({ name: name.trim(), email: email.trim(), password, cpf: onlyDigits(cpf), image: image || null }),
    onSuccess: () => setCreated(email.trim()),
    onError: (err) => {
      const idToken = session?.idToken ?? "";
      if (isSessionRejected(err, idToken)) {
        expireSession();
        return;
      }
      if (isPermissionDenied(err, idToken)) {
        setError("Sua conta não tem permissão para cadastrar gestores.");
        return;
      }
      setError(
        err instanceof ApiError && err.status !== 400
          ? err.message
          : "Não foi possível cadastrar o gestor. Confira se o e-mail ou o CPF já não estão em uso.",
      );
    },
  });

  function reset() {
    setName("");
    setEmail("");
    setCpf("");
    setPassword("");
    setConfirmPassword("");
    setImage("");
    setUploadError(null);
    setError(null);
    setCreated(null);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const cpfError = validateCpf(cpf);
    if (cpfError) return setError(cpfError);

    const passwordError = validatePassword(password);
    if (passwordError) return setError(passwordError);
    if (password !== confirmPassword) return setError("As senhas não conferem.");

    mutation.mutate();
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploadError(null);
    setUploadingImage(true);
    try {
      const { url } = await uploadUserImage(file);
      setImage(url);
    } catch (err) {
      setUploadError(err instanceof ApiError ? err.message : "Não foi possível enviar a foto.");
    } finally {
      setUploadingImage(false);
    }
  }

  if (created) {
    return (
      <PageWidth className="py-10">
        <div className="max-w-xl">
          <h1 className="font-display text-2xl text-ink sm:text-3xl">Gestor cadastrado</h1>
          <p className="mt-3 text-sm text-muted">
            A conta <strong className="text-ink">{created}</strong> foi criada com perfil de gestor. A pessoa já pode
            entrar em <strong className="text-ink">Entrar</strong> com a senha que você definiu.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={reset}
              className="rounded-full bg-magenta px-4 py-2.5 text-sm text-paper transition-opacity hover:opacity-90"
            >
              Cadastrar outro gestor
            </button>
            <Link
              to="/gestor"
              className="rounded-full border border-line px-4 py-2.5 text-sm text-ink transition-colors hover:border-magenta hover:text-magenta"
            >
              Voltar ao painel
            </Link>
          </div>
        </div>
      </PageWidth>
    );
  }

  return (
    <PageWidth className="py-10">
      <div className="max-w-xl">
        <Link to="/gestor" className="text-sm text-muted hover:text-magenta">
          Voltar ao painel do gestor
        </Link>

        <h1 className="font-display mt-4 text-2xl text-ink sm:text-3xl">Novo gestor</h1>
        <p className="mt-1 text-sm text-muted">
          Cadastre outra pessoa da ONG com acesso à área do gestor. Ela entra depois com o e-mail e a senha
          definidos aqui.
        </p>

        <form className="mt-8 flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-1 text-sm text-ink">
            Nome
            <input
              type="text"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nome completo"
              className={inputClass}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-ink">
            E-mail
            <input
              type="email"
              required
              autoComplete="off"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="gestor@ong.org"
              className={inputClass}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-ink">
            CPF
            <input
              type="text"
              inputMode="numeric"
              required
              value={cpf}
              onChange={(event) => setCpf(formatCpf(event.target.value))}
              placeholder="000.000.000-00"
              className={inputClass}
            />
          </label>

          <div className="flex flex-col gap-2 text-sm text-ink">
            Foto de perfil (opcional)

            <div className="flex items-center gap-3">
              {image ? (
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-line">
                  <img src={image} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImage("")}
                    className="absolute inset-0 flex items-center justify-center bg-ink/60 text-xs text-paper opacity-0 transition-opacity hover:opacity-100"
                  >
                    Remover
                  </button>
                </div>
              ) : (
                <label className="flex h-16 w-16 shrink-0 cursor-pointer items-center justify-center rounded-full border border-dashed border-line text-center text-xs text-muted hover:border-magenta hover:text-magenta">
                  {uploadingImage ? "Enviando…" : "Escolher"}
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
          </div>

          <label className="flex flex-col gap-1 text-sm text-ink">
            Senha inicial
            <input
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              className={inputClass}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-ink">
            Confirmar senha
            <input
              type="password"
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="••••••••"
              className={inputClass}
            />
          </label>

          <p className="text-xs text-muted">Mínimo de 8 caracteres, com letra, número e caractere especial.</p>

          {error && <p className="text-sm text-danger">{error}</p>}

          <button
            type="submit"
            disabled={mutation.isPending || uploadingImage}
            className="mt-2 rounded-full bg-magenta px-4 py-2.5 text-sm text-paper transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {mutation.isPending ? "Cadastrando…" : "Cadastrar gestor"}
          </button>
        </form>
      </div>
    </PageWidth>
  );
}
