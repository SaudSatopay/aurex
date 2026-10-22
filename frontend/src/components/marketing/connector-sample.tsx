import { CutMarks, SpecimenOverprint } from "@/components/art/ornaments";
import { cn } from "@/lib/utils";

import { IllustrativeLabel } from "./evidence";
import { NOTE_ON_PAPER } from "./surface";

// NovaMart demo data (synthetic). Read = new + duplicates skipped + rejected.
const RUNS = [
  { started: "14 Oct 2026, 02:10", read: "18,204", added: "18,167", duplicates: "37", rejected: "0", result: "Completed" },
  {
    started: "13 Oct 2026, 02:10",
    read: "17,951",
    added: "17,936",
    duplicates: "11",
    rejected: "4",
    result: "4 rows held for review",
  },
  {
    started: "12 Oct 2026, 02:10",
    read: "18,630",
    added: "18,630",
    duplicates: "0",
    rejected: "0",
    result: "Completed after 1 retry",
  },
] as const;

/**
 * Illustrative connector status and sync history for a file-export connector, printed as a sync log: a
 * specimen document (synthetic data) with its row counts set as figures and its provenance at the foot.
 */
export function ConnectorRunSample() {
  return (
    <figure className="relative">
      <CutMarks />
      <div className={cn("relative isolate overflow-hidden rounded-[0.9rem]", NOTE_ON_PAPER)}>
        <SpecimenOverprint className="-z-10" />
        <figcaption className="space-y-3 border-b border-rule px-5 pt-6 pb-5 sm:px-7">
          <span className="block">
            <span className="block font-display text-[1.375rem] leading-snug font-semibold tracking-[-0.02em]">
              NovaMart POS sales export
            </span>
            <span className="mt-0.5 block text-sm text-muted-foreground">Approved export, nightly</span>
          </span>
          <IllustrativeLabel />
        </figcaption>

        <dl className="grid grid-cols-2 border-b border-rule text-sm sm:grid-cols-3 sm:divide-x sm:divide-rule">
          <div className="px-5 py-4 sm:px-7">
            <dt className="text-xs text-muted-foreground">Status</dt>
            <dd className="mt-1.5 inline-flex items-center gap-2 font-medium">
              <span aria-hidden className="size-2 rounded-full bg-verdigris" />
              Healthy
            </dd>
          </div>
          <div className="border-l border-rule px-5 py-4 sm:border-l-0 sm:px-6">
            <dt className="text-xs text-muted-foreground">Last sync</dt>
            <dd className="tabular mt-1.5">14 Oct 2026, 02:10</dd>
          </div>
          <div className="col-span-2 border-t border-rule px-5 py-4 sm:col-span-1 sm:border-t-0 sm:px-6">
            <dt className="text-xs text-muted-foreground">Mode</dt>
            <dd className="mt-1.5">Incremental</dd>
          </div>
        </dl>

        <table className="hidden w-full text-left text-sm sm:table">
          <caption className="sr-only">Sync history, last three runs</caption>
          <thead className="text-xs text-muted-foreground">
            <tr>
              <th scope="col" className="pt-4 pr-2 pb-2 pl-6 font-medium">
                Run
              </th>
              <th scope="col" className="px-2 pt-4 pb-2 text-right font-medium">
                Read
              </th>
              <th scope="col" className="px-2 pt-4 pb-2 text-right font-medium">
                New
              </th>
              <th scope="col" className="px-2 pt-4 pb-2 text-right font-medium">
                Duplicates
              </th>
              <th scope="col" className="px-2 pt-4 pb-2 text-right font-medium">
                Rejected
              </th>
              <th scope="col" className="pt-4 pr-6 pb-2 pl-4 font-medium">
                Result
              </th>
            </tr>
          </thead>
          <tbody>
            {RUNS.map((run) => (
              <tr key={run.started} className="border-t border-rule align-baseline">
                <th scope="row" className="tabular py-3 pr-2 pl-6 font-normal whitespace-nowrap text-ink/85">
                  {run.started}
                </th>
                <td className="numeral px-2 py-3 text-right text-[1rem]">{run.read}</td>
                <td className="numeral px-2 py-3 text-right text-[1rem]">{run.added}</td>
                <td className="numeral px-2 py-3 text-right text-[1rem]">{run.duplicates}</td>
                <td className={cn("numeral px-2 py-3 text-right text-[1rem]", run.rejected !== "0" && "font-semibold text-oxblood")}>
                  {run.rejected}
                </td>
                <td className="py-3 pr-6 pl-4 text-ink/75">{run.result}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <ul className="divide-y divide-rule sm:hidden" aria-label="Sync history, last three runs">
          {RUNS.map((run) => (
            <li key={run.started} className="px-5 py-3.5 text-sm">
              <p className="tabular font-medium">{run.started}</p>
              <p className="tabular mt-0.5 text-muted-foreground">
                {run.read} read, {run.added} new, {run.duplicates} duplicates skipped, {run.rejected} rejected
              </p>
              <p className="mt-0.5">{run.result}</p>
            </li>
          ))}
        </ul>

        <p className="border-t border-rule bg-paper/55 px-5 py-3.5 text-xs leading-relaxed text-ink/75 sm:px-7">
          Every imported row keeps its provenance: source system, import batch (2291 for the latest run), import time and file checksum.
        </p>
      </div>
    </figure>
  );
}
