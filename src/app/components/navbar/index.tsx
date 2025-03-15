"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe, faBars, faUserCircle } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import Link from "next/link";
import { useSession, signOut, getSession } from "next-auth/react";
import { useState } from "react";

const Navbar = () => {
  const { data: session } = useSession(); // Get session data
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = async () => {
  const session = await getSession(); // Get the user session
  const accessToken = session?.accessToken;
  const refreshToken = session?.refreshToken;

  if (accessToken && refreshToken) {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`, // Send Bearer token
        },
        body: JSON.stringify({ accessToken, refreshToken }),
      });
    } catch (error) {
      console.error("Logout API error:", error);
    }
  }

  // Force signOut without calling /api/auth/signout (prevents NextAuth from auto handling it)
  await signOut({ redirect: false });

  // Manually remove session data (force NextAuth to clear cache)
  window.localStorage.clear();
  window.sessionStorage.clear();
  document.cookie.split(";").forEach((c) => {
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
  });

  // Reload page to fully clear NextAuth session
  window.location.reload();
};


  return (
    <nav className="flex justify-between items-center p-4 relative">
      {/* Logo */}
      <div className="flex items-center">
        <Link href="/">
          <Image src="/logo.png" alt="Airbnb Logo" width={100} height={40} />
        </Link>
      </div>

      {/* Middle Section: Navigation Links - HIDDEN when logged in */}
      {!session && (
        <div className="hidden md:flex items-center space-x-4">
          <Link href="/register" className="text-gray-600 hover:text-black">
            Register
          </Link>
          <Link href="/register-tenant" className="text-gray-600 hover:text-black">
            List Your Place
          </Link>
        </div>
      )}

      {/* Right Section: Profile & Actions */}
      <div className="flex items-center space-x-4">
        <FontAwesomeIcon icon={faGlobe} className="text-gray-600 w-4 cursor-pointer" />

        {/* If user is logged in, show profile dropdown */}
        {session ? (
          <div className="relative">
            <div
              className="px-4 py-2 border rounded-full flex flex-row items-center gap-2 space-x-2 cursor-pointer"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <FontAwesomeIcon icon={faBars} className="text-gray-600 w-3" />
              <FontAwesomeIcon icon={faUserCircle} className="text-gray-600 w-6 h-6" />
            </div>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div className="relative">
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-md p-2 z-50">
                  <Link
                    href="/dashboard/profile"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                  >
                    Profile
                  </Link>
                  {session?.user?.roles?.includes("TENANT") && (
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                    >
                      Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Show Login button when user is not logged in
          <Link
            href="/login"
            className="px-4 py-2 border rounded-full text-gray-600 hover:text-black hover:bg-gray-100 transition"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
