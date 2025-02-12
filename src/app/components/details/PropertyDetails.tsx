"use client";

import Image from "next/image";
import Link from "next/link";

const PropertyDetails = ({ data }) => {
  return (
    <div className="max-w-4xl mx-auto p-6 border rounded-lg shadow-md">
      {/* Property Image */}
      {data.image && (
        <Image src={data.image} alt={data.name} width={800} height={400} className="rounded-lg w-full" />
      )}
      
      {/* Property Info */}
      <h1 className="text-3xl font-bold mt-4">{data.name}</h1>
      <p className="text-gray-500 mt-1">{data.location}</p>
      <p className="mt-4">{data.description}</p>
      
      {/* Room Variants */}
      <h2 className="text-2xl font-semibold mt-6">Available Rooms</h2>
      <div className="mt-2 space-y-2">
        {data.roomVariants.length > 0 ? (
          data.roomVariants.map((room, index) => (
            <div key={index} className="border p-4 rounded-md">
              <h3 className="text-lg font-medium">{room.name}</h3>
              <p className="text-gray-600">Price: ${room.price} / night</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No room variants available.</p>
        )}
      </div>

      {/* Book Now Button */}
      <div className="mt-6 text-center">
        <Link href={`/booking/${data.id}`}>
          <button className="bg-blue-500 text-white px-6 py-3 rounded-lg text-lg">Book Now</button>
        </Link>
      </div>
    </div>
  );
};

export default PropertyDetails;
