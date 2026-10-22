"use client";

import { ArrowDownRightIcon, ArrowUpRightIcon, CircleAlertIcon, LockIcon, MinusIcon, TriangleAlertIcon } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";

import { Seal, SpecimenOverprint } from "@/components/art/ornaments";
import { Rosette } from "@/components/art/rosette";
import { useChartView } from "@/components/app/charts/chart-parts";
import { NumberTicker } from "@/components/kit/number-ticker";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { DataTable, type Column } from "@/components/app/data-table";
import { DetailList, NoteList, Panel, SectionHeading } from "@/components/app/page";
import { Serial } from "@/components/app/print";
import { periodTitle } from "@/components/app/sections/sales";
import { Notice } from "@/components/app/states";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  cleanAmount,
  cleanFraction,
  formatAmount,
  formatDelta,
  formatFullAmount,
  formatProbability,
  isNum,
} from "@/lib/app/decision-lab-format";
import type { PnlMonth, SimulationResult } from "@/lib/app/decision-lab-types";
import { formatDate, formatMonth, formatNumber, formatPercent, formatPoints, humanize, MISSING } from "@/lib/app/format";
import { cn } from "@/lib/utils";

import { CumulativeCashChart, DeltaBarsChart, ScenarioLinesChart, Tornado, tornadoRows } from "./charts";
import { Figure, HashValue, RangeStrip, rangeDomain, ReliabilityBadge, SourceLegend, SyntheticBadge } from "./common";
import { AssumptionRows, LeverResultPanel } from "./lever-results";
import { RangeEngraving } from "./range-engraving";

type MetricKey = "net_sales" | "operating_expenses" | "ebitda" | "net_profit" | "free_cash_flow" | "gross_profit";

const METRICS: { key: MetricKey; label: string; up: boolean }[] = [
  { key: "net_profit", label: "Net profit", up: true },
  { key: "net_sales", label: "Net sales", up: true },
  { key: "gross_profit", label: "Gross profit", up: true },
  { key: "operating_expenses", label: "Operating expenses", up: false },
  { key: "ebitda", label: "EBITDA", up: true },
  { key: "free_cash_flow", label: "Free cash flow", up: true },
];

function direction(value: number | null, up: boolean): "good" | "bad" | "none" {
  if (value === null || value === 0) return "none";
  return value > 0 === up ? "good" : "bad";
}

/** Direction inks on the ink plate: lifted verdigris and oxblood, readable on navy. */
const PLATE_GOOD = "text-[color-mix(in_oklch,var(--verdigris),white_52%)]";
const PLATE_BAD = "text-[color-mix(in_oklch,var(--oxblood),white_50%)]";

/** One delta figure in the outcome band, set as a denomination: value, direction, whether the move is favourable. */
function BandFigure({
  label,
  value,
  text,
  up = true,
  hint,
  format,
}: {
  label: string;
  value: number | null;
  text: string;
  up?: boolean;
  hint?: ReactNode;
  /** Formatter that produces `text` from `value`; when given, the figure counts up to it. */
  format?: (value: number) => string;
}) {
  const dir = direction(value, up);
  const Icon = value === null || value === 0 ? MinusIcon : value > 0 ? ArrowUpRightIcon : ArrowDownRightIcon;
  const word = value === null ? "not available" : value === 0 ? "no change" : `${value > 0 ? "increase" : "decrease"}, ${dir === "good" ? "favourable" : "unfavourable"}`;
  return (
    <div
      role="group"
      aria-label={`${label} change`}
      className="min-w-0 border-t border-l border-gold-light/12 px-4 py-3.5 transition-colors duration-300 ease-(--ease-out) hover:bg-gold-light/[0.05] sm:px-5"
    >
      <p className="text-xs text-sidebar-foreground/65">{label}</p>
      <p className="mt-1 flex items-center gap-1.5 text-sidebar-foreground">
        <Icon
          className={cn("size-3.5 shrink-0", dir === "good" && PLATE_GOOD, dir === "bad" && PLATE_BAD, dir === "none" && "text-sidebar-foreground/45")}
          aria-hidden
        />
        <span className="numeral text-[1.375rem] leading-none font-semibold">
          {format && isNum(value) ? <NumberTicker value={value} format={format} /> : <span>{text}</span>}
        </span>
        <span className="sr-only"> ({word})</span>
      </p>
      {hint ? <p className="mt-0.5 text-xs leading-snug text-sidebar-foreground/55">{hint}</p> : null}
    </div>
  );
}

