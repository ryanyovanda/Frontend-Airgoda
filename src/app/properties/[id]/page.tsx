"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import getPropertyById from "@/app/actions/getPropertyById.actions";
import PropertyDetails from "../../components/details/PropertyDetails";
import Navbar from "@/app/components/navbar";

const PropertyPage = () => {
  const params = useParams();
  const id = params?.id as string | undefined; // ✅ Ensure `id` is treated as a string
  const [property, setProperty] = useState(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperty = async () => {
      console.log("Fetching property ID:", id);

      if (!id) {
        setError("Invalid property ID.");
        return;
      }

      // ✅ Convert id to a number safely
      const numericId = parseInt(id, 10);

      if (isNaN(numericId)) {
        setError("Invalid property ID.");
        return;
      }

      try {
        const data = await getPropertyById(numericId);
        console.log("Fetched property data:", data);

        if (!data) {
          throw new Error("Property not found.");
        }
        setProperty(data);
      } catch (err) {
        console.error("Error fetching property:", err);
        setError("Property not found.");
      }
    };

    fetchProperty();
  }, [id]);

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  if (!property) {
    return <p className="text-center mt-10">Loading property details...</p>;
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-6">
        <PropertyDetails data={property} />
      </div>
    </>
  );
};

export default PropertyPage;
