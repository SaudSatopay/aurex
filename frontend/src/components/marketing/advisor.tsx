import { plateBands, seedFrom } from "@/components/art/guilloche";
import { CutMarks, Seal, SpecimenOverprint } from "@/components/art/ornaments";
import { Rosette } from "@/components/art/rosette";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

import { IllustrativeLabel } from "./evidence";
import { Container } from "./primitives";
import { NOTE_ON_PLATE, PlateBackdrop, PlateFrame } from "./surface";

const ADVISOR_POINTS = [
  {
    name: "Runs validated calculations",
    text: "Figures come from the same tested calculations as your dashboards and reports, not from the language model's own arithmetic.",
  },
  {
    name: "Cites its sources",
    text: "Each answer links to the data, period and calculation it used, so anyone can check it.",
  },
  {
    name: "States its uncertainty",
    text: "When data is thin or a range is wide, the answer says so, and says what would narrow it.",
  },
] as const;

const SOURCES = [
  "Gross margin by store, September 2026 (sales ledger)",
  "Product-mix variance, August to September 2026",
  "Supplier price file, imported 8 September 2026",
] as const;

// The answer's own figures, set as the margin bridge the advisor ran (32.6 - 1.7 - 0.8 = 30.1).
const BRIDGE = [
  { label: "Gross margin, August", value: "32.6", unit: "%" },
  { label: "Shift toward lower-margin household lines", value: "−1.7", unit: "pts" },
  { label: "Higher supplier prices on 41 products", value: "−0.8", unit: "pts" },
] as const;

function Cite({ n }: { n: number }) {
  return (
    <sup className="ml-0.5">
      <a
        href={`#advisor-source-${n}`}
        aria-label={`Source ${n}`}
        className="rounded-sm px-0.5 text-[0.7rem] font-semibold text-prussian outline-none hover:underline focus-visible:ring-2 focus-visible:ring-prussian"
      >
        [{n}]
      </a>
    </sup>
  );
}

/**
 * Illustrative advisor answer as a certified extract: the question on glassine, the answer printed on a
 * paper note with its figures set as a bridge, its calculations and sources, and a seal stamped where
 * the figures are traced. "slab" lays it on its own ink plate (light pages); "glass" lays it straight
 * onto an ink band that is already there.
 */
