import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  isAllowedAdminEmail,
  verifyAdminSessionToken,
} from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase/admin";

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const session = await verifyAdminSessionToken(token);
  if (!session || !isAllowedAdminEmail(session.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "CSV file is required." }, { status: 400 });
  }

  const raw = await file.text();
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length < 2) {
    return NextResponse.json({
      inserted: 0,
      skipped_duplicate: 0,
      invalid_rows: 0,
    });
  }

  const header = parseCsvLine(lines[0]).map((column) => column.toLowerCase());

  const validHeaderA = header.length === 2 && header[0] === "full_name" && header[1] === "elo";
  const validHeaderB = header.length === 2 && header[0] === "name" && header[1] === "elo";

  if (!validHeaderA && !validHeaderB) {
    return NextResponse.json(
      { error: "Invalid CSV headers. Use full_name,elo or name,elo." },
      { status: 400 }
    );
  }

  const nameColumn = 0;
  const eloColumn = 1;

  const existingResult = await supabaseAdmin.from("players").select("full_name");
  if (existingResult.error) {
    return NextResponse.json(
      { error: existingResult.error.message },
      { status: 500 }
    );
  }

  const existingNames = new Set(
    (existingResult.data || []).map((row) => row.full_name.trim().toLowerCase())
  );

  const batchNames = new Set<string>();
  const toInsert: Array<{ full_name: string; elo: number }> = [];

  let skippedDuplicate = 0;
  let invalidRows = 0;

  for (const line of lines.slice(1)) {
    const columns = parseCsvLine(line);

    if (columns.length < 2) {
      invalidRows += 1;
      continue;
    }

    const fullName = columns[nameColumn]?.trim();
    const eloRaw = columns[eloColumn]?.trim();
    const elo = Number.parseInt(eloRaw, 10);

    if (!fullName || !Number.isFinite(elo)) {
      invalidRows += 1;
      continue;
    }

    const normalizedName = fullName.toLowerCase();
    if (existingNames.has(normalizedName) || batchNames.has(normalizedName)) {
      skippedDuplicate += 1;
      continue;
    }

    batchNames.add(normalizedName);
    toInsert.push({ full_name: fullName, elo });
  }

  if (toInsert.length > 0) {
    const insertResult = await supabaseAdmin.from("players").insert(toInsert);
    if (insertResult.error) {
      return NextResponse.json({ error: insertResult.error.message }, { status: 500 });
    }
  }

  return NextResponse.json({
    inserted: toInsert.length,
    skipped_duplicate: skippedDuplicate,
    invalid_rows: invalidRows,
  });
}
