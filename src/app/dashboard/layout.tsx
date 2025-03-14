"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  ClipboardList,
  BarChart2,
  ShoppingCart,
  History,
  Star,
  UserCircle2,
  LucideIcon,
} from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

type NavLink = {
  name: string;
  href: string;
  icon: LucideIcon;
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: authSession, status } = useSession({
    required: true,
    onUnauthenticated() {
      void handleRelogin();
    },
  });

  const handleRelogin = () => {
    router.push(
      "/login" +
        new URLSearchParams({
          login: "true",
          redirectTo: pathname,
        })
    );
  };

  const links: NavLink[] = [
    { name: "Profile", href: "/dashboard/profile", icon: UserCircle2 },
    { name: "Manage Listings", href: "/dashboard/manage-listings", icon: ClipboardList },
    { name: "Orders", href: "/dashboard/orders", icon: ShoppingCart },
    { name: "Transaction History", href: "/dashboard/transactions", icon: History },
    { name: "Reviews", href: "/dashboard/reviews", icon: Star },
  ];

  if (status === "loading") {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  // Breadcrumb Path Segments
  const pathSegments = pathname.split("/").filter((segment) => segment);

  return (
    <div className="flex h-screen w-full">
      {/* Sidebar Navigation */}
      <aside className="h-full w-64 bg-white shadow-md border-r">
        <nav className="flex flex-col space-y-2 p-4">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-purple-100",
                  pathname === link.href && "bg-purple-500 text-white hover:bg-purple-600"
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gray-100 p-6">
        {/* Breadcrumb Navigation - Fix for inline display */}
        <Breadcrumb className="flex flex-wrap items-center space-x-1 text-gray-600 text-sm">
          <BreadcrumbList className="flex items-center space-x-1">
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            {pathSegments.length > 0 && <BreadcrumbSeparator />}
            {pathSegments.map((segment, index) => {
              const href = "/" + pathSegments.slice(0, index + 1).join("/");
              const isLast = index === pathSegments.length - 1;

              return (
                <span key={href} className="flex items-center space-x-1">
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage className="text-black font-semibold">
                        {decodeURIComponent(segment)}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={href}>{decodeURIComponent(segment)}</BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast && <BreadcrumbSeparator />}
                </span>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>

        {/* Page Content */}
        <div className="mt-4">{children}</div>
      </main>
    </div>
  );
}
