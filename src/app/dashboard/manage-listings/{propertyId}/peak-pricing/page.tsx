"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import axios from "axios";

interface PeakRate {
  id: string;
  startDate: string;
  endDate: string;
  price: number;
}

export default function ManagePeakPricing() {
  const { propertyId } = useParams();
  const router = useRouter();
  const [peakRates, setPeakRates] = useState<PeakRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPeakRate, setNewPeakRate] = useState<PeakRate>({
    id: "",
    startDate: "",
    endDate: "",
    price: 0,
  });

  useEffect(() => {
    async function fetchPeakRates() {
      try {
        const response = await axios.get(`/api/peak-rates/${propertyId}`);
        setPeakRates(response.data);
      } catch (error) {
        console.error("Error fetching peak rates:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPeakRates();
  }, [propertyId]);

  const handleAddPeakRate = async () => {
    try {
      const response = await axios.post(`/api/peak-rates/${propertyId}`, newPeakRate);
      setPeakRates([...peakRates, response.data]);
      setNewPeakRate({ id: "", startDate: "", endDate: "", price: 0 });
    } catch (error) {
      console.error("Error adding peak rate:", error);
    }
  };

  const handleDeletePeakRate = async (id: string) => {
    if (confirm("Are you sure you want to remove this peak rate?")) {
      try {
        await axios.delete(`/api/peak-rates/${id}`);
        setPeakRates(peakRates.filter(rate => rate.id !== id));
      } catch (error) {
        console.error("Error deleting peak rate:", error);
      }
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Manage Peak Season Pricing</h1>

      <div className="mb-6 flex gap-4">
        <Input
          type="date"
          value={newPeakRate.startDate}
          onChange={(e) => setNewPeakRate({ ...newPeakRate, startDate: e.target.value })}
        />
        <Input
          type="date"
          value={newPeakRate.endDate}
          onChange={(e) => setNewPeakRate({ ...newPeakRate, endDate: e.target.value })}
        />
        <Input
          type="number"
          placeholder="Special Price"
          value={newPeakRate.price}
          onChange={(e) => setNewPeakRate({ ...newPeakRate, price: parseFloat(e.target.value) })}
        />
        <Button onClick={handleAddPeakRate}>Add Peak Rate</Button>
      </div>

      {loading ? (
        <p>Loading peak season rates...</p>
      ) : peakRates.length === 0 ? (
        <p>No peak season pricing set.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Special Price</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {peakRates.map((rate) => (
              <TableRow key={rate.id}>
                <TableCell>{rate.startDate}</TableCell>
                <TableCell>{rate.endDate}</TableCell>
                <TableCell>${rate.price.toFixed(2)}</TableCell>
                <TableCell>
                  <Button variant="destructive" onClick={() => handleDeletePeakRate(rate.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
