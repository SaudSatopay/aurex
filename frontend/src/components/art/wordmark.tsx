"use client";

/*
 * The AUREX wordmark struck as banknote lettering, from the brand's own letter drawings. Each letter is
 * gold foil filled with microprint (an engraved texture until the loupe makes it readable), edged in
 * light gold, with the brand's evidence point set inside the A. On load the letters are pressed in one
 * after another and a single glint of light crosses the gold. Server and client render the same markup;
 * under reduced motion everything rests in place (globals.css). Decorative: the name is in the page text.
 */
import { motion } from "motion/react";
import { useId, type CSSProperties } from "react";

import { WORDMARK_PATHS } from "@/components/brand/logo";
import { enterTransition } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

const LETTERS: { key: string; paths: string[] }[] = [
  { key: "A", paths: [WORDMARK_PATHS[0]] },
  { key: "U", paths: [WORDMARK_PATHS[1]] },
  { key: "R", paths: [WORDMARK_PATHS[2], WORDMARK_PATHS[3]] },
  { key: "E", paths: [WORDMARK_PATHS[4]] },
  { key: "X", paths: [WORDMARK_PATHS[5], WORDMARK_PATHS[6]] },
];

const MICRO_NAME = "AUREX ".repeat(64);
const MICRO_RULE = "EVERY FIGURE CARRIES ITS SOURCE AND ITS UNCERTAINTY ".repeat(8);

export function StruckWordmark({
  className,
  animate = true,
  delay = 0,
}: {
  className?: string;
  /** Press the letters in and send the glint across on mount. */
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
        <linearGradient id={`${uid}-glint`} x1={0} x2={1} y1={0} y2={0}>
          <stop offset="0" stopColor="oklch(1 0 0)" stopOpacity={0} />
          <stop offset="0.5" stopColor="oklch(1 0 0)" stopOpacity={0.6} />
          <stop offset="1" stopColor="oklch(1 0 0)" stopOpacity={0} />
        </linearGradient>
        <clipPath id={`${uid}-letters`}>
          {WORDMARK_PATHS.map((d) => (
            <path key={d} d={d} clipRule="evenodd" />
          ))}
        </clipPath>
        {LETTERS.map((letter) => (
          <clipPath key={letter.key} id={`${uid}-${letter.key}`}>
            {letter.paths.map((d) => (
              <path key={d} d={d} clipRule="evenodd" />
            ))}
          </clipPath>
        ))}
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
          {letter.paths.map((d) => (
            <path
              key={`s-${d}`}
              d={d}
              fill="none"
              stroke="var(--gold-light)"
              strokeWidth={0.13}
              strokeOpacity={0.85}
              strokeLinejoin="round"
            />
          ))}
          <g clipPath={`url(#${uid}-${letter.key})`}>
            <rect x={-1} y={-1} width={82} height={22} fill={`url(#${uid}-foil)`} />
            <rect x={-1} y={-1} width={82} height={22} fill={`url(#${uid}-micro)`} opacity={0.6} />
          </g>
          {letter.key === "A" ? <circle cx={7.5} cy={16.2} r={1.45} fill="var(--paper)" /> : null}
        </motion.g>
      ))}
      <g clipPath={`url(#${uid}-letters)`}>
        <rect
          className={animate ? "glint" : "invisible"}
          x={-30}
          y={-1}
          width={24}
          height={23}
          fill={`url(#${uid}-glint)`}
          style={{ "--glint-delay": `${delay + 1.05}s` } as CSSProperties}
        />
      </g>
    </svg>
  );
}
