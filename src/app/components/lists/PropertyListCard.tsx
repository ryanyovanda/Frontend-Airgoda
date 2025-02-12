"use client";

import Image from "next/image";
import Link from "next/link";
import { FC } from "react";

interface Property {
  id: number;
  name: string;
  description: string;
  image: string;
  roomVariants?: { name: string; price: number }[]; // ✅ Allow optional roomVariants
  location: string;
}

const PropertyListCard: FC<{ data: Property }> = ({ data }) => {
  const roomVariants = data.roomVariants || []; // ✅ Prevents undefined errors
  const basePrice = roomVariants.length > 0 ? Math.min(...roomVariants.map((room) => room.price)) : "N/A";

  return (
    <div className="border p-4 rounded-lg shadow-sm">
      <Image src={data.image} alt={data.name} width={300} height={200} className="rounded-lg" />
      <h3 className="text-lg font-semibold mt-2">{data.name}</h3>
      <p className="text-gray-500">{data.location}</p>
      <p className="text-md text-gray-600">
        Room Types: {roomVariants.map(room => room.name).join(", ") || "No rooms available"}
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
