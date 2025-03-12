"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";

export default function AddProperty() {
  const router = useRouter();
  const [property, setProperty] = useState({
    name: "",
    location: "",
    description: "",
    basePrice: "",
    isAvailable: true,
    tenantId: "", // Fetched from session
  });
  const [images, setImages] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTenantId() {
      try {
        const response = await axios.get("/api/auth/session"); // Get user session
        setProperty((prev) => ({ ...prev, tenantId: response.data.user.id }));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching tenant ID:", error);
      }
    }
    fetchTenantId();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProperty({ ...property, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImages(e.target.files);
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
  
      // Ensure the payload structure matches Postman
      const requestData = {
        name: property.name,
        description: property.description,
        categoryId: property.categoryId || "1", // Default category
        tenantId: property.tenantId,
        locationId: property.locationId || "10", // Default location
        fullAddress: property.fullAddress || "Unknown Address",
        roomId: property.roomId || "1", // Default room
      };
  
      formData.append("data", JSON.stringify(requestData));
  
      if (images) {
        Array.from(images).forEach((file, index) => {
          formData.append("images", file);
          console.log(`✅ Added image ${index + 1}:`, file.name);
        });
      }
  
      console.log("📦 FormData contents:");
      for (let [key, value] of formData.entries()) {
        console.log(`🔹 ${key}:`, value);
      }
  
      console.log("🔍 Fetching access token...");
      const session = await axios.get("/api/auth/session");
      const token = session.data.accessToken;
  
      console.log("✅ Access token retrieved:", token);
  
      console.log("🔍 Sending POST request...");
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
  
      const response = await axios.post(`${BACKEND_URL}/api/properties`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
  
      console.log("✅ Response received:", response.data);
      alert("Property added successfully!");
      router.push("/dashboard/manage-listings");
    } catch (error) {
      console.error("❌ Error adding property:", error.response ? error.response.data : error);
      alert("Failed to add property. Check console for details.");
    }
  };
  
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Add New Property</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input type="text" name="name" placeholder="Property Name" value={property.name} onChange={handleChange} required />
          <Input type="text" name="location" placeholder="Location" value={property.location} onChange={handleChange} required />
          <textarea name="description" placeholder="Description" value={property.description} onChange={handleChange} className="w-full p-2 border rounded-md" required />
          <Input type="number" name="basePrice" placeholder="Base Price" value={property.basePrice} onChange={handleChange} required />
          <label className="flex items-center">
            <input type="checkbox" checked={property.isAvailable} onChange={(e) => setProperty({ ...property, isAvailable: e.target.checked })} />
            <span className="ml-2">Available</span>
          </label>
          <Input type="file" multiple onChange={handleFileChange} />

          <Button type="submit">Save Property</Button>
        </form>
      )}
    </div>
  );
}
