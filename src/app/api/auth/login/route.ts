import { timingSafeEqual } from "node:crypto";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { getSessionSecret } from "@/lib/auth-env";
import { createSessionToken, SESSION_COOKIE_NAME, SESSION_MAX_AGE_S } from "@/lib/session-token";

function comparePin(a: string, b: string): boolean {
  const ba = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

export async function POST(req: Request) {
  const expectedPin = (process.env.APP_LOGIN_PIN ?? "").trim();
  const secret = getSessionSecret();

  if (!expectedPin) {
    return NextResponse.json({ error: "APP_LOGIN_PIN belum diset di server." }, { status: 500 });
  }
  if (!secret) {
    return NextResponse.json({ error: "APP_SESSION_SECRET wajib di production." }, { status: 500 });
  }

  const body = (await req.json().catch(() => null)) as { pin?: unknown } | null;
  const submitted = typeof body?.pin === "string" ? body.pin : "";

  if (!comparePin(submitted, expectedPin)) {
    return NextResponse.json({ error: "PIN salah." }, { status: 401 });
  }

  const token = await createSessionToken(secret);
  const jar = await cookies();
  jar.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_S,
  });

  return NextResponse.json({ ok: true });
}
