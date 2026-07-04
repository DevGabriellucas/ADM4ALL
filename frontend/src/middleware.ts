import { type NextRequest, NextResponse } from "next/server";

// O middleware apenas disponibiliza o pathname atual para os Server
// Components (layouts de guarda) via header de requisicao. A logica de
// autenticacao/autorizacao continua nos layouts, usando getServerSession(),
// porque eles leem cookies assinados e conhecem o perfil do usuario.
export const config = {
  matcher: ["/coordenador/:path*", "/instrutor/:path*", "/aluno/:path*"],
};

export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}
