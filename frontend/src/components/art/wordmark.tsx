"use client";

/*
 * The AUREX wordmark struck as banknote lettering, from the brand's own letter drawings. Each letter is
 * gold foil filled with microprint (an engraved texture until the loupe makes it readable), edged in
 * light gold, with the brand's evidence point set inside the A. On load the letters are pressed in one
 * after another. `WordmarkGlow` breathes a soft gold halo behind the letters and `WordmarkLight` sends a
 * wave of light across the foil, continuously; both are masked HTML layers animated on the compositor
 * (opacity and transform only), so the engraved SVG is painted once. Server and client render the same
 * markup; under reduced motion everything rests (globals.css). Decorative: the name is in the page text.
 */
import { motion } from "motion/react";
import { useId, type CSSProperties } from "react";

import { WORDMARK_PATHS } from "@/components/brand/logo";
import { enterTransition } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

// One closed outline per letter, from the brand's letter drawings (components/brand/logo). The logo draws
// R's leg and X's two strokes as overlapping shapes, which is invisible at logo size; here they are drawn
// as single outlines: the leg leaves the bowl where the bowl's curve meets the leg's outer edge (43.735,
// 11.13) and rejoins the bowl's lower bar (40.565, 11.4); the X is the outline of its two crossing strokes.
const LETTERS: { key: string; d: string }[] = [
  { key: "A", d: WORDMARK_PATHS[0] },
  { key: "U", d: WORDMARK_PATHS[1] },
  {
    key: "R",
    d: "M34.4 0 H42 A5.7 5.7 0 0 1 43.735 11.13 L48 20 H44.7 L40.565 11.4 H37.4 V20 H34.4 Z M37.4 3 V8.4 H42 A2.7 2.7 0 0 0 42 3 Z",
  },
  { key: "E", d: WORDMARK_PATHS[4] },
  {
    key: "X",
    d: "M64.6 0 H68.04 L71.9 6.918 L75.76 0 H79.2 L73.62 10 L79.2 20 H75.76 L71.9 13.082 L68.04 20 H64.6 L70.18 10 Z",
  },
];

/** The letters as a CSS mask (the evidence point is cut out of the A), for the glow and the light. */
const WORDMARK_MASK = (() => {
  const point = "M6.05 16.2 a1.45 1.45 0 1 0 2.9 0 a1.45 1.45 0 1 0 -2.9 0 Z";
  const paths = LETTERS.map((l) => `<path fill-rule='evenodd' d='${l.key === "A" ? `${l.d} ${point}` : l.d}'/>`).join("");
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='-0.6 -0.6 80.4 21.2'>${paths}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
})();

const MASKED: CSSProperties = {
  WebkitMaskImage: WORDMARK_MASK,
  maskImage: WORDMARK_MASK,
  WebkitMaskSize: "100% 100%",
  maskSize: "100% 100%",
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
};

/** A soft gold halo that breathes behind the letters (place it under the wordmark, same box). */
export function WordmarkGlow({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("wordmark-glow pointer-events-none absolute inset-0", className)}>
      <div className="absolute inset-0 bg-gold" style={MASKED} />
    </div>
  );
}

/** A wave of light that flows across the gold, on a loop (place it over the wordmark, same box). */
export function WordmarkLight({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} style={MASKED}>
      <div className="wordmark-light absolute inset-y-0 -left-full w-[300%]" />
    </div>
  );
}

// Long enough to run past the right edge of the 80-unit tile on every row.
const MICRO_NAME = "AUREX ".repeat(120);
const MICRO_RULE = "EVERY FIGURE CARRIES ITS SOURCE AND ITS UNCERTAINTY ".repeat(16);

export function StruckWordmark({
  className,
  animate = true,
  delay = 0,
}: {
  className?: string;
  /** Press the letters in on mount. */
  animate?: boolean;
  /** Seconds before the first letter is struck. */
  delay?: number;
}) {
  const uid = useId().replace(/:/g, "");
  const micro = (y: number, x: number, text: string) => (
    <text
      x={x}
      y={y}
      fontSize={0.235}
      fontWeight={600}
      letterSpacing={0.03}
      fontFamily="var(--font-sans)"
      fill="var(--gold-deep)"
    >
      {text}
    </text>
  );
  return (
    <svg viewBox="-0.6 -0.6 80.4 21.2" aria-hidden focusable="false" className={cn("block w-full overflow-visible", className)}>
      <defs>
        <linearGradient id={`${uid}-foil`} gradientUnits="userSpaceOnUse" x1={0} y1={0} x2={80} y2={20}>
          <stop offset="0" stopColor="var(--gold-deep)" />
          <stop offset="0.17" stopColor="var(--gold-light)" />
          <stop offset="0.33" stopColor="var(--gold)" />
          <stop offset="0.5" stopColor="var(--gold-deep)" />
          <stop offset="0.68" stopColor="var(--gold-light)" />
          <stop offset="0.84" stopColor="var(--gold)" />
          <stop offset="1" stopColor="var(--gold-deep)" />
        </linearGradient>
        <pattern id={`${uid}-micro`} patternUnits="userSpaceOnUse" width={80} height={0.64}>
          {micro(0.27, 0, MICRO_NAME)}
          {micro(0.59, -1.4, MICRO_RULE)}
        </pattern>
      </defs>
      {LETTERS.map((letter, i) => (
        <motion.g
          key={letter.key}
          data-reveal=""
          style={{ transformBox: "fill-box", transformOrigin: "50% 78%" }}
          initial={animate ? { opacity: 0, scale: 1.16, filter: "blur(10px)" } : false}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
          transition={enterTransition(delay + i * 0.09, 0.85)}
        >
          <path d={letter.d} fill={`url(#${uid}-foil)`} fillRule="evenodd" />
          <path d={letter.d} fill={`url(#${uid}-micro)`} fillRule="evenodd" opacity={0.6} />
          <path
            d={letter.d}
            fill="none"
            stroke="var(--gold-light)"
            strokeWidth={0.06}
            strokeOpacity={0.9}
            strokeLinejoin="round"
          />
          {letter.key === "A" ? <circle cx={7.5} cy={16.2} r={1.45} fill="var(--paper)" /> : null}
        </motion.g>
      ))}
    </svg>
  );
}
