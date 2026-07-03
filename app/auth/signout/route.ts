import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  // Anti-CSRF: solo aceptamos el logout si el Origin es el propio sitio. Un
  // form cross-site auto-enviado no podrá desloguear al usuario (logout CSRF).
  const origin = request.headers.get("origin");
  const expected = request.nextUrl.origin;
  if (origin && origin !== expected) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(`${expected}/login`, { status: 303 });
}
