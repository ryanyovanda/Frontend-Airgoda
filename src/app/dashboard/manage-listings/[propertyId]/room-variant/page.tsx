"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation"; // ✅ Import useParams
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
import { faPlus, faEdit, faCalendarAlt } from "@fortawesome/free-solid-svg-icons";

// Define Room Variant Type
interface RoomVariant {
  id: number;
  name: string;
  capacity: number;
  price: number;
  facilities: string[];
}

export default function RoomVariantList() {
  const params = useParams(); // ✅ Use useParams hook
  const propertyId = params.propertyId as string; // ✅ Extract propertyId safely
  const router = useRouter();
  
  const [roomVariants, setRoomVariants] = useState<RoomVariant[]>([]);
  const [propertyName, setPropertyName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

        // Fetch Room Variants
        const roomVariantRes = await axios.get(`${API_BASE_URL}/api/room-variants/property/${propertyId}`);
        setRoomVariants(roomVariantRes.data);

        // Fetch Property Name
        const propertyRes = await axios.get(`${API_BASE_URL}/api/properties/${propertyId}`);
        setPropertyName(propertyRes.data.name);
      } catch (err) {
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    }

    if (propertyId) {
      fetchData();
    }
  }, [propertyId]);

  const handleAddRoomVariant = () => {
    router.push(`/dashboard/manage-listings/${propertyId}/room-variant/new`);
  };

  const handleEditRoomVariant = (roomVariantId: number) => {
    router.push(`/dashboard/manage-listings/${propertyId}/room-variant/${roomVariantId}`);
  };

  const handleManagePeakRates = (roomVariantId: number) => {
    router.push(`/dashboard/manage-listings/${propertyId}/room-variant/${roomVariantId}/peak-rates`);
  };

  if (loading) return <p className="text-center py-12">Loading room variants...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 flex justify-center">
      <Card className="w-full max-w-5xl shadow-xl">
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className="text-purple-600 text-2xl">🏨 {propertyName} - Room Variants</CardTitle>
          <Button onClick={handleAddRoomVariant} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
            <FontAwesomeIcon icon={faPlus} className="mr-2" /> Add Room Variant
          </Button>
        </CardHeader>

        <CardContent>
          {roomVariants.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No room variants available.</p>
              <Button onClick={handleAddRoomVariant} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
                Add Room Variant
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Facilities</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roomVariants.map((variant) => (
                  <TableRow key={variant.id}>
                    <TableCell>{variant.name}</TableCell>
                    <TableCell>{variant.capacity}</TableCell>
                    <TableCell>Rp {variant.price.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {variant.facilities.length > 0 ? (
                          variant.facilities.map((facility, index) => (
                            <span key={index} className="bg-gray-200 px-2 py-1 rounded text-sm">
                              {facility}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500">No Facilities</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="flex gap-2">
                      <Button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg"
                        onClick={() => handleEditRoomVariant(variant.id)}
                      >
                        <FontAwesomeIcon icon={faEdit} className="mr-2" /> Edit
                      </Button>
                      <Button
                        className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg"
                        onClick={() => handleManagePeakRates(variant.id)}
                      >
                        <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" /> Peak Rates
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
