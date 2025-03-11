"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getSession } from "next-auth/react";

interface User {
  id: string;
  name?: string;
  email?: string;
  isVerified?: boolean;
}

interface ProfileDetailsProps {
  user: User;
  setUser: (updatedUser: Partial<User>) => void;
}

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
});

const ProfileDetailsSection: React.FC<ProfileDetailsProps> = ({ user, setUser }) => {
  const [emailSent, setEmailSent] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name || "",
    },
  });

  // ✅ Sync form values with user prop updates
  useEffect(() => {
    setValue("name", user.name || "");
  }, [user.name, setValue]);

  const onSubmit = async (data: { name: string }) => {
    try {
      const session = await getSession();
      if (!session || !session.accessToken) {
        throw new Error("❌ User session expired. Please log in again.");
      }

      const BASE_API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080/api/v1";

      // ✅ Ensure ID is retained
      const payload = { id: user.id, name: data.name };

      console.log("📡 Sending update request with payload:", JSON.stringify(payload));

      const response = await fetch(`${BASE_API_URL}/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Server responded with error:", errorData);
        throw new Error(errorData.message || "Failed to update profile");
      }

      alert("✅ Profile updated successfully!");
      setUser({ ...user, name: data.name }); // ✅ Keeps other properties intact
    } catch (error: any) {
      alert(error.message || "Something went wrong. Please try again.");
    }
  };

  const sendVerificationEmail = async () => {
    try {
      if (!user.email) {
        alert("❌ No email found in user data!");
        return;
      }

      const BASE_API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080/api/v1";

      const response = await fetch(`${BASE_API_URL}/api/v1/users/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });

      if (!response.ok) {
        throw new Error("Failed to send verification email");
      }

      setEmailSent(true);
      alert("✅ Verification email sent. Check your inbox!");
    } catch (error) {
      console.error("🚨 Error sending verification email:", error);
    }
  };

  return (
    <div className="bg-white p-6 shadow rounded-lg max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Edit Profile</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-gray-600">
            Name
          </label>
          <input
            id="name"
            {...register("name")}
            className="w-full px-4 py-2 border rounded-md"
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
        </div>

        {/* Email Field (Read-Only) */}
        <div>
          <label htmlFor="email" className="block text-gray-600">
            Email
          </label>
          <input
            id="email"
            value={user.email || ""}
            disabled
            className="w-full px-4 py-2 border rounded-md bg-gray-100 cursor-not-allowed"
          />
        </div>

        {/* Update Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-400"
        >
          {isSubmitting ? "Updating..." : "Update Profile"}
        </button>
      </form>

      {/* ✅ Email Verification Section */}
      <div className="mt-6 p-4 border rounded-lg shadow-md">
        <h2 className="text-lg font-semibold">Email Verification</h2>
        {user.isVerified ? (
          <p className="text-green-600">✅ Verified</p>
        ) : (
          <p className="text-red-500">❌ Not Verified</p>
        )}

        {!user.isVerified && !emailSent && (
          <button
            onClick={sendVerificationEmail}
            className="text-blue-600 text-sm font-medium hover:underline mt-2"
          >
            Send Verification Email
          </button>
        )}

        {emailSent && <p className="text-blue-500 mt-2">📩 Verification email sent!</p>}
      </div>
    </div>
  );
};

export default ProfileDetailsSection;
