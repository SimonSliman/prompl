import type { Metadata } from "next";
import { SimpleHeader } from "@/components/SimpleHeader";
import { JoinForm } from "./JoinForm";

export const metadata: Metadata = { title: "Leave your name" };

export default function JoinPage() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[520px] flex-col gap-5 px-5 pb-7 pt-5">
      <SimpleHeader />
      <div className="flex flex-col gap-2">
        <h1 className="m-0 font-heading text-[28px] font-bold leading-[1.1] tracking-[-0.02em]">Want a seat at a future table?</h1>
        <p className="m-0 text-[15px] leading-[1.5] text-body">
          Tables are small and invitation only. Leave your name and we will reach out when there is one near you on a topic you care about.
        </p>
      </div>
      <JoinForm />
    </div>
  );
}
