"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const VerifyEmailPage = () => {
  const [status, setStatus] = useState<"loading" | "success" | "error" | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setStatus("error");
    }
  }, [token]);

  const handleVerify = async () => {
    if (!token) return;

    try {
      const res = await fetch("http://localhost:8080/api/v1/users/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      if (!res.ok) throw new Error("Verification failed");

      setStatus("success");
      alert("✅ Email successfully verified! Redirecting...");
      setTimeout(() => {
        router.push("/profile"); // Redirect to profile page
      }, 2000);
    } catch (error) {
      console.error("🚨 Verification Error:", error);
      setStatus("error");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-semibold">Email Verification</h1>
        {status === "error" && <p className="text-red-500">Invalid verification link.</p>}
        {status === "success" ? (
          <p className="text-green-500">Your email has been verified! ✅ Redirecting...</p>
        ) : (
          <>
            <p className="text-gray-600">Click the button below to verify your email.</p>
            <button
              onClick={handleVerify}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Verify Email
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
