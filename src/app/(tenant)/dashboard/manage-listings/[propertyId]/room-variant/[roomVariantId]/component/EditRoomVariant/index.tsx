"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import axios from "axios";
import { useSession } from "next-auth/react";

interface RoomVariant {
  id: number;
  name: string;
  price: number;
  maxGuest: number;
  capacity: number;
  facilities: string[];
  propertyId: number;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

const EditRoomVariant = () => {
  const { roomVariantId, propertyId } = useParams();
  const router = useRouter();
  const { data: session } = useSession();

  const [roomVariant, setRoomVariant] = useState<RoomVariant | null>(null);
  const [facilities, setFacilities] = useState<string[]>([]);
  const [facilityInput, setFacilityInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRoomVariant();
  }, [roomVariantId]);

  const fetchRoomVariant = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/room-variants/${roomVariantId}`);
      setRoomVariant(response.data);
      setFacilities(response.data.facilities || []);
    } catch (error) {
      toast.error("Failed to fetch room variant");
      console.error(error);
    }
  };

  const handleAddFacility = () => {
    const trimmed = facilityInput.trim();
    if (!trimmed) return;

    if (facilities.includes(trimmed)) {
      toast.error("Facility already added");
      return;
    }

    if (facilities.length >= 10) {
      toast.error("You can only add up to 10 facilities.");
      return;
    }

    setFacilities((prev) => [...prev, trimmed]);
    setFacilityInput("");
  };

  const handleRemoveFacility = (facility: string) => {
    setFacilities((prev) => prev.filter((f) => f !== facility));
  };

  const handleUpdate = async () => {
    if (!roomVariant || !session?.accessToken) {
      toast.error("Authentication error or missing data.");
      return;
    }

    setLoading(true);

    const updatedData = {
      ...roomVariant,
      facilities,
    };

    try {
      await axios.put(`${BACKEND_URL}/api/room-variants/${roomVariantId}`, updatedData, {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      });

      toast.success("Room variant updated successfully!");
      router.push(`/dashboard/manage-listings/${propertyId}/room-variant`);
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to update room variant");
    } finally {
      setLoading(false);
    }
  };

  if (!roomVariant) return <p className="text-center text-muted">Loading room variant...</p>;

  return (
    <div className="max-w-3xl mx-auto mt-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Edit Room Variant</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Room Name"
            value={roomVariant.name}
            onChange={(e) => setRoomVariant({ ...roomVariant, name: e.target.value })}
          />
          <Input
            placeholder="Price"
            type="number"
            value={roomVariant.price}
            onChange={(e) => setRoomVariant({ ...roomVariant, price: Number(e.target.value) })}
          />
          <Input
            placeholder="Max Guests"
            type="number"
            value={roomVariant.maxGuest}
            onChange={(e) => setRoomVariant({ ...roomVariant, maxGuest: Number(e.target.value) })}
          />
          <Input
            placeholder="Capacity"
            type="number"
            value={roomVariant.capacity}
            onChange={(e) => setRoomVariant({ ...roomVariant, capacity: Number(e.target.value) })}
          />

          <div>
            <label htmlFor="facility" className="block font-medium mb-1">
              Facilities (Max 10)
            </label>
            <div className="flex gap-2 mb-2">
              <Input
                id="facility"
                value={facilityInput}
                onChange={(e) => setFacilityInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddFacility();
                  }
                }}
                placeholder="Add a facility"
              />
              <Button type="button" onClick={handleAddFacility}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {facilities.map((facility) => (
                <div key={facility} className="flex items-center bg-gray-200 px-2 py-1 rounded">
                  <span className="mr-2">{facility}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFacility(facility)}
                    className="text-red-600 hover:text-red-800 font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <Button onClick={handleUpdate} disabled={loading} className="w-full">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin w-4 h-4" /> Saving...
              </span>
            ) : (
              "Save Changes"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditRoomVariant;
