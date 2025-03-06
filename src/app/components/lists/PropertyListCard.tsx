"use client";

import Image from "next/image";
import Link from "next/link";
import { FC } from "react";

interface RoomVariant {
  name: string;
  price: number;
}

interface Location {
  city?: string;
  address?: string;
}

interface Property {
  id: number;
  name: string;
  description: string;
  image?: string; // ✅ Make image optional
  roomVariants?: RoomVariant[]; // ✅ Keep roomVariants optional
  location: Location; // ✅ Adjusted to match backend response
}

const PropertyListCard: FC<{ data: Property }> = ({ data }) => {
  const roomVariants = data.roomVariants || []; // Prevent undefined errors
  const basePrice = roomVariants.length > 0 ? Math.min(...roomVariants.map((room) => room.price)) : "N/A";
  
  // ✅ Fix location to prevent errors
  const locationText = data.location?.city || data.location?.address || "Location unavailable";

  return (
    <div className="border p-4 rounded-lg shadow-sm">
      {/* ✅ Handle missing image */}
      {data.image ? (
        <Image src={data.image} alt={data.name} width={300} height={200} className="rounded-lg" />
      ) : (
        <div className="w-[300px] h-[200px] bg-gray-300 flex items-center justify-center rounded-lg">
          <span className="text-gray-500">No Image</span>
        </div>
      )}

      <h3 className="text-lg font-semibold mt-2">{data.name}</h3>
      <p className="text-gray-500">{locationText}</p>
      <p className="text-md text-gray-600">
        Room Types: {roomVariants.length > 0 ? roomVariants.map(room => room.name).join(", ") : "No rooms available"}
      </p>
      <p className="text-xl font-bold mt-2">
        {basePrice !== "N/A" ? `$${basePrice} / night` : "Price unavailable"}
      </p>

      <Link href={`/properties/${data.id}`}>
        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          View Details
        </button>
      </Link>
    </div>
  );
};

export default PropertyListCard;
