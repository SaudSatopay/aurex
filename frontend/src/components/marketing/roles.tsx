import { CutMarks, MintMark, WaveBand } from "@/components/art/ornaments";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

import { ROLES } from "./content";
import { Container, SectionHeading } from "./primitives";
import { NOTE_ON_PAPER, NOTE_ON_PLATE } from "./surface";

/**
 * The ten roles as the signatories of one printed document: each role has its own signature line, its
 * seal (a mint mark seeded by the role's name) pressed at the start of the line, its name set on the
 * line and what it can see printed beneath. `surface` says what the document is laid on: paper, or an
 * ink plate.
 */
export function RoleRegister({ className, surface = "light" }: { className?: string; surface?: "light" | "dark" }) {
  const dark = surface === "dark";
  return (
    <div className={className}>
      <div className="relative">
        <CutMarks tone={dark ? "gold" : "ink"} />
        <div
          className={cn(
            "relative overflow-hidden rounded-[0.9rem] px-5 pt-8 pb-9 sm:px-10 sm:pt-10 sm:pb-11 lg:px-14",
            dark ? NOTE_ON_PLATE : NOTE_ON_PAPER,
          )}
        >
          <WaveBand tone="ink" className="h-5" waves={22} copies={5} />
          <dl className="mt-10 grid gap-x-16 gap-y-11 md:grid-cols-2 lg:mt-12">
            {ROLES.map((role) => (
              <div key={role.label} className="group pl-[4.25rem] sm:pl-[4.75rem]">
                <dt className="relative border-b border-rule-strong pb-2 font-display text-[1.375rem] leading-tight font-semibold tracking-[-0.02em] text-ink sm:text-[1.5rem]">
                  {/* The seal pressed at the start of the signature line. */}
                  <MintMark
                    name={role.label}
                    strokeWidth={0.45}
                    className="absolute bottom-0 -left-[4.25rem] size-[3.25rem] translate-y-1/2 drop-shadow-[0_1px_0_oklch(1_0_0/0.8)] transition-transform duration-700 ease-(--ease-out) group-hover:rotate-[24deg] sm:-left-[4.75rem] sm:size-[3.75rem]"
                  />
                  {role.label}
                </dt>
                <dd className="max-w-[46ch] pt-2.5 text-[0.9375rem] leading-relaxed text-muted-foreground">
                  {role.description}
                </dd>
              </div>
            ))}
          </dl>
          <WaveBand tone="ink" className="mt-11 h-5 lg:mt-12" waves={22} copies={5} />
        </div>
      </div>
    </div>
  );
}

export function RolesSection() {
  return (
    <section aria-labelledby="roles-title" className="py-24 sm:py-32">
      <Container>
        <Reveal>
          <SectionHeading
            id="roles-title"
            title="A workspace for each role"
            lead="Ten roles, enforced on the server. Each person lands in the workspace for their job, and store managers and employees can be limited to the stores they're assigned."
          />
        </Reveal>
        <RoleRegister className="mt-14 sm:mt-16" />
      </Container>
    </section>
  );
}
