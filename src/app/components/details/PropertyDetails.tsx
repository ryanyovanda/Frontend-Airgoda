"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import BookingForm from "@/app/components/forms/BookingForm";

interface RoomVariant {
  id: number;
  name: string;
  facilities?: string[];
  price: number;
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

const fetchRoomVariants = async (propertyId: number): Promise<RoomVariant[]> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/room-variants/property/${propertyId}`);
    if (!response.ok) throw new Error("Failed to fetch room variants");
    return await response.json();
  } catch (error) {
    console.error("Error fetching room variants:", error);
    return [];
  }
};

const PropertyDetails: React.FC<PropertyDetailsProps> = ({ data }) => {
  const [roomVariants, setRoomVariants] = useState<RoomVariant[]>([]);

  useEffect(() => {
    fetchRoomVariants(data.id).then(setRoomVariants);
  }, [data.id]);

  const locationText = data.location?.name || "Location unavailable";

  return (
    <div className="max-w-4xl mx-auto p-6 border rounded-lg shadow-md">
      {data.imageUrls && data.imageUrls.length > 0 ? (
        <Swiper
          modules={[Navigation, Pagination]}
          navigation
          pagination={{ clickable: true }}
          className="w-full h-[400px] rounded-lg"
        >
          {data.imageUrls.map((url, index) => (
            <SwiperSlide key={index} className="relative w-full h-[400px]">
              <div className="relative w-full h-full">
                <Image
                  src={url}
                  alt={`Property Image ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 800px"
                  className="object-cover rounded-lg"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <div className="w-full h-[400px] bg-gray-300 flex items-center justify-center rounded-lg">
          <span className="text-gray-500">No Images Available</span>
        </div>
      )}

      <h1 className="text-3xl font-bold mt-4">{data.name}</h1>
      <p className="text-gray-500 mt-1">{locationText}</p>
      <p className="mt-4">{data.description}</p>

      <h2 className="text-2xl font-semibold mt-6">Available Rooms</h2>
      <div className="mt-2 space-y-2">
        {roomVariants.length > 0 ? (
          roomVariants.map((room) => (
            <div key={room.id} className="border p-4 rounded-md">
              <h3 className="text-lg font-medium">{room.name}</h3>
              <div className="mt-2 text-sm text-gray-600">
                <strong>Facilities:</strong> {room.facilities?.join(", ") || "None"}
              </div>
              <p className="text-gray-600">Price: Rp. {room.price} / night</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No room variants available.</p>
        )}
      </div>

      <div className="mt-6">
        <BookingForm propertyId={data.id} roomVariants={roomVariants} />
      </div>
    </div>
  );
};

export default PropertyDetails;
