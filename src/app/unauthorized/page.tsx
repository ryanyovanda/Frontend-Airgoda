"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-purple-100">
      <Card className="w-[400px] shadow-lg border-2 border-purple-500">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-purple-700">Access Denied</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-gray-700">
          <p className="mb-4">You do not have permission to access this page.</p>
          <div className="flex justify-center gap-4">
            <Button variant="outline" className="border-purple-500 text-purple-700 hover:bg-purple-100" onClick={() => router.back()}>
              Go Back
            </Button>
            <Link href="/">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">Go to Home</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
