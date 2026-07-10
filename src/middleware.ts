import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

function getSecret() {
  return new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret-mudar");
}

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  let sessao: any = null;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, getSecret());
      sessao = payload;
    } catch {}
  }

  if (!sessao) return NextResponse.redirect(new URL("/login", req.url));

  if (pathname.startsWith("/admin") && sessao.role !== "ADMIN")
    return NextResponse.redirect(new URL("/aluno", req.url));
  if (pathname.startsWith("/aluno") && sessao.role !== "ALUNO")
    return NextResponse.redirect(new URL("/admin", req.url));

  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*", "/aluno/:path*"] };
