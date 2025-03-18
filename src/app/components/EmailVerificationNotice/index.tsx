"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";

const EmailVerificationNotice = () => {
  const { data: session } = useSession();
  const isVerified = session?.user?.isVerified;

  if (!session || isVerified) return null; 

  return (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
      <p>
        Your email is not verified.
        <Link href="/dashboard/profile" className="text-blue-600 underline">
          Click here
        </Link>
        to verify your email.
      </p>
    </div>
  );
};

export default EmailVerificationNotice;
