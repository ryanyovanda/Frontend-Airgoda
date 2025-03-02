"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "next-auth/react";
import ProfileDetailsSection from "@/app/components/profile/ProfileDetailsSection";

const ProfilePage = () => {
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        console.log("🔍 Fetching session...");
        const session = await getSession();
        console.log("✅ Session Data:", session);
  
        if (!session || !session.user) {
          console.error("❌ Session not found, redirecting...");
          router.push("/login");
          return;
        }
  
        const userId = session.user.id;
        const accessToken = session.accessToken;

        console.log("🆔 User ID:", userId);
        console.log("🔑 Access Token:", accessToken);
  
        if (!userId || !accessToken) throw new Error("❌ Invalid session!");
  
        console.log(`📡 Fetching user from: /api/v1/users/${userId}`);
  
        const BASE_API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080/api/v1";

        const res = await fetch(`${BASE_API_URL}/api/v1/users/${userId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        console.log("📩 API Response Status:", res.status);
  
        if (!res.ok) {
          const errorData = await res.json();
          console.error("❌ API Error Response:", errorData);
          throw new Error(`❌ Failed to fetch user: ${errorData.message}`);
        }
  
        const data = await res.json();
        console.log("✅ Fetched User Data:", data);
  
        setUser(data.data);
        setLoading(false);
      } catch (error) {
        console.error("🚨 Fetch User Error:", error);
      }
    };
  
    fetchUser();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="max-w-6xl mx-auto p-8 flex flex-col md:flex-row">
      {/* Left Section - User Information */}
      <div className="md:w-2/3">
        <h1 className="text-3xl font-bold mb-6">Personal Info</h1>

        <div className="border-b py-4 flex justify-between">
          <div>
            <p className="text-gray-500">Legal Name</p>
            <p className="text-lg font-semibold">{user?.name || "Not provided"}</p>
          </div>
          <button className="text-blue-600 hover:underline">Edit</button>
        </div>

        <div className="border-b py-4 flex justify-between">
          <div>
            <p className="text-gray-500">Email Address</p>
            <p className="text-lg">{user?.email || "Not provided"}</p>
          </div>
          <button className="text-blue-600 hover:underline">Edit</button>
        </div>

        <div className="border-b py-4 flex justify-between">
          <div>
            <p className="text-gray-500">Phone Number</p>
            <p className="text-lg">Not provided</p>
          </div>
          <button className="text-blue-600 hover:underline">Add</button>
        </div>

        <div className="border-b py-4 flex justify-between">
          <div>
            <p className="text-gray-500">Identity Verification</p>
            <p className="text-lg">Not started</p>
          </div>
          <button className="text-blue-600 hover:underline">Start</button>
        </div>

        <div className="border-b py-4 flex justify-between">
          <div>
            <p className="text-gray-500">Emergency Contact</p>
            <p className="text-lg">Not provided</p>
          </div>
          <button className="text-blue-600 hover:underline">Add</button>
        </div>
      </div>

      {/* Right Section - Help Panel */}
      <div className="md:w-1/3 md:ml-10 mt-8 md:mt-0 bg-gray-100 p-5 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">Why isn’t my info shown here?</h3>
        <p className="text-gray-600 mb-6">
          We’re hiding some account details to protect your identity.
        </p>

        <h3 className="text-xl font-semibold mb-4">Which details can be edited?</h3>
        <p className="text-gray-600 mb-6">
          Contact info and personal details can be edited. If this info was used
          to verify your identity, you’ll need to get verified again the next time
          you book or to continue hosting.
        </p>

        <h3 className="text-xl font-semibold mb-4">What info is shared with others?</h3>
        <p className="text-gray-600">
          Your contact info is private and won’t be shared with other guests.
        </p>
      </div>
    </div>
  );
};

export default ProfilePage;
