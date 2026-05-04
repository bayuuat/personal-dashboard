import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getSessionSecret } from "@/lib/auth-env";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/session-token";

export async function middleware(request: NextRequest) {
  const secret = getSessionSecret();
  if (!secret && process.env.NODE_ENV === "production") {
    return new NextResponse("Konfigurasi auth tidak lengkap (APP_SESSION_SECRET).", {
      status: 500,
    });
  }

  const { pathname, searchParams } = request.nextUrl;

  if (pathname.startsWith("/login")) {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (token && secret && (await verifySessionToken(token, secret))) {
      const from = searchParams.get("from");
      const dest = from && from.startsWith("/") && !from.startsWith("//") ? from : "/";
      return NextResponse.redirect(new URL(dest, request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/auth/login") || pathname.startsWith("/api/auth/logout")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token || !secret) {
    return NextResponse.redirect(
      new URL(`/login?from=${encodeURIComponent(pathname + request.nextUrl.search)}`, request.url),
    );
  }

  const valid = await verifySessionToken(token, secret);
  if (!valid) {
    const res = NextResponse.redirect(
      new URL(`/login?from=${encodeURIComponent(pathname + request.nextUrl.search)}`, request.url),
    );
    res.cookies.delete(SESSION_COOKIE_NAME);
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
