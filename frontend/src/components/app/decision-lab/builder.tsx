"use client";

import { ChevronDownIcon, LoaderCircleIcon, PlayIcon, PlusIcon, RotateCcwIcon, SaveIcon } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useId, useMemo, useState } from "react";

import { FormError } from "@/components/app/form";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { emptyDraft, PRESETS, type LeverDraft, type LeverErrors, type PresetContext, type PresetKey } from "@/lib/app/decision-lab-levers";
import type { CatalogLever, DecisionEvidence, LeverType } from "@/lib/app/decision-lab-types";
import type { FiltersResponse } from "@/lib/app/types";
import { cn } from "@/lib/utils";

import { LEVER_LABELS, LEVER_TYPES, LeverCard, LeverMark } from "./lever-editor";
import { ScopePicker, type Scope } from "./scope-picker";

export const HORIZONS = [1, 3, 6, 9, 12, 18, 24, 36];

export type AdvancedSettings = { runs: string; discount: string; seed: string };

export type AdvancedErrors = Partial<Record<keyof AdvancedSettings, string>>;

export function validateAdvanced(settings: AdvancedSettings): AdvancedErrors {
  const errors: AdvancedErrors = {};
  const runs = Number(settings.runs);
  if (!Number.isInteger(runs) || runs < 50 || runs > 5000) errors.runs = "A whole number between 50 and 5,000";
  const discount = Number(settings.discount);
  if (settings.discount.trim() === "" || !Number.isFinite(discount) || discount < 0 || discount > 50) errors.discount = "Between 0% and 50%";
  const seed = Number(settings.seed);
  if (!Number.isInteger(seed) || seed < 0 || seed > 2 ** 31 - 1) errors.seed = "A whole number from 0";
  return errors;
}

function PresetButton({
  label,
  leverType,
  disabledReason,
  onClick,
  busy,
}: {
  label: string;
  /** The lever the quick start sets up: its mint mark prints on the chip. */
  leverType?: string;
  disabledReason?: string;
  onClick: () => void;
  busy: boolean;
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      className="h-auto min-h-8 max-w-full shrink justify-start rounded-lg bg-sheet py-1 pl-1.5 text-left whitespace-normal"
      onClick={onClick}
      disabled={Boolean(disabledReason) || busy}
      title={disabledReason}
    >
      {leverType ? <LeverMark type={leverType} className="size-5" /> : null}
      {label}
    </Button>
  );
}

