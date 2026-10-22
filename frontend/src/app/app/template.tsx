import type { ReactNode } from "react";

import { PageEnter } from "@/components/motion/page-enter";

/** Remounts on every workspace navigation, so each page rises and sharpens into place. */
export default function AppTemplate({ children }: { children: ReactNode }) {
  return <PageEnter>{children}</PageEnter>;
}
