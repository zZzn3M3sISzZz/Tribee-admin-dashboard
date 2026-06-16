import { NextRequest, NextResponse } from "next/server";
import { tribeeApiBase } from "@/lib/tribee-api-base";

export async function POST(req: NextRequest) {
  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const email = body.email?.trim();
  if (!email) {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }

  const upstream = await fetch(`${tribeeApiBase()}/v1/account/delete/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const payload = await upstream.json().catch(() => ({}));
  if (!upstream.ok) {
    return NextResponse.json(
      { error: payload.error ?? "Could not send verification code" },
      { status: upstream.status },
    );
  }

  return NextResponse.json(payload);
}
