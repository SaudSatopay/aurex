"use client";

/*
 * Route entrance for the workspace: each page rises and sharpens into place (short, so navigation never
 * feels slower). Used by app/app/template.tsx, which remounts on every navigation. Same markup on server
 * and client; under reduced motion globals.css shows `[data-reveal]` at rest (see motion/reveal.tsx).
 */
import { motion } from "motion/react";
import type { ReactNode } from "react";

export function PageEnter({ children }: { children: ReactNode }) {
  return (
    <motion.div
      data-reveal=""
      initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
      transition={{
        y: { type: "spring", bounce: 0, visualDuration: 0.45 },
        opacity: { duration: 0.32, ease: [0.23, 1, 0.32, 1] },
        filter: { duration: 0.36, ease: [0.23, 1, 0.32, 1] },
      }}
    >
      {children}
    </motion.div>
  );
}
