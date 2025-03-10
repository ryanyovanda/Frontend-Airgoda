"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const fetchRoomVariants = async (propertyId: number) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/room-variants/property/${propertyId}`
    );
    if (!response.ok) throw new Error("Failed to fetch room variants");
    return await response.json();
  } catch (error) {
    console.error("Error fetching room variants:", error);
    return [];
  }
};

const PropertyListCard = ({ data }) => {
  const [roomVariants, setRoomVariants] = useState([]);

  useEffect(() => {
    fetchRoomVariants(data.id).then(setRoomVariants);
  }, [data.id]);

  const basePrice =
    roomVariants.length > 0
      ? Math.min(...roomVariants.map((room) => room.price))
      : "N/A";

  const locationText = data.location?.name || "Location unavailable";

  return (
    <div className="border p-4 rounded-lg shadow-sm">
      {/* ✅ Fixed Image Handling */}
      <div className="flex justify-center">
        {data.imageUrls && data.imageUrls.length > 0 ? (
          <div className="relative w-[300px] h-[200px]">
            <Image
              src={data.imageUrls[0]} // Show only the first image
              alt={data.name}
              fill={true} // Replace `layout="fill"`
              sizes="(max-width: 768px) 100vw, 300px"
              className="rounded-lg object-cover"
            />
          </div>
        ) : (
          <div className="w-[300px] h-[200px] bg-gray-300 flex items-center justify-center rounded-lg">
            <span className="text-gray-500">No Image</span>
          </div>
        )}
      </div>

      <h3 className="text-lg font-semibold mt-2">{data.name}</h3>

      {/* Display Location */}
      <p className="text-sm text-gray-600">
        <strong>Location:</strong> {locationText}
      </p>

      {/* Display Room Variants */}
      <p className="text-md text-gray-600">
        <strong>Room Types:</strong>{" "}
        {roomVariants.length > 0
          ? roomVariants.map((room) => room.name).join(", ")
          : "No rooms available"}
      </p>

      {/* Display Lowest Room Price */}
      <p className="text-lg font-bold mt-2 text-blue-600">
        {basePrice !== "N/A" ? `Rp. ${basePrice} / night` : "Price unavailable"}
      </p>

      <Link href={`/properties/${data.id}`}>
        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mt-3">
          View Details
        </button>
      </Link>
    </div>
  );
};

export default PropertyListCard;
