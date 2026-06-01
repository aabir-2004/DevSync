import ResetForm from "@/components/auth/ResetForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Reset your DevSync account password.",
};

export default function ResetPage() {
  return <ResetForm />;
}
