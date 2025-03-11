import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

const PUBLIC_PATHS = ["/","/login", "/register", "/transactiondetail"];
const PROTECTED_PATHS = ["/dashboard", "/trx/reports"];
const ROLE_PATHS = {
  TENANT: ["/dashboard"],
  ADMIN: ["*"], // Admin can access everything
};

// Function to retrieve session
async function getSession() {
  try {
    return await auth();
  } catch (error) {
    console.error("[Middleware] Failed to retrieve session:", error);
    return null;
  }
}

// Check if path is public
function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((path) => pathname.startsWith(path));
}

// Check if path is protected
function isProtectedPath(pathname: string) {
  return PROTECTED_PATHS.some((path) => pathname.startsWith(path));
}

// Check if user has required role for path
function hasRequiredRole(userRoles: string[], pathname: string) {
  if (userRoles.includes("ADMIN")) return true;
  return Object.entries(ROLE_PATHS).some(([role, paths]) =>
    paths.some((path) => pathname.startsWith(path)) && userRoles.includes(role)
  );
}

export async function middleware(request: NextRequest) {
  const session = await getSession();
  const { pathname } = request.nextUrl;

  // ✅ Ensure absolute URLs are used for redirection
  const origin = request.nextUrl.origin;

  // Allow access to public paths
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Check if user is authorized for protected paths
  if (isProtectedPath(pathname)) {
    if (!session) {
      console.warn("[Middleware] No session found, redirecting to /login");
      return NextResponse.redirect(new URL("/login", origin));
    }

    const userRoles = session.user?.roles || [];
    if (!hasRequiredRole(userRoles, pathname)) {
      console.warn(`[Middleware] User lacks required role(s), redirecting to /unauthorized`);
      return NextResponse.redirect(new URL("/unauthorized", origin));
    }
  }

  return NextResponse.next();
}
