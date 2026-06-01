import SignupForm from "@/components/auth/SignupForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create an account on the DevSync platform.",
};

export default function SignupPage() {
  return <SignupForm />;
}
