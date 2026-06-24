import { NextRequest, NextResponse } from "next/server";
import { tribeeApiBase } from "@/lib/tribee-api-base";

export async function POST(req: NextRequest) {
  let body: { name?: string; email?: string; content?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const name = body.name?.trim();
  const email = body.email?.trim();
  const content = body.content?.trim();

  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  if (!email) {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }
  if (!content) {
    return NextResponse.json({ error: "feedback is required" }, { status: 400 });
  }

  const upstream = await fetch(`${tribeeApiBase()}/v1/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      email,
      content,
      source: "admin-dashboard",
    }),
  });

  const payload = await upstream.json().catch(() => ({}));
  if (!upstream.ok) {
    return NextResponse.json(
      { error: payload.error ?? "Could not submit feedback" },
      { status: upstream.status },
    );
  }

  return NextResponse.json(payload);
}
