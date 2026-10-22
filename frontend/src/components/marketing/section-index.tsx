"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

export type SectionIndexGroup = {
  name: string;
  items: { id: string; label: string }[];
};

/**
 * Sticky in-page index that highlights the section currently in view. Without JavaScript it is
 * still a plain list of anchor links.
 */
export function SectionIndex({ groups, label }: { groups: SectionIndexGroup[]; label: string }) {
  const [active, setActive] = useState<string | null>(null);
  const still = useReducedMotion();

  useEffect(() => {
    const ids = groups.flatMap((group) => group.items.map((item) => item.id));
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      // A section counts as current while it occupies the band just below the sticky header.
      { rootMargin: "-96px 0px -55% 0px", threshold: 0 },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [groups]);

  return (
    <nav aria-label={label}>
      <ol className="space-y-5">
        {groups.map((group) => (
          <li key={group.name}>
            <p className="font-display text-[0.9375rem] leading-snug font-semibold tracking-[-0.01em] text-ink">{group.name}</p>
            <ol className="mt-1.5 space-y-0.5 border-l border-rule">
              {group.items.map((item) => {
                const current = active === item.id;
                return (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      aria-current={current ? "location" : undefined}
                      className={cn(
                        "relative -ml-px block rounded-r-[0.4rem] py-1.5 pr-2 pl-3.5 text-sm leading-snug transition-colors duration-200 outline-none focus-visible:ring-3 focus-visible:ring-prussian/40",
                        current ? "font-medium text-ink" : "text-muted-foreground hover:text-ink",
                      )}
                    >
                      {current ? (
                        // The marker glides to the section in view (critically damped; instant under reduced motion):
                        // a struck gold rule on the index line, the one active mark.
                        <motion.span
                          aria-hidden
                          layoutId="section-index-marker"
                          transition={still ? { duration: 0 } : { type: "spring", bounce: 0, visualDuration: 0.4 }}
                          className="absolute inset-0 rounded-r-[0.4rem] bg-ink/[0.05] shadow-[inset_2px_0_0_var(--gold-deep)]"
                        />
                      ) : null}
                      <span className="relative">{item.label}</span>
                    </a>
                  </li>
                );
              })}
            </ol>
          </li>
        ))}
      </ol>
    </nav>
  );
}
