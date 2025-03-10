"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getSession } from "next-auth/react";

interface ProfileDetailsProps {
  user: {
    id: string;
    name?: string;
    email?: string;
    isVerified?: boolean;
  };
  setUser: (user: { name: string }) => void;
}

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
});

const ProfileDetailsSection: React.FC<ProfileDetailsProps> = ({ user, setUser }) => {
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name || "",
    },
  });

  const onSubmit = async (data: { name: string }) => {
    try {
      const session = await getSession();
      if (!session || !session.accessToken) {
        throw new Error("❌ User session expired. Please log in again.");
      }

      const BASE_API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080/api/v1";

      const payload = { name: data.name, email: user.email };

      console.log("📡 Sending update request with payload:", JSON.stringify(payload));

      const response = await fetch(`${BASE_API_URL}/api/v1/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Server responded with error:", errorData);
        throw new Error(errorData.message || "Failed to update profile");
      }

      alert("✅ Profile updated successfully!");
      setUser(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Something went wrong. Please try again.";
      alert(errorMessage);
    }
  };

  return (
    <div className="bg-white p-6 shadow rounded-lg max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Edit Profile</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-400"
        >
          {isSubmitting ? "Updating..." : "Update Profile"}
        </button>
      </form>
    </div>
  );
};

export default ProfileDetailsSection;
