"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import PropertyListCard from "./PropertyListCard";
import { Button } from "@/components/ui/button";


// ✅ Define Types
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

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

const PropertyList = ({ initialCategories = [], initialLocations = [] }) => { // ✅ Default to empty array
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchQuery = searchParams.get("search") || "";
  const categoryFilter = searchParams.get("categoryId") || "";
  const locationFilter = searchParams.get("locationId") || "";

  const [properties, setProperties] = useState<Property[]>([]);
  const [categories, setCategories] = useState<Category[]>(initialCategories || []); // ✅ Ensure it's an array
  const [locations, setLocations] = useState<Location[]>(initialLocations || []); // ✅ Ensure it's an array
  const [selectedCategory, setSelectedCategory] = useState(categoryFilter);
  const [selectedLocation, setSelectedLocation] = useState(locationFilter);
  const [page, setPage] = useState(0);
  const [size] = useState(30);
  const [totalPages, setTotalPages] = useState(1);

  // ✅ Fetch properties when search query, category, location, or page changes
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        let url = `${BACKEND_URL}/api/properties/filter?page=${page}&size=${size}`;

        if (searchQuery) {
          url = `${BACKEND_URL}/api/properties/search?keyword=${encodeURIComponent(searchQuery)}`;
        }
        if (selectedCategory) {
          url += `&categoryId=${selectedCategory}`;
        }
        if (selectedLocation) {
          url += `&locationId=${selectedLocation}`;
        }

        console.log("Fetching properties from:", url);

        const response = await axios.get(url);
        setProperties(response.data.content || []);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error("Failed to fetch properties:", error);
      }
    };

    fetchProperties();
  }, [searchQuery, selectedCategory, selectedLocation, page]);

/// ✅ Handle Category Change
const handleCategoryChange = (categoryId: string) => {
  setSelectedCategory(categoryId);
  updateURL({ categoryId });
};

// ✅ Handle Location Change
const handleLocationChange = (locationId: string) => {
  setSelectedLocation(locationId);
  updateURL({ locationId });
};

// ✅ Update the URL to reflect filters
const updateURL = (newParams: { categoryId?: string; locationId?: string }) => {
  const params = new URLSearchParams(searchParams.toString());

  if (newParams.categoryId !== undefined) {
    newParams.categoryId ? params.set("categoryId", newParams.categoryId) : params.delete("categoryId");
  }
  if (newParams.locationId !== undefined) {
    newParams.locationId ? params.set("locationId", newParams.locationId) : params.delete("locationId");
  }

  router.push(`/?${params.toString()}`);
};

  return (
    <div className="container mx-auto p-6">


      {/* ✅ Filters Section */}
      <div className="flex flex-wrap items-center gap-4 py-4">
        {/* ✅ Category Dropdown */}
        <select
          className="border rounded-md px-4 py-2"
          value={selectedCategory}
          onChange={(e) => handleCategoryChange(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((category) => ( // ✅ Now it won't error
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        {/* ✅ Location Dropdown */}
        <select
          className="border rounded-md px-4 py-2"
          value={selectedLocation}
          onChange={(e) => handleLocationChange(e.target.value)}
        >
          <option value="">All Locations</option>
          {locations.map((location) => ( // ✅ Now it won't error
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
    </div>
  );
};

export default PropertyList;
