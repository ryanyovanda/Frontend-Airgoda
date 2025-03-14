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
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteImageIndex, setDeleteImageIndex] = useState<number | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const propertyRes = await axios.get(`${API_BASE_URL}/api/properties/${propertyId}`);
        setProperty(propertyRes.data);
        setSelectedLocation(propertyRes.data.locationId);
        setImagePreviews(propertyRes.data.imageUrls || []);

        const categoriesRes = await axios.get(`${API_BASE_URL}/categories`);
        setCategories(categoriesRes.data);

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

  const confirmDeleteImage = (index: number) => {
    setDeleteImageIndex(index); // Open confirmation modal
  };

  const handleRemoveImage = async () => {
    if (deleteImageIndex === null || !property) return;

    const imageId = property.imageIds[deleteImageIndex];

    if (imageId) {
      try {
        await axios.delete(`${API_BASE_URL}/api/properties/image/${imageId}`);
        toast.success("Image deleted successfully!");

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
          imageUrls: property.imageUrls, // Ensure images are correctly passed
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
          <form className="space-y-6">
          <Input
  placeholder="Property Name"
  value={property?.name || ""}
  onChange={(e) =>
    setProperty((prev) => ({ ...prev!, name: e.target.value }))
  }
  required
/>
<Textarea
  placeholder="Description"
  value={property?.description || ""}
  onChange={(e) =>
    setProperty((prev) => ({ ...prev!, description: e.target.value }))
  }
  required
/>
<Input
  placeholder="Full Address"
  value={property?.fullAddress || ""}
  onChange={(e) =>
    setProperty((prev) => ({ ...prev!, fullAddress: e.target.value }))
  }
  required
/>

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
            <Input type="file" multiple accept="image/*" onChange={handleImageChange} />

            <Button onClick={handleSave} className="w-full bg-purple-600 hover:bg-purple-700">
              Save Changes
            </Button>
            <Button onClick={handleDeleteProperty} className="w-full bg-red-600 hover:bg-red-700 mt-3">
              Delete Property
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* ✅ ChadCN Dialog for Delete Confirmation */}
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
