"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"; // ShadCN UI Button
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import axios from "axios";

interface Property {
  id: string;
  name: string;
  location: string;
  isAvailable: boolean;
  totalRoomVariants: number;
}

export default function ManageListings() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchProperties() {
      try {
        console.log("🔍 Fetching tenant ID...");
        let sessionResponse = await axios.get("/api/auth/session");
        let tenantId = sessionResponse.data.user.id;
        let accessToken = sessionResponse.data.accessToken;
        const refreshToken = sessionResponse.data.refreshToken;
        console.log("✅ Tenant ID:", tenantId);
        console.log("🔍 Checking token validity...");

        const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

        // Attempt to fetch properties
        try {
          console.log("🔍 Fetching properties...");
          const response = await axios.get(`${BACKEND_URL}/api/properties/tenant?tenantId=${tenantId}`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          console.log("✅ Properties received:", response.data);
          setProperties(response.data);
        } catch (error) {
          // If the error is 401 (Unauthorized), try refreshing the token
          if (error.response?.status === 401) {
            console.warn("⚠️ Access token expired. Attempting to refresh...");
            const refreshResponse = await axios.post(`${BACKEND_URL}/api/auth/refresh`, { refreshToken });

            // If refresh successful, update accessToken and retry the request
            accessToken = refreshResponse.data.accessToken;
            sessionStorage.setItem("accessToken", accessToken);

            console.log("🔄 Token refreshed. Retrying request...");
            const retryResponse = await axios.get(`${BACKEND_URL}/api/properties/tenant?tenantId=${tenantId}`, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            });

            console.log("✅ Properties received after retry:", retryResponse.data);
            setProperties(retryResponse.data);
          } else {
            throw error;
          }
        }
      } catch (error) {
        console.error("❌ Error fetching properties:", error.response ? error.response.data : error);
      } finally {
        setLoading(false);
      }
    }

    fetchProperties();
  }, []);

  const handleEdit = (id: string) => {
    router.push(`/dashboard/manage-listings/${id}`);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this property?")) {
      try {
        await axios.delete(`/api/properties/${id}`);
        setProperties(properties.filter((property) => property.id !== id));
      } catch (error) {
        console.error("Error deleting property:", error);
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Manage Your Listings</h1>
        <Button onClick={() => router.push("/dashboard/manage-listings/new")}>Add New Property</Button>
      </div>

      {loading ? (
        <p>Loading properties...</p>
      ) : properties.length === 0 ? (
        <p>No properties found. Click "Add New Property" to create one.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Property Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Room Variants</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {properties.map((property) => (
              <TableRow key={property.id}>
                <TableCell>{property.name}</TableCell>
                <TableCell>{property.location?.name || "Unknown Location"}</TableCell>
                <TableCell>{property.isAvailable ? "Active" : "Inactive"}</TableCell>
                <TableCell>{property.totalRoomVariants}</TableCell>
                <TableCell className="flex gap-2">
                  <Button variant="outline" onClick={() => handleEdit(property.id)}>Edit</Button>
                  <Button variant="destructive" onClick={() => handleDelete(property.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
