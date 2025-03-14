"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faTrash, faUpload } from "@fortawesome/free-solid-svg-icons";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

interface Location {
  id: number;
  name: string;
  parent: Location | null;
  type: string;
}

interface Category {
  id: number;
  name: string;
}

interface Property {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  locationId: string;
  fullAddress: string;
  isActive: boolean;
  imageUrls: string[];
}

export default function ManageProperty() {
  const { propertyId } = useParams();
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch Property Details
        const propertyRes = await axios.get(`${API_BASE_URL}/api/properties/${propertyId}`);
        setProperty(propertyRes.data);
        setSelectedLocation(propertyRes.data.locationId);
        setImagePreviews(propertyRes.data.imageUrls || []);

        // Fetch Categories
        const categoriesRes = await axios.get(`${API_BASE_URL}/categories`);
        setCategories(categoriesRes.data);

        // Fetch Locations
        const locationsRes = await axios.get(`${API_BASE_URL}/api/locations`);
        setLocations(locationsRes.data);
      } catch (error) {
        toast.error("Error fetching property details.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [propertyId]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);
    setImages((prev) => [...prev, ...selectedFiles]);
    const newPreviews = selectedFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleRemoveImage = async (index: number) => {
  if (!property) return;

  const imageUrl = property.imageUrls[index]; // Get the correct image URL

  if (imageUrl) {
    try {
      await axios.delete(`${API_BASE_URL}/api/properties/image`, {
        data: { imageUrl }, // Send image URL instead of ID if needed
      });
      toast.success("Image deleted successfully!");

      // Remove the deleted image from state
      setProperty((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          imageUrls: prev.imageUrls.filter((_, i) => i !== index),
        };
      });
    } catch (error) {
      toast.error("Error deleting image.");
    }
  }
};


  
  const handleSave = async () => {
    if (!property) return;

    try {
      await axios.put(
        `${API_BASE_URL}/api/properties/${propertyId}`,
        {
          name: property.name,
          description: property.description,
          isActive: property.isActive,
          categoryId: Number(property.categoryId),
          locationId: Number(selectedLocation),
          fullAddress: property.fullAddress,
        },
        { withCredentials: true }
      );

      toast.success("Property updated successfully!");
      router.push("/dashboard/manage-listings");
    } catch (error) {
      toast.error("Error updating property.");
    }
  };

  const handleDeleteProperty = async () => {
    if (!confirm("Are you sure you want to delete this property?")) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/properties/${propertyId}`);
      toast.success("Property deleted successfully!");
      router.push("/dashboard/manage-listings");
    } catch (error) {
      toast.error("Error deleting property.");
    }
  };

  if (loading) return <p className="text-center py-12">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <Card className="max-w-2xl w-full shadow-xl rounded-2xl border-purple-400">
        <CardHeader>
          <CardTitle className="text-purple-600 text-2xl">✏️ Edit Property</CardTitle>
        </CardHeader>
        <CardContent>
    {property ? (
      <form className="space-y-6">
        <Input
          placeholder="Property Name"
          value={property?.name || ""}
          onChange={(e) =>
            setProperty((prev) => prev ? { ...prev, name: e.target.value } : prev)
          }
          required
        />
        <Textarea
          placeholder="Description"
          value={property?.description || ""}
          onChange={(e) =>
            setProperty((prev) => prev ? { ...prev, description: e.target.value } : prev)
          }
          required
        />
        <Input
          placeholder="Full Address"
          value={property?.fullAddress || ""}
          onChange={(e) =>
            setProperty((prev) => prev ? { ...prev, fullAddress: e.target.value } : prev)
          }
          required
        />

        {/* ✅ Category Dropdown */}
        <select
          value={property?.categoryId || ""}
          onChange={(e) =>
            setProperty((prev) => prev ? { ...prev, categoryId: e.target.value } : prev)
          }
          className="w-full border rounded p-2"
          required
        >
          <option value="">Select Category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        {/* ✅ Location Dropdown */}
        <select
          value={selectedLocation || ""}
          onChange={(e) => setSelectedLocation(e.target.value)}
          className="w-full border rounded p-2"
          required
        >
          <option value="">Select Location</option>
          {locations.map((location) => (
            <option key={location.id} value={location.id}>
              {location.name}
            </option>
          ))}
        </select>

        {/* ✅ isActive Toggle */}
        <div className="flex items-center space-x-3">
          <span className="text-gray-700">Active Status:</span>
          <input
            type="checkbox"
            checked={property?.isActive || false}
            onChange={(e) =>
              setProperty((prev) => prev ? { ...prev, isActive: e.target.checked } : prev)
            }
            className="w-5 h-5"
          />
        </div>

        {/* ✅ Image Upload & Previews */}
        {imagePreviews.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative w-20 h-20">
                <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-md" />
                <button
                  type="button"
                  className="absolute top-1 right-1 bg-red-500 text-white text-xs px-1 py-0.5 rounded"
                  onClick={() => handleRemoveImage(index)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <Input type="file" multiple accept="image/*" onChange={handleImageChange} />

            <Button onClick={handleSave} className="w-full bg-purple-600 hover:bg-purple-700">
              Save Changes
            </Button>
            <Button onClick={handleDeleteProperty} className="w-full bg-red-600 hover:bg-red-700 mt-3">
              Delete Property
            </Button>
          </form>
    
    ) : (
      <p className="text-center py-12">Loading property details...</p>
    )}
  </CardContent>
            
      
      </Card>
    </div>
  );
}
