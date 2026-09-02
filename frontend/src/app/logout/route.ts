import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAMES } from "@/services/sessionService";

export function GET() {
  // Location relativo: o navegador resolve contra a URL que ele mesmo pediu.
  // NextResponse.redirect exige URL absoluta e request.nextUrl.origin devolve
  // sempre o host de bind do servidor (localhost:3000), o que jogava o usuario
  // para localhost em qualquer acesso por IP ou dominio.
  //
  // A raiz "/" e a propria tela de login (app/page.tsx renderiza o LoginForm
  // quando nao ha sessao), entao este e o destino correto do "Sair".
  //
  // Os botoes de sair precisam usar window.location.replace("/logout"), nunca
  // router.replace: a navegacao client-side do App Router resolve este 303
  // internamente, mantem o Router Cache com as telas do usuario anterior e
  // deixa a URL final a cargo do router. So a navegacao de documento garante
  // que os cookies limpos valham e que a raiz seja buscada do zero.
  const response = new NextResponse(null, {
    status: 303,
    headers: { "Cache-Control": "no-store", Location: "/" },
  });

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
