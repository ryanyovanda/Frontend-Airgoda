"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "next-auth/react";

const ProfilePage = () => {
  const [user, setUser] = useState<{ id?: string; name?: string; email?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [editField, setEditField] = useState<{ field: string; value: string } | null>(null);
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

        const res = await fetch(`${BASE_API_URL}/api/v1/users/${userId}`, {
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
        setUser(data);
      } catch (error) {
        console.error("🚨 Fetch User Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleEditClick = (field: "name" | "email", value: string) => {
    setEditField({ field, value });
  };

  const handleSave = async () => {
    if (!editField || !user) return;
  
    try {
      const updatedUser = { ...user, [editField.field]: editField.value };
      const BASE_API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080/api/v1";
      
      // Fetch session to get token
      const session = await getSession();
      if (!session || !session.accessToken) {
        throw new Error("User session expired. Please log in again.");
      }
  
      const res = await fetch(`${BASE_API_URL}/api/v1/users/profile`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${session.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedUser),
      });
  
      if (!res.ok) {
        throw new Error("❌ Failed to update profile");
      }
  
      setUser(updatedUser);
      setEditField(null);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("🚨 Update Error:", error);
      alert("Something went wrong. Please try again.");
    }
  };
  

  if (loading) return <p className="text-center mt-10 text-gray-500">Loading...</p>;

  if (!user) return <p className="text-center mt-10 text-red-500">Failed to load user data.</p>;

  return (
    <div className="max-w-6xl mx-auto p-8 flex flex-col md:flex-row">
      {/* Left Section - User Information */}
      <div className="md:w-2/3">
        <h1 className="text-3xl font-bold mb-6">Personal Info</h1>

        {[
          { label: "Legal Name", field: "name", value: user?.name },
          { label: "Email Address", field: "email", value: user?.email },
        ].map(({ label, field, value }, index) => (
          <div key={index} className="border-b py-4 flex justify-between">
            <div>
              <p className="text-gray-500">{label}</p>
              <p className="text-lg font-semibold">{value || "Not provided"}</p>
            </div>
            <button
              className="text-blue-600 hover:underline"
              onClick={() => handleEditClick(field as "name" | "email", value || "")}
            >
              {value ? "Edit" : "Add"}
            </button>
          </div>
        ))}
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

      {/* Edit Modal */}
      {editField && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Edit {editField.field === "name" ? "Name" : "Email"}</h2>
            <input
              type={editField.field === "email" ? "email" : "text"}
              value={editField.value}
              onChange={(e) => setEditField({ ...editField, value: e.target.value })}
              className="w-full p-2 border rounded-md mb-4"
            />
            <div className="flex justify-end space-x-4">
              <button className="bg-gray-300 px-4 py-2 rounded-md" onClick={() => setEditField(null)}>
                Cancel
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md" onClick={handleSave}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
