import {
  BracesIcon,
  DatabaseIcon,
  FileOutputIcon,
  FileSpreadsheetIcon,
  KeyRoundIcon,
  WebhookIcon,
  type LucideIcon,
} from "lucide-react";
import type { Metadata } from "next";

import { CutMarks, Seal, WaveBand } from "@/components/art/ornaments";
import { Reveal } from "@/components/motion/reveal";
import { ClosingCta } from "@/components/marketing/closing-cta";
import { ConnectorRunSample } from "@/components/marketing/connector-sample";
import { CONNECTION_METHODS, CONNECTOR_FRAMEWORK } from "@/components/marketing/content";
import { IntegrationCatalog } from "@/components/marketing/integration-catalog";
import { Container, PageMasthead, SectionHeading } from "@/components/marketing/primitives";
import { Caption, NOTE_ON_PLATE } from "@/components/marketing/surface";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Integrations",
  description:
    "How AUREX connects to POS, ERP, inventory, accounting and HR systems: documented APIs, authorized OAuth, signed webhooks, approved exports, CSV and Excel imports, and read-only database access.",
};

type MethodKey = (typeof CONNECTION_METHODS)[number]["key"];

const METHOD_ICONS: Record<MethodKey, LucideIcon> = {
  rest_api: BracesIcon,
  oauth: KeyRoundIcon,
  webhook: WebhookIcon,
  export: FileOutputIcon,
  file_import: FileSpreadsheetIcon,
  database: DatabaseIcon,
};

// The lead's own distinction: each method is either documented by the vendor or fully under your control.
const METHOD_COLUMNS: { caption: string; keys: MethodKey[] }[] = [
  { caption: "Documented by the vendor", keys: ["rest_api", "oauth", "webhook"] },
  { caption: "Under your control", keys: ["export", "file_import", "database"] },
];

/** The milled edge of a small medallion (48-unit box). */
const TEETH = (() => {
  const n = 36;
  let d = "";
  for (let i = 0; i <= n * 2; i++) {
    const a = (i / (n * 2)) * Math.PI * 2;
    const r = i % 2 === 0 ? 23 : 21.6;
    d += `${i === 0 ? "M" : "L"}${(24 + r * Math.cos(a)).toFixed(2)} ${(24 + r * Math.sin(a)).toFixed(2)}`;
  }
  return `${d}Z`;
})();

/** A method's icon struck into a small milled medallion. */
function MethodMedallion({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span aria-hidden className="relative grid size-12 shrink-0 place-items-center text-ink">
      <svg viewBox="0 0 48 48" focusable="false" className="absolute inset-0 size-full" fill="none" stroke="var(--ink)">
        <path d={TEETH} strokeOpacity={0.45} strokeWidth={0.7} />
        <circle cx={24} cy={24} r={19} strokeOpacity={0.7} strokeWidth={1} />
      </svg>
      <Icon className="relative size-[1.125rem]" strokeWidth={1.6} />
    </span>
  );
}

export default function IntegrationsPage() {
  const methods = new Map(CONNECTION_METHODS.map((method) => [method.key, method]));
  return (
    <>
      <PageMasthead
        seed="integrations"
        title="Connect the systems you already run"
        lead="AUREX reads from POS, ERP, inventory, accounting and HR systems through documented, authorized methods, and records where every row came from."
      >
        <div className="relative mt-10 max-w-3xl">
          <CutMarks tone="gold" />
          <div className={cn("relative flex items-center gap-5 rounded-[0.9rem] px-6 py-6 sm:gap-7 sm:px-8", NOTE_ON_PLATE)}>
            <div className="hidden shrink-0 flex-col items-center gap-1 text-center sm:flex">
              <Seal text="connected after a test" mark="Integration Hub" className="size-24" />
              <p className="text-[0.6875rem] leading-snug text-muted-foreground">Connected after a test</p>
            </div>
            <div>
              <p className="font-display text-[1.375rem] leading-snug font-semibold tracking-[-0.02em]">
                Nothing connects until you authorize it.
              </p>
              <p className="mt-2 leading-relaxed text-ink/80">
                Vendor connections activate only after your organization authorizes access and AUREX tests the
                credentials. A provider listed on this page is not a claim that AUREX is connected to it.
              </p>
            </div>
          </div>
        </div>
      </PageMasthead>

      <section aria-labelledby="methods-title" className="py-24 sm:py-32">
        <Container>
          <Reveal>
            <SectionHeading
              id="methods-title"
              title="Six ways to connect"
              lead="Use whichever your systems support. Each method is either documented by the vendor or fully under your control."
            />
          </Reveal>
          <div className="mt-14 grid gap-12 sm:mt-16 lg:grid-cols-2 lg:gap-16">
            {METHOD_COLUMNS.map((column) => (
              <div key={column.caption}>
                <Caption className="text-ink">{column.caption}</Caption>
                <ul className="mt-4 border-b border-rule">
                  {column.keys.map((key) => {
                    const method = methods.get(key);
                    if (!method) return null;
                    return (
                      <li key={key} className="group flex gap-5 border-t border-rule py-6 sm:gap-6">
                        <MethodMedallion icon={METHOD_ICONS[key]} />
                        <div className="min-w-0">
                          <h3 className="font-display text-[1.5rem] leading-tight font-semibold tracking-[-0.02em]">
                            {method.name}
                          </h3>
                          <p className="mt-2 max-w-[50ch] text-[0.9375rem] leading-relaxed text-muted-foreground">
                            {method.text}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section aria-labelledby="framework-title" className="pb-24 sm:pb-32">
        <Container>
          <WaveBand tone="ink" className="mb-20 h-5 sm:mb-24" waves={22} copies={5} />
          <Reveal>
            <SectionHeading
              id="framework-title"
              title="Every connector runs on the same framework"
              lead="Whichever method you use, imports behave the same way: incremental, deduplicated, validated and traceable back to their source."
            />
          </Reveal>
          <div className="mt-14 grid gap-14 sm:mt-16 lg:grid-cols-12 lg:gap-12">
            <dl className="grid content-start gap-x-10 sm:grid-cols-2 lg:col-span-6">
              {CONNECTOR_FRAMEWORK.map((item) => (
                <div key={item.name} className="border-t border-rule py-4">
                  <dt className="font-display text-[1.125rem] leading-snug font-semibold tracking-[-0.01em]">{item.name}</dt>
                  <dd className="mt-1 text-[0.9375rem] leading-relaxed text-muted-foreground">{item.text}</dd>
                </div>
              ))}
            </dl>
            <Reveal y={36} blur={12} delay={0.1} className="lg:col-span-6">
              <ConnectorRunSample />
            </Reveal>
          </div>
        </Container>
      </section>

      <section aria-labelledby="catalogue-title" className="pb-24 sm:pb-32">
        <Container>
          <WaveBand tone="ink" className="mb-20 h-5 sm:mb-24" waves={22} copies={5} />
          <Reveal>
            <SectionHeading
              id="catalogue-title"
              title="Provider catalogue"
              lead="Vendors whose systems AUREX can work with, and how. Availability says what is possible today. Verification says how far the listed methods have been checked against the vendor's own documentation."
            />
          </Reveal>
          <IntegrationCatalog />
        </Container>
      </section>

      <ClosingCta
        title="Try the platform before you connect anything."
        text="The NovaMart demo runs on synthetic data, so you can explore every module without authorizing a single system."
      />
    </>
  );
}
