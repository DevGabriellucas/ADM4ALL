import { type NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAMES } from "@/services/sessionService";

export function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/", request.url));

  for (const cookieName of Object.values(SESSION_COOKIE_NAMES)) {
    response.cookies.set(cookieName, "", {
      expires: new Date(0),
      httpOnly: true,
      maxAge: 0,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }

  return response;
}
