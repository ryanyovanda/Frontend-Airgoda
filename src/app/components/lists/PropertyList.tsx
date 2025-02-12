"use client";

import { useEffect, useState } from "react";
import getAllProperties from "@/app/actions/getAllProperties.actions";
import PropertyListCard from "./PropertyListCard";

const PropertyList = () => {
  const [properties, setProperties] = useState([]);
  const [page, setPage] = useState(0);
  const [size] = useState(10);

  useEffect(() => {
    const fetchProperties = async () => {
      const data = await getAllProperties(page, size);
      setProperties(data);
    };
    fetchProperties();
  }, [page]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold">Available Properties</h1>
      <div className="grid grid-cols-3 gap-4 mt-4">
        {properties.length > 0 ? (
          properties.map((property) => <PropertyListCard key={property.id} data={property} />)
        ) : (
          <p>No properties available.</p>
        )}
      </div>
      
      {/* Pagination Controls */}
      <div className="flex justify-center gap-4 mt-6">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
          disabled={page === 0}
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={() => setPage((prev) => prev + 1)}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PropertyList;
