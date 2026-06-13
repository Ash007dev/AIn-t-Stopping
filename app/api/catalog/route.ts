import { NextResponse } from "next/server";
import { loadCatalog } from "@/lib/catalog";

export async function GET() {
  try {
    const catalog = loadCatalog();
    return NextResponse.json(catalog);
  } catch (e) {
    console.error("[catalog]", e);
    return NextResponse.json({ error: "Catalog unavailable" }, { status: 500 });
  }
}
