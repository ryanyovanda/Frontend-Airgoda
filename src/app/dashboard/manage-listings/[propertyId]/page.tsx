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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

interface Location {
  id: number;
  name: string;
  type: string;
}

interface Property {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  location: Location;
  fullAddress: string;
  imageUrls: string[];
}

export default function ManageProperty() {
  const { propertyId } = useParams();
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [images, setImages] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProperty() {
      try {
        const response = await axios.get(`${API_BASE_URL}/properties/${propertyId}`);
        setProperty(response.data);
      } catch (error) {
        toast.error("Error fetching property details.");
      } finally {
        setLoading(false);
      }
    }

    fetchProperty();
  }, [propertyId]);

  const handleImageUpload = async () => {
    if (!images) {
      toast.error("Please select images to upload.");
      return;
    }

    const formData = new FormData();
    Array.from(images).forEach((file) => formData.append("images", file));

    try {
      await axios.put(`${API_BASE_URL}/properties/${propertyId}/images`, formData);
      toast.success("Images uploaded successfully!");
      setImages(null);
      router.refresh();
    } catch (error) {
      toast.error("Error uploading images.");
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    try {
      await axios.delete(`${API_BASE_URL}/properties/image/${imageId}`);
      toast.success("Image deleted successfully!");
      router.refresh();
    } catch (error) {
      toast.error("Error deleting image.");
    }
  };

  const handleSave = async () => {
    if (!property) return;

    try {
      await axios.put(`${API_BASE_URL}/properties/${propertyId}`, {
        ...property,
        categoryId: Number(property.categoryId),
        locationId: property.location.id,
      });
      toast.success("Property updated successfully!");
    } catch (error) {
      toast.error("Error updating property.");
    }
  };

  const handleDeleteProperty = async () => {
    if (!confirm("Are you sure you want to delete this property?")) return;

    try {
      await axios.delete(`${API_BASE_URL}/properties/${propertyId}`);
      toast.success("Property deleted successfully!");
      router.push("/dashboard/manage-listings");
    } catch (error) {
      toast.error("Error deleting property.");
    }
  };

  if (loading) return <p className="text-center py-12">Loading...</p>;
  if (!property) return <p className="text-center py-12">Property not found.</p>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 flex justify-center">
      <Card className="max-w-3xl w-full shadow-xl">
        <CardHeader>
          <CardTitle className="text-purple-600 text-2xl">✏️ Edit Property</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Property Name"
            value={property.name}
            onChange={(e) => setProperty({ ...property, name: e.target.value })}
          />
          <Textarea
            placeholder="Description"
            value={property.description}
            onChange={(e) => setProperty({ ...property, description: e.target.value })}
          />
          <Input
            placeholder="Full Address"
            value={property.fullAddress}
            onChange={(e) => setProperty({ ...property, fullAddress: e.target.value })}
          />

          <div className="grid grid-cols-4 gap-2">
            {property.imageUrls.map((imgUrl, idx) => (
              <div key={idx} className="relative w-24 h-24">
                <img src={imgUrl} alt="Property" className="rounded-md w-full h-full object-cover" />
                <button
                  className="absolute top-1 right-1 bg-red-500 text-white rounded px-1"
                  onClick={() => handleDeleteImage(imgUrl)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <Input type="file" multiple onChange={(e) => setImages(e.target.files)} />
          <Button onClick={handleImageUpload} className="bg-green-500">
            <FontAwesomeIcon icon={faUpload} className="mr-2" /> Upload Images
          </Button>
          <div className="flex gap-2">
            <Button onClick={handleSave} className="bg-blue-500">
              <FontAwesomeIcon icon={faSave} className="mr-2" /> Save Changes
            </Button>
            <Button onClick={handleDeleteProperty} className="bg-red-500">
              <FontAwesomeIcon icon={faTrash} className="mr-2" /> Delete Property
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}