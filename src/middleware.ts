import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

const PUBLIC_PATHS = [

  "/login",
  "/register",
  "/register-tenant"
];

const PROTECTED_PATHS = [
  "/dashboard",
  "/dashboard/manage-listings",
  "/dashboard/manage-listings/[propertyId]",
  "/dashboard/manage-listings/[propertyId]/room-variant",
  "/dashboard/manage-listings/[propertyId]/room-variant/new",
  "/dashboard/manage-listings/new",
  "/dashboard/profile",
  "/properties/[id]",
  "/verify"
];

const ROLE_PATHS = {
  ADMIN: [
    "/dashboard",
    "/dashboard/manage-listings",
    "/dashboard/manage-listings/[propertyId]",
    "/dashboard/manage-listings/[propertyId]/room-variant",
    "/dashboard/manage-listings/[propertyId]/room-variant/new",
    "/dashboard/manage-listings/new",
    "/dashboard/profile"
  ],
  TENANT: [
    "/dashboard/profile",
    "/dashboard/manage-listings",
    "/dashboard/manage-listings/[propertyId]",
    "/dashboard/manage-listings/[propertyId]/room-variant",
    "/dashboard/manage-listings/[propertyId]/room-variant/new",
    "/dashboard/manage-listings/new",
    "/verify"
  ],
  USER: [
    "/properties/[id]",
    "/dashboard/profile",
    "/verify"
  ]
};

// Retrieve session
async function getSession() {
  return await auth();
}

// Check if path is public
function isPublicPath(pathname: string) {
  return pathname === "/" || PUBLIC_PATHS.some((path) => pathname.startsWith(path));
}


// Check if path is protected
function isProtectedPath(pathname: string) {
  return PROTECTED_PATHS.some((path) => pathname.startsWith(path));
}

// Check if user has the required role for the path
function hasRequiredRole(userRoles: string[], pathname: string) {
  const normalizedRoles = userRoles.map(role => role.toUpperCase());

  console.log(`[Middleware] Checking role-based access for ${pathname}`);
  console.log("[Middleware] User Roles:", normalizedRoles);
  console.log("[Middleware] Role Paths:", ROLE_PATHS);

  if (normalizedRoles.includes("ADMIN")) {
    console.log(`[Middleware] ✅ ADMIN role detected - access granted to ${pathname}`);
    return true;
  }

  for (const [role, paths] of Object.entries(ROLE_PATHS)) {
    if (paths.some((path) => pathname.startsWith(path)) && normalizedRoles.includes(role)) {
      console.log(`[Middleware] ✅ Access Granted: ${role} can access ${pathname}`);
      return true;
    }
  }

  console.warn(`[Middleware] ❌ Access Denied: No matching roles for ${pathname}`);
  return false;
}

export async function middleware(request: NextRequest) {
  const session = await getSession();
  const { pathname } = request.nextUrl;
  const origin = request.nextUrl.origin;

  console.log(`[Middleware] Checking access for: ${pathname}`);

  // ✅ Allow static assets to load without restriction
  if (pathname.startsWith("/_next/static")) {
    console.log(`[Middleware] ✅ Allowing static asset: ${pathname}`);
    return NextResponse.next();
  }

  // ✅ Allow all public paths including "/"
  if (isPublicPath(pathname)) {
    console.log(`[Middleware] ✅ Allowing public access to: ${pathname}`);
    return NextResponse.next();
  }

  // 🔴 If path is protected but no session exists, redirect to login
  if (!session && isProtectedPath(pathname)) {
    console.warn(`[Middleware] ❌ No session found, redirecting to /login`);
    return NextResponse.redirect(new URL("/login", origin));
  }

  const userRoles = session?.user?.roles || [];
  console.log(`[Middleware] User Roles for ${pathname}:`, userRoles);

  // ✅ Allow direct access to "/unauthorized" to prevent redirect loops
  if (pathname === "/unauthorized") {
    console.log(`[Middleware] ✅ Allowing access to /unauthorized`);
    return NextResponse.next();
  }

  // 🔴 Ensure protected paths require the correct roles
  if (isProtectedPath(pathname) && !hasRequiredRole(userRoles, pathname)) {
    console.warn(`[Middleware] ❌ Access Denied: Redirecting to /unauthorized`);
    return NextResponse.redirect(new URL("/unauthorized", origin));
  }

  return NextResponse.next();
}
