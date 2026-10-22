import type { Metadata } from "next";

import { AuthCard, AuthSwitch, AuthTitle } from "@/components/auth/auth-card";
import { DemoPanel } from "@/components/auth/demo-panel";
import { AuthRedirectProvider } from "@/components/auth/redirect";
import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your AUREX workspace, or explore the NovaMart demo with synthetic data.",
};

export default function SignInPage() {
  return (
    <AuthRedirectProvider>
      <AuthCard>
        <AuthTitle>Sign in to AUREX</AuthTitle>
        <p className="mt-4 text-[0.9375rem] leading-relaxed text-muted-foreground">
          Use the email address and password for your AUREX account.
        </p>
        <div className="mt-8">
          <SignInForm />
        </div>
        <AuthSwitch href="/sign-up" label="Create an account">
          New to AUREX?
        </AuthSwitch>
      </AuthCard>
      <DemoPanel />
    </AuthRedirectProvider>
  );
}
