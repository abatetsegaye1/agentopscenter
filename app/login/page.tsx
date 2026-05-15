import { LoginForm } from "@/components/login-form";
import { Suspense } from "react";

export default function LoginPage(): JSX.Element {
  return (
    <main className="login-page">
      <Suspense fallback={<p>Loading login...</p>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
