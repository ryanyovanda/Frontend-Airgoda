"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faEdit, faTrash, faHouse } from "@fortawesome/free-solid-svg-icons";

interface Property {
  id: string;
  name: string;
  location: { id: string; name: string } | null;
  isActive: boolean; 
  totalRoomVariants: number;
  categoryId: number;
}

interface Category {
  id: number;
  name: string;
}

export default function ManageListings() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        const sessionResponse = await axios.get("/api/auth/session");
        const tenantId = sessionResponse.data.user.id;
        const accessToken = sessionResponse.data.accessToken;

        const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

       
        const categoryResponse = await axios.get(`${BACKEND_URL}/categories`);
        setCategories(categoryResponse.data);

        const propertyResponse = await axios.get(`${BACKEND_URL}/api/properties/tenant?tenantId=${tenantId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        setProperties(propertyResponse.data);
      } catch (error) {
        toast.error("Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleEdit = (id: string) => {
    router.push(`/dashboard/manage-listings/${id}`);
  };

  const handleRoomVariant = (id: string) => {
    router.push(`/dashboard/manage-listings/${id}/room-variant`);
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this property?")) {
      try {
        await axios.delete(`/api/properties/${id}`);
        setProperties((prev) => prev.filter((property) => property.id !== id));
        toast.success("Property deleted successfully.");
      } catch (error) {
        toast.error("Error deleting property.");
      }
    }
  };

  const getCategoryName = (categoryId: number) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : "Unknown";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 flex justify-center">
      <Card className="w-full max-w-5xl shadow-xl">
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className="text-purple-600 text-2xl"><FontAwesomeIcon icon={faHouse} className="mr-2" /> Manage Your Listings</CardTitle>
          <Button onClick={() => router.push("/dashboard/manage-listings/new")}>
            <FontAwesomeIcon icon={faPlus} className="mr-2" /> Add New Property
          </Button>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-center">Loading properties...</p>
          ) : properties.length === 0 ? (
            <p className="text-center">No properties found. Click "Add New Property" to create one.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rooms</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {properties.map((property) => (
                  <TableRow key={property.id}>
                    <TableCell>{property.name}</TableCell>
                    <TableCell>{property.location?.name || "Unknown"}</TableCell>
                    <TableCell>
                    <span
                      className={`px-2 py-1 rounded-md text-sm font-medium ${
                        property.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {property.isActive ? "Active" : "Inactive"}
                    </span>
                  </TableCell>

                    <TableCell>{property.totalRoomVariants}</TableCell>
                    <TableCell>{getCategoryName(property.categoryId)}</TableCell> 
                    <TableCell className="flex gap-2">
                      <Button variant="outline" onClick={() => handleRoomVariant(property.id)}>
                      <FontAwesomeIcon icon={faEdit} className="mr-1" /> Room Variant
                      </Button>
                      <Button variant="outline" onClick={() => handleEdit(property.id)}>
                        <FontAwesomeIcon icon={faEdit} className="mr-1" /> Edit
                      </Button>
                      <Button variant="destructive" onClick={() => handleDelete(property.id)}>
                        <FontAwesomeIcon icon={faTrash} className="mr-1" /> Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
