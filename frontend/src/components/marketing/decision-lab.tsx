"use client";

import { useInView } from "motion/react";
import { useRef, type CSSProperties } from "react";

import { WaveBand } from "@/components/art/ornaments";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

import { DECISION_ANALYSES, DECISION_LEVERS, DECISION_PRINCIPLE } from "./content";
import { IllustrativeLabel } from "./evidence";
import { Container, TextLink } from "./primitives";
import { PlateBackdrop, PlateFrame } from "./surface";

/*
 * Decision Lab. The principle is engraved on an ink plate, and proved beside it by a small hand-drawn
 * schematic: the staffing cost is one sharp line (known arithmetic, one equal step per hire), while the
 * revenue effect is a woven envelope of fine lines, printed in UV ink because it only appears with
 * evidence. One orchestrated moment: the lines engrave themselves the first time the plate is seen.
 * Static and complete under reduced motion.
 */

/** The Decision Lab principle, set large. */
export function DecisionPrinciple({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "text-balance font-display text-[1.75rem] leading-[1.08] font-semibold tracking-[-0.03em] sm:text-[2.25rem] lg:text-[2.625rem]",
        className,
      )}
    >
      {DECISION_PRINCIPLE}
    </p>
  );
}

// Schematic geometry (320 x 200 units): effect against hires, 0 to 10.
const X0 = 30;
const X1 = 302;
const ZERO = 98;
const COST_AT_10 = 172;
const HIRE = (X1 - X0) / 10;

const COST_TICKS = Array.from({ length: 10 }, (_, i) => {
  const t = (i + 1) / 10;
  const x = X0 + t * (X1 - X0);
  const y = ZERO + t * (COST_AT_10 - ZERO);
  return `M${(x - 2.2).toFixed(1)} ${(y - 5).toFixed(1)}L${(x + 2.2).toFixed(1)} ${(y + 5).toFixed(1)}`;
});

