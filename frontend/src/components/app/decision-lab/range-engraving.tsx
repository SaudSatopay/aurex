"use client";

/*
 * The P10–P90 range of a simulated outcome, engraved. On a value axis that always includes zero (the
 * forecast baseline), the range is an envelope woven from fine guilloché lines: it opens at P10, is
 * widest at the median and closes at P90. Only the three quantiles and zero are data; the envelope's
 * height is ornament, so the axis carries no vertical scale. The median is one bold gold line. When
 * every run gives the same result there is no envelope, only that line. Each line engraves itself once
 * (stroke draw, globals.css `.engrave`); under reduced motion everything is simply there.
 */
import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";

import { isNum } from "@/lib/app/decision-lab-format";
import { cn } from "@/lib/utils";

import { rangeDomain } from "./common";

const TAU = Math.PI * 2;
const r1 = (n: number) => Math.round(n * 10) / 10;

type Label = { key: string; x: number; text: string; tone: "gold" | "muted" | "plain" };

/** Lay one row of labels out left to right around their anchors without overlapping. */
function placeRow(labels: Label[], width: number, gap = 12): (Label & { left: number; w: number })[] {
  const sorted = [...labels]
    .sort((a, b) => a.x - b.x)
    .map((l) => ({ ...l, w: Math.ceil(l.text.length * 6.7 + 4), left: 0 }));
  for (const l of sorted) l.left = Math.min(Math.max(l.x - l.w / 2, 0), Math.max(0, width - l.w));
  for (let i = 1; i < sorted.length; i++) sorted[i].left = Math.max(sorted[i].left, sorted[i - 1].left + sorted[i - 1].w + gap);
  const last = sorted.length - 1;
  if (last >= 0 && sorted[last].left + sorted[last].w > width) {
    sorted[last].left = Math.max(0, width - sorted[last].w);
    for (let i = last - 1; i >= 0; i--) sorted[i].left = Math.max(0, Math.min(sorted[i].left, sorted[i + 1].left - gap - sorted[i].w));
  }
  return sorted;
}

