"use client";

/*
 * Building blocks shared by the planning, market and delivery pages (Decision Lab, Forecasts,
 * Advisor, Intelligence, News, Benchmarking, Reports, Workflows). They sit on top of part A's
 * primitives (badges, states, palette) and add the evidence vocabulary and uncertainty ranges.
 */
import {
  CircleAlertIcon,
  CircleCheckIcon,
  CircleHelpIcon,
  ExternalLinkIcon,
  FlaskRoundIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { toast } from "sonner";

import { StatusBadge, type Tone } from "@/components/app/badges";
import { CopyButton } from "@/components/app/form";
import { Serial } from "@/components/app/print";
import { ErrorState } from "@/components/app/states";
import {
  errorText,
  isNum,
  SOURCE_HINTS,
  SOURCE_LABELS,
  sourceKind,
  withRetryHint,
  type SourceKind,
} from "@/lib/app/decision-lab-format";
import { humanize } from "@/lib/app/format";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------------------------

/** Part A's error panel, with "retry in N s" for rate limits. */
export function QueryError({ error, onRetry, compact, className }: { error: unknown; onRetry?: () => void; compact?: boolean; className?: string }) {
  return <ErrorState error={withRetryHint(error)} onRetry={onRetry} compact={compact} className={className} />;
}

/** Toast for a failed action, using the backend's message (rate limits say when to retry). */
export function toastError(error: unknown, title?: string) {
  const message = errorText(error);
  if (title) toast.error(title, { description: message });
  else toast.error(message);
}

// ---------------------------------------------------------------------------------------------
// Evidence vocabulary
// ---------------------------------------------------------------------------------------------

/** Shape + colour per source, as on the public site: never colour alone. */
export function SourceMarker({ kind, className }: { kind: SourceKind; className?: string }) {
  const shape = {
    data: "rounded-full bg-prussian dark:bg-gold",
    user: "rotate-45 scale-90 rounded-[1px] bg-warning",
    model: "rounded-[1px] border-[1.5px] border-current",
    default: "rounded-full border-[1.5px] border-current opacity-70",
  }[kind];
  return <span aria-hidden className={cn("inline-block size-2 shrink-0", shape, className)} />;
}

/** Where a figure comes from: "From your data", "Your assumption", "Model rule", "Default". */
export function SourceBadge({ source, className, showRaw = true }: { source: string | null | undefined; className?: string; showRaw?: boolean }) {
  const kind = sourceKind(source);
  const raw = (source ?? "").trim();
  const canonical = { data: "historical", user: "user", model: "model", default: "default" }[kind];
  const extra = showRaw && raw && raw.toLowerCase() !== canonical && raw.toLowerCase() !== "user" ? raw : null;
  return (
    <span
      title={SOURCE_HINTS[kind]}
      className={cn("inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap text-foreground/85", className)}
    >
      <SourceMarker kind={kind} className={kind === "model" || kind === "default" ? "text-muted-foreground" : undefined} />
      {SOURCE_LABELS[kind]}
      {extra ? <span className="font-normal text-muted-foreground">({extra})</span> : null}
    </span>
  );
}

export function SourceLegend({ className }: { className?: string }) {
  return (
    <ul className={cn("flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground", className)} aria-label="Source markers">
      {(Object.keys(SOURCE_LABELS) as SourceKind[]).map((kind) => (
        <li key={kind} className="flex items-center gap-1.5" title={SOURCE_HINTS[kind]}>
          <SourceMarker kind={kind} className={kind === "model" || kind === "default" ? "text-muted-foreground" : undefined} />
          <span className="text-foreground/80">{SOURCE_LABELS[kind]}</span>
        </li>
      ))}
    </ul>
  );
}

// ---------------------------------------------------------------------------------------------
// Uncertainty
// ---------------------------------------------------------------------------------------------

export function rangeDomain(values: (number | null | undefined)[], includeZero = true): [number, number] {
  const nums = values.filter(isNum);
  if (includeZero) nums.push(0);
  if (!nums.length) return [-1, 1];
  let lo = Math.min(...nums);
  let hi = Math.max(...nums);
  if (hi - lo < 1e-9) {
    const pad = Math.abs(hi) * 0.1 || 1;
    lo -= pad;
    hi += pad;
  }
  const pad = (hi - lo) * 0.06;
  return [lo - pad, hi + pad];
}

/**
 * P10–P90 band with the median tick and the zero line, on a shared or own domain. The figures
 * are always written out below the strip, so the band is never the only channel.
 */
export function RangeStrip({
  low,
  mid,
  high,
  format,
  domain,
  label,
  surface = "light",
  compact,
  emphasis,
  showLabels = true,
}: {
  low: number | null | undefined;
  mid: number | null | undefined;
  high: number | null | undefined;
  format: (value: number) => string;
  domain?: [number, number];
  label: string;
  surface?: "light" | "dark";
  compact?: boolean;
  emphasis?: boolean;
  showLabels?: boolean;
}) {
  const still = useReducedMotion();
  if (!isNum(low) || !isNum(high)) {
    return <p className={cn("text-xs", surface === "dark" ? "text-sidebar-foreground/60" : "text-muted-foreground")}>Range not available</p>;
  }
  const [min, max] = domain ?? rangeDomain([low, mid, high]);
  const pos = (v: number) => Math.max(0, Math.min(100, ((v - min) / (max - min)) * 100));
  const left = pos(Math.min(low, high));
  const right = pos(Math.max(low, high));
  const width = Math.max(right - left, 0.8);
  const zero = min < 0 && max > 0 ? pos(0) : null;
  const deterministic = Math.abs(high - low) <= Math.max(1, Math.abs(mid ?? high) * 1e-6);
  // With no spread, the single value is drawn as the median line and the band is left out.
  const median = isNum(mid) ? pos(mid) : deterministic ? left : null;
  const description = deterministic
    ? `${label}: ${format(mid ?? low)} in every simulation run`
    : `${label}: 10th percentile ${format(low)}, median ${isNum(mid) ? format(mid) : "not available"}, 90th percentile ${format(high)}`;
  const dark = surface === "dark";
  // Engraved tint: fine diagonal hatching in ink (gold on a plate) between two hairlines.
  const hatch = dark
    ? "repeating-linear-gradient(115deg, color-mix(in oklch, var(--gold-light) 55%, transparent) 0 1px, transparent 1px 4px)"
    : `repeating-linear-gradient(115deg, color-mix(in oklch, var(--prussian) ${emphasis ? 62 : 42}%, transparent) 0 1px, transparent 1px 4px)`;
  return (
    <div className="min-w-0">
      <div className={cn("relative", compact ? "h-4" : "h-6")} role="img" aria-label={description}>
        <span className={cn("absolute inset-x-0 top-1/2 h-px -translate-y-1/2", dark ? "bg-sidebar-foreground/15" : "bg-rule")} />
        {zero !== null ? (
          <span
            className={cn("absolute top-0 bottom-0 w-px", dark ? "bg-sidebar-foreground/45" : "bg-ink/35")}
            style={{ left: `${zero}%` }}
            aria-hidden
          />
        ) : null}
        <span
          className={cn("absolute top-1/2 -translate-y-1/2", compact ? "h-2" : "h-2.5", deterministic && "hidden")}
          style={{ left: `${left}%`, width: `${width}%` }}
          aria-hidden
        >
          <motion.span
            className={cn(
              "block size-full origin-left border-y",
              dark ? "border-gold-light/70 bg-gold/10" : emphasis ? "border-prussian/70 bg-prussian/10" : "border-prussian/45 bg-prussian/[0.06]",
            )}
            style={{ backgroundImage: hatch }}
            data-reveal=""
            initial={{ scaleX: 0, opacity: 0 }}
            whileInView={{ scaleX: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ scaleX: { type: "spring", bounce: 0, visualDuration: 0.8 }, opacity: { duration: 0.4 } }}
          />
        </span>
        {median !== null ? (
          <motion.span
            className={cn(
              "absolute top-1/2 w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full",
              compact ? "h-3" : "h-4",
              dark ? "bg-gold" : "bg-gold-deep",
            )}
            style={{ left: `${median}%` }}
            data-reveal=""
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: still ? 0 : 0.35 }}
            aria-hidden
          />
        ) : null}
      </div>
      {showLabels ? (
        deterministic ? (
          <p className={cn("mt-1 text-xs", dark ? "text-sidebar-foreground/60" : "text-muted-foreground")}>
            Same in every run: no uncertain parameter affects it
          </p>
        ) : (
          <div className={cn("mt-1 flex justify-between gap-2 text-xs tabular", dark ? "text-sidebar-foreground/75" : "text-muted-foreground")}>
            <span>
              <span className="sr-only">10th percentile </span>P10 {format(low)}
            </span>
            {isNum(mid) ? (
              <span className={dark ? "font-medium text-gold-light" : "font-medium text-gold-deep"}>
                <span className="sr-only">Median </span>P50 {format(mid)}
              </span>
            ) : null}
            <span>
              <span className="sr-only">90th percentile </span>P90 {format(high)}
            </span>
          </div>
        )
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Labels and links
// ---------------------------------------------------------------------------------------------

export function SyntheticBadge({ className, label = "Synthetic data" }: { className?: string; label?: string }) {
  return (
    <StatusBadge tone="info" icon={FlaskRoundIcon} className={className} title="Generated demonstration data for the fictional NovaMart retailer">
      {label}
    </StatusBadge>
  );
}

const RELIABILITY: Record<string, { tone: Tone; label: string; icon: typeof CircleCheckIcon; seal: "verdigris" | "gold" | "oxblood" }> = {
  reliable: { tone: "good", label: "Reliable", icon: CircleCheckIcon, seal: "verdigris" },
  use_with_caution: { tone: "warning", label: "Use with caution", icon: CircleAlertIcon, seal: "gold" },
  unreliable: { tone: "danger", label: "Unreliable", icon: TriangleAlertIcon, seal: "oxblood" },
};

/** The verdict's words and the ink of its seal; null for a verdict the API did not give. */
export function reliabilityVerdict(reliability: string | null | undefined): { label: string; seal: "verdigris" | "gold" | "oxblood" } | null {
  if (!reliability) return null;
  const info = RELIABILITY[reliability];
  return info ? { label: info.label, seal: info.seal } : null;
}

export function ReliabilityBadge({ reliability, className }: { reliability: string | null | undefined; className?: string }) {
  if (!reliability) return <StatusBadge icon={CircleHelpIcon}>Not rated</StatusBadge>;
  const info = RELIABILITY[reliability] ?? { tone: "neutral" as Tone, label: humanize(reliability), icon: CircleHelpIcon };
  return (
    <StatusBadge tone={info.tone} icon={info.icon} className={className}>
      {info.label}
    </StatusBadge>
  );
}

/** Only http(s) links are rendered as links; anything else is shown as text. */
export function safeHref(href: string | null | undefined): string | null {
  if (!href) return null;
  try {
    const url = new URL(href);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export function hostOf(href: string | null | undefined): string | null {
  const safe = safeHref(href);
  if (!safe) return null;
  try {
    return new URL(safe).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

/** External link that opens in a new tab without giving the target page access to this one. */
export function ExternalLink({ href, children, className }: { href: string | null | undefined; children: ReactNode; className?: string }) {
  const safe = safeHref(href);
  if (!safe) return <span className={className}>{children}</span>;
  return (
    <a
      href={safe}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-baseline gap-1 rounded-sm font-medium text-primary underline-offset-3 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
    >
      <span className="min-w-0 break-words">{children}</span>
      <ExternalLinkIcon className="size-3 shrink-0 self-center" aria-hidden />
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

/** A long hash or id, printed as a serial: shortened on screen, full value in the title and on copy. */
export function HashValue({ value, chars = 12, copy = true }: { value: string | null | undefined; chars?: number; copy?: boolean }) {
  if (!value) return <span className="text-muted-foreground">Not available</span>;
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <Serial value={value} chars={chars} />
      {copy ? <CopyButton value={value} label="Copy" /> : null}
    </span>
  );
}

/** Small "Label: value" figure used inside dense cards. */
export function Figure({
  label,
  value,
  hint,
  className,
  valueClassName,
}: {
  label: ReactNode;
  value: ReactNode;
  hint?: ReactNode;
  className?: string;
  valueClassName?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("numeral mt-0.5 text-[1.125rem] leading-snug font-semibold text-foreground", valueClassName)}>{value}</p>
      {hint ? <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
