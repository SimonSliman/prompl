import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdminSession } from "@/lib/admin-auth";
import { LoginForm } from "./LoginForm";
import { Wordmark } from "@/components/Wordmark";

export const metadata: Metadata = { title: "Admin" };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await isAdminSession()) redirect("/admin");
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[420px] flex-col gap-6 px-5 pt-5">
      <Wordmark />
      <LoginForm />
    </div>
  );
}
