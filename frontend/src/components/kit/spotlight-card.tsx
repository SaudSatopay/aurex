"use client";

/*
 * Spotlight Card — from React Bits (https://reactbits.dev/components/spotlight-card), MIT + Commons
 * Clause, Copyright (c) David Haz. See components/kit/LICENSES.md. Reinterpreted for AUREX as a UV
 * lamp: banknotes hide fluorescent engraving that only shows under ultraviolet light. On a fine
 * pointer, a pool of light follows the cursor and reveals a hidden fluorescent guilloche inside it
 * (a masked layer, positioned through two custom properties, no React render per move). The pattern is
 * decorative; links inside stay live. Touch screens and reduced motion see the surface as printed.
 */
import { useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

import { cn } from "@/lib/utils";

const UV_PATTERN = [
  "repeating-radial-gradient(circle at 82% 18%, color-mix(in oklch, var(--uv-a) 70%, transparent) 0 0.8px, transparent 0.8px 8px)",
  "repeating-conic-gradient(from 8deg at 82% 18%, color-mix(in oklch, var(--uv-b) 45%, transparent) 0 0.7deg, transparent 0.7deg 6deg)",
].join(", ");

export function SpotlightCard({
  children,
  className,
  color = "oklch(0.82 0.15 195 / 0.1)",
  radius = 220,
  surface = "paper",
}: {
  children: ReactNode;
  className?: string;
  /** Colour of the lamp's soft glow. */
  color?: string;
  /** Radius of the lamp, px. */
  radius?: number;
  /** The surface underneath: ink on paper multiplies, light on a plate adds. */
  surface?: "paper" | "plate";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const still = useReducedMotion();
  const [fine, setFine] = useState(false);
  const [lit, setLit] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setFine(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const move = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--spot-x", `${e.clientX - r.left}px`);
    el.style.setProperty("--spot-y", `${e.clientY - r.top}px`);
  };

  const enabled = fine && !still;
  const mask = `radial-gradient(${radius}px circle at var(--spot-x, 50%) var(--spot-y, 50%), #000 0%, transparent 72%)`;

  return (
    <div
      ref={ref}
      className={cn("relative", className)}
      {...(enabled
        ? {
            onPointerMove: move,
            onPointerEnter: (e: React.PointerEvent<HTMLDivElement>) => {
              move(e);
              setLit(true);
            },
            onPointerLeave: () => setLit(false),
          }
        : {})}
    >
      {children}
      {enabled ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1] overflow-hidden rounded-[inherit]"
          style={
            {
              opacity: lit ? 1 : 0,
              transition: "opacity 280ms var(--ease-out)",
              background: `radial-gradient(${radius}px circle at var(--spot-x, 50%) var(--spot-y, 50%), ${color}, transparent 70%), ${UV_PATTERN}`,
              WebkitMaskImage: mask,
              maskImage: mask,
              mixBlendMode: surface === "plate" ? "screen" : "multiply",
            } as CSSProperties
          }
        />
      ) : null}
    </div>
  );
}
