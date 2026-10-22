import type { CSSProperties } from "react";

import { CutMarks, Seal, SpecimenOverprint } from "@/components/art/ornaments";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

import { IllustrativeLabel } from "./evidence";
import { NOTE_ON_PAPER } from "./surface";

const FORECAST_CONCEPTS = [
  {
    name: "Baselines and advanced models",
    text: "Seasonal-naive and moving-average baselines set the bar. Advanced models are shown next to them, so you can see whether the extra complexity earns its place.",
  },
  {
    name: "Time-based validation",
    text: "Models are trained on earlier periods and scored on later ones they haven't seen, the way they will be used. Data is never shuffled across time.",
  },
  {
    name: "Prediction intervals",
    text: "Every forecast comes with a range, so plans can allow for the plausible low and high, not just the middle.",
  },
] as const;

const METRICS = [
  { name: "MAE", full: "Mean absolute error", text: "The typical size of a miss, in the forecast's own units." },
  { name: "RMSE", full: "Root mean squared error", text: "Like MAE, but large misses count for more." },
  {
    name: "WAPE",
    full: "Weighted absolute percentage error",
    text: "Total error as a share of total actuals, comparable across stores of different sizes.",
  },
] as const;

// NovaMart demo data (synthetic): weekly sales per store, 26-week holdout, mean actual about 82,700.
const MODEL_SCORES = [
  { model: "Seasonal naive", kind: "Baseline", mae: "7,940", rmse: "10,300", wape: "9.6%" },
  { model: "Moving average", kind: "Baseline", mae: "9,350", rmse: "12,200", wape: "11.3%" },
  { model: "Advanced model", kind: "Candidate", mae: "5,950", rmse: "7,900", wape: "7.2%" },
] as const;

/**
 * Forecasting on the product page: the three ideas as one ruled specification, the accuracy measures as
 * a glossary, and the holdout scores printed as a document (a specimen: synthetic data), with the seal
 * the result has earned.
 */
