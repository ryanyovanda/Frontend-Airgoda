"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  ClipboardList,
  ShoppingCart,
  History,
  Star,
  UserCircle2,
  Menu,
  X,
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
  icon: any;
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const links: NavLink[] = [
    { name: "Profile", href: "/dashboard/profile", icon: UserCircle2 },
    ...(session?.user?.roles?.includes("TENANT")
      ? [{ name: "Manage Listings", href: "/dashboard/manage-listings", icon: ClipboardList }]
      : []),
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
      {/* Mobile Sidebar Toggle */}
      <button
        className="absolute top-4 left-4 z-50 block md:hidden p-2 rounded-md bg-purple-500 text-white"
        onClick={toggleSidebar}
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar Navigation */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 w-64 bg-white shadow-md border-r transform transition-transform md:relative md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
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
                onClick={() => setSidebarOpen(false)} // Close sidebar when link is clicked
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
        {/* Breadcrumb Navigation */}
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
