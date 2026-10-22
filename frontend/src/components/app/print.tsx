"use client";

/*
 * Print vocabulary for the workspace, built on components/art: serial numbers (only real ids, versions
 * and checksums), signatory lines (who asked, who decided), rubber date stamps (dated snapshots), the
 * certificate's gold double rule, a perforation between a slip's stub and its body, and a medallion
 * (an engraved mint mark around an icon) for empty and error states. Everything decorative is
 * aria-hidden; every word a mark stands for is printed as text next to it.
 */
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { MintMark } from "@/components/art/ornaments";
import { formatDate } from "@/lib/app/format";
import { cn } from "@/lib/utils";

/**
 * A serial: the first characters of a real checksum, id or fingerprint, set like the numbering of a
 * banknote. The full value is in the title (and on copy, where the caller adds a copy button).
 */
export function Serial({
  value,
  chars = 12,
  label,
  className,
  surface = "paper",
}: {
  value: string | null | undefined;
  chars?: number;
  label?: ReactNode;
  className?: string;
  surface?: "paper" | "plate";
}) {
  if (!value) return <span className={cn("text-xs text-muted-foreground", className)}>Not available</span>;
  const shown = value.length > chars ? value.slice(0, chars) : value;
  return (
    <span className={cn("inline-flex min-w-0 items-baseline gap-1.5", className)} title={value}>
      {label ? (
        <span className={cn("text-xs", surface === "plate" ? "text-sidebar-foreground/60" : "text-muted-foreground")}>{label}</span>
      ) : null}
      <span
        className={cn(
          "font-mono text-[0.75rem] font-medium tracking-[0.14em] whitespace-nowrap tabular-nums",
          surface === "plate" ? "text-gold-light" : "text-oxblood dark:text-[color-mix(in_oklch,var(--oxblood),white_48%)]",
        )}
      >
        {shown}
        {/* A shortened value must look shortened: the ellipsis says there is more (full value in the title). */}
        {value.length > chars ? (
          <>
            <span aria-hidden>…</span>
            <span className="sr-only"> (first {chars} characters)</span>
          </>
        ) : null}
      </span>
    </span>
  );
}

/**
 * Ring lettering for a seal: a short word is set twice per turn so the ring reads as one band of type
 * (the seal prints its text twice around the ring; about twenty characters fill a half turn).
 */
export function sealWords(label: string): string {
  return label.length <= 9 ? `${label} · ${label}` : label;
}

/**
 * The certificate's frame: two gold rules inset from the sheet's edge. Place inside a `relative`
 * sheet whose radius is about 0.75rem.
 */
export function GoldRules({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn("pointer-events-none absolute inset-0", className)}>
      <span className="absolute inset-[5px] rounded-[0.55rem] border border-gold/60" />
      <span className="absolute inset-[9px] rounded-[0.35rem] border border-gold-deep/25" />
    </span>
  );
}

/** A perforation: the dashed rule between a slip's stub and its body. */
export function Perforation({ className, vertical }: { className?: string; vertical?: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "block shrink-0 border-rule-strong",
        vertical ? "w-0 self-stretch border-l border-dashed" : "h-0 w-full border-t border-dashed",
        className,
      )}
    />
  );
}

/**
 * A signatory line, as at the foot of a document: what the person did, their name over a rule, then
 * their role and the date. An empty name prints a dotted line still waiting for its signature.
 */
export function Signatory({
  caption,
  name,
  details,
  mark,
  className,
}: {
  /** "Requested by", "Approved by", "Awaiting decision". */
  caption: ReactNode;
  name: ReactNode | null;
  details?: ReactNode[];
  /** A seal or stamp pressed beside the signature (decorative; its words are in `caption`). */
  mark?: ReactNode;
  className?: string;
}) {
  const lines = (details ?? []).filter((d) => d !== null && d !== undefined && d !== false && d !== "");
  return (
    <div className={cn("relative min-w-0", className)}>
      <p className="text-xs text-muted-foreground">{caption}</p>
      <div className={cn("relative mt-2 flex h-12 items-end border-b pb-1.5", name ? "border-ink/45" : "border-dotted border-ink/35", mark && "pr-20")}>
        {name ? (
          <p className="min-w-0 truncate font-display text-[1.375rem] leading-tight font-medium tracking-[-0.015em] text-ink">{name}</p>
        ) : (
          <span className="text-sm text-muted-foreground/80">Not signed yet</span>
        )}
        {mark ? <span className="pointer-events-none absolute right-0 -bottom-6">{mark}</span> : null}
      </div>
      {lines.length ? (
        <p className="mt-1.5 flex flex-wrap gap-x-2 text-xs leading-relaxed text-muted-foreground">
          {lines.map((line, i) => (
            <span key={i}>
              {i > 0 ? <span aria-hidden className="mr-2">·</span> : null}
              {line}
            </span>
          ))}
        </p>
      ) : null}
    </div>
  );
}

/** A rubber date stamp: the date stays readable text (a dated snapshot, not a live figure). */
export function DateStamp({ date, label, className }: { date: string | null | undefined; label?: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 -rotate-2 flex-col items-center rounded-[3px] border border-oxblood/55 px-2 py-0.5 text-oxblood shadow-[inset_0_0_0_2px_var(--sheet),inset_0_0_0_3px_color-mix(in_oklch,var(--oxblood)_35%,transparent)] dark:text-[color-mix(in_oklch,var(--oxblood),white_48%)]",
        className,
      )}
    >
      {label ? <span className="text-[0.625rem] leading-tight font-medium">{label}</span> : null}
      <span className="font-mono text-[0.75rem] leading-tight font-semibold tracking-[0.06em] whitespace-nowrap">{formatDate(date)}</span>
    </span>
  );
}

/** An engraved medallion: a mint mark ringing a small icon (empty, error and access states). */
export function Medallion({
  icon: Icon,
  seed,
  size = "md",
  tone = "neutral",
  className,
}: {
  icon: LucideIcon;
  /** Seeds the engraving; defaults to the icon's name, so the same state always wears the same mark. */
  seed?: string;
  size?: "sm" | "md" | "lg";
  tone?: "neutral" | "brand" | "danger";
  className?: string;
}) {
  const name = seed ?? Icon.displayName ?? "aurex";
  return (
    <span
      aria-hidden
      className={cn(
        "relative grid shrink-0 place-items-center",
        size === "sm" && "size-11",
        size === "md" && "size-14",
        size === "lg" && "size-[4.5rem]",
        className,
      )}
    >
      <MintMark name={name} tone={tone === "brand" ? "gold" : "ink"} strokeWidth={size === "lg" ? 0.75 : 0.85} className="absolute inset-0 size-full opacity-80" />
      <span className="relative grid size-[42%] place-items-center rounded-full bg-sheet shadow-[0_0_0_1px_var(--rule-strong)]">
        <Icon
          className={cn(
            "size-[58%]",
            tone === "neutral" && "text-muted-foreground",
            tone === "brand" && "text-gold-deep",
            tone === "danger" && "text-destructive",
          )}
        />
      </span>
    </span>
  );
}
