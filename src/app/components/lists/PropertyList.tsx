"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import PropertyListCard from "./PropertyListCard";
import { Button } from "@/components/ui/button";

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

  // ✅ Get params from URL
  const page = parseInt(searchParams.get("page") || "0");
  const size = 10;
  const searchQuery = searchParams.get("keyword") || "";
  const locationId = searchParams.get("locationId") || "";
  const categoryId = searchParams.get("categoryId") || "";

  const [properties, setProperties] = useState<Property[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [categories] = useState<Category[]>(initialCategories);
  const [locations] = useState<Location[]>(initialLocations);

  // ✅ Fetch properties when URL params change
  useEffect(() => {
    const fetchProperties = async () => {
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
      }
    };

    fetchProperties();
  }, [locationId, categoryId, page]);

  // ✅ Function to update URL on filter or pagination change
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
      {/* ✅ Filters */}
      <div className="flex flex-wrap items-center gap-4 py-4">
        {/* Category Dropdown */}
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

        {/* Location Dropdown */}
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

      {/* ✅ Property List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mt-4">
        {properties.length > 0 ? (
          properties.map((property) => <PropertyListCard key={property.id} data={property} />)
        ) : (
          <p className="text-gray-500 text-center col-span-5">No properties available.</p>
        )}
      </div>

      {/* ✅ Pagination Controls */}
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
