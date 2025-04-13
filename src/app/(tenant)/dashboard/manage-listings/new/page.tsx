"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import axios from "axios";
import { Location, Category } from "@/interfaces/property";
import { faHouse } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";


const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

export default function AddProperty() {
  const router = useRouter();
  const [property, setProperty] = useState({
    name: "",
    description: "",
    categoryId: "",
    isActive: false,
    tenantId: "",
    locationId: "",
    fullAddress: "",

  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<number | null>(null);
  const [selectedIsland, setSelectedIsland] = useState<number | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<number | null>(null);
  const [selectedCity, setSelectedCity] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
const [dialogOpen, setDialogOpen] = useState(false);


  useEffect(() => {
    async function fetchTenantId() {
      try {
        const response = await axios.get("/api/auth/session");
        setProperty((prev) => ({ ...prev, tenantId: response.data.user.id }));
      } catch (error) {
        toast.error("Error fetching tenant ID.");
      }
    }

    async function fetchLocations() {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/locations`);
        setLocations(response.data);
      } catch (error) {
        toast.error("Error fetching locations");
      }
    }

    async function fetchCategories() {
      try {
        const response = await axios.get(`${API_BASE_URL}/categories`);
        setCategories(response.data);
      } catch (error) {
        toast.error("Error fetching categories.");
      }
    }

    fetchTenantId();
    fetchLocations();
    fetchCategories();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
  
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    const selectedFiles = Array.from(e.target.files);
    const invalidFiles = selectedFiles.filter((file) => !allowedTypes.includes(file.type));
  
    if (invalidFiles.length > 0) {
      toast.error("Only JPG, JPEG, and PNG files are allowed.");
      return;
    }
  
    setImages((prevImages) => [...prevImages, ...selectedFiles]);
    const newPreviews = selectedFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews((prevPreviews) => [...prevPreviews, ...newPreviews]);
  };
  
  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
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
  
    if (
      !property.name ||
      !property.description ||
      !property.fullAddress ||
      !property.locationId ||
      !property.categoryId
    ) {
      toast.error("Please fill all required fields.");
      return;
    }
  
    setIsUploading(true);
  
    const formData = new FormData();
    formData.append(
      "data",
      JSON.stringify({
        name: property.name,
        description: property.description,
        isActive: false,
        categoryId: Number(property.categoryId),
        tenantId: Number(property.tenantId),
        locationId: Number(property.locationId),
        fullAddress: property.fullAddress,
      })
    );
  
    images.forEach((file) => formData.append("images", file));
  
    try {
      const session = await axios.get("/api/auth/session");
      const accessToken = session.data.accessToken;
  
      await axios.post(`${API_BASE_URL}/api/properties`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${accessToken}`,
        },
      });
  
      setDialogOpen(true);
    } catch (error) {
      toast.error("Failed to add property.");
    } finally {
      setIsUploading(false);
    }
  };
  

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <Card className="max-w-2xl w-full shadow-xl rounded-2xl border-purple-400">
        <CardHeader>
          <CardTitle className="text-purple-600 text-2xl"><FontAwesomeIcon icon={faHouse} className="mr-2 w-7"/> Add New Property</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              placeholder="Property Name"
              value={property.name}
              onChange={(e) => setProperty({ ...property, name: e.target.value })}
              required
            />
            <Textarea
              placeholder="Description"
              value={property.description}
              onChange={(e) => setProperty({ ...property, description: e.target.value })}
              required
            />
            <Input
              placeholder="Full Address"
              value={property.fullAddress}
              onChange={(e) => setProperty({ ...property, fullAddress: e.target.value })}
              required
            />

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
            <Input
              type="file"
              multiple
              accept=".jpg, .jpeg, .png, image/jpeg, image/png, image/jpg"
              onChange={handleImageChange}
            />


            <Button 
            type="submit" 
            className="w-full bg-purple-600 hover:bg-purple-700" 
            disabled={isUploading}>
            {isUploading ? "Uploading..." : "Save Property"}
            </Button>

          </form>
        </CardContent>
      </Card>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
  <DialogContent>
    <DialogTitle>Success</DialogTitle>
    <DialogDescription>
      Property added successfully!
    </DialogDescription>
    <Button onClick={() => router.push("/dashboard/manage-listings")}>
      OK
    </Button>
  </DialogContent>
</Dialog>

    </div>
  );
}
