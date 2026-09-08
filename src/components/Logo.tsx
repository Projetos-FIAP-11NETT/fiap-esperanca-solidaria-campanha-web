export function Logo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" className={className} aria-hidden="true">
      <circle cx="11" cy="14" r="9" fill="var(--color-magenta)" />
      <circle cx="18" cy="14" r="9" fill="var(--color-indigo)" fillOpacity="0.85" />
    </svg>
  );
}
