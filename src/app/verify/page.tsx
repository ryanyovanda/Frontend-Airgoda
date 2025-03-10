"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

const VerifyEmailPage = () => {
  const { data: session, status } = useSession(); // ✅ Get session token from NextAuth
  const [statusMessage, setStatusMessage] = useState<"loading" | "success" | "error" | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (status === "loading") return; // ✅ Wait for session to load

    if (!session?.accessToken) {
      console.error("🚨 No authentication token found. Redirecting to login.");
      setStatusMessage("error");
      setErrorMessage("Session expired. Please log in again.");
      router.push("/login");
      return;
    }

    if (!token) {
      console.error("🚨 No verification token found in URL.");
      setStatusMessage("error");
      setErrorMessage("Verification token is missing.");
      return;
    }

    const handleVerify = async () => {
      try {
        console.log("🔍 Sending verification request with token:", token);
        console.log("🔐 Using session auth token:", session.accessToken);

        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/verify?token=${token}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          const errorResponse = await res.json();
          console.error("❌ Server error response:", errorResponse);
          throw new Error(errorResponse.message || "Verification failed");
        }

        setStatusMessage("success");
        alert("✅ Email successfully verified! Redirecting...");
        setTimeout(() => {
          router.push("/profile"); // Redirect after verification
        }, 2000);
      } catch (error) {
        console.error("🚨 Verification Error:", error);
        setStatusMessage("error");
        setErrorMessage(error instanceof Error ? error.message : "Something went wrong.");
      }
    };

    handleVerify();
  }, [status, session, token, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-semibold">Email Verification</h1>
        {statusMessage === "error" && <p className="text-red-500">{errorMessage || "Verification failed."}</p>}
        {statusMessage === "success" ? (
          <p className="text-green-500">Your email has been verified! ✅ Redirecting...</p>
        ) : (
          <p className="text-gray-600">Verifying your email, please wait...</p>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