/**
 * The headline of a simulation, printed on an ink plate like a note: the net profit change as its
 * denomination, the P10–P90 range engraved as a guilloché envelope with the median in gold, the
 * inputs hash as its serial, then the other deltas. Synthetic runs carry the SPECIMEN overprint.
 */
function OutcomeBand({ result, scopeLabel }: { result: SimulationResult; scopeLabel: string }) {
  const currency = result.scope.currency;
  const totals = result.delta.totals;
  const net = cleanAmount(totals.net_profit);
  const unc = result.uncertainty;
  const npd = unc?.net_profit_delta;
  const months = result.months;
  const range = months.length ? `${formatMonth(months[0])} – ${formatMonth(months[months.length - 1])}` : null;
  const netDir = direction(net, true);
  const money = (v: number) => formatDelta(v, currency);
  const points = (v: number) => formatPoints(v);
  return (
    <section
      aria-label="Simulation outcome"
      className="relative isolate overflow-hidden rounded-2xl text-sidebar-foreground shadow-[inset_0_1px_0_oklch(0.9_0.085_92/0.22),0_0_0_1px_oklch(0.9_0.085_92/0.14),var(--glass-shadow-lift)]"
    >
      <div aria-hidden className="aurora-hero" />
      <div aria-hidden className="pointer-events-none absolute -top-36 -right-36 -z-[1] size-[26rem] opacity-[0.3]">
        <Rosette tone="gold" bands={OUTCOME_BANDS} strokeWidth={0.6} opacity={0.75} />
      </div>
      {result.scope.is_synthetic ? <SpecimenOverprint tone="gold" className="-z-[1] opacity-45" /> : null}
      <div className="grid gap-0 @4xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="min-w-0 px-5 pt-5 pb-5 sm:px-7 sm:pt-6">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <p className="text-[0.8125rem] text-sidebar-foreground/75">
              Net profit change over {result.horizon_months} {result.horizon_months === 1 ? "month" : "months"}
              {range ? <span className="text-sidebar-foreground/55"> · {range}</span> : null}
            </p>
            <Serial value={result.inputs_hash} label="Inputs" surface="plate" />
          </div>
          <p
            role="group"
            aria-label="Net profit change"
            className={cn(
              "numeral mt-3 text-[3rem] leading-[0.9] font-semibold tracking-[-0.035em] sm:text-[4.25rem]",
              netDir === "bad" && PLATE_BAD,
              netDir === "good" && PLATE_GOOD,
              netDir === "none" && "text-gold-light",
            )}
          >
            {isNum(net) ? <NumberTicker value={net} format={(v) => formatDelta(v, currency)} /> : formatDelta(net, currency)}
          </p>
          <p className="mt-2.5 text-[0.8125rem] text-sidebar-foreground/80">
            {netDir === "none" ? "No change against the forecast baseline" : `${netDir === "good" ? "Better" : "Worse"} than the forecast baseline`}
            {isNum(totals.net_profit) ? <span className="text-sidebar-foreground/55"> · {formatFullAmount(totals.net_profit, currency)}</span> : null}
          </p>
          <div className="mt-6">
            <p className="mb-2 text-xs text-sidebar-foreground/65">Range across {formatNumber(unc?.runs ?? null)} Monte Carlo runs</p>
            <RangeEngraving
              label="Net profit change"
              low={cleanAmount(npd?.p10)}
              mid={cleanAmount(npd?.p50)}
              high={cleanAmount(npd?.p90)}
              format={money}
            />
          </div>
          <p className="mt-5 flex flex-wrap items-baseline gap-x-2 text-[0.8125rem] text-sidebar-foreground/80">
            Probability net profit improves:{" "}
            <strong className="numeral text-[1.25rem] leading-none font-semibold text-gold-light">
              {isNum(unc?.probability_net_profit_positive) ? (
                <NumberTicker value={unc.probability_net_profit_positive} format={formatProbability} />
              ) : (
                formatProbability(unc?.probability_net_profit_positive)
              )}
            </strong>
          </p>
        </div>
        <div className="-mr-px grid grid-cols-1 content-start border-gold-light/12 @xs:grid-cols-2 @2xl:grid-cols-3 @4xl:grid-cols-2 @4xl:border-l">
          <BandFigure label="Net sales" value={cleanAmount(totals.net_sales)} text={formatDelta(totals.net_sales, currency)} format={money} />
          <BandFigure
            label="Operating expenses"
            value={cleanAmount(totals.operating_expenses)}
            text={formatDelta(totals.operating_expenses, currency)}
            up={false}
            format={money}
          />
          <BandFigure label="EBITDA" value={cleanAmount(totals.ebitda)} text={formatDelta(totals.ebitda, currency)} format={money} />
          <BandFigure label="Free cash flow" value={cleanAmount(totals.free_cash_flow)} text={formatDelta(totals.free_cash_flow, currency)} format={money} />
          <BandFigure
            label="Net margin"
            value={cleanFraction(result.delta.net_margin_pp)}
            text={formatPoints(cleanFraction(result.delta.net_margin_pp))}
            format={points}
          />
          <BandFigure
            label="Gross margin"
            value={cleanFraction(result.delta.gross_margin_pp)}
            text={formatPoints(cleanFraction(result.delta.gross_margin_pp))}
            format={points}
          />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-gold-light/12 bg-plate-deep/40 px-5 py-3 text-xs text-sidebar-foreground/65 sm:px-7">
        <span>Scope: {scopeLabel}</span>
        <span>Against the forecast baseline{result.baseline?.as_of ? ` with data to ${formatDate(result.baseline.as_of)}` : ""}</span>
        {result.scope.is_synthetic ? <span className="font-medium text-gold-light">Synthetic demonstration data</span> : null}
      </div>
    </section>
  );
}

