"use client";

import {
  CircleAlertIcon,
  DatabaseIcon,
  LockIcon,
  RefreshCwIcon,
  TriangleAlertIcon,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { ApiError, errorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";

import { useDocumentTitle } from "./page";
import { Medallion } from "./print";

/**
 * The mark at the top of empty, error and access states: an engraved medallion (a mint mark seeded by
 * the icon, ringing it), so each kind of state always wears the same small engraving.
 */
export function IconTile({
  icon,
  tone = "neutral",
  size = "md",
  className,
}: {
  icon: LucideIcon;
  tone?: "neutral" | "brand" | "danger";
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  return <Medallion icon={icon} tone={tone} size={size} className={className} />;
}

/**
 * Loading placeholder with a soft light sweep (a translucent band crossing left to right). The sweep is
 * off under reduced motion; the block itself stays as a quiet shape.
 */
export function Shimmer({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <div
      data-slot="skeleton"
      className={cn("relative overflow-hidden rounded-md bg-foreground/[0.06] dark:bg-white/[0.06]", className)}
      style={style}
    >
      <span
        aria-hidden
        className="animate-marquee absolute inset-y-0 left-full w-full bg-linear-to-r from-transparent via-white/55 to-transparent [animation-direction:reverse] motion-reduce:hidden dark:via-white/[0.07]"
        style={{ "--gap": "100%", "--duration": "1.8s" } as CSSProperties}
      />
    </div>
  );
}

/** Centered message for "nothing here yet" with an optional next step. */
export function EmptyState({
  icon: Icon = DatabaseIcon,
  title,
  description,
  action,
  className,
  compact,
}: {
  icon?: LucideIcon;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "gap-2 px-4 py-8" : "gap-3 px-6 py-14",
        className,
      )}
    >
      <IconTile icon={Icon} size={compact ? "sm" : "md"} />
      <div className="max-w-md space-y-1">
        <p className="font-heading text-[0.9375rem] font-medium text-foreground">{title}</p>
        {description ? <div className="text-sm leading-relaxed text-muted-foreground">{description}</div> : null}
      </div>
      {action ? <div className="mt-1 flex flex-wrap justify-center gap-2">{action}</div> : null}
    </div>
  );
}

function explain(error: unknown): { title: string; message: string; icon: LucideIcon; noData?: boolean; forbidden?: boolean } {
  if (error instanceof ApiError) {
    if (error.code === "no_data") {
      return { title: "No data yet", message: error.message, icon: DatabaseIcon, noData: true };
    }
    if (error.code === "no_company") {
      return { title: "No company set up", message: error.message, icon: DatabaseIcon, noData: true };
    }
    if (error.status === 403) return { title: "Access restricted", message: error.message, icon: LockIcon, forbidden: true };
    if (error.status === 404) return { title: "Not found", message: error.message, icon: CircleAlertIcon };
    if (error.status === 429) return { title: "Too many requests", message: error.message, icon: TriangleAlertIcon };
    if (error.status >= 500) {
      return {
        title: "The server couldn't complete this request",
        message: error.code.startsWith("http_") ? "AUREX can't be reached right now. Try again in a moment." : error.message,
        icon: TriangleAlertIcon,
      };
    }
    return { title: "Request failed", message: error.message, icon: CircleAlertIcon };
  }
  if (error instanceof TypeError) {
    return { title: "Connection problem", message: "AUREX can't be reached. Check your connection and try again.", icon: TriangleAlertIcon };
  }
  return { title: "Something went wrong", message: errorMessage(error), icon: CircleAlertIcon };
}

/** Error panel for a failed request. Shows the backend's message verbatim (ApiError.message). */
export function ErrorState({
  error,
  onRetry,
  className,
  compact,
}: {
  error: unknown;
  onRetry?: () => void;
  className?: string;
  compact?: boolean;
}) {
  const info = explain(error);
  const requestId = error instanceof ApiError ? error.requestId : undefined;
  return (
    <div role={info.noData ? undefined : "alert"} className={className}>
      <EmptyState
        compact={compact}
        icon={info.icon}
        title={info.title}
        description={
          <>
            <span className="block">{info.message}</span>
            {requestId ? <span className="mt-1 block text-xs text-muted-foreground/80">Reference {requestId}</span> : null}
          </>
        }
        action={
          info.noData ? (
            <Button asChild variant="outline" size="sm">
              <Link href="/app/integrations">Open Integration Hub</Link>
            </Button>
          ) : onRetry && !info.forbidden ? (
            <Button variant="outline" size="sm" onClick={onRetry}>
              <RefreshCwIcon aria-hidden />
              Try again
            </Button>
          ) : undefined
        }
      />
    </div>
  );
}

/** Friendly 403 for a whole page the member's role doesn't include. */
export function ForbiddenState({ area, role, homeHref }: { area: string; role?: string; homeHref?: string }) {
  useDocumentTitle(`No access to ${area}`);
  return (
    <div className="mx-auto max-w-xl py-10 sm:py-16">
      <div className="rounded-3xl glass px-6 py-10 text-center sm:px-10">
        <IconTile icon={LockIcon} size="lg" className="mx-auto" />
        <h1 className="mt-5 font-display text-2xl font-semibold tracking-[-0.02em]">You don’t have access to {area}</h1>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
          {role ? `Your role (${role}) doesn’t include this area. ` : "Your role doesn’t include this area. "}
          If you need it, ask an organization owner to change your role.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">Error 403: permission required</p>
        <div className="mt-7 flex justify-center">
          <Button asChild>
            <Link href={homeHref || "/app"}>Go to your workspace</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

/** Error shown when the session itself failed to load. `embedded` renders inside the shell. */
export function FullPageError({
  title,
  message,
  onRetry,
  embedded,
}: {
  title: string;
  message: string;
  onRetry?: () => void;
  embedded?: boolean;
}) {
  return (
    <div className={cn("flex flex-1 items-center justify-center px-4", embedded ? "py-16" : "min-h-dvh bg-(--canvas)")}>
      <div role="alert" className="w-full max-w-md rounded-3xl glass-strong p-8 text-center">
        <IconTile icon={TriangleAlertIcon} tone="danger" size="lg" className="mx-auto" />
        <h1 className="mt-4 font-display text-xl font-semibold">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{message}</p>
        <div className="mt-6 flex justify-center gap-2">
          {onRetry ? (
            <Button onClick={onRetry}>
              <RefreshCwIcon aria-hidden />
              Try again
            </Button>
          ) : null}
          <Button variant="outline" asChild>
            <a href="/sign-in">Go to sign in</a>
          </Button>
        </div>
      </div>
    </div>
  );
}

/** Generic skeleton block sized to the content it stands in for. */
export function SkeletonBlock({ className }: { className?: string }) {
  return <Shimmer className={cn("rounded-lg", className)} />;
}

export function ChartSkeleton({ height = 260 }: { height?: number }) {
  return (
    <div className="flex flex-col gap-3" style={{ height }} aria-hidden>
      <div className="flex flex-1 items-end gap-2">
        {[0.45, 0.6, 0.52, 0.7, 0.66, 0.8, 0.74, 0.86, 0.78, 0.9, 0.84, 0.95].map((h, i) => (
          <Shimmer key={i} className="flex-1 rounded-t-md rounded-b-sm" style={{ height: `${h * 100}%` }} />
        ))}
      </div>
      <Shimmer className="h-3 w-full rounded-sm" />
    </div>
  );
}

export function TableSkeleton({ rows = 6, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-2" aria-hidden>
      <Shimmer className="h-8 w-full rounded-lg" />
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className="grid gap-3" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          {Array.from({ length: columns }, (_, c) => (
            <Shimmer key={c} className="h-5" />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Standard loading / error / empty handling for one query result. */
export function QueryView<T>({
  query,
  loading,
  isEmpty,
  empty,
  children,
  compact,
}: {
  query: { data: T | undefined; error: unknown; isPending: boolean; refetch: () => unknown };
  loading?: ReactNode;
  isEmpty?: (data: T) => boolean;
  empty?: ReactNode;
  children: (data: T) => ReactNode;
  compact?: boolean;
}) {
  if (query.isPending) return <>{loading ?? <TableSkeleton />}</>;
  if (query.error || query.data === undefined) {
    return <ErrorState compact={compact} error={query.error} onRetry={() => void query.refetch()} />;
  }
  if (isEmpty?.(query.data)) return <>{empty ?? <EmptyState compact={compact} title="Nothing to show yet" />}</>;
  return <>{children(query.data)}</>;
}

/** Short contextual message inside a panel (method notes, limitations, warnings). */
export function Notice({
  tone = "info",
  title,
  children,
  className,
}: {
  tone?: "info" | "warning" | "danger";
  title?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const Icon = tone === "info" ? CircleAlertIcon : TriangleAlertIcon;
  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-xl px-3.5 py-3 text-sm leading-relaxed shadow-[inset_0_1px_0_var(--glass-edge)]",
        tone === "info" && "bg-white/45 text-foreground ring-1 ring-(--glass-border) dark:bg-white/[0.04]",
        tone === "warning" && "bg-warning/12 text-foreground ring-1 ring-warning/30",
        tone === "danger" && "bg-destructive/6 text-foreground ring-1 ring-destructive/25",
        className,
      )}
    >
      <Icon
        className={cn(
          "mt-0.5 size-4 shrink-0",
          tone === "info" && "text-primary/80",
          tone === "warning" && "text-warning",
          tone === "danger" && "text-destructive",
        )}
        aria-hidden
      />
      <div className="min-w-0 space-y-1">
        {title ? <p className="font-medium">{title}</p> : null}
        <div className="text-muted-foreground [&_strong]:text-foreground">{children}</div>
      </div>
    </div>
  );
}
