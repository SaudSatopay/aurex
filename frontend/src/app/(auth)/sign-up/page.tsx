import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthCard, AuthSwitch } from "@/components/auth/auth-card";
import { AuthRedirectProvider } from "@/components/auth/redirect";
import { SignUpFallback, SignUpForm } from "@/components/auth/sign-up-form";

export const metadata: Metadata = {
  title: "Create an account",
  description: "Create an AUREX account and organization, or accept an invitation to join your team's workspace.",
};

export default function SignUpPage() {
  return (
    <AuthRedirectProvider>
      <AuthCard className="max-w-[30rem]">
        {/* The form reads ?invite= with useSearchParams, so it renders inside its own Suspense boundary. */}
        <Suspense fallback={<SignUpFallback />}>
          <SignUpForm />
        </Suspense>
        <AuthSwitch href="/sign-in" label="Sign in">
          Already have an account?
        </AuthSwitch>
      </AuthCard>
    </AuthRedirectProvider>
  );
}
