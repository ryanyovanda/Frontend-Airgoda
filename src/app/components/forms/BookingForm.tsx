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

  // Debugging: Log roomVariants data
  useEffect(() => {
    console.log("🔍 roomVariants received in BookingForm:", roomVariants);
  }, [roomVariants]);

  // Ensure roomVariants has a default selected room
  useEffect(() => {
    if (Array.isArray(roomVariants) && roomVariants.length > 0) {
      setSelectedRoomVariant(roomVariants[0].id);
    }
  }, [roomVariants]);

  const handleBooking = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const session = await fetch("/api/auth/session").then((res) => res.json());
      console.log("🔍 Session Data:", session); // Debugging log

      if (!session || !session.accessToken || !session.user?.id) {
        console.error("🚨 Session is invalid. Redirecting to login.");
        alert("Session expired. Please log in again.");
        return;
      }

      const payload = {
        user: { id: session.user.id },
        totalPrice: 0, // Backend will handle the calculation
        isPaid: false,
        orderItems: [
          {
            roomVariant: { id: selectedRoomVariant },
            startDate: checkIn,
            endDate: checkOut,
            guest: guests,
          },
        ],
      };

      console.log("📦 Booking Payload:", payload); // Debugging log before API call

      const response = await fetchData("/orders", "POST", payload);
      const responseData = await response.json();
      
      console.log("✅ Response Status:", response.status);
      console.log("✅ Response Data:", responseData);

      if (response.ok) {
        alert("🎉 Booking successful!");
        router.push("/dashboard");
      } else {
        alert(`Booking failed: ${responseData.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("❌ Error booking property:", error);
      alert("An error occurred. Please try again.");
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
          onChange={(e) => setSelectedRoomVariant(e.target.value)}
          required
          className="w-full border p-2 rounded"
        >
          {Array.isArray(roomVariants) && roomVariants.length > 0 ? (
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
          min="1"
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