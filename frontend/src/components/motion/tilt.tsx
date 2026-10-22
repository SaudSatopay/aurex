"use client";

/*
 * Pointer-aware depth. The surface leans toward the pointer on two independent springs (X and Y,
 * critically damped, so it never wobbles) and settles back flat when the pointer leaves. A soft light
 * follows the pointer across the surface. Fine pointers only; touch screens and reduced motion get a
 * flat surface.
 */
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

const SPRING = { stiffness: 170, damping: 26, mass: 0.6 };

export function Tilt({
  children,
  className,
  max = 6,
  glare = true,
}: {
  children: ReactNode;
  className?: string;
  /** Maximum lean, degrees. */
  max?: number;
  glare?: boolean;
}) {
  const still = useReducedMotion();
  const [fine, setFine] = useState(false);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const gx = useMotionValue(50);
  const gy = useMotionValue(50);
  const rotateX = useSpring(rx, SPRING);
  const rotateY = useSpring(ry, SPRING);
  const light = useMotionTemplate`radial-gradient(600px circle at ${gx}% ${gy}%, oklch(1 0 0 / 0.12), transparent 45%)`;

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setFine(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  if (still || !fine) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={cn("relative [transform-style:preserve-3d]", className)}
      style={{ rotateX, rotateY, transformPerspective: 1400 }}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        ry.set((px - 0.5) * 2 * max);
        rx.set(-(py - 0.5) * 2 * max);
        gx.set(px * 100);
        gy.set(py * 100);
      }}
      onPointerLeave={() => {
        rx.set(0);
        ry.set(0);
      }}
    >
      {children}
      {glare ? (
        <motion.div aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit]" style={{ background: light }} />
      ) : null}
    </motion.div>
  );
}
