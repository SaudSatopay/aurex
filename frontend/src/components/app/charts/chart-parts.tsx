"use client";

import { ChartColumnIcon, TableIcon } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { useId, useState, type ReactNode } from "react";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

export type LegendItem = { label: string; color: string; shape?: "line" | "rect" };

/** Legend above a chart: line keys for lines, swatches for areas and bars. Text stays in text colours. */
export function ChartLegend({ items, className }: { items: LegendItem[]; className?: string }) {
  if (items.length < 2) return null;
  return (
    <ul className={cn("flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground", className)}>
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-1.5">
          {item.shape === "line" ? (
            <span aria-hidden className="h-0.5 w-3.5 rounded-full" style={{ background: item.color }} />
          ) : (
            <span aria-hidden className="size-2.5 rounded-[3px]" style={{ background: item.color }} />
          )}
          <span className="text-foreground/80">{item.label}</span>
        </li>
      ))}
    </ul>
  );
}

export type TooltipRow = { key: string; label: string; color: string; value: ReactNode };

/** Tooltip card: the value leads (strong), the series name follows; a short line key carries identity. */
export function TooltipCard({ title, rows, footer }: { title: ReactNode; rows: TooltipRow[]; footer?: ReactNode }) {
  return (
    <div className="min-w-40 rounded-xl glass-strong px-3 py-2.5 text-xs text-popover-foreground">
      <p className="mb-1.5 font-medium text-foreground">{title}</p>
      <ul className="space-y-1">
        {rows.map((row) => (
          <li key={row.key} className="flex items-center gap-2">
            <span aria-hidden className="h-0.5 w-3 shrink-0 rounded-full" style={{ background: row.color }} />
            <span className="font-semibold text-foreground tabular">{row.value}</span>
            <span className="truncate text-muted-foreground">{row.label}</span>
          </li>
        ))}
      </ul>
      {footer ? <div className="mt-1.5 border-t border-(--glass-border) pt-1.5 text-muted-foreground">{footer}</div> : null}
    </div>
  );
}

export type ChartView = "chart" | "table";

/**
 * Chart / table switch. Every chart has a table twin so no value is reachable only by hovering.
 * Returns the current view and the toggle to place in the panel header.
 */
export function useChartView(label: string, initial: ChartView = "chart"): [ChartView, ReactNode] {
  const [view, setView] = useState<ChartView>(initial);
  const toggle = (
    <ToggleGroup
      type="single"
      size="sm"
      variant="outline"
      spacing={0}
      value={view}
      onValueChange={(value) => value && setView(value as ChartView)}
      aria-label={`${label}: display as`}
    >
      <ToggleGroupItem value="chart" aria-label="Show chart" title="Chart">
        <ChartColumnIcon aria-hidden />
      </ToggleGroupItem>
      <ToggleGroupItem value="table" aria-label="Show table" title="Table">
        <TableIcon aria-hidden />
      </ToggleGroupItem>
    </ToggleGroup>
  );
  return [view, toggle];
}

/** Wrapper that names a chart for assistive technology; the table view carries the values. */
export function ChartFigure({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <figure className={cn("min-w-0", className)} aria-label={label}>
      {children}
    </figure>
  );
}

/**
 * Recharts entrance: series draw in on a ~800 ms ease-out the first time they mount and when the
 * data changes. Under reduced motion they are simply there. Spread onto Line / Area / Bar / Pie.
 */
export function useChartAnimation(duration = 800) {
  const still = useReducedMotion();
  return still
    ? ({ isAnimationActive: false } as const)
    : ({ isAnimationActive: true, animationDuration: duration, animationEasing: "ease-out" } as const);
}

/** A unique, url()-safe id prefix for SVG gradients inside one chart. */
export function useGradientId(prefix = "g") {
  return `${prefix}-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
}

/** Vertical wash under an area line: the series colour fading to nothing at the baseline. */
export function AreaGradient({ id, color, from = 0.3 }: { id: string; color: string; from?: number; to?: number }) {
  // Engraved tone: fine diagonal hatching in the series ink over the faintest wash, as on a printed plate.
  const ink = Math.min(0.8, from * 2.1);
  return (
    <pattern id={id} patternUnits="userSpaceOnUse" width={4.5} height={4.5} patternTransform="rotate(-38)">
      <rect width={4.5} height={4.5} fill={color} fillOpacity={from * 0.22} />
      <line x1={0} y1={0} x2={0} y2={4.5} stroke={color} strokeOpacity={ink} strokeWidth={0.9} />
    </pattern>
  );
}

/** Bars printed in solid ink with a fine engraved highlight running through them. */
export function BarGradient({ id, color }: { id: string; color: string; horizontal?: boolean }) {
  return (
    <pattern id={id} patternUnits="userSpaceOnUse" width={4} height={4} patternTransform="rotate(-38)">
      <rect width={4} height={4} fill={color} />
      <line x1={0} y1={0} x2={0} y2={4} stroke="oklch(1 0 0)" strokeOpacity={0.24} strokeWidth={1} />
    </pattern>
  );
}
