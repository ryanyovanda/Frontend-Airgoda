"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import axios from "axios";

interface Discount {
  id: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  startDate: string;
  endDate: string;
}

export default function ManageDiscounts() {
  const { propertyId } = useParams();
  const router = useRouter();
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDiscount, setNewDiscount] = useState<Discount>({
    id: "",
    type: "PERCENTAGE",
    value: 0,
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    async function fetchDiscounts() {
      try {
        const response = await axios.get(`/api/discounts/${propertyId}`);
        setDiscounts(response.data);
      } catch (error) {
        console.error("Error fetching discounts:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDiscounts();
  }, [propertyId]);

  const handleAddDiscount = async () => {
    try {
      const response = await axios.post(`/api/discounts/${propertyId}`, newDiscount);
      setDiscounts([...discounts, response.data]);
      setNewDiscount({ id: "", type: "PERCENTAGE", value: 0, startDate: "", endDate: "" });
    } catch (error) {
      console.error("Error adding discount:", error);
    }
  };

  const handleDeleteDiscount = async (id: string) => {
    if (confirm("Are you sure you want to delete this discount?")) {
      try {
        await axios.delete(`/api/discounts/${id}`);
        setDiscounts(discounts.filter(discount => discount.id !== id));
      } catch (error) {
        console.error("Error deleting discount:", error);
      }
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Manage Discounts</h1>

      <div className="mb-6 flex gap-4">
        <select
          value={newDiscount.type}
          onChange={(e) => setNewDiscount({ ...newDiscount, type: e.target.value as "PERCENTAGE" | "FIXED" })}
          className="border p-2"
        >
          <option value="PERCENTAGE">Percentage (%)</option>
          <option value="FIXED">Fixed Amount ($)</option>
        </select>
        <Input
          type="number"
          placeholder="Discount Value"
          value={newDiscount.value}
          onChange={(e) => setNewDiscount({ ...newDiscount, value: parseFloat(e.target.value) })}
        />
        <Input
          type="date"
          value={newDiscount.startDate}
          onChange={(e) => setNewDiscount({ ...newDiscount, startDate: e.target.value })}
        />
        <Input
          type="date"
          value={newDiscount.endDate}
          onChange={(e) => setNewDiscount({ ...newDiscount, endDate: e.target.value })}
        />
        <Button onClick={handleAddDiscount}>Add Discount</Button>
      </div>

      {loading ? (
        <p>Loading discounts...</p>
      ) : discounts.length === 0 ? (
        <p>No discounts found.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {discounts.map((discount) => (
              <TableRow key={discount.id}>
                <TableCell>{discount.type}</TableCell>
                <TableCell>{discount.type === "PERCENTAGE" ? `${discount.value}%` : `$${discount.value}`}</TableCell>
                <TableCell>{discount.startDate}</TableCell>
                <TableCell>{discount.endDate}</TableCell>
                <TableCell>
                  <Button variant="destructive" onClick={() => handleDeleteDiscount(discount.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
