import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const { supabaseResponse, user } = await updateSession(request);

  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/auth");
  const isPublicRoute = isAuthRoute || pathname.startsWith("/u/") || pathname.startsWith("/api/");
  const isStaticAsset = pathname.startsWith("/_next") || pathname.startsWith("/favicon.ico");

  if (isStaticAsset) {
    return supabaseResponse;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isConfigured = supabaseUrl && !supabaseUrl.includes("placeholder");

  // Se o Supabase estiver configurado e o usuário não estiver logado tentando acessar rotas da estante
  if (isConfigured && !user && !isPublicRoute && pathname !== "/") {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Se o usuário já estiver logado e tentar acessar /login, manda para /livros
  if (isConfigured && user && isAuthRoute) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/livros";
    return NextResponse.redirect(dashboardUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
