const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "UTC",
});

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export function formatDate(value: string): string {
  return dateFormatter.format(new Date(value));
}

export function progressPercent(raised: number, goal: number): number {
  if (goal <= 0) return 0;
  return Math.round((raised / goal) * 100);
}

const statusLabels: Record<string, string> = {
  Scheduled: "agendada",
  Active: "ativa",
  Completed: "concluída",
  Cancelled: "cancelada",
};

export function statusLabel(status: string): string {
  return statusLabels[status] ?? status.toLowerCase();
}
