"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "next-auth/react";
import ProfileDetailsSection from "@/app/components/profile/ProfileDetailsSection";

const ProfilePage = () => {
  const [user, setUser] = useState<{ 
    id: string; // ✅ Ensures `id` is always a string
    name?: string; 
    email?: string;
    isVerified?: boolean;
  } | null>(null);
  
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        console.log("🔍 Fetching session...");
        const session = await getSession();

        if (!session || !session.user) {
          console.error("❌ No session found. Redirecting to login...");
          router.push("/login");
          return;
        }

        const { id: userId } = session.user;
        const accessToken = session.accessToken;
        if (!userId || !accessToken) throw new Error("❌ Invalid session!");

        console.log(`📡 Fetching user from API: /users/${userId}`);
        const BASE_API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080/api/v1";

        const res = await fetch(`${BASE_API_URL}/users/${userId}`, {
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

        const { data } = await res.json();
        setUser({ id: data.id ?? "", name: data.name, email: data.email, isVerified: data.isVerified }); // ✅ Ensures `id` is never `undefined`
      } catch (error) {
        console.error("🚨 Fetch User Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  if (loading) return <p className="text-center mt-10 text-gray-500">Loading...</p>;
  if (!user) return <p className="text-center mt-10 text-red-500">Failed to load user data.</p>;

  return (
    <div className="max-w-6xl mx-auto p-8 flex flex-col md:flex-row">
      {/* Left Section - User Information */}
      <div className="md:w-2/3">
        <h1 className="text-3xl font-bold mb-6">Personal Info</h1>
        <ProfileDetailsSection 
          user={user} 
          setUser={(updatedFields) => 
            setUser((prevUser) => prevUser ? { ...prevUser, ...updatedFields } : prevUser)
          } 
        />
      </div>

      {/* Right Section - Help Panel */}
      <div className="md:w-1/3 md:ml-10 mt-8 md:mt-0 bg-gray-100 p-5 rounded-lg">
        {[
          {
            title: "Why isn’t my info shown here?",
            description: "We’re hiding some account details to protect your identity.",
          },
          {
            title: "Which details can be edited?",
            description:
              "Contact info and personal details can be edited. If this info was used to verify your identity, you’ll need to get verified again the next time you book or to continue hosting.",
          },
          {
            title: "What info is shared with others?",
            description: "Your contact info is private and won’t be shared with other guests.",
          },
        ].map((item, index) => (
          <div key={index} className="mb-6">
            <h3 className="text-xl font-semibold">{item.title}</h3>
            <p className="text-gray-600">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfilePage;
