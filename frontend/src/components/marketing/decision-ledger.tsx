"use client";

import { MinusIcon, PlusIcon } from "lucide-react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useId, useState, type CSSProperties } from "react";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

import { SpecimenOverprint, WaveBand } from "@/components/art/ornaments";

import { EvidenceTag, IllustrativeLabel, type EvidenceBasis } from "./evidence";

/*
 * Illustrative Decision Lab calculation. Every input below is NovaMart demo data (synthetic).
 * The point being demonstrated: the staffing cost is known arithmetic, while revenue only moves
 * when sales history or a documented assumption supports it, and then always with a range.
 */
type RevenueBasis = "none" | "assumption" | "history";

const STORES = 6;
const COST_PER_ASSOCIATE = 3_840; // monthly loaded cost, from payroll records
const MONTHLY_REVENUE = 2_150_000; // the six stores combined
const GROSS_MARGIN = 0.31;
const UPLIFT_PER_ASSOCIATE: Record<Exclude<RevenueBasis, "none">, Range> = {
  // Assumption A-14, with a +/-50% sensitivity range
  assumption: { point: 0.0045, low: 0.00225, high: 0.00675 },
  // Estimated from staffing and sales history, 80% interval
  history: { point: 0.0062, low: 0.0031, high: 0.0093 },
};
const MIN_HIRES = 1;
const MAX_HIRES = 20;

type Range = { point: number; low: number; high: number };

type Simulation = {
  cost: number;
  revenue: Range | null;
  margin: Range | null;
  profit: Range;
};

function round10(value: number) {
  return Math.round(value / 10) * 10;
}

function simulate(hires: number, basis: RevenueBasis): Simulation {
  const cost = hires * COST_PER_ASSOCIATE;
  if (basis === "none") {
    return { cost, revenue: null, margin: null, profit: { point: -cost, low: -cost, high: -cost } };
  }
  const uplift = UPLIFT_PER_ASSOCIATE[basis];
  const revenueAt = (rate: number) => round10(hires * rate * MONTHLY_REVENUE);
  const revenue = { point: revenueAt(uplift.point), low: revenueAt(uplift.low), high: revenueAt(uplift.high) };
  const marginOf = (amount: number) => round10(amount * GROSS_MARGIN);
  const margin = { point: marginOf(revenue.point), low: marginOf(revenue.low), high: marginOf(revenue.high) };
  // Profit is derived from the rounded lines so the visible arithmetic always adds up.
  const profit = { point: margin.point - cost, low: margin.low - cost, high: margin.high - cost };
  return { cost, revenue, margin, profit };
}

const integer = new Intl.NumberFormat("en-US");
const MINUS = "−";
const NO_CHANGE = "No change";

function signed(value: number) {
  if (value === 0) return "0";
  return `${value > 0 ? "+" : MINUS}${integer.format(Math.abs(value))}`;
}

type Row = {
  key: string;
  label: string;
  value: string;
  range?: string;
  basis: EvidenceBasis;
  detail: string;
  total?: boolean;
};

function buildRows(hires: number, basis: RevenueBasis, sim: Simulation): Row[] {
  const rangeName = basis === "history" ? "80% interval" : "Assumption range";
  const rangeText = (r: Range) => `${rangeName} ${signed(r.low)} to ${signed(r.high)}`;

  const revenue: Row = sim.revenue
    ? {
        key: "revenue",
        label: "Revenue",
        value: signed(sim.revenue.point),
        range: rangeText(sim.revenue),
        basis: basis === "history" ? "history" : "assumption",
        detail:
          basis === "history"
            ? `Estimated from 104 weeks of staffing and sales history at the ${STORES} stores.`
            : "A-14: each added associate lifts store sales by 0.45%. Documented by Operations, not yet checked against history.",
      }
    : {
        key: "revenue",
        label: "Revenue",
        value: NO_CHANGE,
        basis: "none",
        detail: "No sales history or documented assumption supports a revenue effect yet.",
      };

  return [
    revenue,
    {
      key: "margin",
      label: "Gross margin",
      value: sim.margin ? signed(sim.margin.point) : NO_CHANGE,
      range: sim.margin ? rangeText(sim.margin) : undefined,
      basis: "calculated",
      detail: "Revenue effect × 31% gross margin.",
    },
    {
      key: "cost",
      label: "Staffing cost",
      value: signed(-sim.cost),
      basis: "known",
      detail: `${hires} × ${integer.format(COST_PER_ASSOCIATE)} monthly loaded cost per associate, from payroll records.`,
    },
    {
      key: "profit",
      label: "Operating profit",
      value: signed(sim.profit.point),
      range: sim.revenue ? rangeText(sim.profit) : undefined,
      basis: "calculated",
      detail: "Gross margin effect minus staffing cost.",
      total: true,
    },
  ];
}

