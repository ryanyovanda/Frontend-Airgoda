import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

const PUBLIC_PATHS = ["/login", "/register", "/transactiondetail"];
const PROTECTED_PATHS = ["/dashboard", "/trx/reports"];
const ROLE_PATHS = {
  ORGANIZER: ["/dashboard"],
  // Admin can access everything
  ADMIN: ["*"],
};

async function getSession() {
  return await auth();
}

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((path) => pathname.startsWith(path));
}

function isProtectedPath(pathname: string) {
  return PROTECTED_PATHS.some((path) => pathname.startsWith(path));
}

function hasRequiredRole(userRoles: string[], pathname: string) {
  if (userRoles.includes("ADMIN")) {
    return true;
  }
  for (const [role, paths] of Object.entries(ROLE_PATHS)) {
    if (paths.some((path) => pathname.startsWith(path)) && userRoles.includes(role)) {
      return true;
    }
  }
  return false;
}

export async function middleware(request: NextRequest) {
  const session = await getSession();
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  if (isProtectedPath(pathname)) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const userRoles = session.user?.roles || [];
    if (!hasRequiredRole(userRoles, pathname)) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  return NextResponse.next();
}