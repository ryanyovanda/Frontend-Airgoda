"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [tokenValid, setTokenValid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL; // Load from .env.local

  // ✅ Step 1: Verify Token
  useEffect(() => {
    if (!token) {
      setMessage("Invalid reset link.");
      setLoading(false);
      return;
    }

    fetch(`${API_BASE_URL}/api/v1/auth/verify-reset-token?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setTokenValid(true);
        } else {
          setMessage("Reset token is invalid or expired.");
        }
      })
      .catch(() => setMessage("Error verifying token."))
      .finally(() => setLoading(false));
  }, [token, API_BASE_URL]);

  // ✅ Step 2: Handle Password Reset Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/auth/change-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword }),
    });

    if (response.ok) {
      setMessage("✅ Password changed successfully!");
      setTimeout(() => router.push("/login"), 2000);
    } else {
      const errorData = await response.json();
      setMessage(errorData.message || "Failed to reset password.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Reset Password</h2>

        {loading ? (
          <p>Verifying token...</p>
        ) : tokenValid ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block font-semibold mb-1">New Password</label>
              <input
                type="password"
                className="w-full border p-2 rounded"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block font-semibold mb-1">Confirm Password</label>
              <input
                type="password"
                className="w-full border p-2 rounded"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded w-full"
            >
              Reset Password
            </button>
          </form>
        ) : (
          <p className="text-red-500">{message}</p>
        )}

        {message && <p className="mt-4 text-center text-red-500">{message}</p>}
      </div>
    </div>
  );
}
