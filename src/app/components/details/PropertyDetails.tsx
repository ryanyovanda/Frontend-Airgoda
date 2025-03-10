"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface RoomVariant {
  id: number;
  name: string;
  price: number;
}

interface BookingFormProps {
  propertyId: number;  // ✅ Ensure propertyId is included
  roomVariants?: RoomVariant[];
}

const BookingForm: React.FC<BookingFormProps> = ({ propertyId, roomVariants = [] }) => {
  const [checkIn, setCheckIn] = useState<string>("");
  const [checkOut, setCheckOut] = useState<string>("");
  const [guests, setGuests] = useState<number>(1);
  const [selectedRoomVariant, setSelectedRoomVariant] = useState<number | "">("");
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    if (roomVariants.length > 0) {
      setSelectedRoomVariant(roomVariants[0].id);
    }
  }, [roomVariants]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,  // ✅ Ensure propertyId is included in the booking request
          roomVariantId: selectedRoomVariant,
          checkIn,
          checkOut,
          guests,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to book the room.");
      }

      alert("Booking successful!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Booking error:", error);
      alert("Booking failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border p-4 rounded shadow-md">
      <form onSubmit={handleBooking}>
        <label className="block">Select Room Variant:</label>
        <select
          value={selectedRoomVariant}
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
