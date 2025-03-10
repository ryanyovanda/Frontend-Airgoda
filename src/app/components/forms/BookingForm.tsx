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
  propertyId: string;
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

  const fetchSession = async (): Promise<SessionData | null> => {
    try {
      console.log("🔍 Fetching session data...");
      const res = await fetch("/api/auth/session");
      if (!res.ok) throw new Error("Failed to fetch session");
      const data = await res.json();
      console.log("✅ Session fetched:", data);
      return data;
    } catch (error) {
      console.error("❌ Session fetch error:", error);
      return null;
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    console.log("🔍 Fetching session data...");
    const session = await fetchSession();
    if (!session?.accessToken || !session?.user?.id) {
        console.error("❌ No valid session found:", session);
        alert("Session expired. Please log in again.");
        setLoading(false);
        return;
    }
    
    const payload = {
        user: { id: session.user.id },
        totalPrice: 0,
        isPaid: false,
        orderItems: [
            {
                roomVariant: { id: Number(selectedRoomVariant) },
                startDate: checkIn,
                endDate: checkOut,
                guest: guests,
            },
        ],
    };

    console.log("📌 Booking Request Payload:", JSON.stringify(payload, null, 2));

    // Ensure NEXT_PUBLIC_BACKEND_URL is defined
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
        console.error("❌ Missing environment variable: NEXT_PUBLIC_BACKEND_URL");
        alert("Backend URL is not set. Please check your environment variables.");
        setLoading(false);
        return;
    }

    try {
        const response = await fetch(`${backendUrl}/orders`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${session.accessToken}`,
                "Content-Type": "application/json",
            },
            credentials: "include", // 🔹 Important for CORS
            body: JSON.stringify(payload),
        });

        console.log("📌 Response Status:", response.status);

        if (!response.ok) {
            let errorMessage = "Unknown error occurred.";
            try {
                const errorData = await response.json();
                console.error("❌ API Error Response:", errorData);
                errorMessage = errorData.message || errorMessage;
            } catch (jsonError) {
                console.error("❌ Failed to parse API error response:", jsonError);
            }
            alert(`Booking failed: ${errorMessage}`);
            return;
        }

        const responseData = await response.json();
        console.log("✅ Booking Success:", responseData);
        alert("🎉 Booking successful!");
        router.push("/dashboard");
    } catch (error) {
        console.error("❌ Network or Unexpected Error:", error);
        alert(`An unexpected error occurred: ${error instanceof Error ? error.message : error}`);
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