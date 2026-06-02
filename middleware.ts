import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return handleApiAuth(request);
  }

  if (
    pathname.startsWith("/") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/agents")
  ) {
    return handlePageAuth(request);
  }

  return NextResponse.next();
}

function isPublicRoute(pathname: string): boolean {
  const publicPaths = [
    "/api/login",
    "/api/signup",
    "/login",
    "/signup",
    "/public",
    "/_next",
    "/favicon.ico",
  ];

  return publicPaths.some((path) => pathname.startsWith(path));
}

function handleApiAuth(request: NextRequest) {
  const token = getTokenFromHeader(request);

  if (!token) {
    return new Response(JSON.stringify({ error: "Access token required" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  return NextResponse.next();
}

function handlePageAuth(request: NextRequest) {
  return NextResponse.next();
}

function getTokenFromHeader(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    return token;
  }

  const url = new URL(request.url);
  const tokenParam = url.searchParams.get("token");
  if (tokenParam) {
    return tokenParam;
  }

  return null;
}

function getTokenFromCookies(request: NextRequest): string | null {
  const tokenCookie = request.cookies.get("auth-token");

  return tokenCookie ? tokenCookie.value : null;
}

export const config = {
  matcher: ["/((?!_next|api/login|login|public|signup|favicon.ico).*)"],
};
