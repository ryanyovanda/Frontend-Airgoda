"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import axios from "axios";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";

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
  imageIds: number[];
  imageUrls: string[];
}

export default function ManageProperty() {
  const { propertyId } = useParams();
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<number | null>(null);
  const [selectedIsland, setSelectedIsland] = useState<number | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<number | null>(null);
  const [selectedCity, setSelectedCity] = useState<number | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [deleteImageIndex, setDeleteImageIndex] = useState<number | null>(null);
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

  const confirmDeleteImage = (index: number) => {
    setDeleteImageIndex(index);
  };

  const handleRemoveImage = async () => {
    if (deleteImageIndex === null || !property) return;

    const imageId = property.imageIds[deleteImageIndex]; // Get the correct image ID

    if (imageId) {
      try {
        await axios.delete(`${API_BASE_URL}/api/properties/image/${imageId}`);
        toast.success("Image deleted successfully!");

        // Update state after successful deletion
        setProperty((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            imageIds: prev.imageIds.filter((_, i) => i !== deleteImageIndex),
            imageUrls: prev.imageUrls.filter((_, i) => i !== deleteImageIndex),
          };
        });

        setImagePreviews((prev) => prev.filter((_, i) => i !== deleteImageIndex));
      } catch (error) {
        toast.error("Error deleting image.");
      }
    }
    setDeleteImageIndex(null);
  };

  const getFilteredLocations = (type: string, parentId: number | null) => {
    return locations.filter(
      (loc) => loc.type === type && (loc.parent ? loc.parent.id === parentId : parentId === null)
    );
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const countryId = parseInt(e.target.value);
    setSelectedCountry(countryId);
    setSelectedIsland(null);
    setSelectedProvince(null);
    setSelectedCity(null);
    
    setProperty((prev) => prev ? { ...prev, locationId: "" } : prev);
  };
  
  const handleIslandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const islandId = parseInt(e.target.value);
    setSelectedIsland(islandId);
    setSelectedProvince(null);
    setSelectedCity(null);
  
    setProperty((prev) => prev ? { ...prev, locationId: "" } : prev);
  };
  
  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provinceId = parseInt(e.target.value);
    setSelectedProvince(provinceId);
    setSelectedCity(null);
  
    setProperty((prev) => prev ? { ...prev, locationId: "" } : prev);
  };
  
  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cityId = parseInt(e.target.value);
    setSelectedCity(cityId);
  
    setProperty((prev) => prev ? { ...prev, locationId: cityId.toString() } : prev);
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

  const handleUploadImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !property) return;

    const selectedFiles = Array.from(e.target.files);
    const formData = new FormData();

    selectedFiles.forEach((file) => {
      formData.append("images", file);
    });

    try {
      const response = await axios.put(`${API_BASE_URL}/api/properties/${propertyId}/images`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Images uploaded successfully!");

      // Update image list with newly uploaded images
      setProperty((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          imageUrls: [...prev.imageUrls, ...response.data.imageUrls],
          imageIds: [...prev.imageIds, ...response.data.imageIds],
        };
      });

      setImagePreviews((prev) => [...prev, ...response.data.imageUrls]);
    } catch (error) {
      toast.error("Error uploading images.");
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
              <Input placeholder="Property Name" value={property.name} onChange={(e) => setProperty({ ...property, name: e.target.value })} required />
              <Textarea placeholder="Description" value={property.description} onChange={(e) => setProperty({ ...property, description: e.target.value })} required />
              <Input placeholder="Full Address" value={property.fullAddress} onChange={(e) => setProperty({ ...property, fullAddress: e.target.value })} required />

              {/* ✅ Category Dropdown */}
              <select
                value={property.categoryId}
                onChange={(e) => setProperty({ ...property, categoryId: e.target.value })}
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

              {/* Location Dropdowns */}
            <select value={selectedCountry || ""} onChange={handleCountryChange} className="w-full border rounded p-2">
              <option value="">Select Country</option>
              {getFilteredLocations("COUNTRY", null).map((loc) => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>

            <select value={selectedIsland || ""} onChange={handleIslandChange} className="w-full border rounded p-2">
              <option value="">Select Island</option>
              {getFilteredLocations("ISLAND", selectedCountry).map((loc) => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>

            <select value={selectedProvince || ""} onChange={handleProvinceChange} className="w-full border rounded p-2">
              <option value="">Select Province</option>
              {getFilteredLocations("PROVINCE", selectedIsland).map((loc) => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>

            <select value={selectedCity || ""} onChange={handleCityChange} className="w-full border rounded p-2">
              <option value="">Select City</option>
              {getFilteredLocations("CITY", selectedProvince).map((loc) => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
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
                      <button type="button" className="absolute top-1 right-1 bg-red-500 text-white text-xs px-1 py-0.5 rounded" onClick={() => confirmDeleteImage(index)}>
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <Input type="file" multiple accept="image/*" onChange={handleUploadImages} />

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

      {/* ✅ Delete Confirmation Dialog */}
      <Dialog open={deleteImageIndex !== null} onOpenChange={() => setDeleteImageIndex(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Image</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this image?</p>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDeleteImageIndex(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleRemoveImage}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
