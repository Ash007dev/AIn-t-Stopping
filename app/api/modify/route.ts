import { NextRequest, NextResponse } from "next/server";
import { ModifyCartRequest } from "@/lib/types";
import { invokeModificationHandler } from "@/lib/agents/modification-handler";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ModifyCartRequest;
    const { modificationText, currentCart } = body;

    if (!modificationText || modificationText.trim().length === 0)
      return NextResponse.json({ error: "Modification text is required" }, { status: 400 });

    const diff = await invokeModificationHandler(modificationText, currentCart);
    return NextResponse.json(diff);
  } catch (e) {
    console.error("[modify]", e);
    return NextResponse.json({ error: "AI service unavailable" }, { status: 503 });
  }
}
