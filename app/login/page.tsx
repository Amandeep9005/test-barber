import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-sm flex-col justify-center gap-8 px-4 py-12">
      <div>
        <p className="text-lg font-semibold">Barber Ledger</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Enter the shop PIN
        </h1>
      </div>
      <LoginForm />
    </main>
  );
}
