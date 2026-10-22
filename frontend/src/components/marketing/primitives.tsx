import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import { Rosette } from "@/components/art/rosette";
import { plateBands, seedFrom } from "@/components/art/guilloche";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

/** Page-width container: 1240px max, 16px gutters on phones. */
export function Container({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-[77.5rem] px-4 sm:px-6 lg:px-8", className)} {...props} />;
}

type CtaVariant = "primary" | "secondary" | "inverse" | "inverse-outline";

// Pills, Apple style: they answer on press (scale) and catch light on hover (sheen, glow).
const CTA_BASE =
  "press inline-flex items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap outline-none select-none focus-visible:ring-3 duration-200";

const CTA_VARIANTS: Record<CtaVariant, string> = {
  // Ink on paper, with a gold hairline that brightens on hover.
  primary:
    "sheen bg-ink text-paper shadow-[inset_0_1px_0_oklch(1_0_0/0.14),0_0_0_1px_var(--gold-rule)] hover:shadow-[inset_0_1px_0_oklch(1_0_0/0.14),0_0_0_1px_var(--gold),0_14px_30px_-16px_var(--ink)] focus-visible:ring-prussian/50",
  secondary: "glass text-foreground hover:shadow-[0_0_0_1px_var(--rule-strong)] focus-visible:ring-prussian/50",
  // Struck gold on a plate.
  inverse:
    "sheen bg-[linear-gradient(105deg,var(--gold-deep),var(--gold-light)_32%,var(--gold)_58%,var(--gold-light)_86%)] text-plate-deep shadow-[inset_0_1px_0_oklch(1_0_0/0.55),inset_0_-1px_0_oklch(0.4_0.08_75/0.5),0_12px_30px_-14px_oklch(0.77_0.12_85/0.7)] hover:shadow-[inset_0_1px_0_oklch(1_0_0/0.55),inset_0_-1px_0_oklch(0.4_0.08_75/0.5),0_18px_40px_-14px_oklch(0.77_0.12_85/0.85)] focus-visible:ring-gold/70",
  "inverse-outline": "glass-ink text-paper hover:bg-gold/10 focus-visible:ring-gold/70",
};

const CTA_SIZES = {
  default: "h-12 px-6 text-[0.9375rem]",
  sm: "h-9 px-4 text-sm",
} as const;

export function ctaClasses(variant: CtaVariant = "primary", size: keyof typeof CTA_SIZES = "default") {
  return cn(CTA_BASE, CTA_VARIANTS[variant], CTA_SIZES[size]);
}

/** A link styled as a call to action. Internal routes use next/link. */
export function CtaLink({
  variant = "primary",
  size = "default",
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: CtaVariant; size?: keyof typeof CTA_SIZES }) {
  return <Link className={cn(ctaClasses(variant, size), className)} {...props} />;
}

/** Inline text link with a visible focus style on light surfaces. */
export function TextLink({ className, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link
      className={cn(
        "font-medium text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:decoration-primary focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        className,
      )}
      {...props}
    />
  );
}

export function SectionHeading({
  id,
  title,
  lead,
  className,
  surface = "light",
}: {
  id: string;
  title: ReactNode;
  lead?: ReactNode;
  className?: string;
  surface?: "light" | "dark";
}) {
  return (
    <div className={cn("grid gap-5 lg:grid-cols-12 lg:gap-8", className)}>
      <h2
        id={id}
        className="text-display text-[2.5rem] sm:text-[3.5rem] lg:col-span-7 lg:text-[4.25rem]"
      >
        {title}
      </h2>
      {lead ? (
        <p
          className={cn(
            "max-w-[60ch] text-pretty text-[1.0625rem] leading-relaxed lg:col-span-5 lg:self-end",
            surface === "dark" ? "text-paper/75" : "text-muted-foreground",
          )}
        >
          {lead}
        </p>
      ) : null}
    </div>
  );
}

/** Navy introduction band used at the top of inner marketing pages. */
export function PageMasthead({
  title,
  lead,
  children,
  seed = "aurex",
}: {
  title: ReactNode;
  lead: ReactNode;
  children?: ReactNode;
  /** Chooses this page's engraved rosette (each page gets its own). */
  seed?: string;
}) {
  return (
    <div className="relative isolate overflow-hidden text-white">
      <div aria-hidden className="aurora-hero" />
      <div aria-hidden className="absolute top-16 -right-[34vw] size-[90vw] opacity-40 sm:-right-[18vw] sm:size-[62vw] sm:opacity-60 lg:top-6 lg:-right-[8vw] lg:size-[min(46vw,640px)] lg:opacity-90">
        <Rosette bands={plateBands(seedFrom(seed))} microprint={false} delay={0.05} />
      </div>
      <Container className="relative pt-36 pb-20 sm:pt-40 sm:pb-24 lg:pt-48 lg:pb-28">
        <Reveal onMount>
          <h1 className="max-w-[14ch] text-display text-[3rem] sm:text-[4.5rem] lg:text-[5.75rem]">{title}</h1>
        </Reveal>
        <Reveal onMount delay={0.15}>
          <p className="mt-7 max-w-[56ch] text-pretty text-lg leading-relaxed text-paper/78 sm:text-xl">{lead}</p>
        </Reveal>
        {children ? <Reveal onMount delay={0.28}>{children}</Reveal> : null}
      </Container>
    </div>
  );
}
