"use client";

/*
 * Small engraved ornaments shared by the public site and the workspace: a guilloche wave band (rules
 * and plate edges), an embossed seal (verdicts), a SPECIMEN overprint (synthetic demo data), print cut
 * marks (an uncut sheet of notes), a seeded mint mark (every role or module gets its own little rosette)
 * and the paper watermark behind the workspace. All decorative and aria-hidden: the words they stand
 * for are always present as text elsewhere.
 */
import { useInView } from "motion/react";
import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";

import { cn } from "@/lib/utils";

import { circlePath, rosetteBandPaths, seededBands, seedFrom, waveBandPaths, type RosetteBand } from "./guilloche";

/**
 * A woven band that engraves itself (left to right) the first time it scrolls into view. It measures its
 * own box and draws for that exact size, so lines keep their weight at any width and the engraving
 * reaches the far end.
 */
export function WaveBand({
  className,
  tone = "gold",
  height = 28,
  waves = 9,
  copies = 6,
  strokeWidth = 0.8,
}: {
  className?: string;
  tone?: "gold" | "ink" | "paper";
  height?: number;
  /** Waves per 1200 px of width (the density stays the same at any width). */
  waves?: number;
  copies?: number;
  strokeWidth?: number;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const seen = useInView(ref, { once: true, margin: "0px 0px -8% 0px" });
  const [box, setBox] = useState({ w: 1200, h: height });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) setBox({ w: Math.round(r.width), h: Math.round(r.height) });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const n = Math.max(2, Math.round((waves * box.w) / 1200));
  const paths = useMemo(
    () =>
      waveBandPaths({
        width: box.w,
        height: box.h,
        waves: n,
        waves2: Math.max(1, Math.round(n / 3)),
        amp: box.h * 0.32,
        amp2: box.h * 0.12,
        copies,
      }),
    [box.w, box.h, n, copies],
  );
  const stroke = tone === "gold" ? "var(--gold)" : tone === "ink" ? "var(--ink)" : "oklch(0.95 0.01 165)";
  return (
    <svg
      ref={ref}
      aria-hidden
      focusable="false"
      viewBox={`0 0 ${box.w} ${box.h}`}
      preserveAspectRatio="none"
      className={cn("block h-7 w-full", className)}
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeOpacity={tone === "ink" ? 0.35 : 0.7}
    >
      {paths.map((d, i) => (
        <path
          key={i}
          d={d}
          pathLength={1}
          className={seen ? "engrave" : "engrave-wait"}
          style={{ "--engrave-delay": `${i * 0.06}s`, "--engrave-duration": "1.4s" } as CSSProperties}
        />
      ))}
    </svg>
  );
}

