import { WaveBand } from "@/components/art/ornaments";
import { Loupe } from "@/components/art/loupe";
import { Rosette } from "@/components/art/rosette";
import { StruckWordmark } from "@/components/art/wordmark";
import { Reveal, WordReveal } from "@/components/motion/reveal";

import { DEMO_HREF, SIGN_UP_HREF } from "./content";
import { DecisionLedger } from "./decision-ledger";
import { Container, CtaLink } from "./primitives";

/** The face of the note: the name struck in gold across the plate, the engraved medallion behind it. */
function HeroEmblem({ still = false }: { still?: boolean }) {
  return (
    <div className="relative aspect-[1180/430] w-full">
      <div className="absolute top-1/2 left-[63%] aspect-square w-[50%] -translate-x-1/2 -translate-y-1/2 opacity-50">
        <Rosette animate={!still} delay={0.05} />
      </div>
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
        <StruckWordmark animate={!still} delay={0.25} />
      </div>
    </div>
  );
}

/*
 * The plate. The brand is the bold thing: AUREX is struck in gold across the full width while the lathe
 * engraves the medallion behind it; the claim, the actions and the Decision Lab note follow. A loupe over
 * the emblem reads the microprint inside the letters and around the medallion. Complete at rest and under
 * reduced motion.
 */
export function HomeHero() {
  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden text-paper">
      <div aria-hidden className="aurora-hero" />
      <Container className="relative pt-28 pb-16 sm:pt-32 lg:pt-36 lg:pb-24">
        <Loupe className="w-full" zoom={3} size={210} magnified={<HeroEmblem still />}>
          <HeroEmblem />
        </Loupe>
        <div className="mt-12 grid gap-8 sm:mt-16 lg:mt-24 lg:grid-cols-12 lg:items-end lg:gap-12">
          <h1 id="hero-title" className="text-display text-[2.6rem] sm:text-[3.75rem] lg:col-span-7 lg:text-[4.5rem]">
            <span className="sr-only">AUREX. </span>
            <WordReveal text="Test a decision before you make it." mode="strike" delay={0.95} stagger={0.06} />
          </h1>
          <div className="lg:col-span-5 lg:pb-2">
            <Reveal onMount delay={1.2}>
              <p className="max-w-[46ch] text-pretty text-lg leading-relaxed text-paper/78">
                AUREX brings your authorized sales, finance, inventory and workforce data into one model, forecasts
                what comes next and simulates management decisions. Every result shows its source and how certain
                it is.
              </p>
            </Reveal>
            <Reveal onMount delay={1.35} className="mt-8 flex flex-col gap-3 sm:flex-row">
              <CtaLink href={DEMO_HREF} variant="inverse">
                Open the live demo
              </CtaLink>
              <CtaLink href={SIGN_UP_HREF} variant="inverse-outline">
                Create an account
              </CtaLink>
            </Reveal>
          </div>
        </div>
        <WaveBand className="mt-16 sm:mt-20" waves={11} copies={7} />
        <Reveal onMount delay={1.5} y={44} blur={12} className="mt-10 sm:mt-12">
          <DecisionLedger />
        </Reveal>
      </Container>
    </section>
  );
}