/** The revenue envelope: a fan of fine lines whose spread widens with every hire, woven by a small wobble. */
const ENVELOPE = Array.from({ length: 16 }, (_, c) => {
  const f = c / 15;
  const rise = 20 + f * 56;
  const phase = f * Math.PI * 2;
  let d = "";
  for (let i = 0; i <= 64; i++) {
    const t = i / 64;
    const x = X0 + t * (X1 - X0);
    const y = ZERO - rise * t - 3.6 * t * Math.sin(t * Math.PI * 7 + phase);
    d += `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return d;
});

const LABEL = { fontFamily: "var(--font-sans)", fontSize: 9.5, fill: "oklch(0.95 0.01 165)" } as const;

function Schematic({ evidence, seen }: { evidence: boolean; seen: boolean }) {
  // No render-time branch on reduced motion (the server can't know it, and a mismatched class is never
  // patched on hydration): globals.css finishes .engrave instantly under prefers-reduced-motion.
  const engrave = (delay: number, duration: number) => ({
    pathLength: 1,
    className: seen ? "engrave" : "opacity-0",
    style: { "--engrave-delay": `${delay}s`, "--engrave-duration": `${duration}s` } as CSSProperties,
  });
  return (
    <svg aria-hidden focusable="false" viewBox="0 0 320 200" className="block h-auto w-full" fill="none">
      {/* axes: effect (up is a gain) and hires */}
      <path d={`M${X0} 12V188`} stroke="oklch(0.95 0.01 165)" strokeOpacity={0.22} strokeWidth={0.75} />
      <path d={`M${X0} ${ZERO}H${X1 + 6}`} stroke="oklch(0.95 0.01 165)" strokeOpacity={0.32} strokeWidth={0.75} />
      {Array.from({ length: 10 }, (_, i) => (
        <path
          key={i}
          d={`M${X0 + (i + 1) * HIRE} ${ZERO - 2.5}V${ZERO + 2.5}`}
          stroke="oklch(0.95 0.01 165)"
          strokeOpacity={0.3}
          strokeWidth={0.75}
        />
      ))}
      <text {...LABEL} x={X0 - 9} y={26} textAnchor="middle" fillOpacity={0.6}>
        +
      </text>
      <text {...LABEL} x={X0 - 9} y={178} textAnchor="middle" fillOpacity={0.6}>
        −
      </text>
      <text {...LABEL} x={X1 + 6} y={ZERO + 15} textAnchor="end" fillOpacity={0.6}>
        10 hires
      </text>

      {evidence ? (
        <g strokeWidth={0.6}>
          {ENVELOPE.map((d, i) => (
            <path
              key={i}
              d={d}
              stroke={i % 2 === 0 ? "var(--uv-a)" : "var(--uv-b)"}
              strokeOpacity={i % 2 === 0 ? 0.7 : 0.85}
              {...engrave(0.75 + i * 0.05, 1.5)}
            />
          ))}
        </g>
      ) : (
        <path
          d={`M${X0} ${ZERO}H${X1}`}
          stroke="oklch(0.95 0.01 165)"
          strokeOpacity={0.7}
          strokeWidth={1.2}
          strokeDasharray="1.5 4.5"
          strokeLinecap="round"
        />
      )}
      <text {...LABEL} x={X0 + 8} y={evidence ? 30 : ZERO - 8} fillOpacity={0.82}>
        {evidence ? "Revenue effect, as a range" : "Revenue: no change"}
      </text>

      {/* the staffing cost: one sharp line, one equal step per hire */}
      <path
        d={`M${X0} ${ZERO}L${X1} ${COST_AT_10}`}
        stroke="oklch(0.97 0.008 92)"
        strokeWidth={1.6}
        strokeLinecap="round"
        {...engrave(0.2, 0.9)}
      />
      {COST_TICKS.map((d, i) => (
        <path key={i} d={d} stroke="oklch(0.97 0.008 92)" strokeOpacity={0.55} strokeWidth={0.75} />
      ))}
      <text {...LABEL} x={X1} y={194} textAnchor="end" fillOpacity={0.82}>
        Staffing cost
      </text>
    </svg>
  );
}

/** The principle on its plate, with the two-panel schematic that shows it. */
export function DecisionPlate({ className, compact = false }: { className?: string; compact?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.45 });
  const panels = [
    {
      evidence: false,
      title: "Nothing supports a revenue effect yet",
      text: "The staffing cost is known arithmetic. Revenue stays unchanged.",
    },
    {
      evidence: true,
      title: "Sales history or a documented assumption",
      text: "Revenue moves, and always as a range.",
    },
  ];
  return (
    <div
      className={cn(
        "relative isolate overflow-hidden rounded-[0.9rem] text-paper",
        compact ? "px-6 py-9 sm:px-10 sm:py-11" : "px-6 py-11 sm:px-12 sm:py-14 lg:px-16 lg:py-16",
        className,
      )}
    >
      <PlateBackdrop />
      <PlateFrame />
      <DecisionPrinciple
        className={cn(
          "relative max-w-[30ch]",
          compact
            ? "text-[1.625rem] leading-[1.12] sm:text-[2.125rem]"
            : "text-[2rem] leading-[1.08] sm:text-[2.75rem] lg:text-[3.375rem] lg:leading-[1.03]",
        )}
      />
      <figure ref={ref} className={cn("relative border-t border-gold/20", compact ? "mt-9 pt-7" : "mt-12 pt-9")}>
        <div className="grid gap-4 sm:grid-cols-2 lg:gap-5">
          {panels.map((panel) => (
            <div key={panel.title} className="glass-ink rounded-[0.6rem] p-4 sm:p-5">
              <Schematic evidence={panel.evidence} seen={seen} />
              <p className="mt-4 font-display text-[1.0625rem] leading-snug font-semibold tracking-[-0.01em]">
                {panel.title}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-paper/75">{panel.text}</p>
            </div>
          ))}
        </div>
        <figcaption className="mt-6">
          <IllustrativeLabel surface="dark" note="A schematic of the rule, not drawn from data" />
        </figcaption>
      </figure>
    </div>
  );
}

/**
 * Levers and analysis types. "split" sits side by side on wide screens (home page); "stacked" suits a
 * narrower content column (product page). The levers are a ruled index whose last line, the combined
 * scenario, closes it like a total; the three analyses are entries set at display size.
 */
export function DecisionLabDetail({
  className,
  layout = "split",
}: {
  className?: string;
  layout?: "split" | "stacked";
}) {
  const split = layout === "split";
  const levers = DECISION_LEVERS.slice(0, -1);
  const combined = DECISION_LEVERS[DECISION_LEVERS.length - 1];
  return (
    <div className={cn("grid gap-14", split && "lg:grid-cols-12 lg:gap-16", className)}>
      <div className={cn(split && "lg:col-span-5")}>
        <h3 className="font-display text-[1.5rem] leading-tight font-semibold tracking-[-0.02em]">Ten levers</h3>
        <ul className={cn("mt-5 grid gap-x-8 sm:grid-cols-2", !split && "lg:grid-cols-3")}>
          {levers.map((lever) => (
            <li key={lever} className="border-t border-rule py-3 text-[0.9375rem] leading-snug text-ink/85">
              {lever}
            </li>
          ))}
          <li
            className={cn(
              "border-t-2 border-double border-rule-strong pt-3.5 pb-1 font-display text-[1.125rem] leading-snug font-semibold tracking-[-0.01em] text-ink sm:col-span-2",
              !split && "lg:col-span-3",
            )}
          >
            {combined}
          </li>
        </ul>
      </div>
      <div className={cn(split && "lg:col-span-7")}>
        <h3 className="font-display text-[1.5rem] leading-tight font-semibold tracking-[-0.02em]">
          Three ways to test a scenario
        </h3>
        <dl className="mt-5">
          {DECISION_ANALYSES.map((analysis) => (
            <div
              key={analysis.name}
              className="grid gap-x-8 gap-y-1.5 border-t border-rule py-5 sm:grid-cols-[minmax(0,13rem)_minmax(0,1fr)] sm:py-6"
            >
              <dt className="font-display text-[1.75rem] leading-[1.05] font-semibold tracking-[-0.025em] sm:text-[2rem]">
                {analysis.name}
              </dt>
              <dd className="max-w-[54ch] text-[0.9375rem] leading-relaxed text-muted-foreground sm:pt-1.5 sm:text-base">
                {analysis.text}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

export function DecisionLabSection() {
  return (
    <section aria-labelledby="lab-title" className="pb-24 sm:pb-32">
      <Container>
        <WaveBand tone="ink" className="mb-20 h-5 sm:mb-24" waves={22} copies={5} />
        <Reveal className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-8">
          <h2 id="lab-title" className="text-display text-[2.75rem] sm:text-[4rem] lg:col-span-6 lg:text-[5rem]">
            Decision Lab
          </h2>
          <div className="lg:col-span-5 lg:col-start-8">
            <p className="max-w-[46ch] text-pretty text-[1.0625rem] leading-relaxed text-muted-foreground">
              Change one lever or several. AUREX shows which figures move, by how much, and what supports each
              change, before anything is committed.
            </p>
            <TextLink href="/product#decision-lab" className="mt-5 inline-block">
              How Decision Lab works
            </TextLink>
          </div>
        </Reveal>
        <DecisionPlate className="mt-12 sm:mt-14" />
        <DecisionLabDetail className="mt-16 sm:mt-20" />
      </Container>
    </section>
  );
}
