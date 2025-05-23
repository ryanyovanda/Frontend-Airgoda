"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import axios, { AxiosError } from "axios"; 
import { DateRange } from "react-day-picker"; 
import { PeakRate } from "@/interfaces/roomvariant";
import { useToast } from "@/providers/ToastProvider";
import { useConfirmDeleteDialog } from "@/hooks/useConfirmDeleteDialog";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";


const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

const ManagePeakRates = () => {
  const params = useParams();
  const roomVariantId = Number(params.roomVariantId);

  const [peakRates, setPeakRates] = useState<PeakRate[]>([]);
  const [selectedDates, setSelectedDates] = useState<DateRange | undefined>(undefined);
  const [additionalPrice, setAdditionalPrice] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const { showToast } = useToast();

  const {
    isOpen,
    targetId,
    openDialog,
    closeDialog
  } = useConfirmDeleteDialog();

  useEffect(() => {
    fetchPeakRates();
  }, []);

  const fetchPeakRates = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/peak-rates`);
      const allPeakRates: PeakRate[] = response.data;

      const filteredPeakRates = allPeakRates.filter(rate => rate.roomVariantId === roomVariantId);
      setPeakRates(filteredPeakRates);
    } catch (error) {
      console.error("Error fetching peak rates:", error);
      showToast("Failed to fetch peak rates.", "error");
    }
  };

  const handleAddPeakRate = async () => {
    if (!selectedDates || !selectedDates.from || !selectedDates.to || additionalPrice <= 0 || isNaN(additionalPrice)) {
      showToast("Please select valid dates and enter a valid price.", "error");
      return;
    }

    setLoading(true);

    const newPeakRate = {
      roomVariantId: roomVariantId,
      startDate: format(selectedDates.from, "yyyy-MM-dd"),
      endDate: format(selectedDates.to, "yyyy-MM-dd"),
      additionalPrice,
    };

    try {
      const session = await axios.get("/api/auth/session");
      const accessToken = session.data.accessToken;

      await axios.post(`${BACKEND_URL}/peak-rates`, newPeakRate, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      showToast("Peak rate added successfully!", "success");
      fetchPeakRates();
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error("Error adding peak rate:", axiosError.response?.data || axiosError.message);
      showToast("Choose another date, peak rate already added", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePeakRate = async (peakRateId: number) => {
    try {
      const session = await axios.get("/api/auth/session");
      const accessToken = session.data.accessToken;

      await axios.delete(`${BACKEND_URL}/peak-rates/${peakRateId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      showToast("Peak rate deleted successfully!", "success");
      fetchPeakRates();
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error("Error deleting peak rate:", axiosError.response?.data || axiosError.message);
      showToast("Failed to delete peak rate", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 flex justify-center flex-col ">
      <Card className="w-full max-w-3xl shadow-xl flex justify-center items-center flex-col">
        <CardHeader>
          <CardTitle className="text-xl">Manage Peak Rates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Calendar
              mode="range"
              selected={selectedDates}
              onSelect={(range) => setSelectedDates(range || undefined)}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Price</label>
            <Input
              type="number"
              value={additionalPrice}
              onChange={(e) => {
                const price = parseInt(e.target.value);
                setAdditionalPrice(price || 0);
              }}
            />
          </div>

          <Button onClick={handleAddPeakRate} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
            {loading ? "Adding..." : "Add Peak Rate"}
          </Button>
        </CardContent>
      </Card>

      <div className="mt-6 w-full max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Existing Peak Rates for this Room Variant</CardTitle>
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
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {peakRates.map((rate) => (
                    <TableRow key={rate.id}>
                      <TableCell>{rate.startDate}</TableCell>
                      <TableCell>{rate.endDate}</TableCell>
                      <TableCell>Rp {rate.additionalPrice.toLocaleString()}</TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => openDialog(rate.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This will permanently delete the selected peak rate. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={closeDialog}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              if (targetId !== null) {
                handleDeletePeakRate(targetId);
                closeDialog();
              }
            }}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    </div>
  );
};

export default ManagePeakRates;
