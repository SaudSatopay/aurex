"use client";

import { useInView } from "motion/react";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

import { PIPELINE_STAGES } from "./content";
import { IllustrativeLabel } from "./evidence";
import { Container } from "./primitives";

/*
 * The lathe. One engraved ribbon runs through the eight stages every figure passes on its way to a report.
 * Each stage is a milled medallion on the ribbon, and the sample sale's trace is printed beside it as a
 * receipt slip. The ribbon engraves itself once, top to bottom, the first time the list is in view;
 * under reduced motion it is simply there. The last medallion is struck in gold: the report is what the
 * lathe mints.
 */

const RIBBON_W = 56;

/**
 * A vertical guilloche band at its real height (1 unit = 1px, so the engraving dash runs the full
 * length): copies of one sine, each shifted by a fraction of a wave, weave a lattice of constant width;
 * a finer counter-wave fills it; the whole band swells gently along its length.
 */
function ribbonPaths(height: number, copies = 10) {
  const mid = RIBBON_W / 2;
  const k = (Math.PI * 2) / 62;
  const k2 = (Math.PI * 2) / 23;
  const paths: string[] = [];
  for (let c = 0; c < copies; c++) {
    const phase = (c / copies) * Math.PI * 2;
    let d = "";
    for (let y = 0; y <= height; y += 3) {
      const swell = 0.84 + 0.16 * Math.sin((y / 420) * Math.PI * 2);
      const x = mid + 20 * swell * Math.sin(k * y + phase) + 4.5 * Math.sin(k2 * y - phase);
      d += `${y === 0 ? "M" : "L"}${x.toFixed(1)} ${y}`;
    }
    paths.push(d);
  }
  return paths;
}

/** The milled edge of a medallion (64-unit box). */
const TEETH = (() => {
  const n = 44;
  let d = "";
  for (let i = 0; i <= n * 2; i++) {
    const a = (i / (n * 2)) * Math.PI * 2;
    const r = i % 2 === 0 ? 31 : 29.3;
    d += `${i === 0 ? "M" : "L"}${(32 + r * Math.cos(a)).toFixed(2)} ${(32 + r * Math.sin(a)).toFixed(2)}`;
  }
  return `${d}Z`;
})();

// A receipt slip torn from a perforated roll: half-round notches along the left edge.
const PERFORATED: CSSProperties = {
  WebkitMaskImage: "radial-gradient(circle at 0 50%, transparent 2.6px, black 3.1px)",
  maskImage: "radial-gradient(circle at 0 50%, transparent 2.6px, black 3.1px)",
  WebkitMaskSize: "100% 9px",
  maskSize: "100% 9px",
  WebkitMaskRepeat: "repeat-y",
  maskRepeat: "repeat-y",
};

function LatheRibbon({ seen }: { seen: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    // Rounded so small reflows don't redraw the band.
    const ro = new ResizeObserver(([entry]) => setHeight(Math.round(entry.contentRect.height / 8) * 8));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const paths = useMemo(() => (height > 0 ? ribbonPaths(height) : []), [height]);
  return (
    <div
      ref={box}
      aria-hidden
      className="pointer-events-none absolute top-8 bottom-0 left-1 w-14 [mask-image:linear-gradient(to_bottom,black_86%,transparent)]"
    >
      {height > 0 ? (
        <svg
          focusable="false"
          viewBox={`0 0 ${RIBBON_W} ${height}`}
          width={RIBBON_W}
          height={height}
          className="block"
          fill="none"
          strokeWidth={0.7}
        >
          {paths.map((d, i) => (
            <path
              key={i}
              d={d}
              pathLength={1}
              stroke={i % 2 === 0 ? "var(--ink)" : "var(--prussian)"}
              strokeOpacity={i % 2 === 0 ? 0.32 : 0.42}
              className={seen ? "engrave" : "engrave-wait"}
              style={{ "--engrave-delay": `${0.1 + i * 0.07}s`, "--engrave-duration": "2.8s" } as CSSProperties}
            />
          ))}
        </svg>
      ) : null}
    </div>
  );
}

function Medallion({ n, minted }: { n: number; minted: boolean }) {
  const line = minted ? "var(--gold-deep)" : "var(--ink)";
  return (
    <span aria-hidden className="relative grid size-16 place-items-center">
      <svg
        viewBox="0 0 64 64"
        focusable="false"
        className="absolute inset-0 size-full transition-transform duration-700 ease-(--ease-out) group-hover:rotate-[24deg]"
        fill="none"
      >
        <circle cx={32} cy={32} r={31} fill="var(--paper)" />
        <path d={TEETH} stroke={line} strokeOpacity={minted ? 0.85 : 0.5} strokeWidth={0.8} />
        <circle cx={32} cy={32} r={26} stroke={line} strokeOpacity={minted ? 0.95 : 0.75} strokeWidth={1.2} />
        <circle cx={32} cy={32} r={22.4} stroke={line} strokeOpacity={0.45} strokeWidth={0.5} />
      </svg>
      <span
        className={cn(
          "numeral relative text-[1.5rem] leading-none font-semibold",
          minted ? "text-gold-deep" : "text-ink",
        )}
      >
        {n}
      </span>
    </span>
  );
}

export function PipelineSection() {
  const last = PIPELINE_STAGES.length - 1;
  const lathe = useRef<HTMLDivElement>(null);
  const seen = useInView(lathe, { once: true, amount: 0.08 });

  return (
    <section aria-labelledby="pipeline-title" className="relative py-24 sm:py-32">
      <Container className="grid gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <Reveal className="lg:sticky lg:top-28">
            <h2 id="pipeline-title" className="text-display text-[2.5rem] sm:text-[3.5rem] lg:text-[3.75rem]">
              From authorized data to a report you can defend
            </h2>
            <p className="mt-7 max-w-[44ch] text-pretty text-[1.0625rem] leading-relaxed text-muted-foreground">
              Every figure in AUREX passes through the same eight stages. Follow one sale at NovaMart, the demo
              retailer, as it moves through them.
            </p>
            <IllustrativeLabel className="mt-8" note="Sample sale: NovaMart demo data (synthetic)" />
          </Reveal>
        </div>

        <div ref={lathe} className="relative lg:col-span-7 lg:pt-3">
          <LatheRibbon seen={seen} />
          <ol className="relative">
            {PIPELINE_STAGES.map((stage, i) => (
              <li
                key={stage.name}
                className="group grid grid-cols-[4rem_minmax(0,1fr)] gap-x-4 pb-12 last:pb-1 sm:gap-x-7 sm:pb-14"
              >
                <Medallion n={i + 1} minted={i === last} />
                <div className="min-w-0 pt-3">
                  <h3 className="font-display text-[1.5rem] leading-[1.1] font-semibold tracking-[-0.02em] sm:text-[1.75rem]">
                    {stage.name}
                  </h3>
                  <p className="mt-2.5 max-w-[54ch] text-pretty text-[0.9375rem] leading-relaxed text-muted-foreground sm:text-base">
                    {stage.text}
                  </p>
                  <samp
                    style={PERFORATED}
                    className="mt-4 block w-fit max-w-full rounded-r-[0.4rem] border border-rule bg-sheet py-2 pr-3.5 pl-4 font-mono text-[0.78rem] leading-relaxed break-words text-ink/85 shadow-[0_1px_0_var(--rule)]"
                  >
                    {stage.trace}
                  </samp>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
