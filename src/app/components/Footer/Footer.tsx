"use client";

import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebookF,
  faInstagram,
  faTwitter,
  faPinterest,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";
import { useState } from "react";

const Footer = () => {
  const [email, setEmail] = useState("");

  return (
    <footer className="bg-[#4B0082] text-white py-8">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div className="mb-6 md:mb-0">
            <Image src="/logo.png" alt="Brand Logo" width={150} height={50} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <h3 className="font-bold mb-2">Company</h3>
              <Link href="/careers" className="block hover:underline">Careers</Link>
              <Link href="/cafe" className="block hover:underline">Our Café</Link>
              <Link href="/news" className="block hover:underline">News</Link>
            </div>
            <div>
              <h3 className="font-bold mb-2">Support</h3>
              <Link href="/consumer-care" className="block hover:underline">Consumer Care</Link>
              <Link href="/alumni" className="block hover:underline">Alumni</Link>
              <Link href="/foodservice" className="block hover:underline">Foodservice</Link>
            </div>
            <div>
              <h3 className="font-bold mb-2">Regions</h3>
              <Link href="/canada" className="block hover:underline">Canada</Link>
              <Link href="/mexico" className="block hover:underline">Mexico</Link>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-400 pt-6 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-bold">Get the latest updates</h3>
          </div>
          <div className="flex flex-row items-center space-x-2">
            <input
              type="email"
              placeholder="Your email here"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="p-2 rounded-md text-black w-64"
            />
            <button className="bg-white text-[#4B0082] px-4 py-2 rounded-md font-bold hover:bg-gray-200 transition">
              Subscribe
            </button>
          </div>
        </div>

        <div className="flex justify-center space-x-4 mt-6">
          <FontAwesomeIcon icon={faFacebookF} className="text-white w-6 h-6 cursor-pointer hover:opacity-75" />
          <FontAwesomeIcon icon={faInstagram} className="text-white w-6 h-6 cursor-pointer hover:opacity-75" />
          <FontAwesomeIcon icon={faTwitter} className="text-white w-6 h-6 cursor-pointer hover:opacity-75" />
          <FontAwesomeIcon icon={faPinterest} className="text-white w-6 h-6 cursor-pointer hover:opacity-75" />
          <FontAwesomeIcon icon={faYoutube} className="text-white w-6 h-6 cursor-pointer hover:opacity-75" />
        </div>


        <div className="text-center text-xs text-gray-300 mt-6">
          <p>© {new Date().getFullYear()} YourCompany. All rights reserved.</p>
          <div className="flex justify-center space-x-4 mt-2">
            <Link href="" className="hover:underline">Website Terms</Link>
            <Link href="" className="hover:underline">Privacy Policy</Link>
            <Link href="" className="hover:underline">Accessibility</Link>
            <Link href="" className="hover:underline">Marketing to Children</Link>
            <Link href="" className="hover:underline">Do Not Sell My Info</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