export function ForecastingDetail() {
  return (
    <div className="mt-12 space-y-14">
      <dl className="grid border-y border-rule md:grid-cols-3 md:divide-x md:divide-rule">
        {FORECAST_CONCEPTS.map((concept, i) => (
          <div
            key={concept.name}
            className={cn("py-6 md:px-6 md:py-7", i > 0 && "border-t border-rule md:border-t-0", i === 0 && "md:pl-0", i === 2 && "md:pr-0")}
          >
            <dt className="font-display text-[1.3125rem] leading-tight font-semibold tracking-[-0.02em]">{concept.name}</dt>
            <dd className="mt-2.5 text-[0.9375rem] leading-relaxed text-muted-foreground">{concept.text}</dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <h3 className="font-display text-[1.5rem] leading-tight font-semibold tracking-[-0.02em]">
            How accuracy is reported
          </h3>
          <dl className="mt-6">
            {METRICS.map((metric) => (
              <div key={metric.name} className="border-t border-rule py-4 last:pb-0">
                <dt className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="numeral text-[1.75rem] leading-none font-semibold">{metric.name}</span>
                  <span className="text-[0.9375rem] leading-snug font-medium text-ink">
                    <span className="sr-only">, </span>
                    {metric.full}
                  </span>
                </dt>
                <dd className="mt-1.5 text-[0.9375rem] leading-relaxed text-muted-foreground">{metric.text}</dd>
              </div>
            ))}
          </dl>
        </div>

        <Reveal y={28} className="lg:col-span-7">
          <figure className="relative">
            <CutMarks />
            <div className={cn("relative isolate overflow-hidden rounded-[0.9rem]", NOTE_ON_PAPER)}>
              <SpecimenOverprint className="-z-10" />
              <figcaption className="flex items-start justify-between gap-4 border-b border-rule px-5 pt-6 pb-5 sm:px-7">
                <span className="block">
                  <span className="block font-display text-[1.25rem] leading-snug font-semibold tracking-[-0.02em]">
                    Weekly sales per store, 26-week holdout
                  </span>
                  <IllustrativeLabel className="mt-3" />
                </span>
                <Seal text="beats both baselines" mark="ML Forecasting" tone="verdigris" className="-mt-2 -mr-1 size-20 shrink-0" />
              </figcaption>
              <table className="w-full text-left text-sm">
                <thead className="text-xs text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-5 pt-4 pb-2 font-medium sm:px-7">
                      Model
                    </th>
                    <th scope="col" className="px-3 pt-4 pb-2 text-right font-medium">
                      MAE
                    </th>
                    <th scope="col" className="px-3 pt-4 pb-2 text-right font-medium">
                      RMSE
                    </th>
                    <th scope="col" className="px-5 pt-4 pb-2 text-right font-medium sm:px-7">
                      WAPE
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {MODEL_SCORES.map((row) => {
                    const candidate = row.kind === "Candidate";
                    return (
                      <tr
                        key={row.model}
                        className={cn(
                          "align-baseline",
                          candidate ? "border-t-[3px] border-double border-rule-strong" : "border-t border-rule",
                        )}
                      >
                        <th scope="row" className="px-5 py-3.5 font-normal sm:px-7">
                          <span className={cn("block", candidate ? "font-semibold text-ink" : "font-medium text-ink/85")}>
                            {row.model}
                          </span>
                          <span className="block text-xs text-muted-foreground">{row.kind}</span>
                        </th>
                        <td className="numeral px-3 py-3.5 text-right text-[1.0625rem]">{row.mae}</td>
                        <td className="numeral px-3 py-3.5 text-right text-[1.0625rem]">{row.rmse}</td>
                        <td
                          className={cn(
                            "numeral px-5 py-3.5 text-right sm:px-7",
                            candidate ? "text-[1.375rem] font-semibold" : "text-[1.0625rem]",
                          )}
                        >
                          {row.wape}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <p className="border-t border-rule bg-paper/55 px-5 py-3.5 text-xs leading-relaxed text-ink/75 sm:px-7">
                Lower is better on all three. Here the advanced model beats both baselines on weeks it never saw, so
                it earns its place.
              </p>
            </div>
          </figure>
        </Reveal>
      </div>
    </div>
  );
}

// The predicted interval and the measurement, on one scale (operating profit a month).
const SCALE = { min: -5000, max: 6600 };
const at = (value: number) => `${(((value - SCALE.min) / (SCALE.max - SCALE.min)) * 100).toFixed(2)}%`;
const HATCH: CSSProperties = {
  backgroundImage:
    "repeating-linear-gradient(115deg, color-mix(in oklch, var(--prussian) 55%, transparent) 0 1px, transparent 1px 4px)",
};

/** Predicted versus actual for one approved decision, printed as a record (a specimen: synthetic data). */
export function OutcomeTrackingSample({ className }: { className?: string }) {
  return (
    <Reveal y={28} className={className}>
      <figure className="relative">
        <CutMarks />
        <div className={cn("relative isolate overflow-hidden rounded-[0.9rem]", NOTE_ON_PAPER)}>
          <SpecimenOverprint className="-z-10" />
          <figcaption className="flex flex-col gap-3 border-b border-rule px-5 pt-6 pb-5 sm:flex-row sm:items-end sm:justify-between sm:px-7">
            <span className="font-display text-[1.25rem] leading-snug font-semibold tracking-[-0.02em]">
              Predicted versus actual
            </span>
            <IllustrativeLabel />
          </figcaption>

          <dl className="grid gap-6 px-5 pt-6 pb-2 sm:grid-cols-3 sm:gap-8 sm:px-7">
            <div>
              <dt className="text-xs font-medium text-muted-foreground">Decision</dt>
              <dd className="mt-2 text-[0.9375rem] leading-relaxed">
                <span className="font-semibold">R-118:</span> hire 6 associates at stores NM‑012 and NM‑017. Approved 2
                June 2026.
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted-foreground">Predicted</dt>
              <dd className="mt-2 text-[0.9375rem] leading-relaxed">
                Operating profit <span className="numeral text-[1.25rem] font-semibold whitespace-nowrap">−4,200</span> to{" "}
                <span className="numeral text-[1.25rem] font-semibold whitespace-nowrap">+5,800</span> a month (80%
                interval).
              </dd>
            </div>
            <div className="relative">
              <dt className="text-xs font-medium text-muted-foreground">Measured after 12 weeks</dt>
              <dd className="mt-2 text-[0.9375rem] leading-relaxed">
                <span className="numeral text-[1.75rem] leading-none font-semibold">+1,900</span> a month, inside the
                predicted range.
              </dd>
            </div>
          </dl>

          {/* The interval and the measurement on one scale. Decorative: the figures are stated above. */}
          <div aria-hidden className="flex items-center gap-5 px-5 pt-4 pb-7 sm:px-7">
            <div className="relative h-14 flex-1">
              <span className="absolute inset-x-0 top-6 h-px bg-rule-strong" />
              <span
                className="absolute top-3.5 h-[1.375rem] rounded-[3px] shadow-[inset_0_0_0_1px_color-mix(in_oklch,var(--prussian)_45%,transparent)]"
                style={{ left: at(-4200), width: `calc(${at(5800)} - ${at(-4200)})`, ...HATCH }}
              />
              <span className="absolute top-1.5 h-[2.375rem] w-px bg-ink/60" style={{ left: at(0) }} />
              <span
                className="absolute top-[1.0625rem] size-4 -translate-x-1/2 rounded-full bg-verdigris shadow-[0_0_0_2px_var(--sheet),0_0_0_3px_color-mix(in_oklch,var(--verdigris)_50%,transparent)]"
                style={{ left: at(1900) }}
              />
              <span className="absolute top-10 -translate-x-1/2 text-[0.6875rem] text-muted-foreground" style={{ left: at(0) }}>
                0
              </span>
              <span className="tabular absolute top-10 text-[0.6875rem] text-muted-foreground" style={{ left: at(-4200) }}>
                −4,200
              </span>
              <span className="tabular absolute top-10 -translate-x-full text-[0.6875rem] text-muted-foreground" style={{ left: at(5800) }}>
                +5,800
              </span>
            </div>
            <Seal text="inside predicted range" mark="Reports & Workflows" tone="verdigris" className="size-20 shrink-0" />
          </div>
        </div>
      </figure>
    </Reveal>
  );
}
