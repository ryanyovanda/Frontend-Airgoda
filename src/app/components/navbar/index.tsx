"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe, faBars, faUserCircle } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

const Navbar = () => {
  const { data: session } = useSession(); // Get session data
  return (
    <nav className="flex justify-between items-center p-4 border-b shadow-sm">

      <div className="flex items-center">
        <Image src="/logo.png" alt="Airbnb Logo" width={100} height={40} />
      </div>

      
      <div className="flex items-center space-x-4">
        <span className="hidden md:block text-gray-600 hover:text-black cursor-pointer">
        Welcome, {session?.user?.name}
          {session?.user.roles?.includes("USER") && (
           <Link href="/register/organizer" className=" hover:bg-white hover:text-[#232323] rounded-lg p-2 ease-in-out duration-300 transition">Create Event</Link>
            )}
        </span>
        <div>
          {/* Show Logout button if logged in */}
          {session && (
                                    <button
                                        onClick={() => signOut()}
                                        className="rounded-lg p-2 ease-in-out duration-300 transition"
                                    >
                                        Logout
                                    </button>
                                )}

        </div>
        <FontAwesomeIcon icon={faGlobe} className="text-gray-600 w-4 cursor-pointer " />
        <div className="px-4 py-2 border rounded-full flex flex-row items-center gap-2 space-x-2 cursor-pointer">
          <FontAwesomeIcon icon={faBars} className="text-gray-600 w-3" />
          <FontAwesomeIcon icon={faUserCircle} className="text-gray-600 w-6 h-6" />
        </div>
      </div>
    </nav>
  );
}


export default Navbar;
