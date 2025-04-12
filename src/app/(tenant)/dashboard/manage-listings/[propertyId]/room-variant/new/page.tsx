"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import axios from "axios";
import {faHouse } from "@fortawesome/free-solid-svg-icons";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

export default function AddRoomVariant() {
    const params = useParams(); 
    const router = useRouter();
    const propertyId = Number(params.propertyId); 
    const { data: session } = useSession();

    const [formData, setFormData] = useState({
        name: "",
        price: "",
        maxGuest: "",
        capacity: "",
        facilities: [] as string[],
    });

    const [facilityInput, setFacilityInput] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!propertyId) {
            toast.error("Property ID is missing.");
            router.push("/dashboard/manage-listings");
        }
    }, [propertyId, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddFacility = () => {
        if (facilityInput.trim() && !formData.facilities.includes(facilityInput.trim())) {
            if (formData.facilities.length < 10) {
                setFormData((prev) => ({
                    ...prev,
                    facilities: [...prev.facilities, facilityInput.trim()],
                }));
                setFacilityInput("");
            } else {
                toast.error("You can only add up to 10 facilities.");
            }
        }
    };

    const handleRemoveFacility = (facility: string) => {
        setFormData((prev) => ({
            ...prev,
            facilities: prev.facilities.filter((f) => f !== facility),
        }));
    };

    
const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (!session?.accessToken) {
        toast.error("You must be logged in to perform this action.");
        setLoading(false);
        return;
    }

    const payload = {
        ...formData,
        price: Number(formData.price),
        maxGuest: Number(formData.maxGuest),
        capacity: Number(formData.capacity),
        propertyId,
    };

    try {
        const response = await axios.post(
            `${API_BASE_URL}/api/room-variants`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${session.accessToken}`,
                },
            }
        );
        toast.success("Room variant added successfully!");
        router.push(`/dashboard/manage-listings/${propertyId}/room-variant`);
    } catch (error: any) {
        console.error("Detailed error response:", error.response.data);
        toast.error(`Failed to add room variant: ${error.response?.data?.message || error.message}`);
    } finally {
        setLoading(false);
    }
};

    return (
        <div className="max-w-lg mx-auto p-6 bg-white shadow-md rounded-lg mt-6">
            <h2 className="text-2xl font-bold mb-4">Add Room Variant</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label htmlFor="name">Room Name</Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                </div>

                <div>
                    <Label htmlFor="price">Price (IDR)</Label>
                    <Input id="price" name="price" type="number" value={formData.price} onChange={handleChange} required />
                </div>

                <div>
                    <Label htmlFor="maxGuest">Max Guests</Label>
                    <Input id="maxGuest" name="maxGuest" type="number" value={formData.maxGuest} onChange={handleChange} required />
                </div>

                <div>
                    <Label htmlFor="capacity">Capacity</Label>
                    <Input id="capacity" name="capacity" type="number" value={formData.capacity} onChange={handleChange} required />
                </div>

                <div>
                    <Label htmlFor="facility">Facilities (Max: 10)</Label>
                    <div className="flex space-x-2 mb-2">
                        <Input
                            id="facility"
                            value={facilityInput}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFacilityInput(e.target.value)}
                            onKeyDown={(e) =>{
                                if (e.key === "Enter"){
                                    e.preventDefault();
                                    handleAddFacility();
                                }
                            }}
                            placeholder="Add a facility"
                        />
                        <Button type="button" onClick={handleAddFacility} className="bg-blue-600 hover:bg-blue-700 text-white">
                            Add
                        </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {formData.facilities.map((facility) => (
                            <div key={facility} className="flex items-center bg-gray-200 px-2 py-1 rounded">
                                <span className="mr-2">{facility}</span>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveFacility(facility)}
                                    className="text-red-600 hover:text-red-800 font-bold"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                    {loading ? "Adding..." : "Add Room Variant"}
                </Button>
            </form>
        </div>
    );
}
