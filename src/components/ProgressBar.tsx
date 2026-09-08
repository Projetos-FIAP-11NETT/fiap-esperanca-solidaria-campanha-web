import { progressPercent } from "../lib/format";

export function ProgressBar({ raised, goal }: { raised: number; goal: number }) {
  const percent = progressPercent(raised, goal);
  const reached = percent >= 100;
  const fillWidth = Math.min(percent, 100);

  return (
    <div className="h-2 w-full bg-line">
      <div className={reached ? "h-full bg-goal" : "h-full bg-magenta"} style={{ width: `${fillWidth}%` }} />
    </div>
  );
}
