import Link from "next/link";
import type { CSSProperties } from "react";

import { CutMarks, MintMark, WaveBand } from "@/components/art/ornaments";
import { SpotlightCard } from "@/components/kit/spotlight-card";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

import { MODULE_GROUPS, MODULES, type ModuleGroup, type ModuleInfo } from "./content";
import { Container, SectionHeading } from "./primitives";
import { PlateBackdrop } from "./surface";

/*
 * The modules as an uncut sheet of printed notes: one press sheet with a security tint, crop marks in
 * the gutters, registration marks and a colour bar in the margin. Each group is a block of notes of its
 * own sizes; every module carries its own mint mark. Decision Lab, the product's centre, is the one note
 * printed on an ink plate. A UV lamp follows the pointer across each note. The engraved rule above the
 * heading is the section's one moment; the sheet itself stays still.
 */

// Where each group sits on the sheet (wide screens) and how its notes are imposed.
const BLOCKS: Record<ModuleGroup, { block: string; grid: string }> = {
  Connect: { block: "lg:col-span-5", grid: "sm:grid-cols-2 lg:grid-cols-1 lg:grid-rows-[1.25fr_1fr]" },
  Understand: { block: "lg:col-span-7", grid: "sm:grid-cols-2 lg:grid-rows-[1.25fr_1fr]" },
  "Plan and decide": { block: "lg:col-span-8", grid: "sm:grid-cols-2 lg:grid-cols-[1fr_1.55fr] lg:grid-rows-[1.3fr_1fr]" },
  "Look outward": { block: "lg:col-span-4", grid: "sm:grid-cols-2 lg:grid-cols-1 lg:grid-rows-2" },
  Act: { block: "lg:col-span-12", grid: "" },
};

// Notes that print large (name at display size, a watermark of their mint mark) and their spans.
const NOTES: Partial<Record<string, { large?: boolean; plate?: boolean; strip?: boolean; span?: string }>> = {
  "integration-hub": { large: true },
  "executive-dashboard": { large: true, span: "sm:col-span-2" },
  "decision-lab": { large: true, plate: true },
  advisor: { span: "sm:col-span-2" },
  // The one note in its group runs the width of the sheet as a strip.
  "reports-workflows": { large: true, strip: true },
};

// The security tint of the press sheet: an engraved line screen at the plate's angle.
const SHEET_TINT: CSSProperties = {
  backgroundImage:
    "repeating-linear-gradient(115deg, color-mix(in oklch, var(--ink) 4.5%, transparent) 0 1px, transparent 1px 6px)",
};

function RegistrationMark({ className }: { className?: string }) {
  return (
    <svg aria-hidden focusable="false" viewBox="0 0 20 20" className={cn("size-5", className)} fill="none" stroke="var(--ink)" strokeOpacity={0.45} strokeWidth={0.8}>
      <circle cx={10} cy={10} r={5.5} />
      <path d="M10 0v20M0 10h20" />
    </svg>
  );
}

function ColourBar({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn("flex", className)}>
      {["bg-ink", "bg-prussian", "bg-gold", "bg-verdigris", "bg-oxblood", "bg-ink/40", "bg-ink/15"].map((swatch) => (
        <span key={swatch} className={cn("size-2.5", swatch)} />
      ))}
    </span>
  );
}

