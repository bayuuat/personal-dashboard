import { Suspense } from "react";

import { LoginForm } from "./login-form";

function LoginFallback() {
  return (
    <div className="flex h-[280px] w-full max-w-sm items-center justify-center rounded-xl border border-border bg-card text-sm text-muted-foreground">
      Memuat…
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}
