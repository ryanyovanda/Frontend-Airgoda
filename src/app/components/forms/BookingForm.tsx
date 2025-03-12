"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, differenceInDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { DateRange } from "react-day-picker";

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
  propertyId: number;
  roomVariants?: RoomVariant[];
}

const BookingForm: React.FC<BookingFormProps> = ({ propertyId, roomVariants = [] }) => {
  const router = useRouter();
  const [selectedRoom, setSelectedRoom] = useState<number | null>(
    roomVariants.length > 0 ? roomVariants[0].id : null
  );
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [guests, setGuests] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalPrice, setTotalPrice] = useState<number>(0);

  useEffect(() => {
    if (dateRange?.from && dateRange?.to && selectedRoom) {
      const selectedRoomVariant = roomVariants.find((room) => room.id === selectedRoom);
      if (selectedRoomVariant) {
        const nights = differenceInDays(dateRange.to, dateRange.from);
        if (nights > 0) {
          setTotalPrice(nights * selectedRoomVariant.price);
        } else {
          setTotalPrice(0);
        }
      }
    }
  }, [dateRange, selectedRoom]);

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

    if (!dateRange?.from || !dateRange?.to || !selectedRoom) {
      alert("Please select a valid date range.");
      setLoading(false);
      return;
    }

    const session = await fetchSession();
    if (!session?.accessToken || !session?.user?.id) {
      alert("Session expired. Please log in again.");
      setLoading(false);
      return;
    }

    const payload = {
      user: { id: session.user.id },
      totalPrice,
      isPaid: false,
      orderItems: [
        {
          roomVariant: { id: selectedRoom },
          startDate: format(dateRange.from, "yyyy-MM-dd"),
          endDate: format(dateRange.to, "yyyy-MM-dd"),
          guest: guests,
        },
      ],
    };

    console.log("Booking Payload:", JSON.stringify(payload, null, 2));

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/orders`, {
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
    <div className="border p-6 rounded-lg shadow-md">
      <form onSubmit={handleBooking}>
        {/* Select Room Variant */}
        <label className="block">Room:</label>
        <select
          className="w-full border p-2 rounded"
          value={selectedRoom || ""}
          onChange={(e) => setSelectedRoom(Number(e.target.value))}
          required
        >
          {roomVariants.map((room) => (
            <option key={room.id} value={room.id}>
              {room.name} - Rp. {room.price.toLocaleString()} / night
            </option>
          ))}
        </select>

        {/* Date Picker with Range Selection */}
        <label className="block mt-4">Select Check-in & Check-out Dates:</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full text-left">
              {dateRange?.from && dateRange?.to
                ? `${format(dateRange.from, "PPP")} → ${format(dateRange.to, "PPP")}`
                : "Select a date range"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={setDateRange}
              disabled={(date) => date < new Date()}
            />
          </PopoverContent>
        </Popover>

        {/* Guests Selection */}
        <label className="block mt-4">Guests:</label>
        <input
          type="number"
          value={guests}
          onChange={(e) => setGuests(parseInt(e.target.value, 10))}
          min={1}
          required
          className="w-full border p-2 rounded"
        />

        {/* Show Total Price */}
        {dateRange?.from && dateRange?.to && totalPrice > 0 ? (
          <p className="text-lg font-bold text-gray-800 mt-4">
            Total Price: <span className="text-blue-600">Rp. {totalPrice.toLocaleString()}</span>
          </p>
        ) : (
          <p className="text-gray-500 mt-4">Select dates to see total price.</p>
        )}

        {/* Confirm Booking Button */}
        <button
          type="submit"
          disabled={loading}
          className="bg-pink-600 text-white p-3 rounded w-full mt-4 font-bold hover:bg-pink-700 transition"
        >
          {loading ? "Booking..." : "Reserve"}
        </button>
      </form>
    </div>
  );
};

export default BookingForm;
