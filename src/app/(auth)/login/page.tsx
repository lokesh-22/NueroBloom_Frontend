import LoginForm from "@/components/auth/LoginForm";
import { AuthShell } from "@/components/layout/AuthShell";

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Return to your study space without the friction."
      description="Pick up where you left off, reopen your material, and keep your revision streak moving."
    >
      <LoginForm />
    </AuthShell>
  );
}
