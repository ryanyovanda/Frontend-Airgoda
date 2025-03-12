"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import axios from "axios";

interface RoomVariant {
  id: string;
  type: string;
  maxGuests: number;
  facilities: string[];
  price: number;
  availability: boolean;
}

export default function ManageRoomVariant() {
  const { roomId } = useParams();
  const router = useRouter();
  const [room, setRoom] = useState<RoomVariant | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);

  const availableFacilities = ["WiFi", "AC", "TV", "Pool", "Kitchen"];

  useEffect(() => {
    async function fetchRoom() {
      try {
        const response = await axios.get(`/api/room-variants/${roomId}`);
        setRoom(response.data);
        setSelectedFacilities(response.data.facilities || []);
      } catch (error) {
        console.error("Error fetching room details:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRoom();
  }, [roomId]);

  const handleSave = async () => {
    if (!room) return;
    try {
      await axios.put(`/api/room-variants/${roomId}`, {
        ...room,
        facilities: selectedFacilities,
      });
      alert("Room updated successfully!");
      router.back();
    } catch (error) {
      console.error("Error updating room:", error);
    }
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this room?")) {
      try {
        await axios.delete(`/api/room-variants/${roomId}`);
        alert("Room deleted successfully!");
        router.back();
      } catch (error) {
        console.error("Error deleting room:", error);
      }
    }
  };

  const toggleFacility = (facility: string) => {
    setSelectedFacilities((prev) =>
      prev.includes(facility) ? prev.filter((f) => f !== facility) : [...prev, facility]
    );
  };

  return (
    <div className="p-6">
      {loading ? (
        <p>Loading room details...</p>
      ) : room ? (
        <>
          <h1 className="text-2xl font-semibold mb-4">Manage Room Variant</h1>

          <Input
            type="text"
            placeholder="Room Type"
            value={room.type}
            onChange={(e) => setRoom({ ...room, type: e.target.value })}
          />
          <Input
            type="number"
            placeholder="Max Guests"
            value={room.maxGuests}
            onChange={(e) => setRoom({ ...room, maxGuests: parseInt(e.target.value) })}
            className="mt-2"
          />
          <Input
            type="number"
            placeholder="Price"
            value={room.price}
            onChange={(e) => setRoom({ ...room, price: parseFloat(e.target.value) })}
            className="mt-2"
          />

          <div className="mt-4">
            <h3 className="font-semibold">Facilities</h3>
            {availableFacilities.map((facility) => (
              <label key={facility} className="flex items-center mt-2">
                <Checkbox
                  checked={selectedFacilities.includes(facility)}
                  onCheckedChange={() => toggleFacility(facility)}
                />
                <span className="ml-2">{facility}</span>
              </label>
            ))}
          </div>

          <label className="mt-4 flex items-center">
            <input
              type="checkbox"
              checked={room.availability}
              onChange={(e) => setRoom({ ...room, availability: e.target.checked })}
            />
            <span className="ml-2">Available</span>
          </label>

          <div className="flex mt-6">
            <Button onClick={handleSave}>Save Changes</Button>
            <Button variant="destructive" onClick={handleDelete} className="ml-4">
              Delete Room
            </Button>
          </div>
        </>
      ) : (
        <p>Room not found.</p>
      )}
    </div>
  );
}
