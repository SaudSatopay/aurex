"use client";

/*
 * A jeweller's loupe over engraved work. On a fine pointer, a glass lens follows the cursor and shows
 * the artwork underneath at `zoom`x, rendered again at full resolution (vector, so it stays crisp), which
 * turns microprint into words. The lens arrives on a critically damped spring and leaves the same way.
 * Touch screens and reduced motion get the artwork without a lens. Decorative: aria-hidden.
 */
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Loupe({
  children,
  magnified,
  zoom = 3,
  size = 180,
  className,
}: {
  /** The artwork at normal size. */
  children: ReactNode;
  /** The same artwork for the lens (render it without entrance animation). */
  magnified: ReactNode;
  zoom?: number;
  /** Lens diameter, px. */
  size?: number;
  className?: string;
}) {
  const still = useReducedMotion();
  const box = useRef<HTMLDivElement>(null);
  const lens = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const point = useRef({ x: 0, y: 0 });
  const frame = useRef(0);
  const [fine, setFine] = useState(false);
  const [active, setActive] = useState(false);
  const [dims, setDims] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setFine(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => setDims({ w: el.offsetWidth, h: el.offsetHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const place = () => {
    frame.current = 0;
    const { x, y } = point.current;
    const r = size / 2;
    if (lens.current) lens.current.style.transform = `translate3d(${x - r}px, ${y - r}px, 0)`;
    if (inner.current) inner.current.style.transform = `translate3d(${r - x * zoom}px, ${r - y * zoom}px, 0)`;
  };

  const track = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || !box.current) return;
    const rect = box.current.getBoundingClientRect();
    point.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    if (!frame.current) frame.current = requestAnimationFrame(place);
  };

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const enabled = fine && !still;

  return (
    <div
      ref={box}
      aria-hidden
      className={cn("relative", enabled && "cursor-none", className)}
      onPointerEnter={(e) => {
        if (!enabled || e.pointerType !== "mouse") return;
        track(e);
        setActive(true);
      }}
      onPointerMove={enabled ? track : undefined}
      onPointerLeave={() => setActive(false)}
    >
      {children}
      <AnimatePresence>
        {enabled && active ? (
          <motion.div
            ref={lens}
            className="pointer-events-none absolute top-0 left-0 z-10"
            style={{ width: size, height: size }}
            onAnimationStart={place}
          >
            <motion.div
              className="relative size-full overflow-hidden rounded-full bg-plate-deep/70"
              initial={{ scale: 0.55, opacity: 0, filter: "blur(6px)" }}
              animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
              exit={{ scale: 0.55, opacity: 0, filter: "blur(6px)" }}
              transition={{
                scale: { type: "spring", bounce: 0, visualDuration: 0.32 },
                opacity: { duration: 0.18 },
                filter: { duration: 0.22 },
              }}
              style={{
                boxShadow:
                  "inset 0 0 0 1.5px oklch(0.9 0.085 92 / 0.55), inset 0 10px 24px oklch(1 0 0 / 0.16), inset 1.5px 0 0 oklch(0.72 0.2 25 / 0.35), inset -1.5px 0 0 oklch(0.72 0.15 230 / 0.35), 0 24px 50px -12px oklch(0.06 0.03 264 / 0.75)",
              }}
            >
              <div ref={inner} className="absolute top-0 left-0" style={{ width: dims.w * zoom, height: dims.h * zoom }}>
                {magnified}
              </div>
              {/* the glass: a specular crescent and a soft edge darkening */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle at 32% 26%, oklch(1 0 0 / 0.28), transparent 32%), radial-gradient(circle at 50% 50%, transparent 58%, oklch(0.06 0.03 264 / 0.38) 100%)",
                }}
              />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
