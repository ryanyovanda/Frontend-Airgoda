"use client";

import { useEffect, useState } from "react";
import getAllProperties from "@/app/actions/getAllProperties.actions";
import getPropertyCategories from "@/app/actions/getPropertyCategories.actions";
import PropertyListCard from "./PropertyListCard";

const PropertyList = () => {
  const [properties, setProperties] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    // ✅ Fetch categories once on mount
    const fetchCategories = async () => {
      const categoryData = await getPropertyCategories();
      setCategories(categoryData);
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    // ✅ Fetch properties when `selectedCategory` or `page` changes
    const fetchProperties = async () => {
      console.log("Fetching properties with category:", selectedCategory);
      const { content, totalPages } = await getAllProperties(page, size, selectedCategory);
      setProperties(content);
      setTotalPages(totalPages);
    };

    fetchProperties();
  }, [page, selectedCategory]); // ✅ Triggers re-fetch when category changes

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold">Available Properties</h1>

      {/* ✅ Category Filters */}
      <div className="flex gap-4 overflow-x-auto py-4">
        <button
          onClick={() => { setSelectedCategory(null); setPage(0); }}
          className={`px-4 py-2 rounded-lg border ${selectedCategory === null ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => { setSelectedCategory(category.id); setPage(0); }} // ✅ Reset page when filtering
            className={`px-4 py-2 rounded-lg border ${selectedCategory === category.id ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Property List */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        {properties.length > 0 ? (
          properties.map((property) => <PropertyListCard key={property.id} data={property} />)
        ) : (
          <p>No properties available.</p>
        )}
      </div>

      {/* ✅ Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
            disabled={page === 0}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">Page {page + 1} of {totalPages}</span>
          <button
            onClick={() => setPage((prev) => (prev + 1 < totalPages ? prev + 1 : prev))}
            disabled={page + 1 >= totalPages}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default PropertyList;
