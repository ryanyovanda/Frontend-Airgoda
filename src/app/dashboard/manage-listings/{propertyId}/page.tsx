"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import axios from "axios";

interface RoomVariant {
  id: string;
  type: string;
  maxGuests: number;
  facilities: string[];
  price: number;
  availability: boolean;
}

interface Property {
  id: string;
  name: string;
  location: string;
  description: string;
  basePrice: number;
  isAvailable: boolean;
  roomVariants: RoomVariant[];
}

export default function ManageProperty() {
  const { propertyId } = useParams();
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProperty() {
      try {
        const response = await axios.get(`/api/properties/${propertyId}`);
        setProperty(response.data);
      } catch (error) {
        console.error("Error fetching property:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProperty();
  }, [propertyId]);

  const handleSave = async () => {
    try {
      await axios.put(`/api/properties/${propertyId}`, property);
      alert("Property updated successfully!");
    } catch (error) {
      console.error("Error updating property:", error);
    }
  };

  const handleRoomEdit = (roomId: string) => {
    router.push(`/dashboard/manage-listings/${propertyId}/rooms/${roomId}`);
  };

  return (
    <div className="p-6">
      {loading ? (
        <p>Loading property details...</p>
      ) : property ? (
        <>
          <h1 className="text-2xl font-semibold mb-4">Manage Property</h1>

          <div className="mb-6">
            <Input
              type="text"
              placeholder="Property Name"
              value={property.name}
              onChange={(e) => setProperty({ ...property, name: e.target.value })}
            />
            <Input
              type="text"
              placeholder="Location"
              value={property.location}
              onChange={(e) => setProperty({ ...property, location: e.target.value })}
              className="mt-2"
            />
            <Input
              type="number"
              placeholder="Base Price"
              value={property.basePrice}
              onChange={(e) => setProperty({ ...property, basePrice: parseFloat(e.target.value) })}
              className="mt-2"
            />
            <label className="mt-2 flex items-center">
              <input
                type="checkbox"
                checked={property.isAvailable}
                onChange={(e) => setProperty({ ...property, isAvailable: e.target.checked })}
              />
              <span className="ml-2">Available</span>
            </label>
          </div>

          <h2 className="text-xl font-semibold mt-6">Room Variants</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Max Guests</TableHead>
                <TableHead>Facilities</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Availability</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {property.roomVariants.map((room) => (
                <TableRow key={room.id}>
                  <TableCell>{room.type}</TableCell>
                  <TableCell>{room.maxGuests}</TableCell>
                  <TableCell>{room.facilities.join(", ")}</TableCell>
                  <TableCell>${room.price.toFixed(2)}</TableCell>
                  <TableCell>{room.availability ? "Available" : "Unavailable"}</TableCell>
                  <TableCell>
                    <Button variant="outline" onClick={() => handleRoomEdit(room.id)}>Edit</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Button onClick={handleSave} className="mt-6">Save Changes</Button>
        </>
      ) : (
        <p>Property not found.</p>
      )}
    </div>
  );
}