/** A compact plate rosette for the outcome band (lighter than the hero's: fewer copies per band). */
const OUTCOME_BANDS = [
  { radius: 28, amp: 12, lobes: 7, copies: 5 },
  { radius: 82, amp: 16, lobes: 18, amp2: 6, lobes2: 4, copies: 7 },
  { radius: 156, amp: 20, lobes: 28, amp2: 8, lobes2: 6, copies: 9 },
  { radius: 236, amp: 15, lobes: 40, amp2: 8, lobes2: 7, copies: 8 },
  { radius: 300, amp: 6, lobes: 72, copies: 3 },
];

function monthlyRows(result: SimulationResult, key: MetricKey) {
  const base = result.baseline?.monthly ?? [];
  const scen = result.scenario?.monthly ?? [];
  return result.delta.monthly.map((d, i) => ({
    month: d.month,
    baseline: (base[i]?.[key as keyof PnlMonth] as number | null | undefined) ?? null,
    scenario: (scen[i]?.[key as keyof PnlMonth] as number | null | undefined) ?? null,
    delta: (d[key as keyof PnlMonth] as number | null) ?? null,
  }));
}

function MonthlyPanel({ result }: { result: SimulationResult }) {
  const [metric, setMetric] = useState<MetricKey>("net_profit");
  const [view, toggle] = useChartView("Month by month");
  const currency = result.scope.currency;
  const info = METRICS.find((m) => m.key === metric) ?? METRICS[0];
  const rows = useMemo(() => monthlyRows(result, metric), [result, metric]);
  const absolute = Boolean(result.baseline && result.scenario);
  const columns: Column<(typeof rows)[number]>[] = [
    { key: "month", header: "Month", cell: (r) => periodTitle(r.month, "month"), sortValue: (r) => r.month },
    ...(absolute
      ? ([
          { key: "baseline", header: "Baseline", align: "right", cell: (r) => formatAmount(r.baseline, currency), sortValue: (r) => r.baseline },
          { key: "scenario", header: "Scenario", align: "right", cell: (r) => formatAmount(r.scenario, currency), sortValue: (r) => r.scenario },
        ] as Column<(typeof rows)[number]>[])
      : []),
    { key: "delta", header: "Change", align: "right", cell: (r) => formatDelta(r.delta, currency), sortValue: (r) => r.delta },
  ];
  const selectId = "dl-monthly-metric";
  return (
    <Panel
      title="Month by month"
      description={absolute ? "Scenario against the forecast baseline" : "Change against the forecast baseline"}
      actions={
        <>
          <Label htmlFor={selectId} className="sr-only">
            Measure
          </Label>
          <Select value={metric} onValueChange={(value) => setMetric(value as MetricKey)}>
            <SelectTrigger id={selectId} size="sm" className="h-7 w-[11.5rem] bg-white/60 text-[0.8125rem] dark:bg-white/[0.05]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" align="end">
              {METRICS.map((m) => (
                <SelectItem key={m.key} value={m.key}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {toggle}
        </>
      }
      footer={
        absolute
          ? undefined
          : "Absolute baseline and scenario P&L require finance access; the changes are shown."
      }
    >
      {view === "table" ? (
        <DataTable caption={`${info.label} by month`} columns={columns} rows={rows} rowKey={(r) => r.month} dense maxHeight={340} />
      ) : absolute ? (
        <ScenarioLinesChart data={rows} currency={currency} metricLabel={info.label} ariaLabel={`${info.label}: scenario against baseline by month`} />
      ) : (
        <DeltaBarsChart
          data={rows.map((r) => ({ month: r.month, delta: r.delta }))}
          currency={currency}
          metricLabel={info.label}
          favourableWhenUp={info.up}
          ariaLabel={`Change in ${info.label.toLowerCase()} by month`}
        />
      )}
    </Panel>
  );
}

function UncertaintyPanel({ result }: { result: SimulationResult }) {
  const currency = result.scope.currency;
  const unc = result.uncertainty;
  if (!unc) {
    return (
      <Panel title="Uncertainty">
        <p className="text-sm text-muted-foreground">The Monte Carlo summary is not available for this run.</p>
      </Panel>
    );
  }
  const rows = [
    { key: "np", label: "Net profit change", q: unc.net_profit_delta },
    { key: "ns", label: "Net sales change", q: unc.net_sales_delta },
    { key: "fcf", label: "Free cash flow change", q: unc.free_cash_flow_delta },
  ];
  const money = (v: number) => formatDelta(v, currency);
  return (
    <Panel
      title="Uncertainty"
      description={`P10, median and P90 across ${formatNumber(unc.runs)} runs (seed ${unc.seed})`}
      footer={<NoteList notes={[unc.method, ...(result.downside ? [`Downside case: ${result.downside.definition}`] : [])]} />}
    >
      <ul className="space-y-5">
        {rows.map((row) => (
          <li key={row.key}>
            <p className="mb-1.5 text-[0.8125rem] font-medium">{row.label}</p>
            <RangeStrip
              label={row.label}
              low={cleanAmount(row.q?.p10)}
              mid={cleanAmount(row.q?.p50)}
              high={cleanAmount(row.q?.p90)}
              format={money}
              domain={rangeDomain([cleanAmount(row.q?.p10), cleanAmount(row.q?.p90)])}
            />
          </li>
        ))}
      </ul>
      <div className="@container mt-5 border-t border-(--glass-border) pt-4">
        <div className="grid gap-4 @md:grid-cols-3">
          <Figure label="Probability net profit improves" value={formatProbability(unc.probability_net_profit_positive)} />
          <Figure
            label="Downside net profit change"
            value={formatDelta(result.downside?.net_profit_delta, currency)}
            hint="1-in-10 unfavourable outcome"
          />
          <Figure
            label="ROI range (P10–P90)"
            value={unc.roi && isNum(unc.roi.p10) && isNum(unc.roi.p90) ? `${formatPercent(unc.roi.p10)} to ${formatPercent(unc.roi.p90)}` : "Not available"}
            hint={unc.roi ? undefined : "ROI is undefined without upfront investment."}
          />
        </div>
      </div>
    </Panel>
  );
}

function CashPanel({ result }: { result: SimulationResult }) {
  const currency = result.scope.currency;
  const inv = result.investment;
  const [view, toggle] = useChartView("Cumulative cash");
  const rows = result.months.map((month, i) => ({ month, index: i + 1, value: inv.cumulative_free_cash_flow[i] ?? null }));
  return (
    <Panel
      title="Cash and payback"
      description="Cumulative change in free cash flow against the baseline"
      actions={toggle}
      footer={<NoteList notes={[inv.roi_note, inv.payback_note].filter((n): n is string => Boolean(n))} />}
    >
      <div className="@container mb-4">
        <div className="grid grid-cols-2 gap-4 @lg:grid-cols-4">
          <Figure
            label="Investment"
            value={formatAmount(inv.investment, currency)}
            hint={`Capex ${formatAmount(inv.capex, currency)} · working capital ${formatAmount(inv.working_capital, currency)}`}
          />
          <Figure label="ROI" value={isNum(inv.roi) ? formatPercent(inv.roi) : "Not defined"} hint={isNum(inv.roi) ? undefined : "See the note below"} />
          <Figure
            label="Payback"
            value={isNum(inv.payback_months) ? `Month ${inv.payback_months}` : "No payback"}
            hint={isNum(inv.payback_months) ? undefined : "Within the horizon"}
          />
          <Figure
            label={`NPV at ${formatPercent(inv.discount_rate_annual, { decimals: 0 })}`}
            value={formatDelta(inv.npv, currency)}
            hint="Discounted incremental cash flow"
          />
        </div>
      </div>
      {view === "table" ? (
        <DataTable
          caption="Cumulative incremental free cash flow by month"
          columns={[
            { key: "m", header: "Month", cell: (r) => `${r.index} · ${periodTitle(r.month, "month")}`, sortValue: (r) => r.index },
            { key: "v", header: "Cumulative cash vs baseline", align: "right", cell: (r) => formatDelta(r.value, currency), sortValue: (r) => r.value },
          ]}
          rows={rows}
          rowKey={(r) => r.month}
          dense
          maxHeight={300}
        />
      ) : (
        <CumulativeCashChart months={result.months} values={inv.cumulative_free_cash_flow} paybackMonth={inv.payback_months} currency={currency} />
      )}
    </Panel>
  );
}

function SensitivityPanel({ result }: { result: SimulationResult }) {
  const currency = result.scope.currency;
  const [view, toggle] = useChartView("Sensitivity");
  const { visible, negligible } = tornadoRows(result.sensitivity ?? []);
  const base = result.sensitivity?.find((r) => isNum(r.base))?.base ?? null;
  return (
    <Panel
      title="What moves the result"
      description="Net profit change when each uncertain parameter is set to its low and high case, others at base"
      actions={visible.length ? toggle : undefined}
      footer={negligible ? `${negligible} parameter${negligible === 1 ? "" : "s"} with a negligible effect not shown.` : undefined}
    >
      {!visible.length ? (
        <p className="text-sm text-muted-foreground">
          No uncertain parameter moves this result: every effect in this scenario is a known cost or an accounting identity.
        </p>
      ) : view === "table" ? (
        <DataTable
          caption="Sensitivity of the net profit change"
          columns={[
            { key: "p", header: "Parameter", cell: (r) => r.parameter },
            { key: "l", header: "Low case", align: "right", cell: (r) => formatDelta(r.low_case, currency), sortValue: (r) => r.low_case },
            { key: "h", header: "High case", align: "right", cell: (r) => formatDelta(r.high_case, currency), sortValue: (r) => r.high_case },
            { key: "s", header: "Swing", align: "right", cell: (r) => formatAmount(r.swing, currency), sortValue: (r) => r.swing },
          ]}
          rows={visible}
          rowKey={(r) => r.parameter}
          dense
        />
      ) : (
        <Tornado rows={visible} currency={currency} baseLabel={`Base case ${formatDelta(base, currency)}`} />
      )}
    </Panel>
  );
}

function ReproducibilityPanel({ result, engineVersion }: { result: SimulationResult; engineVersion?: string }) {
  const source = result.baseline?.revenue_source ?? result.evidence_summary?.baseline_revenue_model ?? null;
  const window = result.baseline?.trailing_window ?? result.evidence_summary?.trailing_window ?? null;
  return (
    <Panel title="Baseline and reproducibility" description="What the scenario is compared against, and how to reproduce it">
      <DetailList
        items={[
          {
            label: "Baseline revenue model",
            value: source?.algorithm ? (
              <span className="inline-flex flex-wrap items-center gap-2">
                {humanize(source.algorithm)} v{source.version ?? MISSING}
                <ReliabilityBadge reliability={source.reliability} />
              </span>
            ) : (
              "Not available"
            ),
          },
          { label: "Daily forecast error (WAPE)", value: isNum(source?.wape_daily) ? formatPercent(source?.wape_daily) : "Not available" },
          { label: "Cost structure window", value: window ? `${formatDate(window.start)} to ${formatDate(window.end)}` : "Not available" },
          { label: "Engine version", value: result.engine_version ?? engineVersion ?? MISSING },
          {
            label: "Monte Carlo",
            value: result.uncertainty ? `${formatNumber(result.uncertainty.runs)} runs, seed ${result.uncertainty.seed}` : "Not available",
          },
          { label: "Discount rate", value: formatPercent(result.investment.discount_rate_annual, { decimals: 0 }) },
          { label: "Inputs hash", value: <HashValue value={result.inputs_hash} /> },
        ]}
      />
      {result.baseline?.notes?.length ? <NoteList className="mt-4" notes={result.baseline.notes} /> : null}
      {source?.model_id ? (
        <p className="mt-3 text-xs text-muted-foreground">
          The same inputs and seed reproduce these figures exactly.{" "}
          <Link href="/app/forecasts" className="font-medium text-primary underline-offset-3 hover:underline">
            See the forecast model
          </Link>
        </p>
      ) : null}
    </Panel>
  );
}

/** The full result of one simulation (fresh run or a saved scenario's latest run). */
export function SimulationResults({
  result,
  scopeLabel,
  categories,
  engineVersion,
  title,
}: {
  result: SimulationResult;
  scopeLabel: string;
  categories: Record<string, string>;
  engineVersion?: string;
  title?: ReactNode;
}) {
  const currency = result.scope.currency;
  const revenueNotes = result.levers.filter((l) => l.revenue_effect_note);
  // The result itself says revenue did not move: net sales change is exactly zero (after float noise).
  const revenueUnchanged = cleanAmount(result.delta.totals.net_sales) === 0;
  return (
    <div className="@container space-y-6">
      {title}
      <OutcomeBand result={result} scopeLabel={scopeLabel} />

      {revenueNotes.length ? (
        <div className="space-y-2" aria-label="Revenue effects">
          {revenueNotes.map((lever) => {
            const sealed = lever.type === "workforce" && revenueUnchanged;
            return (
              <div key={lever.index} className="relative flex items-center gap-4 rounded-xl glass px-4 py-3.5 sm:px-5">
                <div className="min-w-0 flex-1 space-y-1">
                  {sealed ? (
                    <p className="font-display text-[1.0625rem] leading-snug font-semibold tracking-[-0.01em]">
                      Revenue unchanged{" "}
                      <span className="font-sans text-[0.8125rem] font-normal text-muted-foreground">
                        · net sales change <span className="numeral text-foreground">{formatDelta(result.delta.totals.net_sales, currency)}</span>
                      </span>
                    </p>
                  ) : null}
                  <p className="flex items-start gap-2 text-sm leading-relaxed text-foreground/90">
                    {sealed ? null : <CircleAlertIcon className="mt-0.5 size-4 shrink-0 text-prussian" aria-hidden />}
                    <span>
                      <strong className="font-semibold">Revenue effect{revenueNotes.length > 1 ? ` (lever ${lever.index + 1})` : ""}:</strong>{" "}
                      {lever.revenue_effect_note}
                    </span>
                  </p>
                </div>
                {sealed ? <Seal text="Revenue unchanged" mark="lever:workforce" tone="verdigris" rotate={-8} className="-my-2 size-[5.5rem] shrink-0" /> : null}
              </div>
            );
          })}
        </div>
      ) : null}

      {result.warnings?.length ? (
        <Notice tone="warning" title={`${result.warnings.length} warning${result.warnings.length === 1 ? "" : "s"}`}>
          <NoteList notes={result.warnings} />
        </Notice>
      ) : null}

      {result.redacted ? (
        <div className="flex items-start gap-2.5 rounded-xl bg-sheet/70 px-3.5 py-3 text-sm leading-relaxed ring-1 ring-(--glass-border)">
          <LockIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
          <p className="text-muted-foreground">{result.redacted}</p>
        </div>
      ) : null}

      <RevealGroup className="grid gap-6 @5xl:grid-cols-2" stagger={0.05}>
        <RevealItem y={12} className="grid min-w-0">
          <MonthlyPanel result={result} />
        </RevealItem>
        <RevealItem y={12} className="grid min-w-0">
          <UncertaintyPanel result={result} />
        </RevealItem>
        <RevealItem y={12} className="grid min-w-0">
          <CashPanel result={result} />
        </RevealItem>
        <RevealItem y={12} className="grid min-w-0">
          <SensitivityPanel result={result} />
        </RevealItem>
      </RevealGroup>

      <SectionHeading
        title="Levers"
        description="What each change does, the evidence behind it and the assumptions it rests on"
        actions={<SourceLegend />}
      />
      <RevealGroup className="grid gap-4 @5xl:grid-cols-2" stagger={0.05}>
        {result.levers.map((lever) => (
          <RevealItem key={lever.index} y={12} className="grid min-w-0">
            <LeverResultPanel lever={lever} currency={currency} categories={categories} />
          </RevealItem>
        ))}
      </RevealGroup>

      <div className="grid gap-6 @5xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Panel title="All assumptions" description="Every input the result depends on, with its source">
          <AssumptionRows assumptions={result.assumptions} currency={currency} showLever />
        </Panel>
        <ReproducibilityPanel result={result} engineVersion={engineVersion} />
      </div>
      {result.scope.is_synthetic ? (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <SyntheticBadge /> Computed on synthetic demonstration data for the fictional NovaMart retailer.
        </p>
      ) : null}
    </div>
  );
}

export function WarningInline({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-start gap-2 text-xs text-muted-foreground">
      <TriangleAlertIcon className="mt-0.5 size-3.5 shrink-0 text-warning" aria-hidden />
      {children}
    </p>
  );
}
