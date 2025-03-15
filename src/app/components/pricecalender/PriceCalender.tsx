"use client";

import { useState, useEffect } from "react";
import { format, addMonths, subMonths, isBefore, startOfToday } from "date-fns";

interface PeakRate {
  startDate: string;
  endDate: string;
  additionalPrice: number;
  roomVariantId: number; 
}


interface PriceCalendarProps {
  propertyId: number;
  selectedRoomVariant: number | null;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

const PriceCalendar: React.FC<PriceCalendarProps> = ({ propertyId, selectedRoomVariant }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [basePrice, setBasePrice] = useState<number | null>(null);
  const [peakRates, setPeakRates] = useState<PeakRate[]>([]);

  useEffect(() => {
    if (selectedRoomVariant) {
      fetchRoomPrice(selectedRoomVariant);
    }
  }, [selectedRoomVariant]);

  useEffect(() => {
    if (selectedRoomVariant) {
      fetchRoomPrice(selectedRoomVariant);
      fetchPeakRates(selectedRoomVariant); // ✅ Fetch only relevant peak rates
    }
  }, [selectedRoomVariant]);
  

  const fetchRoomPrice = async (roomId: number) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/room-variants`);
      if (!response.ok) throw new Error("Failed to fetch room variants");

      const rooms = await response.json();
      const selectedRoom = rooms.find((room: any) => room.id === roomId);

      if (selectedRoom) {
        setBasePrice(selectedRoom.price);
      }
    } catch (error) {
      console.error("Error fetching room price:", error);
    }
  };

  const fetchPeakRates = async (roomId: number) => {
    try {
      const response = await fetch(`${BACKEND_URL}/peak-rates`);
      if (!response.ok) throw new Error("Failed to fetch peak rates");
  
      const allPeakRates = await response.json();
  
      // ✅ Filter peak rates for the selected room variant
      const filteredPeakRates = allPeakRates.filter((rate: PeakRate) => rate.roomVariantId === roomId);
  
      setPeakRates(filteredPeakRates);
    } catch (error) {
      console.error("Error fetching peak rates:", error);
    }
  };
  

  const getPriceForDate = (date: Date) => {
    if (!basePrice) return null;

    let price = basePrice;
    const dateString = format(date, "yyyy-MM-dd");

    const peakRate = peakRates.find(
      (p) => dateString >= p.startDate && dateString <= p.endDate
    );

    if (peakRate) {
      price += peakRate.additionalPrice;
    }

    // ✅ FIX PRICE DISPLAY: Always divide by 1000
    const formattedPrice = Math.floor(price / 1000);
    return { price: formattedPrice, isPeakRate: !!peakRate };
  };

  const renderCalendar = () => {
    const today = startOfToday();
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    let days = [];
    for (let i = 1; i <= endOfMonth.getDate(); i++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
      const { price, isPeakRate } = getPriceForDate(date) || {};
      const isPast = isBefore(date, today);

      days.push(
        <div
          key={i}
          className={`w-10 h-10 flex flex-col items-center justify-center rounded-md text-sm ${
            isPast ? "text-gray-400" : isPeakRate ? "text-orange-500" : "text-green-600"
          }`}
        >
          <span>{i}</span>
          {price && <span className="text-xs">{price}</span>}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="p-4 border rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>«</button>
        <span className="font-semibold">{format(currentMonth, "MMMM yyyy")}</span>
        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>»</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day) => (
          <div key={day} className="font-bold text-xs">{day}</div>
        ))}
        {renderCalendar()}
      </div>
    </div>
  );
};

export default PriceCalendar;
