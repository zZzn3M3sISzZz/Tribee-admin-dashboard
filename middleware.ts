import { NextRequest, NextResponse } from "next/server";
import { withBasePath } from "./lib/base-path";

const COOKIE_NAME = "tribee_admin_session";

export function middleware(req: NextRequest) {
  if (process.env.NEXT_PUBLIC_AUTH_BYPASS === "true") {
    return NextResponse.next();
  }

  const session = req.cookies.get(COOKIE_NAME);
  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = withBasePath("/login");
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/user-approvals/:path*",
    "/host-applications/:path*",
    "/venues/:path*",
    "/taxonomy/:path*",
    "/reports/:path*",
    "/settings/:path*",
  ],
};
