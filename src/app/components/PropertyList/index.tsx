"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import PropertyListCard from "@/app/components/PropertyListCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton"; 

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

interface Category {
  id: number;
  name: string;
}

interface Location {
  id: number;
  name: string;
}

interface Property {
  id: number;
  name: string;
  location?: { name?: string };
  imageUrls?: string[];
  description: string;
}

interface PropertyListProps {
  initialCategories: Category[];
  initialLocations: Location[];
}

export default function PropertyList({ initialCategories, initialLocations }: PropertyListProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const page = parseInt(searchParams.get("page") || "0");
  const size = 25;
  const searchQuery = searchParams.get("keyword") || "";
  const locationId = searchParams.get("locationId") || "";
  const categoryId = searchParams.get("categoryId") || "";

  const [properties, setProperties] = useState<Property[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [categories] = useState<Category[]>(initialCategories);
  const [locations] = useState<Location[]>(initialLocations);
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        let url = `${BACKEND_URL}/api/properties`;

        if (searchQuery) {
          url = `${BACKEND_URL}/api/properties/search?keyword=${encodeURIComponent(searchQuery)}`;
        } else {
          url = `${BACKEND_URL}/api/properties/filter`;
        }

        const response = await axios.get(url, {
          params: {
            locationId,
            categoryId,
            page,
            size,
          },
        });

        setProperties(response.data.content || []);
        setTotalPages(response.data.totalPages || 1);
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setLoading(false); 
      }
    };

    fetchProperties();
  }, [locationId, categoryId, page]);

  const updateURL = (newParams: { categoryId?: string; locationId?: string; keyword?: string; page?: number }) => {
    const params = new URLSearchParams(searchParams.toString());

    if (newParams.categoryId !== undefined) {
      newParams.categoryId ? params.set("categoryId", newParams.categoryId) : params.delete("categoryId");
    }
    if (newParams.locationId !== undefined) {
      newParams.locationId ? params.set("locationId", newParams.locationId) : params.delete("locationId");
    }
    if (newParams.page !== undefined) {
      params.set("page", newParams.page.toString());
    }

    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4 py-4">
        <select
          className="border rounded-md px-4 py-2"
          value={categoryId}
          onChange={(e) => updateURL({ categoryId: e.target.value, page: 0 })}
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <select
          className="border rounded-md px-4 py-2"
          value={locationId}
          onChange={(e) => updateURL({ locationId: e.target.value, page: 0 })}
        >
          <option value="">All Locations</option>
          {locations.map((location) => (
            <option key={location.id} value={location.id}>
              {location.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mt-4">
        {loading ? (
          
          [...Array(25)].map((_, index) => (
            <div key={index} className="flex flex-col gap-3 p-4 border rounded-md">
              <Skeleton className="h-40 w-full rounded-md" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))
        ) : properties.length > 0 ? (
          properties.map((property) => <PropertyListCard key={property.id} data={property} />)
        ) : (
          <p className="text-gray-500 text-center col-span-5">No properties available.</p>
        )}
      </div>

      <div className="flex justify-center space-x-4 mt-6">
        <Button onClick={() => updateURL({ page: page - 1 })} disabled={page === 0}>
          Previous
        </Button>
        <span>Page {page + 1} of {totalPages}</span>
        <Button onClick={() => updateURL({ page: page + 1 })} disabled={page >= totalPages - 1}>
          Next
        </Button>
      </div>
    </div>
  );
}
