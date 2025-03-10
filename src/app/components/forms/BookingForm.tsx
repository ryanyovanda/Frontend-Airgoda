"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface RoomVariant {
  id: number;
  name: string;
  price: number;
}

interface SessionData {
  accessToken?: string;
  user?: { id: number };
}

interface BookingFormProps {
  propertyId: number; // ✅ Ensure propertyId is a number and used
  roomVariants?: RoomVariant[];
}

const BookingForm: React.FC<BookingFormProps> = ({ propertyId, roomVariants = [] }) => {
  const [checkIn, setCheckIn] = useState<string>("");
  const [checkOut, setCheckOut] = useState<string>("");
  const [guests, setGuests] = useState<number>(1);
  const [selectedRoomVariant, setSelectedRoomVariant] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    if (roomVariants.length > 0) {
      setSelectedRoomVariant(roomVariants[0].id);
    }
  }, [roomVariants]);

  const fetchSession = async (): Promise<SessionData | null> => {
    try {
      const res = await fetch("/api/auth/session");
      if (!res.ok) throw new Error("Failed to fetch session");
      return await res.json();
    } catch (error) {
      console.error("❌ Session fetch error:", error);
      return null;
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const session = await fetchSession();
    if (!session?.accessToken || !session?.user?.id) {
      alert("Session expired. Please log in again.");
      setLoading(false);
      return;
    }

    if (!selectedRoomVariant) {
      alert("Please select a room variant.");
      setLoading(false);
      return;
    }

    const payload = {
      userId: session.user.id,
      propertyId, // ✅ Now used in the request
      roomVariantId: selectedRoomVariant,
      checkIn,
      checkOut,
      guests,
      isPaid: false,
      totalPrice: 0,
    };

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!backendUrl) {
        throw new Error("Backend URL is not set in environment variables.");
      }

      const response = await fetch(`${backendUrl}/orders`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Booking failed.");
      }

      alert("🎉 Booking successful!");
      router.push("/dashboard");
    } catch (error) {
      console.error("❌ Booking error:", error);
      alert(error instanceof Error ? error.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border p-4 rounded shadow-md">
      <form onSubmit={handleBooking}>
        <label className="block">Select Room Variant:</label>
        <select
          value={selectedRoomVariant || ""}
          onChange={(e) => setSelectedRoomVariant(Number(e.target.value))}
          required
          className="w-full border p-2 rounded"
        >
          {roomVariants.length > 0 ? (
            roomVariants.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name} - Rp. {room.price} / night
              </option>
            ))
          ) : (
            <option value="">No available rooms</option>
          )}
        </select>

        <label className="block mt-2">Check-in Date:</label>
        <input
          type="date"
          value={checkIn}
          onChange={(e) => setCheckIn(e.target.value)}
          required
          className="w-full border p-2 rounded"
        />

        <label className="block mt-2">Check-out Date:</label>
        <input
          type="date"
          value={checkOut}
          onChange={(e) => setCheckOut(e.target.value)}
          required
          className="w-full border p-2 rounded"
        />

        <label className="block mt-2">Guests:</label>
        <input
          type="number"
          value={guests}
          onChange={(e) => setGuests(parseInt(e.target.value, 10))}
          min={1}
          required
          className="w-full border p-2 rounded"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white p-2 rounded w-full mt-4"
        >
          {loading ? "Booking..." : "Confirm Booking"}
        </button>
      </form>
    </div>
  );
};

export default BookingForm;
