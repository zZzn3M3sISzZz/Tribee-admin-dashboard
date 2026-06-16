import { NextRequest, NextResponse } from "next/server";
import { tribeeApiBase } from "@/lib/tribee-api-base";

export async function POST(req: NextRequest) {
  let body: { email?: string; code?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const email = body.email?.trim();
  const code = body.code?.trim();
  if (!email || !code) {
    return NextResponse.json({ error: "email and code are required" }, { status: 400 });
  }

  const upstream = await fetch(`${tribeeApiBase()}/v1/account/delete/confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code }),
  });

  const payload = await upstream.json().catch(() => ({}));
  if (!upstream.ok) {
    return NextResponse.json(
      { error: payload.error ?? "Could not delete account" },
      { status: upstream.status },
    );
  }

  return NextResponse.json(payload);
}
