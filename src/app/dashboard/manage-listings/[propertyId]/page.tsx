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

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

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
        const response = await axios.get(
          `${API_BASE_URL}/api/properties/${propertyId}`,
          { withCredentials: true }
        );
        setProperty(response.data);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          toast.error(
            error.response?.data?.message || "Error fetching property details."
          );
        } else {
          toast.error("An unexpected error occurred.");
        }
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
      await axios.put(
        `${API_BASE_URL}/api/properties/${propertyId}/images`,
        formData,
        { withCredentials: true }
      );
      toast.success("Images uploaded successfully!");
      setImages(null);
      router.refresh();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || "Error uploading images."
        );
      } else {
        toast.error("An unexpected error occurred.");
      }
    }
  };

  const handleDeleteImage = async (imageUrl: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/properties/image`, {
        params: { imageUrl },
        withCredentials: true,
      });
      toast.success("Image deleted successfully!");
      router.refresh();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || "Error deleting image."
        );
      } else {
        toast.error("An unexpected error occurred.");
      }
    }
  };

  const handleSave = async () => {
    if (!property) return;

    try {
      await axios.put(
        `${API_BASE_URL}/api/properties/${propertyId}`,
        {
          ...property,
          categoryId: Number(property.categoryId),
          locationId: property.location.id,
        },
        { withCredentials: true }
      );
      toast.success("Property updated successfully!");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || "Error updating property."
        );
      } else {
        toast.error("An unexpected error occurred.");
      }
    }
  };

  const handleDeleteProperty = async () => {
    if (!confirm("Are you sure you want to delete this property?")) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/properties/${propertyId}`, {
        withCredentials: true,
      });
      toast.success("Property deleted successfully!");
      router.push("/dashboard/manage-listings");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || "Error deleting property."
        );
      } else {
        toast.error("An unexpected error occurred.");
      }
    }
  };

  if (loading) return <p className="text-center py-12">Loading...</p>;
  if (!property)
    return <p className="text-center py-12">Property not found.</p>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 flex justify-center">
      <Card className="max-w-3xl w-full shadow-xl">
        <CardHeader>
          <CardTitle className="text-purple-600 text-2xl">
            ✏️ Edit Property
          </CardTitle>
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
            onChange={(e) =>
              setProperty({ ...property, description: e.target.value })
            }
          />
          <Input
            placeholder="Full Address"
            value={property.fullAddress}
            onChange={(e) =>
              setProperty({ ...property, fullAddress: e.target.value })
            }
          />

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
