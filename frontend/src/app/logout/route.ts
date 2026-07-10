import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAMES } from "@/services/sessionService";

export function GET() {
  const response = NextResponse.redirect(
    new URL("/", process.env.FRONTEND_URL ?? "http://localhost:3000"),
  );

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
