import { NextRequest, NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? "fallback-dev-secret-change-in-production"
);
const COOKIE_NAME = "journaler_session";
const SESSION_DURATION_SECONDS = 60 * 10; // 10 minutes

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return response;

  try {
    const { payload } = await jwtVerify(token, secret);
    // Strip jose internal claims before re-signing
    const { iat, exp, ...userPayload } = payload;
    void iat; void exp;

    const refreshed = await new SignJWT(userPayload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
      .sign(secret);

    response.cookies.set(COOKIE_NAME, refreshed, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_DURATION_SECONDS,
      path: "/",
    });
  } catch {
    // Expired or invalid — let the route handle the redirect
    response.cookies.delete(COOKIE_NAME);
  }

  return response;
}

export const config = {
  matcher: ["/journal/:path*"],
};
