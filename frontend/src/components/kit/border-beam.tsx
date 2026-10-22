"use client";

/*
 * Border Beam — from Magic UI (https://magicui.design), MIT License, Copyright (c) Magic UI.
 * See components/kit/LICENSES.md. Ported from the ORCA adaptation: a conic light rotates behind a mask
 * cut to the border ring (transform only, composited, no script loop).
 * Place inside a `relative` element with a border radius. Hidden under reduced motion (globals.css, data-beam).
 */
import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";

import { cn } from "@/lib/utils";

export function BorderBeam({
  className,
  arc = 70,
  delay = 0,
  duration = 7,
  colorFrom = "oklch(0.8 0.12 225)",
  colorTo = "oklch(0.62 0.2 262)",
  reverse = false,
  borderWidth = 1.5,
}: {
  arc?: number;
  duration?: number;
  delay?: number;
  colorFrom?: string;
  colorTo?: string;
  className?: string;
  reverse?: boolean;
  borderWidth?: number;
}) {
  const ring = useRef<HTMLDivElement>(null);
  const [side, setSide] = useState(0);
  useLayoutEffect(() => {
    const el = ring.current;
    if (!el) return;
    const measure = () => setSide(Math.ceil(Math.hypot(el.offsetWidth, el.offsetHeight)));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const mask: CSSProperties = {
    borderWidth,
    borderStyle: "solid",
    borderColor: "transparent",
    maskImage: "linear-gradient(black, black), linear-gradient(black, black)",
    maskClip: "padding-box, border-box",
    maskComposite: "exclude",
    WebkitMaskImage: "linear-gradient(black, black), linear-gradient(black, black)",
    WebkitMaskClip: "padding-box, border-box",
    WebkitMaskComposite: "xor",
  };
  const stop = 360 - arc;
  return (
    <div aria-hidden data-beam="" className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
      <div ref={ring} className="absolute inset-0 rounded-[inherit]" style={mask}>
        <div
          className={cn("border-beam-spin absolute top-1/2 left-1/2", className)}
          style={{
            width: side,
            height: side,
            marginLeft: -side / 2,
            marginTop: -side / 2,
            background: `conic-gradient(from 0deg, transparent 0deg ${stop}deg, ${colorTo} ${stop + arc * 0.6}deg, ${colorFrom} 360deg)`,
            animationDuration: `${duration}s`,
            animationDelay: `${-delay}s`,
            animationDirection: reverse ? "reverse" : "normal",
          }}
        />
      </div>
    </div>
  );
}
