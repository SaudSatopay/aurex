"use client";

import { MenuIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";

import { AurexLogo } from "@/components/brand/logo";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

import { NAV_ITEMS, SIGN_IN_HREF, SIGN_UP_HREF } from "./content";
import { CtaLink } from "./primitives";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Primary navigation for tablet and desktop widths. */
export function DesktopNav() {
  const pathname = usePathname();
  const still = useReducedMotion();
  return (
    <nav aria-label="Primary" className="hidden md:block">
      <ul className="flex items-center gap-1">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative inline-flex h-9 items-center rounded-full px-4 text-sm font-medium transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-sky-accent",
                  active ? "text-white" : "text-navy-200 hover:bg-white/[0.06] hover:text-white",
                )}
              >
                {active ? (
                  <motion.span
                    aria-hidden
                    layoutId="site-nav-active"
                    transition={still ? { duration: 0 } : { type: "spring", bounce: 0.12, visualDuration: 0.4 }}
                    className="absolute inset-0 rounded-full bg-white/[0.1] shadow-[inset_0_1px_0_oklch(1_0_0/0.18),0_0_0_1px_oklch(1_0_0/0.1)]"
                  />
                ) : null}
                <span className="relative">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Menu sheet for phones. Radix Dialog provides the focus trap, Escape to close and focus return. */
export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);

  // Close the menu when the route changes by any means (links, back/forward).
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className="inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-white ring-1 ring-white/20 transition-colors outline-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-sky-accent md:hidden"
        >
          <MenuIcon className="size-4" aria-hidden />
          Menu
        </button>
      </SheetTrigger>
      <SheetContent
        side="right"
        showCloseButton={false}
        aria-describedby={undefined}
        className="gap-0 border-white/10 bg-navy-900 p-0 text-white data-[side=right]:w-[88%] data-[side=right]:max-w-sm"
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-4">
          <SheetTitle className="text-white">
            <AurexLogo surface="dark" title="" className="h-5" />
            <span className="sr-only">AUREX menu</span>
          </SheetTitle>
          <SheetClose asChild>
            <button
              type="button"
              className="grid size-10 place-items-center rounded-lg text-navy-100 ring-1 ring-white/15 transition-colors outline-none hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-sky-accent"
            >
              <XIcon className="size-4" aria-hidden />
              <span className="sr-only">Close menu</span>
            </button>
          </SheetClose>
        </div>
        <nav aria-label="Primary" className="px-2 py-3">
          <ul>
            <li>
              <Link
                href="/"
                onClick={close}
                aria-current={pathname === "/" ? "page" : undefined}
                className={mobileLinkClass(pathname === "/")}
              >
                Home
              </Link>
            </li>
            {NAV_ITEMS.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={close}
                    aria-current={active ? "page" : undefined}
                    className={mobileLinkClass(active)}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="mt-auto grid gap-3 border-t border-white/10 p-4">
          <CtaLink href={SIGN_UP_HREF} variant="inverse" onClick={close}>
            Create an account
          </CtaLink>
          <CtaLink href={SIGN_IN_HREF} variant="inverse-outline" onClick={close}>
            Sign in
          </CtaLink>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function mobileLinkClass(active: boolean) {
  return cn(
    "flex h-12 items-center gap-3 rounded-lg px-3 text-lg font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-sky-accent",
    active ? "bg-white/8 text-white" : "text-navy-100 hover:bg-white/5 hover:text-white",
  );
}
