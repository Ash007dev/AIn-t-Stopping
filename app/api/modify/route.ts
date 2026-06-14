import { NextRequest, NextResponse } from "next/server";
import { ModifyCartRequest } from "@/lib/types";
import { invokeModificationHandler } from "@/lib/agents/modification-handler";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ModifyCartRequest;
    const { modificationText, currentCart } = body;

    if (!modificationText?.trim()) {
      return NextResponse.json({ add: [], remove: [], modify: [], error: "No modification text provided" });
    }
    if (!currentCart || currentCart.length === 0) {
      return NextResponse.json({ add: [], remove: [], modify: [], error: "Cart is empty" });
    }

    const diff = await invokeModificationHandler(modificationText, currentCart);
    return NextResponse.json(diff);
  } catch (e) {
    console.error("[/api/modify]", e);
    return NextResponse.json(
      { add: [], remove: [], modify: [], error: "Service temporarily unavailable. Please try again." },
      { status: 500 }
    );
  }
}
