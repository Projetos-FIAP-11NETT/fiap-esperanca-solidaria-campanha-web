import { useMutation } from "@tanstack/react-query";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login, signup, uploadUserImage } from "../api/auth";
import { ApiError } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { formatCpf, onlyDigits, validateCpf } from "../lib/cpf";
import { validatePassword } from "../lib/password";

export function DoadorCadastro() {
  const { login: setSession } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [image, setImage] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loginMutation = useMutation({
    mutationFn: () => login({ email: email.trim(), password }),
    onSuccess: (response) => {
      setSession(response);
      navigate("/");
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : "Conta criada, mas não foi possível entrar.");
    },
  });

  const signupMutation = useMutation({
    mutationFn: () =>
      signup({ name: name.trim(), email: email.trim(), password, cpf: onlyDigits(cpf), image: image || null }),
    onSuccess: () => loginMutation.mutate(),
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : "Não foi possível criar sua conta.");
    },
  });

  const isPending = loginMutation.isPending || signupMutation.isPending;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const cpfError = validateCpf(cpf);
    if (cpfError) return setError(cpfError);

    const passwordError = validatePassword(password);
    if (passwordError) return setError(passwordError);
    if (password !== confirmPassword) return setError("As senhas não conferem.");

    signupMutation.mutate();
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

  return (
    <div className="mx-auto max-w-sm px-5 py-16 sm:px-10">
      <Link to="/" className="text-sm text-muted hover:text-magenta">
        Voltar ao painel
      </Link>

      <h1 className="font-display mt-6 text-2xl text-ink">Criar conta</h1>
      <p className="mt-2 text-sm text-muted">Crie sua conta de doador pra apoiar campanhas.</p>

      <form className="mt-8 flex flex-col gap-4" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-1 text-sm text-ink">
          Nome
          <input
            type="text"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Seu nome"
            className="rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink outline-none placeholder:text-muted focus-visible:border-magenta"
          />
        </label>

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
          CPF
          <input
            type="text"
            inputMode="numeric"
            required
            value={cpf}
            onChange={(event) => setCpf(formatCpf(event.target.value))}
            placeholder="000.000.000-00"
            className="rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink outline-none placeholder:text-muted focus-visible:border-magenta"
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

        <label className="flex flex-col gap-1 text-sm text-ink">
          Confirmar senha
          <input
            type="password"
            required
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="••••••••"
            className="rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink outline-none placeholder:text-muted focus-visible:border-magenta"
          />
        </label>

        <p className="text-xs text-muted">
          Mínimo de 8 caracteres, com letra, número e caractere especial.
        </p>

        {error && <p className="text-sm text-danger">{error}</p>}

        <button
          type="submit"
          disabled={isPending || uploadingImage}
          className="mt-2 rounded-full bg-magenta px-4 py-2.5 text-sm text-paper transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "Enviando…" : "Criar conta"}
        </button>
      </form>

      <Link to="/entrar" className="mt-4 inline-block text-sm text-muted hover:text-magenta">
        Já tem conta? Entrar
      </Link>
    </div>
  );
}
