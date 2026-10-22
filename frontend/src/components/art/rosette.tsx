"use client";

/*
 * An engraved rosette, the centrepiece of a banknote. Bands of woven guilloche around a centre flower,
 * with two rings of microprint that read as dotted lines until the loupe magnifies them. On first
 * appearance the lathe "cuts" each band with a rotating sweep (an SVG mask whose pie grows around the
 * centre); under reduced motion it is simply there (globals.css stops the sweep). Decorative: aria-hidden.
 */
import { useId, useMemo, type CSSProperties } from "react";

import { cn } from "@/lib/utils";

import { circlePath, rosetteBandPaths, type RosetteBand } from "./guilloche";

const VIEW = 640;
const C = VIEW / 2;

export const HERO_BANDS: RosetteBand[] = [
  { radius: 24, amp: 12, lobes: 8, copies: 6 },
  { radius: 70, amp: 15, lobes: 16, amp2: 6, lobes2: 4, copies: 9 },
  { radius: 132, amp: 20, lobes: 24, amp2: 8, lobes2: 6, copies: 12 },
  { radius: 200, amp: 13, lobes: 40, amp2: 9, lobes2: 8, copies: 10 },
  { radius: 266, amp: 21, lobes: 30, amp2: 7, lobes2: 5, copies: 14 },
  { radius: 304, amp: 5, lobes: 72, copies: 4 },
];

export const MICROPRINT_INNER = "EVERY FIGURE CARRIES ITS SOURCE AND ITS UNCERTAINTY   ";
export const MICROPRINT_OUTER = "COSTS ARE ARITHMETIC   EFFECTS NEED EVIDENCE   HIRING NEVER ADDS REVENUE BY ITSELF   ";

export type RosetteTone = "gold" | "ink" | "paper";

const TONES: Record<RosetteTone, { lines: string[]; text: string }> = {
  gold: {
    lines: [
      "var(--gold-light)",
      "var(--gold)",
      "oklch(0.86 0.06 165 / 0.75)",
      "var(--gold)",
      "var(--gold-light)",
      "var(--gold)",
    ],
    text: "var(--gold-light)",
  },
  ink: {
    lines: ["var(--ink)", "var(--prussian)", "var(--ink)", "var(--prussian)", "var(--ink)", "var(--ink)"],
    text: "var(--ink)",
  },
  paper: {
    lines: [
      "oklch(0.95 0.01 165)",
      "oklch(0.95 0.01 165)",
      "var(--gold-light)",
      "oklch(0.95 0.01 165)",
      "oklch(0.95 0.01 165)",
      "var(--gold-light)",
    ],
    text: "oklch(0.95 0.01 165)",
  },
};

export function Rosette({
  className,
  tone = "gold",
  bands = HERO_BANDS,
  strokeWidth = 0.7,
  opacity = 0.85,
  microprint = true,
  animate = true,
  delay = 0,
}: {
  className?: string;
  tone?: RosetteTone;
  bands?: RosetteBand[];
  strokeWidth?: number;
  opacity?: number;
  microprint?: boolean;
  /** Cut the bands in with the lathe sweep on mount. */
  animate?: boolean;
  /** Seconds before the first band is cut. */
  delay?: number;
}) {
  const paths = useMemo(() => bands.map((band) => rosetteBandPaths(C, C, band)), [bands]);
  const uid = useId().replace(/:/g, "");
  const sweep = (key: string, at: number) =>
    animate ? (
      <mask key={key} id={`${uid}-${key}`} maskUnits="userSpaceOnUse" x={0} y={0} width={VIEW} height={VIEW}>
        <circle
          cx={C}
          cy={C}
          r={C / 2 + 4}
          stroke="#fff"
          strokeWidth={C + 8}
          fill="none"
          pathLength={1}
          transform={`rotate(-90 ${C} ${C})`}
          className="lathe-sweep"
          style={{ "--lathe-delay": `${at}s` } as CSSProperties}
        />
      </mask>
    ) : null;
  const colours = TONES[tone];
  const innerR = (bands[1]?.radius ?? 70) + ((bands[2]?.radius ?? 132) - (bands[1]?.radius ?? 70)) / 2;
  const outerR = (bands[3]?.radius ?? 200) + ((bands[4]?.radius ?? 266) - (bands[3]?.radius ?? 200)) / 2;
  return (
    <svg
      viewBox={`0 0 ${VIEW} ${VIEW}`}
      aria-hidden
      focusable="false"
      className={cn("block size-full overflow-visible", className)}
      fill="none"
    >
      <defs>
        {paths.map((_, b) => sweep(`b${b}`, delay + b * 0.16))}
        {microprint ? sweep("m", delay + 0.5) : null}
      </defs>
      {paths.map((band, b) => (
        <g
          key={b}
          mask={animate ? `url(#${uid}-b${b})` : undefined}
          stroke={colours.lines[b % colours.lines.length]}
          strokeWidth={strokeWidth}
          strokeOpacity={opacity}
        >
          {band.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
      ))}
      {microprint ? (
        <g
          mask={animate ? `url(#${uid}-m)` : undefined}
          fill={colours.text}
          fillOpacity={0.8}
          fontFamily="var(--font-sans)"
          fontWeight={600}
          letterSpacing={0.35}
        >
          <defs>
            <path id={`${uid}-ring-inner`} d={circlePath(C, C, innerR)} />
            <path id={`${uid}-ring-outer`} d={circlePath(C, C, outerR)} />
          </defs>
          <text fontSize={3.1}>
            <textPath href={`#${uid}-ring-inner`}>{MICROPRINT_INNER.repeat(9)}</textPath>
          </text>
          <text fontSize={3.1}>
            <textPath href={`#${uid}-ring-outer`}>{MICROPRINT_OUTER.repeat(10)}</textPath>
          </text>
        </g>
      ) : null}
    </svg>
  );
}
