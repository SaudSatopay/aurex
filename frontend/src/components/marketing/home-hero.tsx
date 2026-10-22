import { WaveBand } from "@/components/art/ornaments";
import { Loupe } from "@/components/art/loupe";
import { Rosette } from "@/components/art/rosette";
import { Reveal, WordReveal } from "@/components/motion/reveal";

import { DEMO_HREF, SIGN_UP_HREF } from "./content";
import { DecisionLedger } from "./decision-ledger";
import { Container, CtaLink } from "./primitives";

/*
 * The plate. One orchestrated moment: the lathe engraves the rosette band by band while the claim is
 * struck in word by word; the actions and the Decision Lab note follow. A loupe over the rosette turns
 * its microprint into the product's two rules. Everything is complete at rest and under reduced motion.
 */
export function HomeHero() {
  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden text-paper">
      <div aria-hidden className="aurora-hero" />
      <div className="absolute top-10 -right-[38vw] size-[96vw] opacity-25 sm:top-20 sm:-right-[16vw] sm:size-[74vw] sm:opacity-70 lg:top-10 lg:-right-[5vw] lg:size-[min(58vw,860px)] lg:opacity-100">
        <Loupe
          className="size-full"
          zoom={3.2}
          size={200}
          magnified={<Rosette animate={false} />}
        >
          <Rosette delay={0.1} />
        </Loupe>
      </div>
      <Container className="pointer-events-none relative pt-36 pb-16 sm:pt-44 lg:pt-52 lg:pb-24">
        <h1
          id="hero-title"
          className="pointer-events-auto max-w-[9ch] text-display text-[3.5rem] sm:text-[6.25rem] lg:text-[8.25rem] xl:text-[9.25rem]"
        >
          <WordReveal text="Test a decision before you make it." mode="strike" delay={0.3} stagger={0.075} />
        </h1>
        <Reveal onMount delay={0.85} className="pointer-events-auto mt-9 max-w-[46ch]">
          <p className="text-pretty text-lg leading-relaxed text-paper/78 sm:text-xl">
            AUREX brings your authorized sales, finance, inventory and workforce data into one model, forecasts what
            comes next and simulates management decisions. Every result shows its source and how certain it is.
          </p>
        </Reveal>
        <Reveal onMount delay={1} className="pointer-events-auto mt-10 flex flex-col gap-3 sm:flex-row">
          <CtaLink href={DEMO_HREF} variant="inverse">
            Open the live demo
          </CtaLink>
          <CtaLink href={SIGN_UP_HREF} variant="inverse-outline">
            Create an account
          </CtaLink>
        </Reveal>
        <WaveBand className="mt-16 sm:mt-24" waves={11} copies={7} />
        <Reveal onMount delay={1.15} y={44} blur={12} className="pointer-events-auto mt-10 sm:mt-12">
          <DecisionLedger />
        </Reveal>
      </Container>
    </section>
  );
}
