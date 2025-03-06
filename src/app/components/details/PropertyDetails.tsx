"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import BookingForm from "@/app/components/forms/BookingForm";

const fetchRoomVariants = async (propertyId) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/room-variants/property/${propertyId}`);
    if (!response.ok) throw new Error("Failed to fetch room variants");
    return await response.json();
  } catch (error) {
    console.error("Error fetching room variants:", error);
    return [];
  }
};

const PropertyDetails = ({ data }) => {
  const [roomVariants, setRoomVariants] = useState([]);

  useEffect(() => {
    fetchRoomVariants(data.id).then(setRoomVariants);
  }, [data.id]);

  const locationText = data.location?.name || "Location unavailable";

  return (
    <div className="max-w-4xl mx-auto p-6 border rounded-lg shadow-md">
      {/* ✅ Handle missing images */}
      {data.image ? (
        <Image src={data.image} alt={data.name} width={800} height={400} className="rounded-lg w-full" />
      ) : (
        <div className="w-full h-[400px] bg-gray-300 flex items-center justify-center rounded-lg">
          <span className="text-gray-500">No Image Available</span>
        </div>
      )}

      {/* Property Info */}
      <h1 className="text-3xl font-bold mt-4">{data.name}</h1>
      <p className="text-gray-500 mt-1">{locationText}</p>
      <p className="mt-4">{data.description}</p>
      
      {/* Room Variants */}
      <h2 className="text-2xl font-semibold mt-6">Available Rooms</h2>
      <div className="mt-2 space-y-2">
        {roomVariants.length > 0 ? (
          roomVariants.map((room, index) => (
            <div key={index} className="border p-4 rounded-md">
              <h3 className="text-lg font-medium">{room.name}</h3>
              <p className="text-gray-600">Price: Rp. {room.price} / night</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No room variants available.</p>
        )}
      </div>

      {/* Booking Form */}
      <div className="mt-6 p-4 border rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-center">Book this property</h2>
        <BookingForm propertyId={data.id} roomVariants={roomVariants} />
      </div>
    </div>
  );
};

export default PropertyDetails;
