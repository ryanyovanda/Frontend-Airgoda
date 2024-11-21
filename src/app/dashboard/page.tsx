"use client";

import { API_URL } from "@/constants/url";
import { useSession } from "next-auth/react";
import { FC, useEffect } from "react";

const DashboardPage: FC = () => {
  const { data: session } = useSession();

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (session && session.accessToken) {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}${API_URL.user.detail}/${session.user.id}`,
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          }
        );

        if (!response.ok) {
          console.error("Failed to fetch dashboard data");
        }

        const data = await response.json();
        console.log(data);
      }
    };
    fetchDashboardData();
  }, [session]);
  return (
    <div>
      <h1>Dashboard</h1>
    </div>
  );
};

export default DashboardPage;
