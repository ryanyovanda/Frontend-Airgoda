"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe, faBars, faUserCircle } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import Link from "next/link";
import { useSession, signOut, getSession } from "next-auth/react";
import { useState, useEffect } from "react";

const Navbar = ({ profileUpdated }: { profileUpdated?: number }) => {
  const { data: session } = useSession();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileImage, setProfileImage] = useState("");

  const fetchProfileImage = async () => {
    if (session?.user?.id) {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/${session.user.id}/profile-image`, {
          headers: { Authorization: `Bearer ${session.accessToken}` },
        });

        if (res.ok) {
          const imageUrl = await res.text();
          setProfileImage(imageUrl);
        }
      } catch (error) {
        console.error("Error fetching profile image:", error);
      }
    }
  };

  useEffect(() => {
    fetchProfileImage();
  }, [session, profileUpdated]);

  const handleLogout = async () => {
    const session = await getSession();
    const accessToken = session?.accessToken;
    const refreshToken = session?.refreshToken;

    if (accessToken && refreshToken) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ accessToken, refreshToken }),
        });
      } catch (error) {
        console.error("Logout API error:", error);
      }
    }

    await signOut({ redirect: false });

    window.localStorage.clear();
    window.sessionStorage.clear();
    document.cookie.split(";").forEach((c) => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    window.location.reload();
  };

  return (
    <nav className="flex justify-between items-center p-4 relative">
      <div className="flex items-center md:ml-16">
        <Link href="/">
          <Image src="/logo.png" alt="Airbnb Logo" width={100} height={40} />
        </Link>
      </div>

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

      <div className="flex items-center space-x-6 md:mr-16">
        <FontAwesomeIcon icon={faGlobe} className="text-gray-600 w-5 h-5 cursor-pointer" />

        {session ? (
          <div className="relative">
            <div
              className="px-5 py-2 border rounded-full flex flex-row items-center gap-3 cursor-pointer"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <FontAwesomeIcon icon={faBars} className="text-gray-600 w-4 h-4" />

              {profileImage ? (
                <Image
                  src={profileImage}
                  alt="Profile Picture"
                  width={30}
                  height={30}
                  className="w-8 h-8 rounded-full border object-cover aspect-square overflow-hidden"
                />
              ) : (
                <FontAwesomeIcon icon={faUserCircle} className="text-gray-600 w-7 h-7 rounded-full border" />
              )}
            </div>

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
                      href="/dashboard/manage-listings"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                    >
                      Manage Listings
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
          <Link
            href="/login"
            className="px-5 py-2 border rounded-full text-gray-600 hover:text-black hover:bg-gray-100 transition"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;