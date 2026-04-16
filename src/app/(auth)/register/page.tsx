import RegisterForm from "@/components/auth/RegisterForm";
import { AuthShell } from "@/components/layout/AuthShell";

export default function RegisterPage() {
  return (
    <AuthShell
      eyebrow="Build your setup"
      title="Create a sharper study workflow from your very first session."
      description="Join NeuroBloom to turn your documents into summaries, quizzes, and measurable progress."
    >
      <RegisterForm />
    </AuthShell>
  );
}
