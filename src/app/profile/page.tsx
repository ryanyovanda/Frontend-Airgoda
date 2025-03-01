"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "next-auth/react";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
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
        const accessToken = session.user.accessToken;

        if (!userId) throw new Error("❌ No user ID in session!");
        if (!accessToken) throw new Error("❌ No access token in session!");

        console.log(`📡 Fetching user from: /api/users/${userId}`);

        const res = await fetch(`/api/users/${userId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        console.log("📩 API Response Status:", res.status);

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(`❌ Failed to fetch user: ${res.status} - ${errorData.message}`);
        }

        const data = await res.json();
        console.log("✅ Fetched User Data:", data);
        setUser(data);
        setLoading(false);
      } catch (error) {
        console.error("🚨 Fetch User Error:", error);
      }
    };

    fetchUser();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/4 bg-white p-5 border-r">
        <h2 className="text-xl font-semibold mb-4">Profile</h2>
        <ul>
          <li className="py-2 text-blue-500 font-medium">User Details</li>
          <li className="py-2 text-gray-500">Reviews</li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="w-3/4 p-5">
        <h1 className="text-2xl font-bold mb-4">User Details</h1>
        <div className="bg-white p-6 shadow rounded-lg">
          <div className="mb-4">
            <label className="text-gray-600 block">Name</label>
            <p className="text-lg font-semibold">{user?.name || "N/A"}</p>
          </div>
          <div className="mb-4">
            <label className="text-gray-600 block">Email</label>
            <p className="text-lg">{user?.email || "N/A"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