export function AdvisorSample({ material = "slab" }: { material?: "slab" | "glass" }) {
  const slab = material === "slab";
  return (
    <figure
      aria-labelledby="advisor-sample-title"
      className={cn("relative", slab && "isolate overflow-hidden rounded-[0.9rem] px-4 py-8 sm:px-10 sm:py-12")}
    >
      {slab ? (
        <>
          <PlateBackdrop />
          <PlateFrame />
        </>
      ) : null}

      {/* The question: glassine laid on the plate (over the engraving, which it frosts). */}
      <div className="glass-ink relative z-10 ml-auto max-w-[31rem] rounded-[0.6rem] px-5 py-4 text-paper sm:mr-8">
        <p className="text-sm text-paper/75">Question from a Finance Manager</p>
        <p className="mt-1.5 font-display text-[1.25rem] leading-snug font-medium tracking-[-0.01em]">
          Why did gross margin fall at store NM‑012 in September?
        </p>
      </div>

      <div className="relative mt-5">
        <CutMarks tone="gold" />
        <div className={cn("relative isolate overflow-hidden rounded-[0.9rem] px-5 pt-9 pb-7 sm:px-8 sm:pt-10", NOTE_ON_PLATE)}>
          <SpecimenOverprint className="-z-10" />

          <div className="flex items-start justify-between gap-4 border-b border-rule pb-5">
            <div>
              <p id="advisor-sample-title" className="font-display text-[1.625rem] leading-none font-semibold tracking-[-0.02em]">
                AI Business Advisor
              </p>
              <IllustrativeLabel className="mt-3.5" />
            </div>
            <div className="-mt-3 -mr-1 flex shrink-0 flex-col items-center gap-1 text-center">
              <Seal text="traced to tool outputs" mark="AI Business Advisor" className="size-20 sm:size-24" />
              <p className="max-w-[13ch] text-[0.6875rem] leading-snug text-muted-foreground">
                Figures traced to tool outputs
              </p>
            </div>
          </div>

          <p className="mt-5 max-w-[62ch] text-[1rem] leading-relaxed text-ink/90">
            Gross margin at NM‑012 fell from 32.6% in August to 30.1% in September.
            <Cite n={1} /> About 1.7 points of the 2.5-point drop comes from a shift in sales toward lower-margin
            household lines.
            <Cite n={2} /> The remaining 0.8 points come from higher supplier prices on 41 products.
            <Cite n={3} />
          </p>

          <div className="mt-6 grid gap-6 sm:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] sm:gap-8">
            <table className="w-full text-left">
              <caption className="pb-2 text-left font-display text-[1rem] font-semibold tracking-[-0.01em]">
                Margin bridge, NM‑012
              </caption>
              <tbody>
                {BRIDGE.map((line) => (
                  <tr key={line.label} className="border-t border-rule align-baseline">
                    <th scope="row" className="py-2 pr-3 text-[0.8125rem] leading-snug font-normal text-ink/75">
                      {line.label}
                    </th>
                    <td className="py-2 text-right whitespace-nowrap">
                      <span className="numeral text-[1.25rem] font-semibold">{line.value}</span>
                      <span className="ml-1 text-xs text-muted-foreground">{line.unit}</span>
                    </td>
                  </tr>
                ))}
                <tr className="border-t-[3px] border-double border-rule-strong align-baseline">
                  <th scope="row" className="pt-2.5 pr-3 text-[0.8125rem] leading-snug font-semibold text-ink">
                    Gross margin, September
                  </th>
                  <td className="pt-2.5 text-right whitespace-nowrap">
                    <span className="numeral text-[1.75rem] leading-none font-semibold">30.1</span>
                    <span className="ml-1 text-xs text-muted-foreground">%</span>
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="rounded-[0.5rem] bg-paper/70 px-4 py-3.5 shadow-[inset_0_0_0_1px_var(--rule)]">
              <p className="font-display text-[1rem] font-semibold tracking-[-0.01em]">Uncertainty</p>
              <ul className="mt-1.5 space-y-1.5 text-sm leading-relaxed text-ink/80">
                <li>Mix effect: well supported by 18 months of sales.</li>
                <li>Supplier effect: provisional. It rests on only three weeks of new prices.</li>
              </ul>
            </div>
          </div>

          <div className="mt-7 grid gap-6 border-t border-rule pt-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] sm:gap-8">
            <div>
              <p className="text-sm text-muted-foreground">Calculations run</p>
              <ul className="mt-2 space-y-1.5 font-mono text-[0.78rem] leading-relaxed break-words text-ink/85">
                <li className="flex items-baseline gap-2">
                  <span aria-hidden className="size-1.5 shrink-0 translate-y-[-0.1em] rounded-[1px] bg-verdigris" />
                  margin_bridge(NM-012, 2026-09)
                </li>
                <li className="flex items-baseline gap-2">
                  <span aria-hidden className="size-1.5 shrink-0 translate-y-[-0.1em] rounded-[1px] bg-verdigris" />
                  mix_variance(NM-012, 2026-08, 2026-09)
                </li>
              </ul>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sources</p>
              <ol className="mt-2 space-y-1.5 text-[0.8125rem] leading-relaxed text-ink/85">
                {SOURCES.map((source, i) => (
                  <li key={source} id={`advisor-source-${i + 1}`} className="flex scroll-mt-28 gap-2">
                    <span className="tabular shrink-0 font-semibold text-prussian">[{i + 1}]</span>
                    <span>{source}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </figure>
  );
}

export function AdvisorSection() {
  return (
    <section aria-labelledby="advisor-title" className="relative isolate overflow-hidden py-24 text-paper sm:py-32">
      <PlateBackdrop />
      <div aria-hidden className="absolute -top-80 -right-80 size-[40rem] opacity-30 sm:-top-56 sm:-right-72 sm:opacity-50 lg:-top-64 lg:-right-48 lg:size-[50rem]">
        <Rosette bands={plateBands(seedFrom("advisor"))} microprint={false} animate={false} />
      </div>
      <Container className="relative grid gap-14 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <Reveal>
            <h2 id="advisor-title" className="text-display text-[2.5rem] sm:text-[3.5rem] lg:text-[3.75rem]">
              An advisor that shows its working
            </h2>
            <p className="mt-7 max-w-[46ch] text-[1.0625rem] leading-relaxed text-paper/78">
              The AI Business Advisor answers questions about your business by running AUREX&apos;s validated
              calculations. It doesn&apos;t do arithmetic in prose, and it doesn&apos;t fill gaps with guesses.
            </p>
          </Reveal>
          <dl className="mt-12 border-t border-gold/20">
            {ADVISOR_POINTS.map((point) => (
              <div key={point.name} className="border-b border-gold/15 py-5">
                <dt className="font-display text-[1.25rem] leading-snug font-semibold tracking-[-0.015em]">{point.name}</dt>
                <dd className="mt-1.5 max-w-[48ch] text-[0.9375rem] leading-relaxed text-paper/75">{point.text}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="lg:col-span-7">
          <AdvisorSample material="glass" />
        </div>
      </Container>
    </section>
  );
}
