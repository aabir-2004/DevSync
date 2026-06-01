import LoginForm from "@/components/auth/LoginForm";
import { Metadata } from "next";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your DevSync account.",
};

export default function LoginPage() {
  return (
    <Suspense 
      fallback={
        <div className="flex h-[200px] w-full items-center justify-center">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
