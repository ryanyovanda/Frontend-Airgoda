"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "next-auth/react";
import ProfileDetailsSection from "@/app/components/profile/ProfileDetailsSection";
import ProfileImageSection from "@/app/components/profile/ProfileImageSection";

const ProfilePage = () => {
  const [user, setUser] = useState<{ name?: string; email?: string; image?: string } | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        console.log("🔍 Fetching session...");
        const session = await getSession();

        if (!session || !session.user) {
          console.error("❌ Session not found, redirecting...");
          router.push("/login");
          return;
        }

        const userId = session.user.id;
        const accessToken = session.user.accessToken;

        if (!userId || !accessToken) throw new Error("❌ Invalid session!");

        console.log(`📡 Fetching user from: /api/users/${userId}`);

        const res = await fetch(`/api/users/${userId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(`❌ Failed to fetch user: ${errorData.message}`);
        }

        const data = await res.json();
        setUser(data);
        setLoading(false);
      } catch (error) {
        console.error("🚨 Fetch User Error:", error);
      }
    };

    fetchUser();
  }, []);

  const handleImageUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/users/upload-profile-image`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("❌ Image upload failed");

      const data = await res.json();
      setUser((prev) => ({ ...prev, image: data.imageUrl }));

      console.log("✅ Profile picture updated:", data.imageUrl);
    } catch (error) {
      console.error("🚨 Image Upload Error:", error);
    }
  };

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
        <div className="flex flex-col items-center mb-6">
          <ProfileImageSection imageUrl={user?.image} onImageUpload={handleImageUpload} />
        </div>

        <ProfileDetailsSection user={user || {}} />
      </div>
    </div>
  );
};

export default ProfilePage;
