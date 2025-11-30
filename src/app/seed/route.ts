import { createServerSideClient } from "@/lib/supabase/server";
import { Players } from "./seed";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createServerSideClient();

  const { error } = await supabase.from("players").insert(Players);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, count: Players.length });
}
