"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface ProfileDetailsProps {
  user: {
    id: string;
    name?: string;
    email?: string;
    isVerified?: boolean; // ✅ Added email verification status
  };
  setUser: (user: { name: string; email: string }) => void;
}

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
});

const ProfileDetailsSection: React.FC<ProfileDetailsProps> = ({ user, setUser }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name || "",
      email: user.email || "",
    },
  });

  const [emailSent, setEmailSent] = useState(false);

  const onSubmit = async (data: { name: string; email: string }) => {
    try {
      const response = await fetch(`/api/v1/users/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      alert("Profile updated successfully!");
      setUser(data);
    } catch (error) {
      console.error("Profile update error:", error);
    }
  };

  // ✅ Function to send verification email
  const sendVerificationEmail = async () => {
    try {
      const response = await fetch(`/api/auth/send-verification-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });

      if (!response.ok) {
        throw new Error("Failed to send verification email");
      }

      setEmailSent(true);
      alert("Verification email sent. Check your inbox!");
    } catch (error) {
      console.error("Error sending verification email:", error);
    }
  };

  return (
    <div className="p-6 border rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Profile Details</h2>

      {/* Name & Email Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-gray-600">Name</label>
          <input {...register("name")} className="w-full p-2 border rounded" />
          {errors.name && <p className="text-red-500">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-gray-600">Email</label>
          <input {...register("email")} className="w-full p-2 border rounded" disabled />
        </div>

        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          {isSubmitting ? "Saving..." : "Save Changes"}
        </button>
      </form>

      {/* ✅ Email Verification Status */}
      <div className="mt-6 p-4 border rounded-lg shadow-md">
        <h2 className="text-lg font-semibold">Email Verification</h2>
        {user.isVerified ? (
          <p className="text-green-600">✅ Verified</p>
        ) : (
          <p className="text-red-500">❌ Not Verified</p>
        )}

        {/* ✅ Show button if email is NOT verified */}
        {!user.isVerified && !emailSent && (
          <button
            onClick={sendVerificationEmail}
            className="bg-orange-500 text-white px-4 py-2 rounded mt-4 hover:bg-orange-600"
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
