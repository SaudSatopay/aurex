"use client";

import { motion, useReducedMotion } from "motion/react";
import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/utils";

import { SERIES_COLORS } from "./palette";

export type BarListItem = {
  key: string;
  label: ReactNode;
  /** Secondary text under the label (city, code). */
  sublabel?: ReactNode;
  value: number | null;
  /** Formatted value shown at the bar end. */
  display: ReactNode;
  /** Extra figure to the right (growth, share). */
  aside?: ReactNode;
  highlight?: boolean;
};

/** A horizontal bar that grows from its base the first time it is in view (instant under reduced motion). */
export function GrowBar({ className, style, delay = 0 }: { className?: string; style?: CSSProperties; delay?: number }) {
  const still = useReducedMotion();
  return (
    <motion.div
      data-reveal=""
      className={cn("origin-left", className)}
      style={style}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={still ? { duration: 0 } : { type: "spring", bounce: 0, visualDuration: 0.8, delay }}
    />
  );
}

/** Bar fill: solid ink with a fine engraved highlight running through it (as the charts' bars). */
export function barFill(color: string) {
  return `repeating-linear-gradient(-52deg, oklch(1 0 0 / 0.22) 0 1px, transparent 1px 4px), ${color}`;
}

/**
 * Ranked horizontal bars with direct value labels (one hue: identity is the row label, magnitude
 * is the length). Missing values get no bar and say so, they are never drawn as zero.
 */
export function BarList({
  items,
  color = SERIES_COLORS[0],
  label,
  className,
  max: maxOverride,
}: {
  items: BarListItem[];
  color?: string;
  label: string;
  className?: string;
  max?: number;
}) {
  const max = maxOverride ?? Math.max(0, ...items.map((i) => (i.value !== null && Number.isFinite(i.value) ? i.value : 0)));
  return (
    <ul className={cn("space-y-3", className)} aria-label={label}>
      {items.map((item, index) => {
        const width = item.value !== null && max > 0 ? Math.max(0.5, (Math.max(item.value, 0) / max) * 100) : 0;
        return (
          <li
            key={item.key}
            className="-mx-2 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-x-3 gap-y-1 rounded-lg px-2 py-1 transition-colors duration-200 hover:bg-white/50 dark:hover:bg-white/[0.04]"
          >
            <div className="min-w-0">
              <p className={cn("truncate text-[0.8125rem]", item.highlight ? "font-semibold" : "font-medium")}>{item.label}</p>
              {item.sublabel ? <p className="truncate text-xs text-muted-foreground">{item.sublabel}</p> : null}
            </div>
            <div className="flex items-baseline gap-2 text-right">
              <span className="text-[0.8125rem] font-semibold tabular">{item.display}</span>
              {item.aside ? <span className="min-w-[3.5rem] text-xs text-muted-foreground tabular">{item.aside}</span> : null}
            </div>
            <div className="col-span-2 h-2 rounded-full bg-foreground/[0.04] dark:bg-white/[0.05]" aria-hidden>
              {width > 0 ? (
                <GrowBar
                  className="h-2 rounded-full"
                  delay={Math.min(index, 10) * 0.04}
                  style={{ width: `${width}%`, background: barFill(color), opacity: item.highlight === false ? 0.55 : 1 }}
                />
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