export function RangeEngraving({
  low,
  mid,
  high,
  format,
  label,
  surface = "plate",
  height: bandHeight = 112,
  className,
}: {
  low: number | null | undefined;
  mid: number | null | undefined;
  high: number | null | undefined;
  format: (value: number) => string;
  /** What the range measures, for the accessible description ("Net profit change"). */
  label: string;
  surface?: "plate" | "paper";
  /** Height of the engraved band, px (labels add two rows). */
  height?: number;
  className?: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => setWidth(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const usable = isNum(low) && isNum(high);
  const lo = usable ? Math.min(low, high) : 0;
  const hi = usable ? Math.max(low, high) : 0;
  const median = isNum(mid) ? mid : null;
  const deterministic = usable && Math.abs(hi - lo) <= Math.max(1, Math.abs(median ?? hi) * 1e-6);
  const plate = surface === "plate";
  // With no spread there is no envelope to draw: a short band carries the single line and the baseline.
  const height = deterministic ? Math.min(bandHeight, 40) : bandHeight;

  const geometry = useMemo(() => {
    if (!usable || width < 40) return null;
    const [min, max] = rangeDomain([lo, median, hi]);
    const inset = 6;
    const x = (v: number) => inset + ((v - min) / (max - min)) * (width - inset * 2);
    const midY = height / 2;
    const amp = height / 2 - 10;
    const xLo = x(lo);
    const xHi = x(hi);
    const xMid = median !== null ? x(median) : null;
    const xZero = x(0);
    const span = xHi - xLo;
    const paths: { d: string; kind: "outline" | "weave" | "counter" }[] = [];
    if (!deterministic && span >= 2) {
      const crest = Math.min(Math.max(xMid ?? (xLo + xHi) / 2, xLo + span * 0.2), xHi - span * 0.2);
      const envelope = (px: number) => {
        const t = px <= crest ? (px - xLo) / Math.max(crest - xLo, 1e-6) : (xHi - px) / Math.max(xHi - crest, 1e-6);
        return amp * Math.pow(Math.sin((Math.max(0, Math.min(1, t)) * Math.PI) / 2), 0.85);
      };
      const step = Math.max(0.75, span / 320);
      const xs: number[] = [];
      for (let px = xLo; px < xHi; px += step) xs.push(px);
      xs.push(xHi);
      const waves = Math.max(2, Math.round(span / 44));
      // The main weave: copies of one wave, each a fraction of a wave later, interlace into a rope.
      const weave = (copies: number, freq: number, scale: number, sign: number, kind: "weave" | "counter") => {
        for (let c = 0; c < copies; c++) {
          const phase = (c / copies) * TAU;
          let d = "";
          xs.forEach((px, i) => {
            const u = (px - xLo) / span;
            const y = midY + envelope(px) * scale * Math.sin(sign * TAU * freq * u + phase);
            d += `${i === 0 ? "M" : "L"}${r1(px)} ${r1(y)}`;
          });
          paths.push({ d, kind });
        }
      };
      weave(10, waves, 1, 1, "weave");
      // A finer counter-weave inside it turns the rope into a lattice.
      weave(6, waves * 2 + 1, 0.62, -1, "counter");
      for (const sign of [-1, 1]) {
        let d = "";
        xs.forEach((px, i) => {
          d += `${i === 0 ? "M" : "L"}${r1(px)} ${r1(midY + sign * envelope(px))}`;
        });
        paths.push({ d, kind: "outline" });
      }
    }
    const top: Label[] = [{ key: "zero", x: xZero, text: "Baseline", tone: "muted" }];
    const bottom: Label[] = [];
    if (deterministic) {
      top.push({ key: "mid", x: x(median ?? lo), text: `Every run ${format(median ?? lo)}`, tone: "gold" });
    } else {
      if (xMid !== null && median !== null) top.push({ key: "mid", x: xMid, text: `Median ${format(median)}`, tone: "gold" });
      bottom.push({ key: "p10", x: xLo, text: `P10 ${format(lo)}`, tone: "plain" }, { key: "p90", x: xHi, text: `P90 ${format(hi)}`, tone: "plain" });
    }
    return {
      paths,
      xLo,
      xHi,
      xMid: deterministic ? x(median ?? lo) : xMid,
      xZero,
      midY,
      amp,
      top: placeRow(top, width),
      bottom: placeRow(bottom, width),
    };
  }, [usable, width, lo, hi, median, deterministic, height, format]);

  if (!usable) {
    return <p className={cn("text-xs", plate ? "text-sidebar-foreground/60" : "text-muted-foreground")}>Range not available</p>;
  }

  const description = deterministic
    ? `${label}: ${format(median ?? lo)} in every simulation run`
    : `${label}: 10th percentile ${format(lo)}, median ${median !== null ? format(median) : "not available"}, 90th percentile ${format(hi)}; the baseline is zero`;
  const ink = plate
    ? { weave: "var(--gold)", outline: "var(--gold-light)", median: "var(--gold)", axis: "oklch(0.95 0.01 165 / 0.22)", zero: "oklch(0.95 0.01 165 / 0.55)" }
    : { weave: "var(--prussian)", outline: "var(--ink)", median: "var(--gold-deep)", axis: "var(--rule-strong)", zero: "var(--rule-strong)" };
  const labelTone = (tone: Label["tone"]) =>
    tone === "gold"
      ? plate
        ? "text-gold-light font-medium"
        : "text-gold-deep font-medium"
      : tone === "muted"
        ? plate
          ? "text-sidebar-foreground/55"
          : "text-muted-foreground"
        : plate
          ? "text-sidebar-foreground/85"
          : "text-foreground/85";

  return (
    <div ref={box} className={cn("relative min-w-0", className)} role="img" aria-label={description}>
      {geometry ? (
        <div aria-hidden>
          <div className="relative h-5">
            {geometry.top.map((l) => (
              <span key={l.key} className={cn("absolute top-0 text-xs whitespace-nowrap tabular-nums", labelTone(l.tone))} style={{ left: l.left }}>
                {l.text}
              </span>
            ))}
          </div>
          <svg
            key={`${lo}|${median}|${hi}`}
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            className="block overflow-visible"
            fill="none"
          >
            <line x1={0} x2={width} y1={geometry.midY} y2={geometry.midY} stroke={ink.axis} strokeWidth={1} />
            <line
              x1={geometry.xZero}
              x2={geometry.xZero}
              y1={-6}
              y2={height}
              stroke={ink.zero}
              strokeWidth={1}
              strokeDasharray="3 4"
            />
            {geometry.paths.map((p, i) => (
              <path
                key={i}
                d={p.d}
                pathLength={1}
                className="engrave"
                stroke={p.kind === "outline" ? ink.outline : ink.weave}
                strokeOpacity={p.kind === "outline" ? 0.95 : p.kind === "weave" ? (plate ? 0.6 : 0.5) : plate ? 0.38 : 0.3}
                strokeWidth={p.kind === "outline" ? 1.1 : p.kind === "weave" ? 0.65 : 0.5}
                strokeLinejoin="round"
                style={{ "--engrave-delay": `${0.15 + i * 0.045}s`, "--engrave-duration": "1.3s" } as CSSProperties}
              />
            ))}
            {!deterministic ? (
              <>
                <line x1={geometry.xLo} x2={geometry.xLo} y1={geometry.midY - 5} y2={height} stroke={ink.outline} strokeOpacity={0.7} strokeWidth={1} />
                <line x1={geometry.xHi} x2={geometry.xHi} y1={geometry.midY - 5} y2={height} stroke={ink.outline} strokeOpacity={0.7} strokeWidth={1} />
              </>
            ) : null}
            {geometry.xMid !== null ? (
              <line
                x1={geometry.xMid}
                x2={geometry.xMid}
                y1={-6}
                y2={height - 4}
                pathLength={1}
                className="engrave"
                stroke={ink.median}
                strokeWidth={3}
                strokeLinecap="round"
                style={{ "--engrave-delay": "0.05s", "--engrave-duration": "0.9s" } as CSSProperties}
              />
            ) : null}
          </svg>
          {geometry.bottom.length ? (
            <div className="relative mt-1.5 h-5">
              {geometry.bottom.map((l) => (
                <span key={l.key} className={cn("absolute top-0 text-xs whitespace-nowrap tabular-nums", labelTone(l.tone))} style={{ left: l.left }}>
                  {l.text}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      ) : (
        <div style={{ height: height + 48 }} aria-hidden />
      )}
      {deterministic ? (
        <p className={cn("mt-2 text-xs", plate ? "text-sidebar-foreground/65" : "text-muted-foreground")}>Same in every run: no uncertain parameter affects it</p>
      ) : null}
    </div>
  );
}
