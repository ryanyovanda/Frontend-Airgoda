"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";

interface Location {
  id: number;
  name: string;
  parent: Location | null;
  type: string;
}

export default function AddProperty() {
  const router = useRouter();
  const [property, setProperty] = useState({
    name: "",
    description: "",
    isAvailable: true,
    tenantId: "",
    locationId: "",
    fullAddress: "",
  });

  const [images, setImages] = useState<FileList | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<number | null>(null);
  const [selectedIsland, setSelectedIsland] = useState<number | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<number | null>(null);
  const [selectedCity, setSelectedCity] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTenantId() {
      try {
        const response = await axios.get("/api/auth/session");
        setProperty((prev) => ({ ...prev, tenantId: response.data.user.id }));
      } catch (error) {
        console.error("Error fetching tenant ID:", error);
      }
    }

    async function fetchLocations() {
      try {
        const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
        const response = await axios.get(`${BACKEND_URL}/api/locations`);
        console.log("✅ Locations fetched:", response.data);
        setLocations(response.data);
      } catch (error) {
        console.error("❌ Error fetching locations:", error);
      }
    }

    fetchTenantId();
    fetchLocations();
    setLoading(false);
  }, []);

  // Filter functions
  const getFilteredLocations = (type: string, parentId: number | null) => {
    return locations.filter((loc) => loc.type === type && (loc.parent ? loc.parent.id === parentId : parentId === null));
  };

  // Handle selection changes
  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const countryId = parseInt(e.target.value);
    setSelectedCountry(countryId);
    setSelectedIsland(null);
    setSelectedProvince(null);
    setSelectedCity(null);
    setProperty({ ...property, locationId: "" });
  };

  const handleIslandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const islandId = parseInt(e.target.value);
    setSelectedIsland(islandId);
    setSelectedProvince(null);
    setSelectedCity(null);
    setProperty({ ...property, locationId: "" });
  };

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provinceId = parseInt(e.target.value);
    setSelectedProvince(provinceId);
    setSelectedCity(null);
    setProperty({ ...property, locationId: "" });
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cityId = parseInt(e.target.value);
    setSelectedCity(cityId);
    setProperty({ ...property, locationId: cityId.toString() });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!property.tenantId) {
      alert("Tenant ID not found. Please log in again.");
      return;
    }
  
    try {
      console.log("🔍 Preparing form data...");
      const formData = new FormData();
      const requestData = {
        name: property.name,
        description: property.description,
        tenantId: property.tenantId,
        locationId: property.locationId,
        fullAddress: property.fullAddress,
      };
  
      formData.append("data", JSON.stringify(requestData));
  
      if (images) {
        Array.from(images).forEach((file) => {
          formData.append("images", file);
        });
      }
  
      console.log("🔍 Fetching access token...");
      const session = await axios.get("/api/auth/session");
      const accessToken = session.data.accessToken;
  
      if (!accessToken) {
        alert("Authentication failed. Please log in again.");
        return;
      }
  
      console.log("✅ Access token retrieved:", accessToken);
  
      console.log("🔍 Sending POST request...");
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
  
      const response = await axios.post(`${BACKEND_URL}/api/properties`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${accessToken}`, 
        },
      });
  
      console.log("✅ Response received:", response.data);
      alert("Property added successfully!");
      router.push("/dashboard/manage-listings");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error("❌ Error adding property:", error.response?.data || error.message);
        
        if (error.response?.status === 401) {
          alert("Session expired. Please log in again.");
        } else {
          alert("Failed to add property. Check console for details.");
        }
      } else {
        console.error("❌ Unexpected error:", error);
        alert("An unexpected error occurred. Check console for details.");
      }
    }
    
  };
  

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Add New Property</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input type="text" name="name" placeholder="Property Name" value={property.name} onChange={(e) => setProperty({ ...property, name: e.target.value })} required />
          <textarea name="description" placeholder="Description" value={property.description} onChange={(e) => setProperty({ ...property, description: e.target.value })} className="w-full p-2 border rounded-md" required />
          <Input type="text" name="fullAddress" placeholder="Full Address" value={property.fullAddress} onChange={(e) => setProperty({ ...property, fullAddress: e.target.value })} required />

          {/* Country Dropdown */}
          <label className="block">
            <span className="text-gray-700">Select Country</span>
            <select value={selectedCountry || ""} onChange={handleCountryChange} className="w-full p-2 border rounded-md">
              <option value="">Select a Country</option>
              {getFilteredLocations("COUNTRY", null).map((loc) => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
          </label>

          {/* Island Dropdown */}
          {selectedCountry && (
            <label className="block">
              <span className="text-gray-700">Select Island</span>
              <select value={selectedIsland || ""} onChange={handleIslandChange} className="w-full p-2 border rounded-md">
                <option value="">Select an Island</option>
                {getFilteredLocations("ISLAND", selectedCountry).map((loc) => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </label>
          )}

          {/* Province Dropdown */}
          {selectedIsland && (
            <label className="block">
              <span className="text-gray-700">Select Province</span>
              <select value={selectedProvince || ""} onChange={handleProvinceChange} className="w-full p-2 border rounded-md">
                <option value="">Select a Province</option>
                {getFilteredLocations("PROVINCE", selectedIsland).map((loc) => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </label>
          )}

          {/* City Dropdown */}
          {selectedProvince && (
            <label className="block">
              <span className="text-gray-700">Select City / Regency</span>
              <select value={selectedCity || ""} onChange={handleCityChange} className="w-full p-2 border rounded-md">
                <option value="">Select a City / Regency</option>
                {getFilteredLocations("CITY", selectedProvince).concat(getFilteredLocations("REGENCY", selectedProvince)).map((loc) => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </label>
          )}

          {/* Display Selected Location */}
          {selectedCity && (
            <p className="text-gray-600 mt-2">
              Selected Location: <strong>{locations.find((loc) => loc.id === selectedCity)?.name}</strong>
            </p>
          )}

          <label className="flex items-center">
            <input type="checkbox" checked={property.isAvailable} onChange={(e) => setProperty({ ...property, isAvailable: e.target.checked })} />
            <span className="ml-2">Available</span>
          </label>
          <Input type="file" multiple onChange={(e) => setImages(e.target.files)} />

          <Button type="submit">Save Property</Button>
        </form>
      )}
    </div>
  );
}
