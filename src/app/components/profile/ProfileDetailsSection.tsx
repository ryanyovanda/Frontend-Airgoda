"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getSession } from "next-auth/react";
import { Button } from "@/components/ui/button"; // ✅ Using shadcn
import { Input } from "@/components/ui/input"; // ✅ Using shadcn
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageIcon, CheckCircle, XCircle, RefreshCcw, Lock } from "lucide-react"; // ✅ Icon library


interface User {
  id: string;
  name?: string;
  email?: string;
  isVerified?: boolean;
  imageUrl?: string;
}

interface ProfileDetailsProps {
  user: User;
  setUser: (updatedUser: Partial<User>) => void;
}

const nameSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
});

const ProfileDetailsSection: React.FC<ProfileDetailsProps> = ({ user, setUser }) => {
  const [profileImage, setProfileImage] = useState<string | null>(user.imageUrl || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [resetMessage, setResetMessage] = useState("");


  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(nameSchema),
    defaultValues: { name: user.name || "" },
  });

  const BASE_API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080/api/v1";

  // ✅ Fetch profile image from session
  useEffect(() => {
    getSession().then((session) => {
      if (session && session.user) {
        setProfileImage(session.user.imageUrl || null);
      }
    });
  }, []);

  // ✅ Sync form values with user updates
  useEffect(() => {
    setValue("name", user.name || "");
  }, [user.name, setValue]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("❌ Only image files are allowed.");
        return;
      }
      if (file.size > 1024 * 1024) {
        alert("❌ File size must be less than 1MB.");
        return;
      }
      setSelectedFile(file);
      setProfileImage(URL.createObjectURL(file)); // Temporary preview
    }
  };

  // ✅ Save All Changes (Name & Profile Picture)
  const saveChanges = async (data: { name: string }) => {
    setIsUpdating(true);
    try {
      const session = await getSession();
      if (!session || !session.accessToken) {
        throw new Error("❌ User session expired. Please log in again.");
      }

      // 1️⃣ Upload Profile Picture (if selected)
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const uploadResponse = await fetch(`${BASE_API_URL}/api/v1/users/${user.id}/profile-image`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${session.accessToken}` },
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error("❌ Failed to upload profile picture");
        }
        const newImageUrl = await uploadResponse.text();
        setProfileImage(newImageUrl);
        setUser({ ...user, imageUrl: newImageUrl });
      }

      // 2️⃣ Update Name
      const nameResponse = await fetch(`${BASE_API_URL}/api/v1/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({ name: data.name }),
      });

      if (!nameResponse.ok) {
        throw new Error("❌ Failed to update name");
      }

      setUser({ ...user, name: data.name });
      alert("✅ Profile updated successfully!");
    } catch (error) {
      console.error("🚨 Error updating profile:", error);
      alert("Something went wrong.");
    } finally {
      setIsUpdating(false);
    }
  };

  // ✅ Resend Verification Email
  const resendVerificationEmail = async () => {
    setIsResendingVerification(true);
    try {
      const session = await getSession();
      if (!session || !session.accessToken || !session.user?.email) {
        throw new Error("❌ User session expired or email not found. Please log in again.");
      }
  
      const response = await fetch(`${BASE_API_URL}/api/v1/users/resend-verification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({ email: session.user.email }),
      });
  
      if (!response.ok) {
        throw new Error("❌ Failed to resend verification email");
      }
  
      alert("✅ Verification email sent successfully!");
    } catch (error) {
      console.error("🚨 Error resending verification email:", error);
      alert("Something went wrong.");
    } finally {
      setIsResendingVerification(false);
    }
  };
  
  const handleResetPassword = async () => {
    if (!user?.email) {
      setResetMessage("❌ Email not found. Please try again.");
      return;
    }

    setResetMessage("🔄 Sending reset email...");

    try {
      const response = await fetch(`${BASE_API_URL}/api/v1/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send reset email.");
      }

      setResetMessage("✅ Reset email sent! Check your inbox.");
    } catch (error) {
      setResetMessage("❌ Failed to send reset email. Please try again.");
    }
  };


  return (
    <Card className="max-w-3xl mx-auto p-6 shadow-lg border rounded-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-center">Profile Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* ✅ Profile Picture */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-32 h-40 border border-gray-300 shadow-md overflow-hidden rounded-lg bg-gray-100">
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="text-gray-500 w-full h-full p-6" />
            )}
          </div>

          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="fileUpload" />
          <label htmlFor="fileUpload" className="text-sm font-medium text-blue-600 hover:underline cursor-pointer">
            {profileImage ? "Change Picture" : "Upload Picture"}
          </label>
        </div>

        {/* ✅ Email & Verification */}
        

<div className="flex items-center justify-between">
  <div className="flex items-center space-x-2">
    <p className="text-gray-600">
      Email: <span className="font-semibold">{user.email}</span>
    </p>
    {user.isVerified ? (
      <CheckCircle className="text-green-500" size={20} />
    ) : (
      <XCircle className="text-red-500" size={20} />
    )}
  </div>
  {!user.isVerified && (
    <Button
      onClick={resendVerificationEmail}
      disabled={isResendingVerification}
      size="sm"
      variant="outline"
    >
      <RefreshCcw className="mr-2" /> {isResendingVerification ? "Sending..." : "Resend Verification"}
    </Button>
  )}
</div>


        {/* ✅ Change Name */}
        <form onSubmit={handleSubmit(saveChanges)} className="space-y-4">
          <div>
            <label className="block text-gray-600">Name</label>
            <Input {...register("name")} />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          </div>
          <Button type="submit" disabled={isUpdating} className="w-full">
            {isUpdating ? "Saving..." : "Save Changes"}
          </Button>
        </form>


        <form onSubmit={handleSubmit(saveChanges)} className="space-y-4">
          <Button variant="outline" onClick={handleResetPassword}>
            <Lock className="mr-2" /> Reset Password
          </Button>
          {resetMessage && <p className="text-center text-sm mt-2 text-red-500">{resetMessage}</p>}
        </form>

      </CardContent>
    </Card>
  );
};

export default ProfileDetailsSection;
