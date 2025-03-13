"use client";

import { useEffect, useState } from "react";
import getAllProperties from "@/app/actions/getAllProperties.actions";
import getPropertyCategories from "@/app/actions/getPropertyCategories.actions";
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

const PropertyList = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [size] = useState(30);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchCategories = async () => {
      const categoryData: Category[] = await getPropertyCategories();
      setCategories(categoryData);
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProperties = async () => {
      console.log("Fetching properties with category:", selectedCategory);
      const categoryParam: null | undefined = selectedCategory === null ? null : undefined;
      const { content, totalPages } = await getAllProperties(page, size, categoryParam);

      setProperties(content);
      setTotalPages(totalPages);
    };

    fetchProperties();
  }, [page, selectedCategory]);

  return (
    <div className="container mx-auto p-6">
      {/* ✅ Category Filters */}
      <div className="flex gap-2 overflow-x-auto py-4">
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
