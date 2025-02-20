"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchData } from "@/constants/api";

const BookingForm = ({ propertyId, roomVariants = [] }) => { 

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [selectedRoomVariant, setSelectedRoomVariant] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (roomVariants.length > 0) {
      setSelectedRoomVariant(roomVariants[0].id);
    }
  }, [roomVariants]);

  const handleBooking = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let session = await fetch("/api/auth/session").then((res) => res.json());

      const response = await fetchData("/orders", "POST", {
        user: { id: session?.user?.id },
        totalPrice: 0, // Will be calculated backend-side
        isPaid: false,
        orderItems: [
          {
            roomVariant: { id: selectedRoomVariant },
            startDate: checkIn,
            endDate: checkOut,
            guest: guests,
          },
        ],
      }, session?.user?.jwt);

      const responseData = await response.json();
      console.log("Response Status:", response.status);
      console.log("Response Data:", responseData);

      if (response.ok) {
        alert("Booking successful!");
        router.push("/dashboard");
      } else {
        alert(Booking failed: ${responseData.message || "Unknown error"});
      }
    } catch (error) {
      console.error("Error booking property:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border p-4 rounded shadow-md">
      <label className="block">Select Room Variant:</label>
      <select
        value={selectedRoomVariant}
        onChange={(e) => setSelectedRoomVariant(e.target.value)}
        required
        className="w-full border p-2 rounded"
      >
        {roomVariants.map((room) => (
          <option key={room.id} value={room.id}>
            {room.name} - Rp. {room.price} / night
          </option>
        ))}
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
        onChange={(e) => setGuests(e.target.value)}
        min="1"
        required
        className="w-full border p-2 rounded"
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-500 text-white p-2 rounded w-full mt-4"
        onClick={handleBooking}
      >
        {loading ? "Booking..." : "Confirm Booking"}
      </button>
    </div>
  );
};

export default BookingForm;