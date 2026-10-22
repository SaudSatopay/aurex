import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Evidence vocabulary shared by every sample on the site. Each basis has a shape as well as a
 * colour, so the distinction never relies on colour alone, and the label always spells it out.
 *
 * - known: arithmetic on known inputs (payroll rate x headcount). Filled square.
 * - history: estimated from the organization's own historical data. Filled circle, Prussian blue.
 * - assumption: a documented, attributed assumption. Diamond, amber.
 * - calculated: derived from other lines. Outlined square.
 * - none: not modeled because nothing supports it. Outlined circle.
 */
export type EvidenceBasis = "known" | "history" | "assumption" | "calculated" | "none";

export const EVIDENCE_LABELS: Record<EvidenceBasis, string> = {
  known: "Known cost",
  history: "Sales history",
  assumption: "Documented assumption",
  calculated: "Calculated",
  none: "Not modeled",
};

type Surface = "light" | "dark";

export function EvidenceMarker({
  basis,
  surface = "light",
  className,
}: {
  basis: EvidenceBasis;
  surface?: Surface;
  className?: string;
}) {
  const shape = {
    known: "rounded-[1px] bg-current",
    history: cn("rounded-full", surface === "dark" ? "bg-navy-300" : "bg-prussian"),
    assumption: "rotate-45 rounded-[1px] bg-warning scale-90",
    calculated: "rounded-[1px] border-[1.5px] border-current",
    none: "rounded-full border-[1.5px] border-current opacity-70",
  }[basis];
  return <span aria-hidden className={cn("inline-block size-2 shrink-0", shape, className)} />;
}

export function EvidenceTag({
  basis,
  surface = "light",
  children,
  className,
}: {
  basis: EvidenceBasis;
  surface?: Surface;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-[0.8125rem] leading-none font-medium whitespace-nowrap",
        surface === "dark" ? "text-paper/85" : "text-ink",
        className,
      )}
    >
      <EvidenceMarker basis={basis} surface={surface} />
      {children ?? EVIDENCE_LABELS[basis]}
    </span>
  );
}

/**
 * "Illustrative" stamp plus the synthetic-data notice. Required next to every sample figure. The stamp is
 * set in the same oxblood ink as the SPECIMEN overprint (gold on a plate), so the two read as one mark.
 */
export function IllustrativeLabel({
  surface = "light",
  note = "NovaMart demo data (synthetic)",
  className,
}: {
  surface?: Surface;
  note?: string;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs leading-none",
        surface === "dark" ? "text-paper/75" : "text-muted-foreground",
        className,
      )}
    >
      <span
        className={cn(
          "inline-flex items-center rounded-[0.3rem] px-2 py-[0.3125rem] font-semibold tracking-[0.01em]",
          surface === "dark"
            ? "text-gold-light shadow-[inset_0_0_0_1px_oklch(0.9_0.085_92/0.42)]"
            : "text-oxblood shadow-[inset_0_0_0_1px_oklch(0.46_0.14_25/0.42)]",
        )}
      >
        Illustrative
      </span>
      <span>{note}</span>
    </p>
  );
}
