"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { format } from "date-fns";
import axios, { AxiosError } from "axios"; 
import { DateRange } from "react-day-picker"; // ✅ Import DateRange

interface PeakRate {
  id: number;
  roomVariantId: number;
  startDate: string;
  endDate: string;
  additionalPrice: number;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

const ManagePeakRates = () => {
  const params = useParams();
  const roomVariantId = Number(params.roomVariantId); // Ensure it's a number

  const [peakRates, setPeakRates] = useState<PeakRate[]>([]);
  const [selectedDates, setSelectedDates] = useState<DateRange | undefined>(undefined);
  const [additionalPrice, setAdditionalPrice] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchPeakRates();
  }, []);

  const fetchPeakRates = async () => {
    try {
      console.log("Fetching all peak rates...");
      const response = await axios.get(`${BACKEND_URL}/peak-rates`);
      const allPeakRates: PeakRate[] = response.data;

      // ✅ Filter only peak rates for the current room variant
      const filteredPeakRates = allPeakRates.filter(rate => rate.roomVariantId === roomVariantId);

      console.log(`Filtered Peak Rates for Room Variant ID ${roomVariantId}:`, filteredPeakRates);
      setPeakRates(filteredPeakRates);
    } catch (error) {
      console.error("Error fetching peak rates:", error);
      toast.error("Failed to fetch peak rates.");
    }
  };

  const handleAddPeakRate = async () => {
    console.log("✅ Button clicked!");
    console.log("📅 Selected Dates:", selectedDates);
    console.log("💰 Additional Price:", additionalPrice);
  
    // ✅ Ensure selectedDates is defined before accessing its properties
    if (!selectedDates || !selectedDates.from || !selectedDates.to || additionalPrice <= 0 || isNaN(additionalPrice)) {
      toast.error("Please select valid dates and enter a valid price.");
      console.log("❌ Invalid Input:", { selectedDates, additionalPrice });
      return;
    }
  
    setLoading(true);
  
    const newPeakRate = {
      roomVariantId: roomVariantId,
      startDate: format(selectedDates.from, "yyyy-MM-dd"),
      endDate: format(selectedDates.to, "yyyy-MM-dd"),
      additionalPrice,
    };
  
    console.log("🚀 Sending Peak Rate Payload:", newPeakRate);
  
    try {
      console.log("📡 Sending request to API...");
      const response = await axios.post(`${BACKEND_URL}/peak-rates`, newPeakRate, {
        headers: { "Content-Type": "application/json" },
      });
  
      console.log("✅ Peak Rate POST Response:", response.data);
      toast.success("Peak rate added successfully!");
      fetchPeakRates(); 
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error("❌ Error adding peak rate:", axiosError.response?.data || axiosError.message);
      toast.error("Failed to add peak rate.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 flex justify-center">
      <Card className="w-full max-w-3xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl">📅 Manage Peak Rates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
          <Calendar
  mode="range"
  selected={selectedDates} // ✅ Will only pass a valid DateRange or undefined
  onSelect={(range) => {
    console.log("📅 Date Range Selected:", range);
    setSelectedDates(range || undefined); // ✅ Ensure undefined instead of an empty object
  }}
/>

          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Price</label>
            <Input
              type="number"
              value={additionalPrice}
              onChange={(e) => {
                const price = parseInt(e.target.value);
                console.log("💰 Updated Additional Price:", price);
                setAdditionalPrice(price || 0);
              }}
            />
          </div>

          <Button onClick={handleAddPeakRate} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
            {loading ? "Adding..." : "Add Peak Rate"}
          </Button>
        </CardContent>
      </Card>

      {/* ✅ Display Existing Peak Rates */}
      <div className="mt-6 w-full max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">📌 Existing Peak Rates for this Room Variant</CardTitle>
          </CardHeader>
          <CardContent>
            {peakRates.length === 0 ? (
              <p className="text-gray-500 text-center">No peak rates found.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Additional Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {peakRates.map((rate) => (
                    <TableRow key={rate.id}>
                      <TableCell>{rate.startDate}</TableCell>
                      <TableCell>{rate.endDate}</TableCell>
                      <TableCell>Rp {rate.additionalPrice.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManagePeakRates;
