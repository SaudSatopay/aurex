/*
 * Glowing Badge — from Unlumen UI (https://ui.unlumen.com/docs/components/glowing-badge), free
 * component used under the Unlumen UI license. See components/kit/LICENSES.md. A glass pill whose
 * status colour glows faintly behind it; `pulse` pings the dot for things that are live right now.
 */
import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function GlowingBadge({
  tone = "oklch(0.8 0.12 225)",
  pulse = false,
  children,
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: string; pulse?: boolean }) {
  return (
    <span className="relative inline-flex">
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-1 rounded-full blur-lg"
        style={{ background: tone, opacity: pulse ? 0.35 : 0.18 }}
      />
      <span
        className={cn(
          "relative inline-flex items-center gap-2 rounded-full px-3 py-1 text-[0.8125rem] font-medium glass-ink text-white",
          className,
        )}
        {...props}
      >
        <span aria-hidden className="relative flex size-2">
          {pulse ? (
            <span className="absolute inline-flex size-full animate-ping rounded-full opacity-60 motion-reduce:hidden" style={{ background: tone }} />
          ) : null}
          <span className="relative inline-flex size-2 rounded-full" style={{ background: tone }} />
        </span>
        {children}
      </span>
    </span>
  );
}
