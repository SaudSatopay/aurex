"use client";

import { useQuery } from "@tanstack/react-query";
import { LoaderCircleIcon } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { MintMark } from "@/components/art/ornaments";
import { SpotlightCard } from "@/components/kit/spotlight-card";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { authApi, type DemoRole } from "@/lib/api";
import { cn } from "@/lib/utils";

import { authErrorMessage } from "./errors";
import { useAuthNavigation } from "./redirect";

// A role tile on navy glass: rises and brightens under a fine pointer, gives under press.
const INK_TILE =
  "glass-ink transition-[translate,scale,background-color,opacity] duration-300 ease-(--ease-out) hover:-translate-y-[3px] hover:bg-white/[0.09] active:scale-[0.98]";

/**
 * "Explore the live demo": one-click sign-in to NovaMart, the synthetic demo company. Hidden
 * entirely when demo mode is disabled or the roles can't be loaded.
 */
export function DemoPanel() {
  const navigateAfterAuth = useAuthNavigation();
  const [pendingRole, setPendingRole] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const panelRef = useRef<HTMLElement>(null);

  const query = useQuery({
    queryKey: ["auth", "demo-roles"],
    queryFn: () => authApi.demoRoles(),
    retry: false,
    staleTime: 5 * 60_000,
  });

  const roles: DemoRole[] = query.data?.enabled ? query.data.roles : [];
  const visible = roles.length > 0;
  const organization = query.data?.organization || "NovaMart";

  // Links to /sign-in#demo arrive before this panel exists; scroll to it once it renders.
  useEffect(() => {
    if (visible && window.location.hash === "#demo") {
      panelRef.current?.scrollIntoView({ block: "start" });
    }
  }, [visible]);

  // Reset the in-flight state when the page is hidden after navigating into the app.
  useLayoutEffect(() => {
    return () => setPendingRole(null);
  }, []);

  if (!visible) return null;

  async function signInAs(role: string) {
    if (pendingRole) return;
    setError(null);
    setPendingRole(role);
    try {
      const session = await authApi.demoLogin(role);
      navigateAfterAuth(session);
    } catch (err) {
      setPendingRole(null);
      setError(authErrorMessage(err));
    }
  }

  return (
    <section id="demo" ref={panelRef} aria-labelledby="demo-title" className="mt-14 scroll-mt-24 sm:mt-16">
      <Reveal className="mx-auto max-w-[36rem] text-center">
        <h2 id="demo-title" className="text-display text-[2.25rem] sm:text-[3rem]">
          Explore the live demo
        </h2>
        <p className="mt-4 text-[0.9375rem] leading-relaxed text-paper/75">
          Sign in as any role at {organization}, a fictional retailer. Every figure in the demo is synthetic, so
          you can explore freely.
        </p>
      </Reveal>

      {error ? (
        <p
          role="alert"
          className="glass-ink mx-auto mt-6 max-w-[36rem] rounded-xl px-4 py-3 text-sm leading-relaxed text-paper"
        >
          {error}
        </p>
      ) : null}

      <RevealGroup stagger={0.05} delay={0.05} className="mt-8">
        <ul className="grid gap-3 sm:grid-cols-2" aria-busy={pendingRole ? true : undefined}>
          {roles.map((role) => {
            const isPending = pendingRole === role.role;
            return (
              <RevealItem as="li" key={role.role} y={14} className="sm:[&:last-child:nth-child(odd)]:col-span-2">
                <SpotlightCard surface="plate" className="h-full rounded-2xl" radius={180}>
                <button
                  type="button"
                  onClick={() => void signInAs(role.role)}
                  disabled={pendingRole !== null}
                  className={cn(
                    "group flex h-full w-full items-start gap-4 rounded-2xl px-5 py-4 text-left outline-none",
                    INK_TILE,
                    "focus-visible:ring-2 focus-visible:ring-gold",
                    "disabled:cursor-wait disabled:hover:translate-y-0",
                    isPending && "bg-white/[0.1]",
                    pendingRole !== null && !isPending && "opacity-50",
                  )}
                >
                  <MintMark
                    name={role.role}
                    tone="gold"
                    className="size-11 shrink-0 opacity-80 transition-transform duration-700 ease-(--ease-out) group-hover:rotate-[36deg] motion-reduce:transition-none"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-[1.125rem] leading-tight font-semibold text-paper">{role.label}</span>
                    {role.description ? (
                      <span className="mt-1 block text-sm leading-relaxed text-paper/70">{role.description}</span>
                    ) : null}
                  </span>
                  <span className="mt-0.5 shrink-0 text-sm font-medium text-gold">
                    {isPending ? (
                      <span className="inline-flex items-center gap-1.5">
                        <LoaderCircleIcon className="size-4 animate-spin" aria-hidden />
                        Opening
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 opacity-0 transition-[opacity,translate] duration-300 ease-(--ease-out) group-hover:translate-x-0.5 group-hover:opacity-100 group-focus-visible:opacity-100">
                        Sign in
                      </span>
                    )}
                  </span>
                </button>
                </SpotlightCard>
              </RevealItem>
            );
          })}
        </ul>
      </RevealGroup>
    </section>
  );
}
