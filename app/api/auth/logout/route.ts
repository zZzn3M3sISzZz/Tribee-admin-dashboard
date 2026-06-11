import { NextResponse } from "next/server";

const COOKIE_NAME = "tribee_admin_session";
const REFRESH_COOKIE = "tribee_admin_refresh";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, "", { maxAge: 0, path: "/" });
  response.cookies.set(REFRESH_COOKIE, "", { maxAge: 0, path: "/" });
  return response;
}
