"use client";

/*
 * Entrance motion, Apple style: an element arrives by rising a little (or being pressed in), sharpening
 * out of a blur and fading in together, on a critically damped spring (no overshoot). Each runs once,
 * when the element first enters the viewport.
 *
 * Server and client always render the same markup (the starting state). Reduced motion is handled in
 * CSS, not by rendering something else: globals.css forces every `[data-reveal]` element to its final
 * state under `prefers-reduced-motion: reduce`, and the root <noscript> does the same without
 * JavaScript. Branching on the preference while rendering would differ from the server's HTML, and
 * React does not repair attributes on hydration, so content would stay hidden.
 */
import { motion, type Transition } from "motion/react";
import { Fragment, type ComponentProps, type ReactNode } from "react";

import { cn } from "@/lib/utils";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

/** Fire as soon as the element is inside the viewport, above its bottom 12%, whatever its height. */
const VIEWPORT = { once: true, margin: "0px 0px -12% 0px" } as const;

/** Attributes a wrapper must pass through so swapping an element for a reveal never loses semantics. */
type AriaAttrs = {
  id?: string;
  role?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-live"?: "off" | "polite" | "assertive";
  "aria-busy"?: boolean;
};

export function enterTransition(delay = 0, duration = 0.75): Transition {
  return {
    y: { type: "spring", bounce: 0, visualDuration: duration, delay },
    scale: { type: "spring", bounce: 0, visualDuration: duration, delay },
    opacity: { duration: duration * 0.8, ease: EASE_OUT, delay },
    filter: { duration: duration * 0.9, ease: EASE_OUT, delay },
  };
}

type RevealProps = Omit<ComponentProps<typeof motion.div>, "initial" | "whileInView" | "animate"> & {
  delay?: number;
  /** Distance risen, px. */
  y?: number;
  blur?: number;
  /** Animate on mount instead of when scrolled into view (above-the-fold content). */
  onMount?: boolean;
};

export function Reveal({ delay = 0, y = 18, blur = 10, onMount = false, className, children, ...props }: RevealProps) {
  const hidden = { opacity: 0, y, filter: `blur(${blur}px)` };
  const shown = { opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } };
  return (
    <motion.div
      data-reveal=""
      className={className}
      initial={hidden}
      {...(onMount ? { animate: shown } : { whileInView: shown, viewport: VIEWPORT })}
      transition={enterTransition(delay)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/** Children reveal one after another (stagger in seconds). */
export function RevealGroup({
  children,
  className,
  stagger = 0.07,
  delay = 0,
  onMount = false,
  as = "div",
  ...attrs
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
  onMount?: boolean;
  as?: "div" | "ul" | "ol" | "section";
} & AriaAttrs) {
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      {...attrs}
      initial="hidden"
      {...(onMount ? { animate: "shown" } : { whileInView: "shown", viewport: VIEWPORT })}
      variants={{ hidden: {}, shown: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
    >
      {children}
    </Tag>
  );
}

export function RevealItem({
  children,
  className,
  as = "div",
  y = 16,
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li" | "article";
  y?: number;
}) {
  const Tag = motion[as];
  return (
    <Tag
      data-reveal=""
      className={className}
      variants={{
        hidden: { opacity: 0, y, filter: "blur(8px)" },
        shown: { opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" }, transition: enterTransition(0, 0.7) },
      }}
    >
      {children}
    </Tag>
  );
}

/** A headline whose words arrive one after another. The text stays one readable string. */
export function WordReveal({
  text,
  className,
  wordClassName,
  delay = 0.1,
  stagger = 0.06,
  highlight,
  highlightClassName,
  mode = "rise",
}: {
  text: string;
  className?: string;
  wordClassName?: string;
  delay?: number;
  stagger?: number;
  /** Words (exact match) that get `highlightClassName`. */
  highlight?: string[];
  highlightClassName?: string;
  /** "rise": words rise into place; "strike": words are pressed in from slightly large, like a coin. */
  mode?: "rise" | "strike";
}) {
  const words = text.split(" ");
  return (
    <span className={cn("block", className)}>
      <span className="sr-only">{text}</span>
      {words.map((word, i) => {
        const marked = highlight?.includes(word.replace(/[.,]/g, ""));
        return (
          <Fragment key={`${word}-${i}`}>
            <span aria-hidden className="inline-block overflow-visible">
              <motion.span
                data-reveal=""
                className={cn("inline-block", wordClassName, marked && highlightClassName)}
                initial={
                  mode === "strike"
                    ? { opacity: 0, scale: 1.12, filter: "blur(14px)" }
                    : { opacity: 0, y: "0.45em", filter: "blur(12px)" }
                }
                style={mode === "strike" ? { transformOrigin: "50% 80%" } : undefined}
                animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
                transition={enterTransition(delay + i * stagger, 0.9)}
              >
                {word}
              </motion.span>
            </span>
            {i < words.length - 1 ? " " : null}
          </Fragment>
        );
      })}
    </span>
  );
}
