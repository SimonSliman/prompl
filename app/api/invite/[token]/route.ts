import { NextResponse } from "next/server";
import { getInvitationByToken } from "@/lib/tables";
import { acceptInvitation, declineInvitation, markFutureOk, saveQuestion } from "@/lib/guest";

export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const inv = await getInvitationByToken(token);
  if (!inv) return NextResponse.json({ error: "not found" }, { status: 404 });
  const body = await req.json().catch(() => ({}));
  const action = String(body.action ?? "");
  try {
    if (action === "accept") {
      const slots = Array.isArray(body.slots) ? body.slots.map(String) : [];
      const r = await acceptInvitation(inv, slots);
      return NextResponse.json({ ok: true, status: r.status });
    }
    if (action === "decline") {
      const r = await declineInvitation(inv);
      return NextResponse.json({ ok: true, status: r.status });
    }
    if (action === "question") {
      await saveQuestion(inv, String(body.question ?? ""));
      return NextResponse.json({ ok: true });
    }
    if (action === "future") {
      await markFutureOk(inv);
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "unknown action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