function ModuleNote({ module }: { module: ModuleInfo }) {
  const plan = NOTES[module.id] ?? {};
  const { large = false, plate = false, strip = false } = plan;
  return (
    <li className={cn("relative", plan.span)}>
      <CutMarks />
      <SpotlightCard
        surface={plate ? "plate" : "paper"}
        radius={plate ? 260 : 200}
        color={plate ? "oklch(0.82 0.15 195 / 0.14)" : undefined}
        className="group/card h-full rounded-[0.75rem] transition-transform duration-300 ease-(--ease-out) hover:-translate-y-0.5"
      >
        {/* The paper's shadow deepens as it lifts: a prepared shadow fades in (opacity only). */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 shadow-[0_22px_40px_-24px_oklch(0.215_0.045_262/0.6)] transition-opacity duration-300 ease-(--ease-out) group-hover/card:opacity-100"
        />
        <Link
          href={`/product#${module.id}`}
          className={cn(
            "group/note press relative isolate flex h-full flex-col overflow-hidden rounded-[0.75rem] outline-none focus-visible:ring-3 focus-visible:ring-prussian/50",
            large ? "min-h-[13.5rem] p-6 sm:p-7" : "min-h-[11rem] p-5 sm:p-6",
            strip && "lg:min-h-0 lg:flex-row lg:items-center lg:gap-10 lg:py-9",
            plate
              ? "bg-plate text-paper shadow-[0_0_0_1px_oklch(0.9_0.085_92/0.2),0_30px_60px_-34px_oklch(0.08_0.03_264/0.9)]"
              : "bg-sheet text-ink shadow-[0_0_0_1px_var(--rule),0_1px_1px_oklch(0.215_0.045_262/0.05)]",
          )}
        >
          {plate ? <PlateBackdrop /> : null}
          {/* The inner rule of the note's printed border. */}
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-[5px] rounded-[0.5rem] border",
              plate ? "border-gold/25" : "border-rule",
            )}
          />
          {large ? (
            <MintMark
              name={module.name}
              tone={plate ? "gold" : "ink"}
              strokeWidth={0.5}
              className={cn(
                "pointer-events-none absolute -right-14 -bottom-16 size-64 transition-transform duration-[1200ms] ease-(--ease-out) group-hover/note:rotate-[18deg]",
                plate ? "opacity-30" : "opacity-[0.09]",
              )}
            />
          ) : null}
          <MintMark
            name={module.name}
            tone={plate ? "gold" : "ink"}
            strokeWidth={0.5}
            className={cn(
              "relative shrink-0 transition-transform duration-700 ease-(--ease-out) group-hover/note:rotate-[30deg]",
              large ? "size-14" : "size-11",
            )}
          />
          <span
            className={cn(
              "relative mt-auto block pt-8",
              strip && "lg:mt-0 lg:grid lg:flex-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-center lg:gap-10 lg:pt-0",
            )}
          >
            <span
              className={cn(
                "block font-display font-semibold tracking-[-0.025em]",
                large ? "text-[1.875rem] leading-[1.05] sm:text-[2.125rem]" : "text-[1.375rem] leading-[1.1]",
              )}
            >
              {module.name}
            </span>
            <span
              className={cn(
                "mt-2.5 block text-pretty leading-relaxed",
                large ? "max-w-[42ch] text-base" : "max-w-[40ch] text-[0.9375rem]",
                strip && "lg:mt-0",
                plate ? "text-paper/78" : "text-muted-foreground",
              )}
            >
              {module.summary}
            </span>
          </span>
        </Link>
      </SpotlightCard>
    </li>
  );
}

export function ModuleIndexSection() {
  return (
    <section aria-labelledby="modules-title" className="pb-24 sm:pb-32">
      <Container>
        <WaveBand tone="ink" className="mb-20 h-5 sm:mb-24" waves={22} copies={5} />
        <Reveal>
          <SectionHeading
            id="modules-title"
            title="Eleven modules on one shared data model"
            lead="A figure means the same thing on the dashboard, in a forecast, in Decision Lab and in the advisor's answer, because every module reads the same validated model."
          />
        </Reveal>

        {/* Static on purpose: on a phone the sheet is several screens tall, too tall for an entrance. */}
        <div className="mt-14 sm:mt-16">
          <div
            style={SHEET_TINT}
            className="relative rounded-[0.9rem] bg-paper px-5 pt-12 pb-14 shadow-[0_0_0_1px_var(--rule),0_1px_1px_oklch(0.215_0.045_262/0.05),0_40px_80px_-56px_oklch(0.215_0.045_262/0.6)] sm:px-10 sm:pt-14 sm:pb-16 lg:px-14"
          >
            <RegistrationMark className="absolute top-3.5 left-1/2 -translate-x-1/2" />
            <RegistrationMark className="absolute bottom-3.5 left-1/2 hidden -translate-x-1/2 sm:block" />
            <RegistrationMark className="absolute top-1/2 left-3 hidden -translate-y-1/2 sm:block" />
            <RegistrationMark className="absolute top-1/2 right-3 hidden -translate-y-1/2 sm:block" />
            <ColourBar className="absolute right-5 bottom-5 sm:right-10" />

            <div className="grid gap-x-10 gap-y-14 lg:grid-cols-12">
              {MODULE_GROUPS.map((group) => {
                const modules = MODULES.filter((m) => m.group === group.name);
                const layout = BLOCKS[group.name];
                return (
                  <div key={group.name} className={cn("flex flex-col", layout.block)}>
                    <div className="mb-6 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-rule pb-3">
                      <h3 className="font-display text-[1.375rem] leading-tight font-semibold tracking-[-0.015em]">
                        {group.name}
                      </h3>
                      <p className="text-[0.875rem] leading-snug text-muted-foreground">{group.text}</p>
                    </div>
                    <ul className={cn("grid flex-1 gap-5", layout.grid)}>
                      {modules.map((module) => (
                        <ModuleNote key={module.id} module={module} />
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
