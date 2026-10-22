import type { Metadata } from "next";

import { Reveal } from "@/components/motion/reveal";
import { ClosingCta } from "@/components/marketing/closing-cta";
import { SECURITY_GROUPS } from "@/components/marketing/content";
import { Container, PageMasthead, SectionHeading } from "@/components/marketing/primitives";
import { RoleRegister } from "@/components/marketing/roles";
import { PlateBackdrop, SHEET } from "@/components/marketing/surface";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Security",
  description:
    "The security controls implemented in AUREX: Argon2id password hashing, HttpOnly session cookies with rotating refresh tokens, CSRF protection, server-side role-based access, organization isolation, encrypted integration credentials, signed webhooks and an audit trail.",
};

/*
 * The controls are printed as a plain schedule: one ruled sheet per group, no gold and no seals, because
 * this page describes the software and is not a certification.
 */
export default function SecurityPage() {
  return (
    <>
      <PageMasthead
        seed="security"
        title="Security controls, as built"
        lead="This page lists the controls implemented in AUREX today, in plain terms. It describes the software; it is not a certification or an audit report."
      />

      {/* No overflow clipping on this section: it would stop the group headings from sticking. */}
      <section aria-labelledby="controls-title" className="py-24 sm:py-32">
        <Container>
          <h2 id="controls-title" className="sr-only">
            Implemented controls
          </h2>
          <div className="space-y-16 sm:space-y-24">
            {SECURITY_GROUPS.map((group) => {
              const groupId = `controls-${group.name.toLowerCase().replace(/[^a-z]+/g, "-")}`;
              return (
                <div key={group.name} className="grid gap-6 lg:grid-cols-12 lg:gap-10">
                  <div className="lg:col-span-4">
                    <Reveal className="lg:sticky lg:top-28">
                      <h3 id={groupId} className="text-display text-[2rem] sm:text-[2.5rem]">
                        {group.name}
                      </h3>
                    </Reveal>
                  </div>
                  <Reveal y={20} className="lg:col-span-8">
                    <dl aria-labelledby={groupId} className={cn("overflow-hidden rounded-[0.9rem]", SHEET)}>
                      {group.controls.map((control) => (
                        <div
                          key={control.name}
                          className="grid gap-1.5 border-t border-rule px-5 py-5 first:border-t-0 hover:bg-paper/55 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:gap-8 sm:px-7 sm:py-6"
                        >
                          <dt className="font-display text-[1.125rem] leading-snug font-semibold tracking-[-0.01em] text-ink">
                            {control.name}
                          </dt>
                          <dd className="text-[0.9375rem] leading-relaxed text-muted-foreground">{control.text}</dd>
                        </div>
                      ))}
                    </dl>
                  </Reveal>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      <section aria-labelledby="roles-title" className="relative isolate overflow-hidden py-24 text-paper sm:py-32">
        <PlateBackdrop />
        <Container>
          <Reveal>
            <SectionHeading
              id="roles-title"
              surface="dark"
              title="Ten roles, enforced on the server"
              lead="Access is decided by the member's role on every request. Owners can also limit a membership to specific stores, and that scope is applied to the data itself, not just the screens."
            />
          </Reveal>
          <RoleRegister surface="dark" className="mt-14 sm:mt-16" />
        </Container>
      </section>

      <ClosingCta
        title="See role-based access for yourself."
        text="The NovaMart demo lets you sign in under different roles and see what each one can open. All of its data is synthetic."
      />
    </>
  );
}
