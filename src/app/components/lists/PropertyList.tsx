"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import PropertyListCard from "./PropertyListCard";
import { Button } from "@/components/ui/button";

// ✅ Define Types
interface Category {
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

const PropertyList = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [size] = useState(30);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/categories`);
        setCategories(response.data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // ✅ Fetch properties when selectedCategory or page changes
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        let url = `${BACKEND_URL}/api/properties/filter?page=${page}&size=${size}`;
        if (selectedCategory !== null) {
          url += `&categoryId=${selectedCategory}`;
        }

        console.log("Fetching properties from:", url); // Debugging

        const response = await axios.get(url);
        setProperties(response.data.content || []);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error("Failed to fetch properties:", error);
      }
    };

    fetchProperties();
  }, [selectedCategory, page]); // ✅ Trigger API call when category or page changes

  return (
    <div className="container mx-auto p-6">
      {/* ✅ Category Filters */}
      <div className="flex items-center gap-2 overflow-x-auto py-4">
        <Button
          onClick={() => { setSelectedCategory(null); setPage(0); }}
          variant={selectedCategory === null ? "default" : "outline"}
        >
          All
        </Button>
        {categories.map((category) => (
          <Button
            key={category.id}
            onClick={() => { setSelectedCategory(category.id); setPage(0); }}
            variant={selectedCategory === category.id ? "default" : "outline"}
          >
            {category.name}
          </Button>
        ))}
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
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <Button
            onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
            disabled={page === 0}
            variant="outline"
            className="px-4 py-2 rounded-lg disabled:opacity-50"
          >
            Previous
          </Button>
          <span className="text-lg font-medium text-gray-700">
            Page {page + 1} of {totalPages}
          </span>
          <Button
            onClick={() => setPage((prev) => (prev + 1 < totalPages ? prev + 1 : prev))}
            disabled={page + 1 >= totalPages}
            variant="outline"
            className="px-4 py-2 rounded-lg disabled:opacity-50"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default PropertyList;
