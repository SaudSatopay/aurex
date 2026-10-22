import type { Metadata } from "next";
import { Fragment, type ReactNode } from "react";

import { MintMark, Seal, WaveBand } from "@/components/art/ornaments";
import { Reveal } from "@/components/motion/reveal";
import { AdvisorSample } from "@/components/marketing/advisor";
import { ClosingCta } from "@/components/marketing/closing-cta";
import { MODULE_GROUPS, MODULES, ORDERED_MODULES, type ModuleInfo } from "@/components/marketing/content";
import { DecisionLabDetail, DecisionPlate } from "@/components/marketing/decision-lab";
import { Container, PageMasthead, TextLink } from "@/components/marketing/primitives";
import { ForecastingDetail, OutcomeTrackingSample } from "@/components/marketing/product-details";
import { SectionIndex, type SectionIndexGroup } from "@/components/marketing/section-index";
import { Caption } from "@/components/marketing/surface";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Product",
  description:
    "Eleven AUREX modules on one validated data model: integrations, data pipeline, dashboards, analytics, forecasting, Decision Lab, the AI Business Advisor, company intelligence, market news, benchmarking, and reports and workflows.",
};

const INDEX_GROUPS: SectionIndexGroup[] = MODULE_GROUPS.map((group) => ({
  name: group.name,
  items: MODULES.filter((m) => m.group === group.name).map((m) => ({ id: m.id, label: m.name })),
}));

// Extra material for modules that need more than a list.
const DETAILS: Partial<Record<string, ReactNode>> = {
  "integration-hub": (
    <p className="mt-7">
      <TextLink href="/integrations">See connection methods and the provider catalogue</TextLink>
    </p>
  ),
  forecasting: <ForecastingDetail />,
  "decision-lab": (
    <div className="mt-12">
      <DecisionPlate compact />
      <DecisionLabDetail layout="stacked" className="mt-14" />
    </div>
  ),
  advisor: (
    <div className="mt-12">
      <AdvisorSample />
    </div>
  ),
  "reports-workflows": <OutcomeTrackingSample className="mt-12" />,
};

// Notes that are verdicts get a seal; its words are printed beside it as well.
const NOTE_SEALS: Partial<Record<string, string>> = {
  "integration-hub": "connected after a test",
};

function ModuleNote({ module }: { module: ModuleInfo }) {
  if (!module.note) return null;
  const seal = NOTE_SEALS[module.id];
  return (
    <Reveal className="mt-9 max-w-[72ch]">
      <div className="flex items-center gap-5 rounded-[0.75rem] bg-sheet py-4 pr-5 pl-5 shadow-[0_0_0_1px_var(--rule)] sm:gap-6 sm:pl-6">
        {seal ? (
          <div className="flex shrink-0 flex-col items-center gap-1 text-center">
            <Seal text={seal} mark={module.name} className="size-20" />
            <p className="max-w-[11ch] text-[0.6875rem] leading-snug text-muted-foreground first-letter:uppercase">{seal}</p>
          </div>
        ) : (
          <span aria-hidden className="w-0.5 self-stretch rounded-full bg-ink/40" />
        )}
        <p className="text-[0.9375rem] leading-relaxed text-ink/85">{module.note}</p>
      </div>
    </Reveal>
  );
}

function ModuleSection({ module, ruled }: { module: ModuleInfo; ruled: boolean }) {
  const titleId = `${module.id}-title`;
  return (
    <section
      id={module.id}
      aria-labelledby={titleId}
      className={cn("scroll-mt-24 py-16 sm:py-20", ruled && "border-t border-rule", !ruled && "first-of-type:pt-0")}
    >
      <Reveal>
        <div className="flex items-center gap-4 sm:gap-5">
          <MintMark name={module.name} strokeWidth={0.6} className="size-14 shrink-0 sm:size-16" />
          <div>
            <Caption>{module.group}</Caption>
            <h2 id={titleId} className="mt-1 text-display text-[2.25rem] sm:text-[3rem]">
              {module.name}
            </h2>
          </div>
        </div>
        <p className="mt-6 max-w-[64ch] text-pretty text-[1.0625rem] leading-relaxed text-muted-foreground">
          {module.lead}
        </p>
      </Reveal>
      {module.capabilities.length > 0 ? (
        <ul className="mt-9 grid max-w-4xl gap-x-10 sm:grid-cols-2">
          {module.capabilities.map((capability) => (
            <li key={capability} className="flex gap-3 border-t border-rule py-3.5 text-[0.9375rem] leading-relaxed text-ink/85">
              <span aria-hidden className="mt-[0.8em] h-px w-2.5 shrink-0 bg-ink/50" />
              {capability}
            </li>
          ))}
        </ul>
      ) : null}
      <ModuleNote module={module} />
      {DETAILS[module.id] ?? null}
    </section>
  );
}

export default function ProductPage() {
  return (
    <>
      <PageMasthead
        seed="product"
        title="Everything from the first import to the final report"
        lead="Eleven modules share one validated data model, so a figure on the dashboard, in a forecast and in the advisor's answer is the same figure."
      />

      {/* No overflow clipping here: it would break the sticky index. */}
      <div className="relative">
        <Container className="py-16 sm:py-24 lg:grid lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-14 xl:gap-20">
          <aside className="hidden lg:block">
            <div className="glass-strong sticky top-28 rounded-[0.75rem] p-4">
              <SectionIndex groups={INDEX_GROUPS} label="Modules" />
            </div>
          </aside>

          <div className="min-w-0">
            <nav aria-label="Modules" className="mb-14 lg:hidden">
              <Caption className="text-ink">Jump to a module</Caption>
              <ul className="mt-3 flex flex-wrap gap-2">
                {ORDERED_MODULES.map((module) => (
                  <li key={module.id}>
                    <a
                      href={`#${module.id}`}
                      className="press inline-flex h-9 items-center rounded-full bg-sheet px-3.5 text-sm font-medium text-ink shadow-[0_0_0_1px_var(--rule)] outline-none hover:shadow-[0_0_0_1px_var(--rule-strong)] focus-visible:ring-3 focus-visible:ring-prussian/50"
                    >
                      {module.name}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {ORDERED_MODULES.map((module, i) => {
              const groupStart = i > 0 && module.group !== ORDERED_MODULES[i - 1].group;
              return (
                <Fragment key={module.id}>
                  {groupStart ? <WaveBand tone="ink" className="h-5" waves={14} copies={5} /> : null}
                  <ModuleSection module={module} ruled={i > 0 && !groupStart} />
                </Fragment>
              );
            })}
          </div>
        </Container>
      </div>

      <ClosingCta />
    </>
  );
}
