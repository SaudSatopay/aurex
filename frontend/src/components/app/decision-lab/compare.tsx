"use client";

import { AwardIcon, GitCompareArrowsIcon, LoaderCircleIcon } from "lucide-react";
import { useId } from "react";

import { MintMark, Seal } from "@/components/art/ornaments";
import { StatusBadge } from "@/components/app/badges";
import { NoteList, Panel } from "@/components/app/page";
import { GoldRules, Serial } from "@/components/app/print";
import { EmptyState } from "@/components/app/states";
import { NumberTicker } from "@/components/kit/number-ticker";
import { SpotlightCard } from "@/components/kit/spotlight-card";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cleanAmount, cleanFraction, formatAmount, formatDelta, formatProbability, isNum } from "@/lib/app/decision-lab-format";
import type { SavedScenario, ScenarioComparison, ScenarioComparisonRow } from "@/lib/app/decision-lab-types";
import { formatDateTime, formatPercent, formatPoints, MISSING } from "@/lib/app/format";
import { cn } from "@/lib/utils";

import { QueryError, RangeStrip, rangeDomain } from "./common";
import { leverNames } from "./saved";

type MetricRow = {
  key: string;
  label: string;
  value: (r: ScenarioComparisonRow) => number | null;
  format: (v: number | null, currency: string) => string;
  higherIsBetter?: boolean;
};

const ROWS: MetricRow[] = [
  { key: "ns", label: "Net sales change", value: (r) => cleanAmount(r.delta.net_sales), format: formatDelta, higherIsBetter: true },
  { key: "gp", label: "Gross profit change", value: (r) => cleanAmount(r.delta.gross_profit), format: formatDelta, higherIsBetter: true },
  { key: "ox", label: "Operating expenses change", value: (r) => cleanAmount(r.delta.operating_expenses), format: formatDelta, higherIsBetter: false },
  { key: "eb", label: "EBITDA change", value: (r) => cleanAmount(r.delta.ebitda), format: formatDelta, higherIsBetter: true },
  { key: "np", label: "Net profit change", value: (r) => cleanAmount(r.delta.net_profit), format: formatDelta, higherIsBetter: true },
  { key: "fcf", label: "Free cash flow change", value: (r) => cleanAmount(r.delta.free_cash_flow), format: formatDelta, higherIsBetter: true },
  { key: "nm", label: "Net margin change", value: (r) => cleanFraction(r.net_margin_pp), format: (v) => formatPoints(v), higherIsBetter: true },
  { key: "p10", label: "Net profit P10 (downside)", value: (r) => cleanAmount(r.net_profit_p10), format: formatDelta, higherIsBetter: true },
  { key: "p50", label: "Net profit P50", value: (r) => cleanAmount(r.net_profit_p50), format: formatDelta, higherIsBetter: true },
  { key: "p90", label: "Net profit P90", value: (r) => cleanAmount(r.net_profit_p90), format: formatDelta, higherIsBetter: true },
  { key: "pp", label: "Probability profit improves", value: (r) => r.probability_profit_positive, format: (v) => formatProbability(v), higherIsBetter: true },
  { key: "inv", label: "Investment", value: (r) => cleanAmount(r.investment), format: formatAmount },
  { key: "roi", label: "ROI", value: (r) => r.roi, format: (v) => (isNum(v) ? formatPercent(v) : "Not defined"), higherIsBetter: true },
  { key: "pb", label: "Payback", value: (r) => r.payback_months, format: (v) => (isNum(v) ? `Month ${v}` : "No payback") },
  { key: "npv", label: "NPV", value: (r) => cleanAmount(r.npv), format: formatDelta, higherIsBetter: true },
];

