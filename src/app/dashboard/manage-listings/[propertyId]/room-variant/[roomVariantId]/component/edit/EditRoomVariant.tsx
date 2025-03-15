"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner"; // Using Sonner for toast notifications
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { PlusCircle, Loader2 } from "lucide-react";

interface RoomVariant {
  id: number;
  name: string;
  price: number;
  maxGuest: number;
  capacity: number;
  facilities: string[];
  propertyId: number;
}

const defaultFacilities = [
  "Single Bed", "Double Bed", "WiFi", "TV", "Air Conditioner",
  "Refrigerator", "Bathtub", "Balcony", "Kitchen", "Mini Bar"
];

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

const EditRoomVariant = () => {
  const { roomVariantId, propertyId } = useParams();
  const router = useRouter();
  const [roomVariant, setRoomVariant] = useState<RoomVariant | null>(null);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [customFacility, setCustomFacility] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [facilitiesOptions, setFacilitiesOptions] = useState<string[]>(defaultFacilities);

  useEffect(() => {
    fetchRoomVariant();
  }, []);

  const fetchRoomVariant = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/room-variants/${roomVariantId}`);
      if (!response.ok) throw new Error("Failed to fetch room variant");

      const data: RoomVariant = await response.json();
      setRoomVariant(data);
      setSelectedFacilities(data.facilities);
    } catch (error) {
      console.error("Error fetching room variant:", error);
    }
  };

  const handleUpdate = async () => {
    if (!roomVariant) return;
    setLoading(true);

    const updatedData = {
      ...roomVariant,
      facilities: selectedFacilities,
    };

    try {
      const response = await fetch(`${BACKEND_URL}/api/room-variants/${roomVariantId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) throw new Error("Failed to update room variant");

      toast.success("Room variant updated successfully!");
      router.push(`/dashboard/manage-listings/${propertyId}`);
    } catch (error) {
      console.error("Error updating room variant:", error);
      toast.error("Failed to update room variant");
    } finally {
      setLoading(false);
    }
  };

  const handleFacilityChange = (facility: string) => {
    setSelectedFacilities((prev) =>
      prev.includes(facility) ? prev.filter((f) => f !== facility) : [...prev, facility]
    );
  };

  const handleAddFacility = () => {
    if (customFacility.trim() === "" || selectedFacilities.length >= 10) return;

    if (!facilitiesOptions.includes(customFacility)) {
      setFacilitiesOptions([...facilitiesOptions, customFacility]);
    }

    setSelectedFacilities([...selectedFacilities, customFacility]);
    setCustomFacility("");
  };

  if (!roomVariant) return <p className="text-center">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto mt-8 p-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Edit Room Variant</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <Input
              placeholder="Room Name"
              value={roomVariant.name}
              onChange={(e) => setRoomVariant({ ...roomVariant, name: e.target.value })}
            />

            <Input
              placeholder="Price"
              type="number"
              value={roomVariant.price}
              onChange={(e) => setRoomVariant({ ...roomVariant, price: parseInt(e.target.value) })}
            />

            <Input
              placeholder="Max Guests"
              type="number"
              value={roomVariant.maxGuest}
              onChange={(e) => setRoomVariant({ ...roomVariant, maxGuest: parseInt(e.target.value) })}
            />

            <Input
              placeholder="Capacity"
              type="number"
              value={roomVariant.capacity}
              onChange={(e) => setRoomVariant({ ...roomVariant, capacity: parseInt(e.target.value) })}
            />

            {/* Facilities Checkbox Group */}
            <div className="space-y-2">
              <p className="font-semibold">Facilities (Max 10)</p>
              <div className="grid grid-cols-2 gap-2">
                {facilitiesOptions.map((facility) => (
                  <label key={facility} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedFacilities.includes(facility)}
                      onChange={() => handleFacilityChange(facility)}
                      className="accent-blue-500"
                    />
                    <span>{facility}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Add Custom Facility */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="mt-2 flex items-center gap-2">
                  <PlusCircle size={18} />
                  Add Custom Facility
                </Button>
              </DialogTrigger>
              <DialogContent>
                <div className="p-4 space-y-4">
                  <Input
                    placeholder="Enter new facility"
                    value={customFacility}
                    onChange={(e) => setCustomFacility(e.target.value)}
                  />
                  <Button onClick={handleAddFacility} disabled={selectedFacilities.length >= 10}>
                    Add
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Save Button */}
            <Button onClick={handleUpdate} disabled={loading} className="mt-4">
              {loading ? <Loader2 className="animate-spin mr-2" /> : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditRoomVariant;
