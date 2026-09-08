import type { CampaignStatus } from "../api/types";

const styles: Record<CampaignStatus, string> = {
  Scheduled: "bg-indigo/10 text-indigo",
  Active: "bg-magenta/10 text-magenta",
  Completed: "bg-goal/10 text-goal",
  Cancelled: "bg-danger/10 text-danger",
};

const labels: Record<CampaignStatus, string> = {
  Scheduled: "Agendada",
  Active: "Ativa",
  Completed: "Concluída",
  Cancelled: "Cancelada",
};

export function StatusBadge({ status }: { status: CampaignStatus }) {
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
