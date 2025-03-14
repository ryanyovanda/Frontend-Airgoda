"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
      "/login?" +
        new URLSearchParams({
          login: "true",
          redirectTo: pathname,
        })
    );
  };

  const role = authSession?.user?.role;

  const links: NavLink[] = [
    { name: "Profile", href: "/dashboard/profile", icon: UserCircle2 },
    { name: "Manage Listings", href: "/dashboard/manage-listings", icon: ClipboardList },
    ...(role === "TENANT"
      ? [{ name: "Analytics & Reports", href: "/dashboard/analytics", icon: BarChart2 }]
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

  return (
    <div className="flex h-screen w-full">
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

      <main className="flex-1 overflow-auto bg-gray-100 p-6">{children}</main>
    </div>
  );
}
