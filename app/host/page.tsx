import type { Metadata } from "next";
import { HostFlow } from "@/components/host/HostFlow";
import { templateById } from "@/lib/templates";

export const metadata: Metadata = { title: "Host a table" };

export default async function HostPage({ searchParams }: { searchParams: Promise<{ template?: string }> }) {
  const sp = await searchParams;
  const preset = templateById(sp.template)?.id ?? null;
  return <HostFlow presetTemplateId={preset} />;
}
