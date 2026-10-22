import Link from "next/link";
import type { ReactNode } from "react";

import { Rosette } from "@/components/art/rosette";
import { AurexLogo } from "@/components/brand/logo";
import { Container } from "@/components/marketing/primitives";
import { SkipLink } from "@/components/marketing/site-header";

/*
 * Sign-in and sign-up are printed on the same ink plate as the hero: the rosette is engraved behind
 * the form, and the form itself is a paper note that is struck into place (see AuthCard).
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative isolate flex flex-1 flex-col overflow-hidden bg-plate text-paper">
      <div aria-hidden className="aurora-hero" />
      <div aria-hidden className="absolute top-10 left-1/2 size-[64rem] -translate-x-1/2 opacity-35 sm:top-0 lg:size-[78rem]">
        <Rosette delay={0} />
      </div>
      <SkipLink />
      <header className="border-b border-gold-rule/60 bg-plate/55 backdrop-blur-2xl backdrop-saturate-150">
        <Container className="flex h-16 items-center justify-between gap-4">
          <Link
            href="/"
            aria-label="AUREX home"
            className="-m-1.5 rounded-md p-1.5 outline-none focus-visible:ring-2 focus-visible:ring-sky-accent"
          >
            <AurexLogo surface="dark" title="" className="h-[1.375rem]" />
          </Link>
          <Link
            href="/security"
            className="press inline-flex h-9 items-center rounded-full px-4 text-sm font-medium text-paper/75 outline-none hover:bg-gold/10 hover:text-paper focus-visible:ring-2 focus-visible:ring-gold"
          >
            How we protect accounts
          </Link>
        </Container>
      </header>
      <main id="main" tabIndex={-1} className="relative flex-1 px-4 py-12 outline-none sm:py-20">
        <div className="mx-auto w-full max-w-[46rem]">{children}</div>
      </main>
      <footer className="relative px-4 pb-10 text-center text-xs leading-relaxed text-paper/70">
        NovaMart is a fictional retailer used to demonstrate AUREX. All of its data is synthetic.
      </footer>
    </div>
  );
}
