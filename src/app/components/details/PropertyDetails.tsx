"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import BookingForm from "@/app/components/forms/BookingForm";
import PriceCalendar from "../pricecalender/PriceCalender";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface RoomVariant {
  id: number;
  name: string;
  propertyId: number;
  price: number;
  facilities?: string[];
}

interface PropertyDetailsProps {
  data: {
    id: number;
    name: string;
    description: string;
    location?: { name?: string };
    imageUrls?: string[];
  };
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

const PropertyDetails: React.FC<PropertyDetailsProps> = ({ data }) => {
  const { propertyId } = useParams();
  const [roomVariants, setRoomVariants] = useState<RoomVariant[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<RoomVariant | null>(null);

  useEffect(() => {
    if (data.id) {
      fetchRoomVariants(data.id).then(setRoomVariants);
    }
  }, [data.id]);

  const fetchRoomVariants = async (propertyId: number): Promise<RoomVariant[]> => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/room-variants`);
      if (!response.ok) throw new Error("Failed to fetch room variants");

      const allRoomVariants: RoomVariant[] = await response.json();
      const filteredRooms = allRoomVariants.filter((room) => room.propertyId === propertyId);

      return filteredRooms;
    } catch (error) {
      console.error("Error fetching room variants:", error);
      return [];
    }
  };

  const locationText = data.location?.name || "Location unavailable";

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 flex flex-col lg:flex-row gap-8">
      {/* LEFT SIDE: Swiper for Images & Details */}
      <div className="lg:w-2/3 w-full">
        {data.imageUrls && data.imageUrls.length > 0 ? (
          <Swiper
            modules={[Navigation, Pagination]}
            navigation
            pagination={{ clickable: true }}
            spaceBetween={10}
            slidesPerView={1}
            className="w-full h-[300px] sm:h-[400px] rounded-lg shadow-lg"
          >
            {data.imageUrls.map((url, index) => (
              <SwiperSlide key={index} className="relative h-full">
                <Image
                  src={url}
                  alt={`Property Image ${index + 1}`}
                  fill
                  className="rounded-lg object-cover"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="w-full h-[300px] bg-gray-300 flex items-center justify-center rounded-lg">
            <span className="text-gray-500">No Images Available</span>
          </div>
        )}

        <h1 className="text-3xl sm:text-4xl font-bold mt-4">{data.name}</h1>
        <p className="text-lg text-gray-500 mt-1">{locationText}</p>
        <p className="mt-4 text-lg">{data.description}</p>

        {/* Available Rooms Section */}
        <h2 className="text-2xl font-semibold mt-6">Available Rooms</h2>
        <ul className="mt-3 space-y-4">
          {roomVariants.length > 0 ? (
            roomVariants.map((room) => (
              <li
                key={room.id}
                className={`cursor-pointer p-4 border rounded-lg shadow-sm ${
                  selectedRoom?.id === room.id ? "bg-blue-100 border-blue-500" : "hover:bg-gray-50"
                }`}
                onClick={() => setSelectedRoom(room)}
              >
                <span className="text-lg sm:text-xl font-semibold">{room.name}</span>
                {/* Facilities List */}
                {room.facilities && room.facilities.length > 0 ? (
                  <ul className="text-gray-600 mt-2 list-disc pl-5 text-lg">
                    {room.facilities.map((facility, index) => (
                      <li key={index}>{facility}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400 mt-1 text-lg">No facilities listed</p>
                )}
              </li>
            ))
          ) : (
            <p className="text-gray-500 text-lg">No room variants available.</p>
          )}
        </ul>

        {/* Calendar Section */}
        <h2 className="text-2xl font-semibold mt-6">Check Rooms Price</h2>
        <PriceCalendar propertyId={data.id} selectedRoomVariant={selectedRoom?.id ?? null} />

        {/* Price Notes */}
        <div className="mt-3 text-lg text-gray-600">
          <p><span className="text-orange-500 font-semibold">Orange:</span> Peak Rate Price</p>
          <p><span className="text-green-600 font-semibold">Green:</span> Normal Price</p>
        </div>
      </div>

      {/* Floating Booking Form */}
      <div className="lg:w-1/3 w-full">
        <div className="sticky top-20 border p-4 sm:p-6 rounded-lg shadow-lg bg-white">
          <BookingForm propertyId={data.id} roomVariants={roomVariants} />
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
