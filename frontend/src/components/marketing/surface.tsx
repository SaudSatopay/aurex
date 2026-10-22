import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

// The rosette's own microprint (components/art/rosette.tsx), restated here: constants can't be read from a
// client module on the server.
const MICROPRINT = "EVERY FIGURE CARRIES ITS SOURCE AND ITS UNCERTAINTY   ";

/*
 * Print materials for the public site below the hero (see "AUREX art direction" in globals.css).
 * Paper sheets carry content, ink plates carry brand moments, gold marks only what is minted. These
 * helpers keep the recurring pieces identical everywhere: the plate, the gold double rule that frames a
 * plate panel, the printed note, sentence-case captions and a line of true microprint. Everything
 * decorative is aria-hidden; the words it stands for are always present as text.
 */

/** The ink plate: deep navy, an engraved line tint, a pool of light. Parent: `relative isolate overflow-hidden`. */
export function PlateBackdrop() {
  return <div aria-hidden className="aurora-hero" />;
}

/**
 * A gold double rule inside a plate panel. Drawn as its own layer so the plate's engraving never covers
 * it. Parent: `relative` with `rounded-[0.9rem]`.
 */
export function PlateFrame({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn("pointer-events-none absolute inset-0 rounded-[inherit]", className)}>
      <span className="absolute inset-0 rounded-[inherit] border border-gold/20" />
      <span className="absolute inset-2 rounded-[0.4rem] border border-gold/25" />
    </span>
  );
}

/** A printed note laid on paper: sheet, hairline edge, gold double rule, a low paper shadow. */
export const NOTE_ON_PAPER =
  "bg-sheet text-ink shadow-[inset_0_0_0_1px_var(--rule),inset_0_0_0_7px_var(--sheet),inset_0_0_0_8px_var(--gold-rule),0_1px_1px_oklch(0.215_0.045_262/0.05),0_30px_60px_-38px_oklch(0.215_0.045_262/0.55)]";

/** A printed note laid on an ink plate: the same note with the deep plate shadow. */
export const NOTE_ON_PLATE =
  "bg-sheet text-ink shadow-[inset_0_0_0_1px_var(--rule),inset_0_0_0_7px_var(--sheet),inset_0_0_0_8px_var(--gold-rule),0_50px_100px_-40px_oklch(0.06_0.03_264/0.95)]";

/** A plain printed sheet (no gold): working documents that are not a verdict or a specimen. */
export const SHEET =
  "bg-sheet text-ink shadow-[0_0_0_1px_var(--rule),0_1px_1px_oklch(0.215_0.045_262/0.05),0_24px_48px_-34px_oklch(0.215_0.045_262/0.5)]";

/** A sentence-case serif caption: names a group or a part. Never tracked capitals. */
export function Caption({
  children,
  className,
  surface = "light",
  as: Tag = "p",
}: {
  children: ReactNode;
  className?: string;
  surface?: "light" | "dark";
  as?: "p" | "span";
}) {
  return (
    <Tag
      className={cn(
        "font-display text-[1.0625rem] leading-snug font-medium tracking-[-0.01em]",
        surface === "dark" ? "text-paper/75" : "text-muted-foreground",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

/**
 * One line of true microprint: real words at about 4.5px, which read as a dotted rule until magnified.
 * Drawn in SVG with a fixed text size (the line is cropped, never squeezed), so a magnified copy in a
 * larger box lines up exactly with the original.
 */
export function MicroprintLine({
  text = MICROPRINT,
  className,
  tone = "gold",
}: {
  text?: string;
  className?: string;
  tone?: "gold" | "ink";
}) {
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox="0 0 1600 12"
      preserveAspectRatio="xMinYMid slice"
      className={cn("block h-3 w-full", className)}
    >
      <text
        x={0}
        y={8.2}
        fontSize={4.6}
        fontWeight={600}
        letterSpacing={0.55}
        fontFamily="var(--font-sans)"
        fill={tone === "gold" ? "var(--gold-light)" : "var(--ink)"}
        fillOpacity={tone === "gold" ? 0.62 : 0.5}
      >
        {text.repeat(14)}
      </text>
    </svg>
  );
}
