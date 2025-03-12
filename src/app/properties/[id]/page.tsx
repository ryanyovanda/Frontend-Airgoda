"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import getPropertyById from "@/app/actions/getPropertyById.actions";
import PropertyDetails from "@/app/components/details/PropertyDetails";

const PropertyPage = () => {
  const params = useParams();
  const id = params?.id as string | undefined;
  const [property, setProperty] = useState(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) {
        setError("Invalid property ID.");
        return;
      }

      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) {
        setError("Invalid property ID.");
        return;
      }

      try {
        const data = await getPropertyById(numericId);
        if (!data) throw new Error("Property not found.");
        setProperty(data);
      } catch (err) {
        console.error("Error fetching property:", err);
        setError("Property not found.");
      }
    };

    fetchProperty();
  }, [id]);

  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!property) return <p className="text-center mt-10">Loading property details...</p>;

  return (
    <div className="container mx-auto p-6">
      <PropertyDetails data={property} />
    </div>
  );
};

export default PropertyPage;