export function Builder({
  scope,
  onScopeChange,
  filterOptions,
  horizon,
  onHorizonChange,
  levers,
  onLeversChange,
  errors,
  showErrors,
  advanced,
  onAdvancedChange,
  advancedErrors,
  catalog,
  evidence,
  currency,
  presetContext,
  presetStores,
  onPreset,
  onRun,
  onSave,
  onReset,
  running,
  runError,
  editingName,
  canRun,
}: {
  scope: Scope;
  onScopeChange: (scope: Scope) => void;
  filterOptions?: FiltersResponse;
  horizon: string;
  onHorizonChange: (value: string) => void;
  levers: LeverDraft[];
  onLeversChange: (levers: LeverDraft[]) => void;
  errors: Record<string, LeverErrors>;
  showErrors: boolean;
  advanced: AdvancedSettings;
  onAdvancedChange: (settings: AdvancedSettings) => void;
  advancedErrors: AdvancedErrors;
  catalog: CatalogLever[];
  evidence?: DecisionEvidence;
  currency: string;
  presetContext: PresetContext;
  /** Store ids for presets scoped to one store code (null when the store is not permitted). */
  presetStores: Record<string, string | null>;
  onPreset: (key: PresetKey) => void;
  onRun: () => void;
  onSave: () => void;
  onReset: () => void;
  running: boolean;
  runError: string | null;
  editingName?: string | null;
  canRun: boolean;
}) {
  const horizonId = useId();
  const runsId = useId();
  const discountId = useId();
  const seedId = useId();
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const descriptions = Object.fromEntries(catalog.map((c) => [c.type, c.description])) as Partial<Record<LeverType, string>>;
  const available = catalog.length ? catalog.map((c) => c.type) : LEVER_TYPES;
  const showAdvanced = advancedOpen || Object.keys(advancedErrors).length > 0;
  const still = useReducedMotion();
  // Which lever each quick start sets up (for its mint mark); computed once, drafts are discarded.
  const presetTypes = useMemo(
    () => Object.fromEntries(PRESETS.map((p) => [p.key, p.levers({ headcount: null })[0]?.type])) as Record<string, string | undefined>,
    [],
  );

  return (
    <div className="space-y-5">
      <section aria-labelledby={`${horizonId}-quick`} className="space-y-2.5">
        <h2 id={`${horizonId}-quick`} className="font-heading text-sm font-semibold">
          Quick start
        </h2>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => {
            const storeMissing = preset.storeCode && presetStores[preset.storeCode] === null;
            return (
              <PresetButton
                key={preset.key}
                label={preset.label(presetContext)}
                leverType={presetTypes[preset.key]}
                busy={running}
                disabledReason={
                  !canRun
                    ? "Your role can view scenarios but not run them"
                    : storeMissing
                      ? `${preset.storeCode} is not one of your stores`
                      : undefined
                }
                onClick={() => onPreset(preset.key)}
              />
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground">A quick start replaces the levers below and runs straight away.</p>
      </section>

      <section aria-labelledby={`${horizonId}-scope`} className="space-y-3 rounded-2xl glass p-4">
        <div className="flex items-baseline justify-between gap-2">
          <h2 id={`${horizonId}-scope`} className="font-heading text-sm font-semibold">
            Scope and horizon
          </h2>
          {editingName ? <span className="truncate text-xs text-muted-foreground">Editing “{editingName}”</span> : null}
        </div>
        <ScopePicker scope={scope} onChange={onScopeChange} options={filterOptions} />
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor={horizonId}>Horizon</Label>
            <Select value={horizon} onValueChange={onHorizonChange}>
              <SelectTrigger id={horizonId} className="w-full bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                {HORIZONS.map((h) => (
                  <SelectItem key={h} value={String(h)}>
                    {h} {h === 1 ? "month" : "months"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <button
            type="button"
            onClick={() => setAdvancedOpen((v) => !v)}
            aria-expanded={showAdvanced}
            className="press inline-flex items-center gap-1 rounded-md text-xs font-medium text-primary outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <ChevronDownIcon className={cn("size-3.5 transition-transform duration-300 ease-(--ease-out)", showAdvanced && "rotate-180")} aria-hidden />
            Simulation settings
          </button>
          {showAdvanced ? (
            <div className="mt-3 grid gap-3 duration-300 ease-(--ease-out) animate-in fade-in-0 slide-in-from-top-1 motion-reduce:animate-none sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor={runsId} className="text-[0.8125rem]">
                  Monte Carlo runs
                </Label>
                <Input
                  id={runsId}
                  inputMode="numeric"
                  value={advanced.runs}
                  onChange={(e) => onAdvancedChange({ ...advanced, runs: e.target.value })}
                  aria-invalid={advancedErrors.runs ? true : undefined}
                  aria-describedby={`${runsId}-hint`}
                  className="bg-background"
                />
                <p id={`${runsId}-hint`} className={cn("text-xs", advancedErrors.runs ? "text-destructive" : "text-muted-foreground")}>
                  {advancedErrors.runs ?? "50 to 5,000"}
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={discountId} className="text-[0.8125rem]">
                  Discount rate
                </Label>
                <InputGroup className="bg-background">
                  <InputGroupInput
                    id={discountId}
                    inputMode="decimal"
                    value={advanced.discount}
                    onChange={(e) => onAdvancedChange({ ...advanced, discount: e.target.value })}
                    aria-invalid={advancedErrors.discount ? true : undefined}
                    aria-describedby={`${discountId}-hint`}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupText>%</InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
                <p id={`${discountId}-hint`} className={cn("text-xs", advancedErrors.discount ? "text-destructive" : "text-muted-foreground")}>
                  {advancedErrors.discount ?? "Annual, for NPV"}
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={seedId} className="text-[0.8125rem]">
                  Random seed
                </Label>
                <Input
                  id={seedId}
                  inputMode="numeric"
                  value={advanced.seed}
                  onChange={(e) => onAdvancedChange({ ...advanced, seed: e.target.value })}
                  aria-invalid={advancedErrors.seed ? true : undefined}
                  aria-describedby={`${seedId}-hint`}
                  className="bg-background"
                />
                <p id={`${seedId}-hint`} className={cn("text-xs", advancedErrors.seed ? "text-destructive" : "text-muted-foreground")}>
                  {advancedErrors.seed ?? "Same seed, same result"}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section aria-labelledby={`${horizonId}-levers`} className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 id={`${horizonId}-levers`} className="font-heading text-sm font-semibold">
            Levers {levers.length ? <span className="font-normal text-muted-foreground">({levers.length})</span> : null}
          </h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={levers.length >= 20}>
                <PlusIcon aria-hidden />
                Add lever
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Choose what to change</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {available.map((type) => {
                return (
                  <DropdownMenuItem key={type} onSelect={() => onLeversChange([...levers, emptyDraft(type)])} className="items-start gap-2.5 py-2">
                    <LeverMark type={type} className="mt-px size-6" />
                    <span className="min-w-0">
                      <span className="block font-medium">{LEVER_LABELS[type]}</span>
                      {descriptions[type] ? <span className="block text-xs leading-snug text-muted-foreground">{descriptions[type]}</span> : null}
                    </span>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {levers.length === 0 ? (
          <div className="rounded-xl border border-dashed border-rule-strong bg-paper/50 px-4 py-6 text-center text-sm text-muted-foreground">
            Add a lever, or start from a quick-start scenario above.
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence initial={false} mode="popLayout">
              {levers.map((draft, index) => (
                <motion.div
                  key={draft.uid}
                  data-reveal=""
                  layout="position"
                  initial={{ opacity: 0, y: 12, scale: 0.98, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
                  exit={{ opacity: 0, scale: 0.97, filter: "blur(6px)", transition: still ? { duration: 0 } : { duration: 0.2, ease: [0.77, 0, 0.175, 1] } }}
                  transition={still ? { duration: 0 } : { type: "spring", bounce: 0, visualDuration: 0.45 }}
                >
                  <LeverCard
                    draft={draft}
                    index={index}
                    errors={errors[draft.uid] ?? {}}
                    showErrors={showErrors}
                    currency={currency}
                    evidence={evidence}
                    description={descriptions[draft.type]}
                    onChange={(next) => onLeversChange(levers.map((l) => (l.uid === draft.uid ? next : l)))}
                    onRemove={() => onLeversChange(levers.filter((l) => l.uid !== draft.uid))}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      <div className="sticky bottom-3 z-10 space-y-2 rounded-2xl glass-strong px-3 py-3">
        <FormError message={runError} />
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={onRun} disabled={running || !canRun} className="min-w-36">
            {running ? <LoaderCircleIcon className="animate-spin" aria-hidden /> : <PlayIcon aria-hidden />}
            {running ? "Simulating…" : "Run simulation"}
          </Button>
          <Button variant="outline" onClick={onSave} disabled={running || !canRun || levers.length === 0}>
            <SaveIcon aria-hidden />
            {editingName ? "Save new version" : "Save scenario"}
          </Button>
          <Button variant="ghost" onClick={onReset} disabled={running}>
            <RotateCcwIcon aria-hidden />
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
