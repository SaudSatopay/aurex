import type { Metadata } from "next";

import { CutMarks, MintMark, SpecimenOverprint } from "@/components/art/ornaments";
import { Reveal } from "@/components/motion/reveal";
import { ClosingCta } from "@/components/marketing/closing-cta";
import { PRINCIPLES } from "@/components/marketing/content";
import { Container, PageMasthead } from "@/components/marketing/primitives";
import { NOTE_ON_PAPER, NOTE_ON_PLATE, PlateBackdrop } from "@/components/marketing/surface";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "About",
  description:
    "Why AUREX exists and the principles it is built on: evidence over assumptions, no fabricated numbers, disclosed uncertainty, customer-owned data and clearly labelled synthetic demo data.",
};

/*
 * The principles are printed as a charter: one document, one article per principle, each with its own
 * mint mark. The note about NovaMart carries the SPECIMEN overprint because its data is synthetic; the
 * note about real public companies is clear glassine, without it.
 */
export default function AboutPage() {
  return (
    <>
      <PageMasthead
        seed="about"
        title="Management decisions should rest on evidence"
        lead="AUREX helps companies decide with their own authorized data, calculations that have been validated, and an honest account of what isn't known yet."
      />

      <section aria-labelledby="principles-title" className="py-24 sm:py-32">
        <Container>
          <Reveal className="grid gap-6 lg:grid-cols-12 lg:gap-8">
            <h2 id="principles-title" className="text-display text-[2.75rem] sm:text-[4rem] lg:col-span-5 lg:text-[4.5rem]">
              Principles
            </h2>
            <p className="max-w-[60ch] text-[1.0625rem] leading-relaxed text-muted-foreground lg:col-span-6 lg:col-start-7 lg:self-end">
              These are design rules, not slogans. Each one changes what the product will and won&apos;t do, and
              each one is visible somewhere you can check.
            </p>
          </Reveal>

          <div className="mt-14 sm:mt-16">
            <div className="relative">
              <CutMarks />
              <div className={cn("relative overflow-hidden rounded-[0.9rem] px-5 py-3 sm:px-10 sm:py-5 lg:px-14", NOTE_ON_PAPER)}>
                <dl>
                  {PRINCIPLES.map((principle) => (
                    <div
                      key={principle.name}
                      className="group grid gap-5 border-t border-rule py-9 first:border-t-0 sm:py-11 lg:grid-cols-12 lg:gap-10"
                    >
                      <dt className="flex items-start gap-4 sm:gap-5 lg:col-span-5">
                        <MintMark
                          name={principle.name}
                          strokeWidth={0.6}
                          className="size-12 shrink-0 transition-transform duration-700 ease-(--ease-out) group-hover:rotate-[24deg] sm:size-14"
                        />
                        <span className="text-display pt-1 text-[1.875rem] leading-[1] sm:text-[2.25rem]">
                          {principle.name}
                        </span>
                      </dt>
                      <dd className="lg:col-span-7">
                        <p className="max-w-[62ch] text-[1.0625rem] leading-relaxed text-ink/90">{principle.text}</p>
                        <p className="mt-5 max-w-[62ch] border-l-2 border-rule-strong pl-4 text-[0.9375rem] leading-relaxed text-muted-foreground">
                          <span className="font-display font-semibold text-ink">In practice: </span>
                          {principle.practice}
                        </p>
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section aria-labelledby="demo-data-title" className="relative isolate overflow-hidden py-24 text-paper sm:py-32">
        <PlateBackdrop />
        <Container className="grid gap-12 lg:grid-cols-12 lg:gap-10">
          <Reveal className="lg:col-span-5">
            <h2 id="demo-data-title" className="text-display text-[2.5rem] sm:text-[3.5rem]">
              About the data you see here
            </h2>
          </Reveal>
          <div className="grid gap-5 lg:col-span-7">
            <Reveal>
              <div className="relative">
                <CutMarks tone="gold" />
                <div className={cn("relative isolate overflow-hidden rounded-[0.9rem] p-6 sm:p-9", NOTE_ON_PLATE)}>
                  <SpecimenOverprint className="-z-10" />
                  <p className="text-[1.0625rem] leading-relaxed text-ink">
                    NovaMart, the retailer in every example on this website and in the demo, is fictional. Its stores,
                    products, staff numbers and results are synthetic, generated to behave like a real retail business.
                  </p>
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="glass-ink rounded-[0.9rem] p-6 sm:p-9">
                <p className="text-[1.0625rem] leading-relaxed text-paper/80">
                  Company Intelligence covers real public companies, such as DMart, MR D.I.Y. and Wellness Forever,
                  using figures from their public filings. A profile doesn&apos;t mean the company uses AUREX or has
                  any relationship with it.
                </p>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      <ClosingCta />
    </>
  );
}
