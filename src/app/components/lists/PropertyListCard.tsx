"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Star } from "lucide-react";

// ✅ Define Interfaces
interface RoomVariant {
  id: number;
  name: string;
  price: number;
}

interface Property {
  id: number;
  name: string;
  location?: { name?: string };
  imageUrls?: string[];
}

interface PropertyListCardProps {
  data: Property;
}

// ✅ Fetch Room Variants for Property
const fetchRoomVariants = async (propertyId: number): Promise<RoomVariant[]> => {
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

const PropertyListCard: React.FC<PropertyListCardProps> = ({ data }) => {
  const [roomVariants, setRoomVariants] = useState<RoomVariant[]>([]);

  useEffect(() => {
    fetchRoomVariants(data.id).then(setRoomVariants);
  }, [data.id]);

  const basePrice =
    roomVariants.length > 0
      ? Math.min(...roomVariants.map((room) => room.price))
      : "N/A";

  const locationText = data.location?.name || "Location unavailable";

  return (
    <Card className="rounded-xl shadow-md overflow-hidden transition hover:shadow-lg cursor-pointer">
      <div className="relative">
         {/* Favorite Button */}
         <button className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md z-10">
          <Heart className="w-5 h-5 text-red-500" />
        </button>
        {/* ✅ Swiper Image Carousel with Smaller White Arrows */}
        <Swiper
          navigation
          modules={[Navigation]}
          className="w-full h-[230px]"
        >
          {data.imageUrls && data.imageUrls.length > 0 ? (
            data.imageUrls.map((url, index) => (
              <SwiperSlide key={index}>
                <Link href={`/properties/${data.id}`}>
                  <Image
                    src={url}
                    alt={data.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 300px"
                    className="object-cover rounded-t-xl"
                  />
                </Link>
              </SwiperSlide>
            ))
          ) : (
            <div className="w-full h-[230px] bg-gray-300 flex items-center justify-center">
              <span className="text-gray-500">No Image</span>
            </div>
          )}
        </Swiper>

        {/* ✅ Custom Small White Navigation Arrows */}
        <style jsx global>{`
          .swiper-button-prev, .swiper-button-next {
            color: white !important;
            width: 15px !important;
            height: 15px !important;
          }
        `}</style>

       
      </div>

      <CardContent className="p-3">
        <h3 className="text-md font-semibold">{data.name}</h3>
        <p className="text-sm text-gray-600">{locationText}</p>

        {/* ✅ Display Price & Rating */}
        <div className="flex justify-between items-center mt-2">
          <p className="text-md font-bold text-gray-900">
            {basePrice !== "N/A" ? `Rp. ${basePrice} / night` : "Price unavailable"}
          </p>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-semibold">4.8</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyListCard;
