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

async function getSession() {
  return await auth();
}

function isPublicPath(pathname: string) {
  return pathname === "/" || PUBLIC_PATHS.some((path) => pathname.startsWith(path));
}



function isProtectedPath(pathname: string) {
  return PROTECTED_PATHS.some((path) => pathname.startsWith(path));
}


function hasRequiredRole(userRoles: string[], pathname: string) {
  const normalizedRoles = userRoles.map(role => role.toUpperCase());

  if (normalizedRoles.includes("ADMIN")) {
    
    return true;
  }

  for (const [role, paths] of Object.entries(ROLE_PATHS)) {
    if (paths.some((path) => pathname.startsWith(path)) && normalizedRoles.includes(role)) {

      return true;
    }
  }


  return false;
}

export async function middleware(request: NextRequest) {
  const session = await getSession();
  const { pathname } = request.nextUrl;
  const origin = request.nextUrl.origin;

  


  if (pathname.startsWith("/_next/static")) {
   
    return NextResponse.next();
  }


  if (isPublicPath(pathname)) {
   
    return NextResponse.next();
  }


  if (!session && isProtectedPath(pathname)) {
    return NextResponse.redirect(new URL("/login", origin));
  }

  const userRoles = session?.user?.roles || [];
 


  if (pathname === "/unauthorized") {
   
    return NextResponse.next();
  }


  if (isProtectedPath(pathname) && !hasRequiredRole(userRoles, pathname)) {

    return NextResponse.redirect(new URL("/unauthorized", origin));
  }

  return NextResponse.next();
}
