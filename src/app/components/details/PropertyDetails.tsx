"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Dialog, DialogTrigger, DialogContent, DialogClose } from "@/components/ui/dialog";
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
    <div className="max-w-7xl mx-auto p-6 flex gap-10 sm:flex-col lg:flex-row ">
      {/* LEFT SIDE: Images & Details */}
      <div className="lg:w-2/3 sm:w-full">
        {/* ✅ Full-Width Image Grid */}
        <div className="grid grid-cols-4 gap-2">
          {data.imageUrls && data.imageUrls.length > 0 ? (
            <>
              {/* Large Main Image */}
              <Dialog>
                <DialogTrigger className="col-span-2 relative h-[400px]">
                  <Image
                    src={data.imageUrls[0]}
                    alt="Main Property Image"
                    fill
                    className="rounded-lg object-cover cursor-pointer"
                  />
                </DialogTrigger>
                <DialogContent className="max-w-4xl p-4">
                  <Image
                    src={data.imageUrls[0]}
                    alt="Enlarged Property Image"
                    width={1000}
                    height={700}
                    className="rounded-lg object-cover"
                  />
                  <DialogClose className="absolute top-2 right-2 bg-gray-800 text-white px-3 py-1 rounded-md">
                    Close
                  </DialogClose>
                </DialogContent>
              </Dialog>

              {/* Smaller Images */}
              {data.imageUrls.slice(1, 4).map((url, index) => (
                <Dialog key={index}>
                  <DialogTrigger className="relative h-[200px]">
                    <Image
                      src={url}
                      alt={`Property Image ${index + 1}`}
                      fill
                      className="rounded-lg object-cover cursor-pointer"
                    />
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl p-4">
                    <Image
                      src={url}
                      alt="Enlarged Property Image"
                      width={1000}
                      height={700}
                      className="rounded-lg object-cover"
                    />
                    <DialogClose className="absolute top-2 right-2 bg-gray-800 text-white px-3 py-1 rounded-md">
                      Close
                    </DialogClose>
                  </DialogContent>
                </Dialog>
              ))}
            </>
          ) : (
            <div className="w-full h-[400px] bg-gray-300 flex items-center justify-center rounded-lg">
              <span className="text-gray-500">No Images Available</span>
            </div>
          )}
        </div>

        <h1 className="text-3xl font-bold mt-4">{data.name}</h1>
        <p className="text-gray-500 mt-1">{locationText}</p>
        <p className="mt-4">{data.description}</p>

        <h2 className="text-2xl font-semibold mt-6">Available Rooms</h2>
        <ul className="mt-2 list-disc list-inside">
          {roomVariants.length > 0 ? (
            roomVariants.map((room) => (
              <li key={room.id} className="text-gray-600">{room.name} - Rp. {room.price} / night</li>
            ))
          ) : (
            <p className="text-gray-500">No room variants available.</p>
          )}
        </ul>
      </div>

      {/* ✅ Floating Booking Form */}
      <div className="lg:w-1/3 sm:w-full">
        <div className="sticky top-20 border p-6 rounded-lg shadow-lg bg-white">
          <BookingForm propertyId={data.id} roomVariants={roomVariants} />
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