/** A seeded mint mark: a small rosette unique to `name`. */
export function MintMark({
  name,
  className,
  tone = "ink",
  strokeWidth = 0.9,
}: {
  name: string;
  className?: string;
  tone?: "gold" | "ink" | "paper" | "uv";
  strokeWidth?: number;
}) {
  const paths = useMemo(() => seededBands(seedFrom(name)).map((band) => rosetteBandPaths(50, 50, band, 10)), [name]);
  const colours: Record<string, string[]> = {
    gold: ["var(--gold-light)", "var(--gold)", "var(--gold)"],
    ink: ["var(--ink)", "var(--prussian)", "var(--ink)"],
    paper: ["oklch(0.95 0.01 165)", "var(--gold-light)", "oklch(0.95 0.01 165)"],
    uv: ["var(--uv-a)", "var(--uv-b)", "var(--uv-a)"],
  };
  return (
    <svg viewBox="0 0 100 100" aria-hidden focusable="false" className={cn("block", className)} fill="none">
      {paths.map((band, b) => (
        <g key={b} stroke={colours[tone][b]} strokeWidth={strokeWidth} strokeOpacity={tone === "ink" ? 0.75 : 0.9}>
          {band.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
      ))}
    </svg>
  );
}

/**
 * An embossed seal: a milled edge, ring lettering and a mint mark in the middle. `stamp` presses it in
 * once when it first appears. Its words must also be stated in nearby text.
 */
export function Seal({
  text,
  mark = text,
  className,
  tone = "ink",
  stamp = true,
  rotate = -6,
}: {
  text: string;
  mark?: string;
  className?: string;
  tone?: "ink" | "gold" | "oxblood" | "verdigris";
  stamp?: boolean;
  rotate?: number;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.6 });
  const colour = {
    ink: "var(--ink)",
    gold: "var(--gold)",
    oxblood: "var(--oxblood)",
    verdigris: "var(--verdigris)",
  }[tone];
  const teeth = useMemo(() => {
    let d = "";
    const n = 72;
    for (let i = 0; i <= n * 2; i++) {
      const a = (i / (n * 2)) * Math.PI * 2;
      const r = i % 2 === 0 ? 58 : 55.5;
      d += `${i === 0 ? "M" : "L"}${(60 + r * Math.cos(a)).toFixed(2)} ${(60 + r * Math.sin(a)).toFixed(2)}`;
    }
    return `${d}Z`;
  }, []);
  const centre = useMemo(() => {
    const bands: RosetteBand[] = seededBands(seedFrom(mark), 52);
    return bands.map((band) => rosetteBandPaths(60, 60, band, 10));
  }, [mark]);
  const id = useMemo(() => `seal-${seedFrom(text).toString(36)}`, [text]);
  return (
    <svg
      ref={ref}
      viewBox="0 0 120 120"
      aria-hidden
      focusable="false"
      className={cn("seal block", className, stamp && !seen && "seal-wait")}
      style={
        {
          "--stamp-rotate": `${rotate}deg`,
          transform: `rotate(${rotate}deg)`,
          animation: stamp && seen ? "stamp-in 520ms var(--ease-out) both" : undefined,
          filter: "drop-shadow(0 1px 0 oklch(1 0 0 / 0.7)) drop-shadow(0 -1px 0 oklch(0.215 0.045 262 / 0.18))",
        } as CSSProperties
      }
      fill="none"
    >
      <path d={teeth} stroke={colour} strokeOpacity={0.55} strokeWidth={0.8} />
      <circle cx={60} cy={60} r={52} stroke={colour} strokeOpacity={0.7} strokeWidth={1.2} />
      <circle cx={60} cy={60} r={40} stroke={colour} strokeOpacity={0.5} strokeWidth={0.6} />
      <defs>
        <path id={id} d={circlePath(60, 60, 45.5)} />
      </defs>
      <text fill={colour} fontSize={7.4} fontWeight={600} letterSpacing={1.6} fontFamily="var(--font-sans)">
        <textPath href={`#${id}`} startOffset="0" textLength={285} lengthAdjust="spacing">
          {`${text.toUpperCase()}   ${text.toUpperCase()}   `}
        </textPath>
      </text>
      {centre.map((band, b) => (
        <g key={b} stroke={colour} strokeOpacity={0.6} strokeWidth={0.55}>
          {band.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
      ))}
    </svg>
  );
}

/** SPECIMEN overprint across a surface that shows synthetic demonstration data. */
export function SpecimenOverprint({ className, tone = "oxblood" }: { className?: string; tone?: "oxblood" | "gold" }) {
  const colour = tone === "gold" ? "oklch(0.9 0.085 92 / 0.09)" : "oklch(0.46 0.14 25 / 0.05)";
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden select-none", className)}>
      <div className="absolute top-1/2 left-1/2 flex w-[180%] -translate-x-1/2 -translate-y-1/2 -rotate-[14deg] flex-col items-center gap-10">
        {[0, 1, 2].map((row) => (
          <span
            key={row}
            className="font-display text-[4.5rem] leading-none font-semibold tracking-[0.42em] whitespace-nowrap"
            style={{ color: colour, fontVariationSettings: '"opsz" 144' }}
          >
            SPECIMEN SPECIMEN SPECIMEN
          </span>
        ))}
      </div>
    </div>
  );
}

/** Crop marks at the four corners, as on an uncut sheet of printed notes. Parent must be `relative`. */
export function CutMarks({ className, tone = "ink" }: { className?: string; tone?: "ink" | "gold" }) {
  const c = tone === "gold" ? "bg-gold/60" : "bg-ink/35";
  const corner = "pointer-events-none absolute size-3";
  return (
    <span aria-hidden className={cn("pointer-events-none absolute -inset-2", className)}>
      {[
        "top-0 left-0",
        "top-0 right-0 rotate-90",
        "right-0 bottom-0 rotate-180",
        "bottom-0 left-0 -rotate-90",
      ].map((pos) => (
        <span key={pos} className={cn(corner, pos)}>
          <span className={cn("absolute top-0 left-0 h-px w-3", c)} />
          <span className={cn("absolute top-0 left-0 h-3 w-px", c)} />
        </span>
      ))}
    </span>
  );
}

/** The engraved watermark behind the workspace: a large rosette in ink at the faintest visible strength. */
export function Watermark() {
  const paths = useMemo(
    () =>
      [
        { radius: 40, amp: 16, lobes: 10, copies: 6 },
        { radius: 120, amp: 22, lobes: 22, amp2: 8, lobes2: 5, copies: 9 },
        { radius: 220, amp: 18, lobes: 34, amp2: 9, lobes2: 7, copies: 10 },
        { radius: 290, amp: 8, lobes: 60, copies: 3 },
      ].map((band) => rosetteBandPaths(320, 320, band, 9)),
    [],
  );
  return (
    <svg
      viewBox="0 0 640 640"
      aria-hidden
      focusable="false"
      className="absolute -right-[18vmin] -bottom-[22vmin] size-[92vmin] opacity-[0.07]"
      fill="none"
      stroke="var(--ink)"
      strokeWidth={0.8}
    >
      {paths.map((band, b) => (
        <g key={b}>
          {band.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
      ))}
    </svg>
  );
}
