"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "next-auth/react";
import ProfileDetailsSection from "@/app/(tenant)/dashboard/profile/components/ProfileDetailsSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";

export default function ProfilePage() {
  const [user, setUser] = useState<{ 
    id: string;
    name?: string; 
    email?: string;
    isVerified?: boolean;
  } | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080/api/v1";

  useEffect(() => {
    const fetchUser = async () => {
      try {
        
        const session = await getSession();

        if (!session || !session.user) {
          console.error(" No session found. Redirecting to login...");
          router.push("/login");
          return;
        }

        const { id: userId } = session.user;
        const accessToken = session.accessToken;
        if (!userId || !accessToken) throw new Error(" Invalid session!");

        
        
        const res = await fetch(`${API_BASE_URL}/api/v1/users/${userId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(` Failed to fetch user: ${errorData.message}`);
        }

        const { data } = await res.json();
        setUser({ id: data.id ?? "", name: data.name, email: data.email, isVerified: data.isVerified });

      } catch (error) {
        console.error("🚨 Fetch User Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin h-10 w-10 text-purple-500" />
      </div>
    );
  }

  if (!user) {
    return <p className="text-center mt-10 text-red-500">Failed to load user data.</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 flex justify-center">
      <Card className="max-w-5xl w-full shadow-xl rounded-xl">
        <CardHeader>
          <CardTitle className="text-purple-600 text-3xl"><FontAwesomeIcon icon={faUser} className="mr-2" /> Personal Info</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-8">
 
          <div className="md:w-2/3">
            <ProfileDetailsSection 
              user={user} 
              setUser={(updatedFields) => 
                setUser((prevUser) => prevUser ? { ...prevUser, ...updatedFields } : prevUser)
              } 
            />
          </div>

          <div className="md:w-1/3 bg-gray-100 p-5 rounded-lg">
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
                <h3 className="text-xl font-semibold text-purple-700">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