function reading(basis: RevenueBasis, sim: Simulation) {
  if (basis === "none") {
    return "The staffing cost is certain. A revenue benefit is possible but unproven, so revenue stays unchanged until sales history or a documented assumption supports it.";
  }
  if (basis === "assumption") {
    return "Revenue moves only because of assumption A-14. The result stays flagged as assumption-based until sales history confirms or contradicts it.";
  }
  const { low, high } = sim.profit;
  if (low < 0 && high > 0) {
    return `Sales history supports a revenue lift, but the range is wide: operating profit could fall by ${integer.format(-low)} or rise by ${integer.format(high)} a month. The interval spans zero, so the data can't yet show that the hires pay for themselves.`;
  }
  if (low >= 0) return "Sales history supports a revenue lift that covers the staffing cost across the whole interval.";
  return "Sales history supports a revenue lift, but not one that covers the staffing cost anywhere in the interval.";
}

/** A figure that cross-fades when its value changes (opacity only under reduced motion). */
function Figure({ value, className }: { value: string; className?: string }) {
  return (
    <span className={cn("relative inline-block", className)}>
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={value}
          className="inline-block"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

const order = (i: number) => ({ "--mk-i": i }) as CSSProperties;

const OPTIONS: { value: RevenueBasis; label: string }[] = [
  { value: "none", label: "Nothing yet" },
  { value: "assumption", label: "An assumption" },
  { value: "history", label: "Sales history" },
];

export function DecisionLedger() {
  const [hires, setHires] = useState(10);
  const [basis, setBasis] = useState<RevenueBasis>("none");
  const titleId = useId();
  const decisionId = useId();
  const questionId = useId();

  const sim = simulate(hires, basis);
  const rows = buildRows(hires, basis, sim);
  const profitRow = rows[rows.length - 1];
  const summary = `${hires} more associates. Operating profit ${profitRow.value} a month${
    profitRow.range ? `, ${profitRow.range}` : ""
  }.`;

  const stepButton =
    "press grid size-9 place-items-center rounded-md text-ink outline-none hover:bg-ink/6 focus-visible:ring-2 focus-visible:ring-prussian disabled:pointer-events-none disabled:opacity-35";

  return (
    <MotionConfig reducedMotion="user">
      <figure
        aria-labelledby={titleId}
        className="relative isolate overflow-hidden rounded-[0.9rem] bg-sheet text-ink shadow-[inset_0_0_0_1px_var(--rule),inset_0_0_0_7px_var(--sheet),inset_0_0_0_8px_var(--gold-rule),0_50px_100px_-40px_oklch(0.06_0.03_264/0.95)]"
        style={order(0)}
      >
        <SpecimenOverprint className="-z-10" />
        <div className="flex flex-col gap-4 px-5 pt-6 pb-3 sm:flex-row sm:items-end sm:justify-between sm:px-8">
          <div>
            <p id={titleId} className="font-display text-[1.75rem] leading-none font-semibold tracking-[-0.02em]">
              Decision Lab
            </p>
            <p className="mt-2 text-sm text-muted-foreground">Monthly effect at NovaMart&apos;s {STORES} busiest stores</p>
            <div className="mt-3">
              <IllustrativeLabel surface="light" />
            </div>
          </div>
          <div className="sm:text-right">
            <p className="text-sm text-muted-foreground">Operating profit, per month</p>
            <Figure
              value={profitRow.value}
              className="numeral mt-1 text-[2.75rem] leading-none font-semibold whitespace-nowrap sm:text-[3.5rem]"
            />
          </div>
        </div>
        <WaveBand tone="ink" className="h-5 px-5 sm:px-8" waves={14} copies={5} />

        <div className="grid gap-6 border-b border-rule px-5 py-5 sm:px-8 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-end lg:gap-12">
          <div className="mk-rise" style={order(1)}>
            <p id={decisionId} className="text-sm text-muted-foreground">
              Decision
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-[1.0625rem] text-ink">
              <span>Hire</span>
              <span
                role="group"
                aria-labelledby={decisionId}
                className="inline-flex items-center gap-0.5 rounded-lg bg-paper/60 p-0.5 ring-1 ring-rule-strong"
              >
                <button
                  type="button"
                  className={stepButton}
                  onClick={() => setHires((n) => Math.max(MIN_HIRES, n - 1))}
                  disabled={hires <= MIN_HIRES}
                  aria-label="Hire one fewer associate"
                >
                  <MinusIcon className="size-4" aria-hidden />
                </button>
                <span className="numeral w-10 text-center text-xl font-semibold text-ink">{hires}</span>
                <button
                  type="button"
                  className={stepButton}
                  onClick={() => setHires((n) => Math.min(MAX_HIRES, n + 1))}
                  disabled={hires >= MAX_HIRES}
                  aria-label="Hire one more associate"
                >
                  <PlusIcon className="size-4" aria-hidden />
                </button>
              </span>
              <span>more store associates</span>
            </div>
          </div>

          <div className="mk-rise" style={order(2)}>
            <p id={questionId} className="text-sm text-muted-foreground">
              What supports a revenue effect?
            </p>
            <ToggleGroup
              type="single"
              value={basis}
              onValueChange={(value) => {
                if (value) setBasis(value as RevenueBasis);
              }}
              aria-labelledby={questionId}
              spacing={1}
              className="mt-2 grid w-full grid-cols-3 rounded-lg bg-paper/60 p-1 ring-1 ring-rule-strong sm:inline-grid sm:w-auto"
            >
              {OPTIONS.map((option) => (
                <ToggleGroupItem
                  key={option.value}
                  value={option.value}
                  className="press h-auto min-h-9 rounded-md px-3 py-2 text-center text-sm leading-tight whitespace-normal text-ink/75 hover:bg-ink/6 hover:text-ink focus-visible:ring-prussian/60 aria-pressed:bg-ink data-[state=on]:bg-ink data-[state=on]:text-paper sm:px-4"
                >
                  {option.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </div>

        <table className="w-full border-collapse text-left">
          <caption className="sr-only">
            Decision Lab result for hiring {hires} more store associates. Illustrative, NovaMart demo data
            (synthetic).
          </caption>
          <thead className="hidden text-xs text-muted-foreground sm:table-header-group">
            <tr>
              <th scope="col" className="w-[24%] pt-4 pr-3 pb-1 pl-8 font-medium">
                Line
              </th>
              <th scope="col" className="w-[28%] px-4 pt-4 pb-1 text-right font-medium">
                Effect per month
              </th>
              <th scope="col" className="pt-4 pr-8 pb-1 pl-6 font-medium">
                Basis
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.key}
                className={cn(
                  "mk-rise align-top",
                  i > 0 && "border-t",
                  row.total ? "border-rule-strong" : "border-rule",
                )}
                style={order(3 + i)}
              >
                <th scope="row" className="py-4 pr-3 pl-5 text-left font-normal sm:pl-8">
                  <span className={cn("block text-[0.9375rem]", row.total ? "font-semibold text-ink" : "text-ink/85")}>
                    {row.label}
                  </span>
                  <span className="mt-2.5 block sm:hidden">
                    <EvidenceTag basis={row.basis} surface="light" />
                    <span className="mt-1.5 block text-xs leading-relaxed text-muted-foreground">{row.detail}</span>
                  </span>
                </th>
                <td className="py-4 pr-5 pl-2 text-right sm:px-4">
                  <Figure
                    value={row.value}
                    className={cn(
                      "whitespace-nowrap",
                      row.value === NO_CHANGE
                        ? "pt-0.5 text-[0.9375rem] font-medium text-muted-foreground"
                        : "numeral text-xl font-semibold sm:text-2xl",
                      row.value !== NO_CHANGE && "text-ink",
                    )}
                  />
                  {row.range ? (
                    <span className="tabular mt-1 block text-xs leading-snug text-muted-foreground">{row.range}</span>
                  ) : null}
                </td>
                <td className="hidden py-4 pr-8 pl-6 sm:table-cell">
                  <EvidenceTag basis={row.basis} surface="light" />
                  <p className="mt-2 max-w-[52ch] text-sm leading-relaxed text-muted-foreground">{row.detail}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mk-rise border-t border-rule bg-paper/50 px-5 py-4 sm:px-8" style={order(7)}>
          <p className="max-w-[80ch] text-sm leading-relaxed text-ink/80">
            <span className="font-semibold text-ink">Reading: </span>
            {reading(basis, sim)}
          </p>
        </div>

        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {summary}
        </p>
      </figure>
    </MotionConfig>
  );
}
