"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

const SearchBar = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // ✅ Extract search query from URL
  const [searchQuery, setSearchQuery] = useState(searchParams.get("keyword") || "");

  useEffect(() => {
    // ✅ Keep the search bar updated with the current URL
    setSearchQuery(searchParams.get("keyword") || "");
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // ✅ Preserve existing filters (categoryId, locationId, page)
    const params = new URLSearchParams(searchParams.toString());
    
    if (searchQuery.trim()) {
      params.set("keyword", searchQuery);
      params.set("page", "0"); // Reset pagination when searching
    } else {
      params.delete("keyword");
    }

    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="relative w-full flex flex-col items-center mb-6">
      <form 
        onSubmit={handleSearch} 
        className="w-2/5 h-[70px] bg-white p-4 rounded-full shadow-lg flex items-center space-x-4 border-gray-300 border">
        
        <input
          type="text"
          placeholder="Search properties..."
          className="flex-grow outline-none bg-transparent px-4"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        
        <button type="submit" className="bg-purple-600 text-white px-3 py-2 rounded-full hover:bg-purple-700">
          <FontAwesomeIcon icon={faSearch} />
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
