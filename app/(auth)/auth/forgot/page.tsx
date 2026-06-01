import ForgotForm from "@/components/auth/ForgotForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Request a password reset link.",
};

export default function ForgotPage() {
  return <ForgotForm />;
}
