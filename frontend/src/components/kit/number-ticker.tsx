"use client";

/*
 * Number Ticker — from Magic UI (https://magicui.design), MIT License, Copyright (c) Magic UI.
 * See components/kit/LICENSES.md. Ported from the ORCA adaptation: a critically damped spring counts
 * to the value the first time it is in view; the final number is printed from the first frame under
 * reduced motion and before hydration, so the figure is always readable. `format` keeps AUREX's own
 * formatting (currency, percent) on every frame.
 */
import { useInView, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useEffect, useLayoutEffect, useRef, type ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

interface NumberTickerProps extends Omit<ComponentPropsWithoutRef<"span">, "children"> {
  value: number;
  startValue?: number;
  delay?: number;
  format?: (n: number) => string;
  /** Tabular figures keep the width steady while counting; turn off for large display numbers. */
  tabular?: boolean;
}

const defaultFormat = (n: number) => Math.round(n).toLocaleString("en-IN");

export function NumberTicker({ value, startValue = 0, delay = 0, format = defaultFormat, tabular = true, className, ...props }: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const still = useReducedMotion();
  const motionValue = useMotionValue(startValue);
  const spring = useSpring(motionValue, { damping: 40, stiffness: 120, mass: 0.9 });
  const inView = useInView(ref, { once: true, margin: "0px" });
  const formatRef = useRef(format);
  useLayoutEffect(() => {
    formatRef.current = format;
  });
  const started = useRef(false);

  useEffect(() => {
    if (still || !inView) return;
    if (!started.current && ref.current) ref.current.textContent = formatRef.current(startValue);
    started.current = true;
    const timer = setTimeout(() => motionValue.set(value), delay * 1000);
    return () => clearTimeout(timer);
  }, [still, inView, value, delay, motionValue, startValue]);

  useEffect(
    () =>
      spring.on("change", (latest) => {
        if (ref.current && started.current) ref.current.textContent = formatRef.current(latest);
      }),
    [spring],
  );

  useEffect(
    () =>
      spring.on("animationComplete", () => {
        if (ref.current) ref.current.textContent = formatRef.current(value);
      }),
    [spring, value],
  );

  return (
    <span ref={ref} className={cn("inline-block", tabular && "tabular-nums", className)} {...props}>
      {format(value)}
    </span>
  );
}