export function CompareSelector({
  scenarios,
  selectedIds,
  onSelectionChange,
  onCompare,
  comparing,
}: {
  scenarios: SavedScenario[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onCompare: () => void;
  comparing: boolean;
}) {
  const baseId = useId();
  const count = selectedIds.length;
  return (
    <Panel
      title="Choose scenarios"
      description="Pick between two and six saved scenarios"
      actions={
        <Button onClick={onCompare} disabled={count < 2 || count > 6 || comparing}>
          {comparing ? <LoaderCircleIcon className="animate-spin" aria-hidden /> : <GitCompareArrowsIcon aria-hidden />}
          Compare {count >= 2 ? count : ""} scenarios
        </Button>
      }
    >
      {scenarios.length < 2 ? (
        <EmptyState compact icon={GitCompareArrowsIcon} title="Save at least two scenarios to compare them" />
      ) : (
        <RevealGroup as="ul" className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3" stagger={0.04} aria-label="Saved scenarios">
          {scenarios.map((s) => {
            const id = `${baseId}-${s.id}`;
            const checked = selectedIds.includes(s.id);
            return (
              <RevealItem as="li" key={s.id} y={10}>
                <SpotlightCard className="h-full rounded-xl">
                  <label
                    htmlFor={id}
                    className={cn(
                      "lift press flex h-full cursor-pointer items-start gap-2.5 rounded-xl bg-sheet px-3 py-2.5 ring-1 ring-(--glass-border)",
                      checked && "bg-gold/[0.07] ring-gold-deep/45",
                    )}
                  >
                    <Checkbox
                      id={id}
                      className="mt-0.5"
                      checked={checked}
                      disabled={!checked && count >= 6}
                      onCheckedChange={(value) => onSelectionChange(value === true ? [...selectedIds, s.id] : selectedIds.filter((x) => x !== s.id))}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{s.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        v{s.version} · {leverNames(s.levers).join(" · ")}
                      </span>
                    </span>
                    <MintMark name={`scenario:${s.id}`} tone={checked ? "gold" : "ink"} className="size-7 shrink-0 opacity-80" />
                  </label>
                </SpotlightCard>
              </RevealItem>
            );
          })}
        </RevealGroup>
      )}
      {count > 6 ? <p className="mt-2 text-xs text-destructive">At most six scenarios can be compared.</p> : null}
    </Panel>
  );
}

/**
 * One scenario printed as a note: its downside (P10) as the denomination, the median, P90 and the
 * chance of improving below, the scenario id as its serial. The best risk-adjusted one is struck on
 * the ink plate and sealed; its words are printed above its name.
 */
function ScenarioNote({ row, currency, best, caption }: { row: ScenarioComparisonRow; currency: string; best: boolean; caption: string }) {
  const headingId = useId();
  const p10 = cleanAmount(row.net_profit_p10);
  const muted = best ? "text-sidebar-foreground/65" : "text-muted-foreground";
  return (
    <article
      aria-labelledby={headingId}
      className={cn(
        "relative isolate flex h-full min-w-0 flex-col overflow-hidden rounded-2xl px-5 pt-5 pb-4 sm:px-6",
        best
          ? "text-sidebar-foreground shadow-[inset_0_1px_0_oklch(0.9_0.085_92/0.22),0_0_0_1px_oklch(0.9_0.085_92/0.14),var(--glass-shadow-lift)]"
          : "glass",
      )}
    >
      {best ? <div aria-hidden className="aurora-hero" /> : <GoldRules />}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <MintMark name={`scenario:${row.scenario_id}`} tone={best ? "gold" : "ink"} className="size-11 shrink-0" />
          <div className="min-w-0">
            <p className={cn("text-xs", best ? "text-gold-light" : "text-muted-foreground")}>{caption}</p>
            <h3 id={headingId} className="truncate font-display text-[1.375rem] leading-tight font-semibold tracking-[-0.02em]">
              {row.name}
            </h3>
          </div>
        </div>
        <Serial value={row.scenario_id} chars={8} label={`v${row.version}`} surface={best ? "plate" : "paper"} className="pt-1" />
      </div>
      <p className={cn("mt-5 text-xs", muted)}>Net profit P10 (downside)</p>
      <p className={cn("numeral mt-1 text-[2.5rem] leading-[0.95] font-semibold sm:text-[2.875rem]", best && "text-gold-light")}>
        {isNum(p10) ? <NumberTicker value={p10} format={(v) => formatDelta(v, currency)} /> : formatDelta(row.net_profit_p10, currency)}
      </p>
      <dl className={cn("mt-auto grid grid-cols-3 gap-3 border-t pt-3", best ? "mt-5 border-gold-light/15" : "mt-5 border-rule")}>
        <div className="min-w-0">
          <dt className={cn("text-xs", muted)}>Net profit P50</dt>
          <dd className="numeral mt-0.5 text-[1.0625rem] font-semibold">{formatDelta(row.net_profit_p50, currency)}</dd>
        </div>
        <div className="min-w-0">
          <dt className={cn("text-xs", muted)}>Net profit P90</dt>
          <dd className="numeral mt-0.5 text-[1.0625rem] font-semibold">{formatDelta(row.net_profit_p90, currency)}</dd>
        </div>
        <div className="min-w-0">
          <dt className={cn("text-xs", muted)}>Probability profit improves</dt>
          <dd className="numeral mt-0.5 text-[1.0625rem] font-semibold">{formatProbability(row.probability_profit_positive)}</dd>
        </div>
      </dl>
      {best ? (
        <Seal text="Best risk-adjusted" mark={`scenario:${row.scenario_id}`} tone="gold" rotate={-10} className="pointer-events-none absolute right-3 bottom-[4.25rem] size-20 opacity-90" />
      ) : null}
    </article>
  );
}

export function ComparisonResult({ data, currency }: { data: ScenarioComparison; currency: string }) {
  const rows = data.scenarios;
  const best = rows.find((r) => r.scenario_id === data.best_risk_adjusted) ?? null;
  const domain = rangeDomain(rows.flatMap((r) => [cleanAmount(r.net_profit_p10), cleanAmount(r.net_profit_p90)]));
  const others = rows.filter((r) => r !== best && isNum(r.net_profit_p10));
  const runnerUp = others.sort((a, b) => (b.net_profit_p10 ?? 0) - (a.net_profit_p10 ?? 0))[0];
  const bestByMedian = [...rows].filter((r) => isNum(r.net_profit_p50)).sort((a, b) => (b.net_profit_p50 ?? 0) - (a.net_profit_p50 ?? 0))[0];
  return (
    <div className="space-y-6">
      {best ? (
        <section aria-label="Best risk-adjusted scenario" className="space-y-3">
          <RevealGroup className={cn("grid gap-4", runnerUp && "md:grid-cols-2")} stagger={0.08} onMount>
            <RevealItem y={14} className="min-w-0">
              <ScenarioNote row={best} currency={currency} best caption="Best risk-adjusted outcome" />
            </RevealItem>
            {runnerUp ? (
              <RevealItem y={14} className="min-w-0">
                <ScenarioNote row={runnerUp} currency={currency} best={false} caption="Next highest downside" />
              </RevealItem>
            ) : null}
          </RevealGroup>
          <p className="max-w-[80ch] text-sm leading-relaxed text-foreground/85">
            Even in a 1-in-10 unfavourable outcome {best.name}&apos;s net profit changes by{" "}
            <strong className="font-semibold text-foreground">{formatDelta(best.net_profit_p10, currency)}</strong>
            {runnerUp ? (
              <>
                , ahead of {runnerUp.name} at {formatDelta(runnerUp.net_profit_p10, currency)}
              </>
            ) : null}
            .{" "}
            {bestByMedian && bestByMedian.scenario_id !== best.scenario_id
              ? `${bestByMedian.name} has the higher median (${formatDelta(bestByMedian.net_profit_p50, currency)}) but a weaker downside.`
              : "It also has the highest median outcome."}
          </p>
          <p className="text-xs text-muted-foreground">{data.ranking_basis}</p>
        </section>
      ) : (
        <p className="text-sm text-muted-foreground">No scenario has a Monte Carlo downside, so no risk-adjusted ranking is possible.</p>
      )}

      <Panel title="Net profit range" description="P10 to P90 change in net profit; the tick is the median. Same scale for every scenario.">
        <ul className="space-y-2">
          {rows.map((r) => (
            <li
              key={r.scenario_id}
              className="-mx-2 grid gap-x-4 gap-y-1 rounded-lg px-2 py-1.5 transition-colors duration-200 hover:bg-paper/70 sm:grid-cols-[minmax(8rem,14rem)_minmax(0,1fr)] sm:items-center"
            >
              <div className="flex min-w-0 items-start gap-2.5">
                <MintMark name={`scenario:${r.scenario_id}`} className="mt-0.5 size-6 shrink-0" />
                <div className="min-w-0">
                  <p className="truncate text-[0.8125rem] font-medium">{r.name}</p>
                  {r.scenario_id === data.best_risk_adjusted ? (
                    <StatusBadge tone="good" icon={AwardIcon}>
                      Best risk-adjusted
                    </StatusBadge>
                  ) : null}
                </div>
              </div>
              <RangeStrip
                label={r.name}
                low={cleanAmount(r.net_profit_p10)}
                mid={cleanAmount(r.net_profit_p50)}
                high={cleanAmount(r.net_profit_p90)}
                format={(v) => formatDelta(v, currency)}
                domain={domain}
                emphasis={r.scenario_id === data.best_risk_adjusted}
              />
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Side by side" description="Change against each scenario's forecast baseline over its horizon" footer={<NoteList notes={data.notes} />}>
        <div
          className="relative w-full overflow-x-auto rounded-xl bg-white/30 ring-1 ring-(--glass-border) outline-none focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-white/[0.02]"
          tabIndex={0}
          role="region"
          aria-label="Scenario comparison table"
        >
          <table className="w-full border-collapse text-[0.8125rem] tabular-nums">
            <caption className="sr-only">Scenario comparison: metrics by scenario</caption>
            <thead className="bg-white/55 backdrop-blur-md dark:bg-white/[0.04]">
              <tr className="border-b border-(--glass-border)">
                <th scope="col" className="sticky left-0 z-[1] min-w-[12rem] bg-(--glass-bg-strong) px-3 py-2 text-left text-xs font-medium text-muted-foreground backdrop-blur-xl">
                  Measure
                </th>
                {rows.map((r) => (
                  <th
                    key={r.scenario_id}
                    scope="col"
                    className={cn(
                      "min-w-[9rem] px-3 py-2 text-right align-bottom font-semibold whitespace-nowrap",
                      r.scenario_id === data.best_risk_adjusted && "bg-success/10",
                    )}
                  >
                    <span className="block truncate">{r.name}</span>
                    <span className="block text-[0.6875rem] font-normal text-muted-foreground">
                      v{r.version} · {r.horizon_months ?? MISSING} mo · {formatDateTime(r.computed_at)}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((metric) => {
                const values = rows.map(metric.value);
                const numeric = values.filter(isNum);
                const top = metric.higherIsBetter === undefined || numeric.length < 2 ? null : metric.higherIsBetter ? Math.max(...numeric) : Math.min(...numeric);
                return (
                  <tr
                    key={metric.key}
                    className={cn(
                      "border-b border-(--glass-border) transition-colors duration-200 ease-(--ease-out) last:border-b-0 hover:bg-primary/[0.035] dark:hover:bg-white/[0.035]",
                      metric.key === "p10" && "bg-foreground/[0.025]",
                    )}
                  >
                    <th scope="row" className="sticky left-0 z-[1] bg-(--glass-bg-strong) px-3 py-2 text-left font-normal whitespace-nowrap backdrop-blur-xl">
                      {metric.label}
                    </th>
                    {rows.map((r, i) => (
                      <td
                        key={r.scenario_id}
                        className={cn(
                          "px-3 py-2 text-right whitespace-nowrap tabular",
                          r.scenario_id === data.best_risk_adjusted && "bg-success/6",
                          top !== null && values[i] === top && "font-semibold",
                        )}
                      >
                        {metric.format(values[i], currency)}
                      </td>
                    ))}
                  </tr>
                );
              })}
              <tr className="border-b border-(--glass-border) transition-colors duration-200 ease-(--ease-out) last:border-b-0 hover:bg-primary/[0.035] dark:hover:bg-white/[0.035]">
                <th scope="row" className="sticky left-0 z-[1] bg-(--glass-bg-strong) px-3 py-2 text-left font-normal whitespace-nowrap backdrop-blur-xl">
                  Warnings
                </th>
                {rows.map((r) => (
                  <td key={r.scenario_id} className="px-3 py-2 text-right whitespace-nowrap tabular">
                    {r.warnings.length}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Bold marks the best value in each row where better has a direction.</p>
      </Panel>
    </div>
  );
}

export function CompareError({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  return (
    <Panel>
      <QueryError error={error} onRetry={onRetry} />
    </Panel>
  );
}
