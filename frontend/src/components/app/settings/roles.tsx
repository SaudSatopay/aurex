"use client";

import { CheckIcon } from "lucide-react";

import { useSession } from "@/components/app/session-provider";
import { QueryView, TableSkeleton } from "@/components/app/states";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

import { RoleMark, useRoles } from "./members";

const PERMISSION_LABELS: Record<string, string> = {
  "org:read": "View organization",
  "org:manage": "Manage organization, companies and stores",
  "members:read": "View members",
  "members:manage": "Manage members and invitations",
  "integrations:read": "View integrations",
  "integrations:manage": "Manage integrations",
  "data:import": "Import data files",
  "data_quality:read": "View data quality",
  "dashboard:read": "Executive dashboard",
  "sales:read": "Sales",
  "finance:read": "Finance and profit",
  "inventory:read": "Inventory",
  "suppliers:read": "Suppliers",
  "workforce:read": "Workforce",
  "forecasts:read": "View forecasts",
  "forecasts:run": "Train and run forecasts",
  "scenarios:read": "View scenarios",
  "scenarios:write": "Create scenarios",
  "advisor:use": "Use the AI advisor",
  "intelligence:read": "Company intelligence and news",
  "intelligence:manage": "Manage intelligence sources",
  "reports:read": "View reports",
  "reports:generate": "Generate reports",
  "recommendations:read": "View recommendations",
  "recommendations:write": "Create recommendations",
  "recommendations:approve": "Approve recommendations",
  "tasks:read": "View tasks",
  "tasks:manage": "Manage tasks",
  "audit:read": "Audit trail",
};

/** Roles × permissions, exactly as the backend enforces them (GET /roles). */
export function RolesMatrix() {
  const { membership } = useSession();
  const roles = useRoles();
  return (
    <QueryView query={roles} loading={<TableSkeleton rows={10} columns={6} />}>
      {(data) => (
        <div className="space-y-5">
          <RevealGroup as="ul" className="grid gap-3 md:grid-cols-2 xl:grid-cols-3" stagger={0.04}>
            {data.roles.map((r) => (
              <RevealItem
                as="li"
                y={10}
                key={r.role}
                className={cn(
                  "flex items-start gap-3 rounded-lg border border-(--glass-border) bg-sheet p-3 shadow-[inset_0_1px_0_var(--glass-edge)] transition-colors duration-200 hover:bg-paper",
                  r.role === membership?.role && "border-gold-deep/40 bg-gold/[0.07] hover:bg-gold/[0.09]",
                )}
              >
                <RoleMark role={r.role} tone={r.role === membership?.role ? "gold" : "ink"} className="mt-0.5 size-9" />
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    {r.label}
                    {r.role === membership?.role ? <span className="ml-1.5 text-xs font-normal text-muted-foreground">(your role)</span> : null}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{r.description}</p>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {r.permissions.length} permissions{r.store_scoped_by_default ? ", usually limited to specific stores" : ""}
                  </p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
          <div
            className="relative overflow-x-auto rounded-xl bg-white/30 ring-1 ring-(--glass-border) outline-none focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-white/[0.02]"
            role="region"
            aria-label="Permissions by role"
            tabIndex={0}
          >
            <table className="w-full border-collapse text-[0.8125rem] tabular-nums">
              <caption className="sr-only">Permissions granted to each role</caption>
              <thead className="bg-white/55 backdrop-blur-md dark:bg-white/[0.04]">
                <tr className="border-b border-(--glass-border)">
                  <th scope="col" className="sticky left-0 z-[1] min-w-[15rem] bg-(--glass-bg-strong) px-3 py-2 text-left text-xs font-medium text-muted-foreground backdrop-blur-xl">
                    Permission
                  </th>
                  {data.roles.map((r) => (
                    <th key={r.role} scope="col" className="min-w-[6.5rem] px-2 py-2 text-center align-bottom text-xs leading-tight font-medium text-muted-foreground">
                      {r.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.all_permissions.map((permission) => (
                  <tr
                    key={permission}
                    className="border-b border-(--glass-border) transition-colors duration-200 ease-(--ease-out) last:border-b-0 hover:bg-primary/[0.035] dark:hover:bg-white/[0.035]"
                  >
                    <th scope="row" className="sticky left-0 z-[1] bg-(--glass-bg-strong) px-3 py-1.5 text-left font-normal backdrop-blur-xl">
                      {PERMISSION_LABELS[permission] ?? permission}
                      <span className="block font-mono text-[0.6875rem] text-muted-foreground">{permission}</span>
                    </th>
                    {data.roles.map((r) => {
                      const granted = r.permissions.includes(permission);
                      return (
                        <td key={r.role} className="px-2 py-1.5 text-center">
                          {granted ? (
                            <>
                              <CheckIcon className="mx-auto size-4 text-primary" aria-hidden />
                              <span className="sr-only">Granted</span>
                            </>
                          ) : (
                            <>
                              <span className="text-muted-foreground/50" aria-hidden>
                                –
                              </span>
                              <span className="sr-only">Not granted</span>
                            </>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </QueryView>
  );
}
