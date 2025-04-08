"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, RefreshCcw, Lock } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileImage } from "@fortawesome/free-solid-svg-icons";

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

const nameSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
});

const ProfileDetailsSection: React.FC<ProfileDetailsProps> = ({ user, setUser }) => {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [resetMessage, setResetMessage] = useState("");

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(nameSchema),
    defaultValues: { name: user.name || "" },
  });

  const BASE_API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080/api/v1";

  const fetchProfileImage = async () => {
    const session = await getSession();
    if (session && session.accessToken && user.id) {
      const res = await fetch(`${BASE_API_URL}/api/v1/users/${user.id}/profile-image`, {
        headers: { Authorization: `Bearer ${session.accessToken}` },
        cache: "no-store",
      });
      if (res.ok) {
        const imageUrl = await res.text();
        setProfileImage(`${imageUrl}?${new Date().getTime()}`);
      }
    }
  };

  useEffect(() => {
    fetchProfileImage();
  }, [user.id]);

  useEffect(() => {
    setValue("name", user.name || "");
  }, [user.name, setValue]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file && file.type.startsWith("image/") && file.size <= 1024 * 1024) {
      setSelectedFile(file);
      setProfileImage(URL.createObjectURL(file));
    } else {
      alert("Only images under 1MB are allowed.");
    }
  };

  const saveChanges = async (data: { name: string }) => {
    setIsUpdating(true);
    try {
      const session = await getSession();
      if (!session || !session.accessToken) throw new Error("Session expired");

      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const res = await fetch(`${BASE_API_URL}/api/v1/users/${user.id}/profile-image`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${session.accessToken}` },
          body: formData,
        });

        if (!res.ok) throw new Error("Failed to upload profile image");
        await fetchProfileImage();
      }

      const nameRes = await fetch(`${BASE_API_URL}/api/v1/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({ name: data.name }),
      });

      if (!nameRes.ok) throw new Error("Failed to update name");

      setUser({ name: data.name });
      alert("Profile updated successfully!");
    } catch (error) {
      alert("Something went wrong.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="max-w-3xl mx-auto p-6 shadow-lg border rounded-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-center">Profile Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center gap-4">
          <div className="w-32 h-40 border overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center">
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <FontAwesomeIcon icon={faFileImage} className="text-gray-500 w-12 h-12" />
            )}
          </div>

          <input type="file" accept="image/*" onChange={handleFileChange} id="fileUpload" hidden />
          <label htmlFor="fileUpload" className="text-sm font-medium text-blue-600 hover:underline cursor-pointer">
            {profileImage ? "Change Picture" : "Upload Picture"}
          </label>
        </div>

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
      </CardContent>
    </Card>
  );
};

export default ProfileDetailsSection;