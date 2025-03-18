"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, differenceInDays, isWithinInterval } from "date-fns";
import { Button } from "@/components/ui/button";
import { DateRange } from "react-day-picker";

interface RoomVariant {
  id: number;
  name: string;
  price: number;
}

interface PeakRate {
  id: number;
  roomVariantId: number;
  startDate: string;
  endDate: string;
  additionalPrice: number;
}

interface SessionData {
  accessToken?: string;
  user?: { id: number };
}

interface BookingFormProps {
  propertyId: number;
  roomVariants?: RoomVariant[];
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

const BookingForm: React.FC<BookingFormProps> = ({ propertyId, roomVariants = [] }) => {
  const router = useRouter();
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [guests, setGuests] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [peakRates, setPeakRates] = useState<PeakRate[]>([]);


  useEffect(() => {
    if (selectedRoom) {
      fetchPeakRates(selectedRoom);
    }
  }, [selectedRoom]);


  useEffect(() => {
    calculateFinalPrice();
  }, [dateRange, selectedRoom]);


  const fetchPeakRates = async (roomId: number) => {
    try {
      const response = await fetch(`${BACKEND_URL}/peak-rates`);
      if (!response.ok) throw new Error("Failed to fetch peak rates");

      const allPeakRates = await response.json();

   
      const filteredPeakRates = allPeakRates.filter((rate: PeakRate) => rate.roomVariantId === roomId);

      setPeakRates(filteredPeakRates);
    } catch (error) {
      console.error("Error fetching peak rates:", error);
    }
  };

  const calculateFinalPrice = () => {
    if (!dateRange?.from || !dateRange?.to || !selectedRoom) {
      setTotalPrice(0);
      return;
    }

    const selectedRoomVariant = roomVariants.find((room) => room.id === selectedRoom);
    if (!selectedRoomVariant) return;

    let finalPrice = 0;

    
    let nights = differenceInDays(dateRange.to, dateRange.from);
    if (nights < 1) return;

    for (let i = 0; i < nights; i++) {
      const currentDate = new Date(dateRange.from);
      currentDate.setDate(currentDate.getDate() + i);
      const dateString = format(currentDate, "yyyy-MM-dd");

      let priceForTheDay = selectedRoomVariant.price;

      const peakRate = peakRates.find(
        (rate) =>
          isWithinInterval(new Date(dateString), {
            start: new Date(rate.startDate),
            end: new Date(rate.endDate),
          })
      );

      if (peakRate) {
        priceForTheDay += peakRate.additionalPrice;
      }

      finalPrice += priceForTheDay;
    }

    setTotalPrice(finalPrice);
  };

  const fetchSession = async (): Promise<SessionData | null> => {
    try {
      const res = await fetch("/api/auth/session");
      if (!res.ok) throw new Error("Failed to fetch session");
      return await res.json();
    } catch (error) {
      console.error(" Session fetch error:", error);
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

  

    try {
      const response = await fetch(`${BACKEND_URL}/orders`, {
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
      console.error(" Booking error:", error);
      alert(error instanceof Error ? error.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border p-6 rounded-lg shadow-md">
      <form onSubmit={handleBooking}>
        <label className="block text-lg font-semibold">Room:</label>
        <select
          className="w-full border p-2 rounded"
          value={selectedRoom || ""}
          onChange={(e) => setSelectedRoom(Number(e.target.value))}
          required
        >
          <option value="">Choose Room Variant</option>
          {roomVariants.map((room) => (
            <option key={room.id} value={room.id}>
              {room.name}
            </option>
          ))}
        </select>

        <label className="block mt-4 text-lg font-semibold">Select Check-in & Check-out Dates:</label>
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

        <label className="block mt-4 text-lg font-semibold">Guests:</label>
        <input
          type="number"
          value={guests}
          onChange={(e) => setGuests(parseInt(e.target.value, 10))}
          min={1}
          required
          className="w-full border p-2 rounded"
        />

        {dateRange?.from && dateRange?.to && totalPrice > 0 ? (
          <p className="text-lg font-bold text-gray-800 mt-4">
            Total Price: <span className="text-blue-600">Rp. {totalPrice.toLocaleString()}</span>
          </p>
        ) : (
          <p className="text-gray-500 mt-4">Select dates to see total price.</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="bg-purple-500 text-white p-3 rounded w-full mt-4 font-bold hover:bg-pink-700 transition"
        >
          {loading ? "Booking..." : "Reserve"}
        </button>
      </form>
    </div>
  );
};

export default BookingForm;
