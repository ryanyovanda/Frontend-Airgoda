"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PropertyDetails from "@/app/(user)/properties/[id]/components/PropertyDetails";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

const PropertyPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/properties/${id}`);
        if (!response.ok) throw new Error("Failed to fetch property details");

        const propertyData = await response.json();
        setData(propertyData);
      } catch (error) {
        setError("Failed to load property details.");
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyDetails();
  }, [id]);

  if (loading) {
    return <div className="text-center text-gray-500 text-lg">Loading property details...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 text-lg">{error}</div>;
  }

  if (!data) {
    return <div className="text-center text-gray-500 text-lg">No property details available.</div>;
  }

  return <PropertyDetails data={data} />;
};

export default PropertyPage;
