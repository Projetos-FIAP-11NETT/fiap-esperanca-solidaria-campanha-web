import type { PropsWithChildren } from "react";

export function PageWidth({ children, className = "" }: PropsWithChildren<{ className?: string }>) {
  return <div className={`mx-auto max-w-3xl px-5 sm:px-10 ${className}`}>{children}</div>;
}
