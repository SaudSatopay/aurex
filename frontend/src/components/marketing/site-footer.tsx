import { cacheLife } from "next/cache";
import Link from "next/link";

import { Loupe } from "@/components/art/loupe";
import { WaveBand } from "@/components/art/ornaments";
import { AurexLogo } from "@/components/brand/logo";

import { DEMO_HREF, SIGN_IN_HREF, SIGN_UP_HREF } from "./content";
import { Container } from "./primitives";
import { MicroprintLine, PlateBackdrop } from "./surface";

const FOOTER_GROUPS = [
  {
    title: "Platform",
    links: [
      { href: "/product", label: "Product" },
      { href: "/integrations", label: "Integrations" },
      { href: "/security", label: "Security" },
    ],
  },
  {
    title: "Company",
    links: [{ href: "/about", label: "About AUREX" }],
  },
  {
    title: "Get started",
    links: [
      { href: SIGN_UP_HREF, label: "Create an account" },
      { href: SIGN_IN_HREF, label: "Sign in" },
      { href: DEMO_HREF, label: "Explore the live demo" },
    ],
  },
] as const;

/** The year is computed once per cache lifetime rather than per request. */
async function CurrentYear() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}

/*
 * The last plate. A gold guilloche band engraves itself along the top edge when it comes into view; at
 * the foot, one line of true microprint (the product's rule, in letters about 4.5px high) reads as a
 * dotted rule until the loupe passes over it.
 */
export function SiteFooter() {
  return (
    <footer className="relative isolate overflow-hidden text-paper">
      <PlateBackdrop />
      {/* Capped at the band's own 1200-unit width (wider, its engraving would stop short), tapered at both ends. */}
      <div className="mx-auto max-w-[75rem] [mask-image:linear-gradient(to_right,transparent,black_7%,black_93%,transparent)]">
        <WaveBand tone="gold" className="h-6" waves={18} copies={7} />
      </div>
      <Container className="pt-14 pb-10 sm:pt-16">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <AurexLogo surface="dark" className="h-7" />
            <p className="mt-6 max-w-[40ch] text-[0.9375rem] leading-relaxed text-paper/75">
              Decision intelligence built on authorized data, validated calculations and an honest account of
              uncertainty.
            </p>
          </div>
          <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
            {FOOTER_GROUPS.map((group) => (
              <div key={group.title}>
                <h2 className="font-display text-[1.0625rem] leading-snug font-semibold tracking-[-0.01em] text-paper">
                  {group.title}
                </h2>
                <ul className="mt-4 space-y-3">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="rounded-sm text-sm text-paper/75 underline decoration-transparent underline-offset-[5px] transition-[color,text-decoration-color] duration-200 outline-none hover:text-paper hover:decoration-gold/70 focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-plate"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <Loupe className="mt-16 sm:mt-20" zoom={3.6} size={150} magnified={<MicroprintLine className="h-full" />}>
          <MicroprintLine />
        </Loupe>

        <div className="mt-6 flex flex-col gap-4 border-t border-gold/15 pt-6 text-xs leading-relaxed text-paper/70 sm:flex-row sm:items-start sm:justify-between">
          <p className="max-w-[72ch]">
            NovaMart is a fictional retailer used to demonstrate AUREX. All NovaMart figures on this website and in
            the demo are synthetic.
          </p>
          <p className="shrink-0">
            &copy; <CurrentYear /> AUREX
          </p>
        </div>
      </Container>
    </footer>
  );
}
