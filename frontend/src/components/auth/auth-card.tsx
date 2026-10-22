import type { ComponentProps, ReactNode } from "react";

import { CutMarks } from "@/components/art/ornaments";
import { Reveal } from "@/components/motion/reveal";
import { TextLink } from "@/components/marketing/primitives";
import { cn } from "@/lib/utils";

/**
 * The sign-in / sign-up surface: a paper note with a gold double rule and print cut marks, laid on the
 * engraved plate. It arrives in one critically damped motion (static under reduced motion).
 */
export function AuthCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <Reveal onMount y={28} blur={12} className={cn("mx-auto w-full max-w-[28rem]", className)}>
      <div className="relative">
        <CutMarks tone="gold" />
        <div className="relative rounded-[0.9rem] bg-sheet p-6 text-foreground shadow-[inset_0_0_0_1px_var(--rule),inset_0_0_0_7px_var(--sheet),inset_0_0_0_8px_var(--gold-rule),0_50px_100px_-40px_oklch(0.06_0.03_264/0.95)] sm:p-10">
          {children}
        </div>
      </div>
    </Reveal>
  );
}

/** Page title inside the auth card. */
export function AuthTitle({ className, ...props }: ComponentProps<"h1">) {
  return (
    <h1 className={cn("text-display text-[2.125rem] leading-[1] font-semibold sm:text-[2.5rem]", className)} {...props} />
  );
}

/** The "New to AUREX? / Already have an account?" line at the foot of the card. */
export function AuthSwitch({ children, href, label }: { children: ReactNode; href: string; label: string }) {
  return (
    <p className="mt-7 border-t border-foreground/[0.07] pt-6 text-center text-sm text-muted-foreground">
      {children} <TextLink href={href}>{label}</TextLink>
    </p>
  );
}
