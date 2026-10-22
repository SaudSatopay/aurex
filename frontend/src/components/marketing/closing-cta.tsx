import { plateBands, seedFrom } from "@/components/art/guilloche";
import { CutMarks } from "@/components/art/ornaments";
import { Rosette } from "@/components/art/rosette";
import { Reveal } from "@/components/motion/reveal";

import { DEMO_HREF, SIGN_UP_HREF } from "./content";
import { Container, CtaLink } from "./primitives";

/** The last plate: one engraved note with the two ways in. */
export function ClosingCta({
  title = "Start with the demo company, or with your own data.",
  text = "The NovaMart demo opens every workspace with synthetic data. When you're ready, create an organization and connect your first source.",
}: {
  title?: string;
  text?: string;
}) {
  return (
    <section aria-labelledby="closing-cta-title" className="py-20 sm:py-28">
      <Container>
        <Reveal y={28}>
          <div className="relative">
            <CutMarks />
            <div className="relative isolate overflow-hidden rounded-[0.9rem] px-6 py-14 text-paper shadow-[inset_0_0_0_1px_oklch(0.9_0.085_92/0.18),inset_0_0_0_8px_var(--plate),inset_0_0_0_9px_oklch(0.9_0.085_92/0.22)] sm:px-14 sm:py-20">
              <div aria-hidden className="aurora-hero" />
              <div aria-hidden className="absolute top-1/2 -left-40 size-[34rem] -translate-y-1/2 opacity-70 sm:-left-24 lg:size-[40rem]">
                <Rosette bands={plateBands(seedFrom("closing"))} microprint={false} />
              </div>
              <div className="relative grid gap-10 lg:grid-cols-12 lg:items-end">
                <div className="lg:col-span-7 lg:col-start-5">
                  <h2 id="closing-cta-title" className="max-w-[16ch] text-display text-[2.6rem] sm:text-[4rem]">
                    {title}
                  </h2>
                  <p className="mt-6 max-w-[52ch] text-[1.0625rem] leading-relaxed text-paper/78">{text}</p>
                  <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                    <CtaLink href={DEMO_HREF} variant="inverse">
                      Open the live demo
                    </CtaLink>
                    <CtaLink href={SIGN_UP_HREF} variant="inverse-outline">
                      Create an account
                    </CtaLink>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
