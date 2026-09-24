import { useMutation } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { donate } from "../api/donations";
import { ApiError, isPermissionDenied, isSessionRejected, PERMISSION_DENIED_MESSAGE } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { formatCurrency } from "../lib/format";
import type { PaymentMethod } from "../api/types";

const paymentMethodLabels: Record<PaymentMethod, string> = {
  Pix: "Pix",
  CreditCard: "Cartão de crédito",
  DebitCard: "Cartão de débito",
  Boleto: "Boleto",
};

export function DonationForm({ campaignId }: { campaignId: string }) {
  const { session, sessionExpired, expireSession } = useAuth();
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Pix");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      donate({
        campaignId,
        amount: Number(amount),
        paymentMethod,
        idToken: session!.idToken,
      }),
    // O total da campanha e o histórico em "Minhas doações" só refletem a doação
    // depois que o doacao-work aprova (assíncrono, via fila) — não dá pra saber
    // esse instante daqui. Sem gambiarra de atualizar na hora: o próximo refresh
    // (ou nova visita à página) já busca o dado atual sozinho.
    onError: (err) => {
      const idToken = session?.idToken ?? "";
      if (isSessionRejected(err, idToken)) {
        // Token vencido/rejeitado: derruba a sessão em vez de mostrar um erro
        // que o doador não tem como resolver sem entrar de novo.
        expireSession();
        return;
      }
      if (isPermissionDenied(err, idToken)) {
        setError(PERMISSION_DENIED_MESSAGE);
        return;
      }
      setError(err instanceof ApiError ? err.message : "Não foi possível registrar a doação.");
    },
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    mutation.mutate();
  }

  if (!session) {
    return (
      <div className="mt-6 border-t border-line pt-6">
        <div className="rounded-lg border border-line bg-canvas p-4 text-sm text-ink">
          <p>
            {sessionExpired
              ? "Sua sessão expirou. Entre de novo pra apoiar essa campanha."
              : "Entre com sua conta de doador pra apoiar essa campanha."}
          </p>
          <Link
            to="/entrar"
            className="mt-3 inline-block rounded-full bg-magenta px-4 py-2 text-sm text-paper transition-opacity hover:opacity-90"
          >
            Entrar ou criar conta
          </Link>
        </div>
      </div>
    );
  }

  if (mutation.isSuccess) {
    return (
      <div className="mt-6 border-t border-line pt-6">
        <div className="rounded-lg border border-warning/30 bg-warning/10 p-4 text-sm text-ink">
          <p>
            Doação de <span className="tabular-nums">{formatCurrency(mutation.data.amount)}</span>{" "}
            registrada — status: <span className="text-warning">pendente de confirmação</span>.
          </p>
          <p className="mt-1 text-xs text-muted">
            O valor entra no total arrecadado assim que o pagamento for aprovado.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form className="mt-6 flex flex-col gap-3 border-t border-line pt-6" onSubmit={handleSubmit}>
      <label className="flex flex-col gap-1 text-sm text-ink">
        Valor
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted">
            R$
          </span>
          <input
            type="number"
            min="0.01"
            step="0.01"
            required
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0,00"
            className="w-full rounded-lg border border-line bg-canvas py-2 pr-3 pl-9 text-sm text-ink outline-none focus-visible:border-magenta"
          />
        </div>
      </label>

      <label className="flex flex-col gap-1 text-sm text-ink">
        Forma de pagamento
        <select
          value={paymentMethod}
          onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}
          className="rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink outline-none focus-visible:border-magenta"
        >
          {Object.entries(paymentMethodLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      {error && <p className="text-sm text-danger">{error}</p>}

      <button
        type="submit"
        disabled={mutation.isPending}
        className="mt-1 w-full rounded-full bg-magenta px-4 py-3 text-sm text-paper transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {mutation.isPending ? "Enviando…" : "Apoiar"}
      </button>
    </form>
  );
}
