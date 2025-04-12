"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";

interface SeatData {
  id: number;
  seatNumber: number;
  isBooked: boolean;
}

interface SeatProps {
  displayNumber: number;
  isBooked: boolean;
}

function Seat({ displayNumber, isBooked }: SeatProps) {
  const bgColor = isBooked ? "bg-red-400" : "bg-green-500";
  const hoverClass = isBooked ? "" : "hover:bg-green-600";

  return (
    <div
      className={`${bgColor} ${hoverClass} text-white font-medium rounded-md w-10 h-10 flex items-center justify-center transition-colors duration-150`}
      aria-label={`Seat ${displayNumber} ${isBooked ? "booked" : "available"}`}
    >
      {displayNumber}
    </div>
  );
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type SeatMapResponse = Record<string, SeatData[]>;

export function SeatBooking() {
  const [allSeats, setAllSeats] = useState<SeatData[]>([]);
  const [seatMap, setSeatMap] = useState<SeatMapResponse>({});
  const [numberOfSeats, setNumberOfSeats] = useState<string>("");
  const [isLoadingSeats, setIsLoadingSeats] = useState<boolean>(true);
  const [isBooking, setIsBooking] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const { token, isLoading: isAuthLoading } = useAuth();

  const totalSeats = allSeats.length;
  const bookedSeatsCount = allSeats.filter((seat) => seat.isBooked).length;
  const availableSeatsCount = totalSeats - bookedSeatsCount;

  const fetchSeatData = useCallback(async () => {
    if (!token) {
      setAllSeats([]);
      setSeatMap({});
      setIsLoadingSeats(false);
      return;
    }
    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const mapResponse = await fetch(`${API_BASE_URL}/seats/map`, { headers });

      if (mapResponse.status === 401) {
        toast.error(
          "Authentication required to view seats. Please log in again."
        );
        setAllSeats([]);
        setSeatMap({});
        return;
      }

      if (!mapResponse.ok) {
        throw new Error(`Failed to fetch seat map: ${mapResponse.statusText}`);
      }

      const mapData: SeatMapResponse = await mapResponse.json();

      const flatSeats = Object.values(mapData)
        .flat()
        .sort((a, b) => a.id - b.id);

      setSeatMap(mapData);
      setAllSeats(flatSeats);
    } catch (error: any) {
      console.error("Error fetching seat data:", error);
      if (
        !(
          error.message.includes("401") ||
          error.message.includes("Unauthorized")
        )
      ) {
        toast.error(error.message || "Failed to load seat information.");
      }
      setAllSeats([]);
      setSeatMap({});
    } finally {
      if (!isResetting && !isBooking) {
        setIsLoadingSeats(false);
      }
    }
  }, [token, isResetting, isBooking]);

  useEffect(() => {
    setIsLoadingSeats(true);
    fetchSeatData();
  }, [fetchSeatData]);

  const handleBooking = async () => {
    if (!token) {
      toast.error("Please log in to book seats.");
      return;
    }

    const seatsToBook = Number.parseInt(numberOfSeats, 10);

    if (isNaN(seatsToBook) || seatsToBook <= 0 || seatsToBook > 7) {
      toast.error("Please enter a valid number of seats.");
      return;
    }

    const currentAvailable =
      allSeats.length - allSeats.filter((s) => s.isBooked).length;
    if (seatsToBook > currentAvailable) {
      toast.error(`Only ${currentAvailable} seat(s) available.`);
      return;
    }

    setIsBooking(true);

    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const response = await fetch(`${API_BASE_URL}/booking/book`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({ count: seatsToBook }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Authentication failed. Please log in again.");
        } else {
          throw new Error(
            result.message || `Booking failed: ${response.statusText}`
          );
        }
      } else {
        toast.success(
          result.message || `${seatsToBook} seat(s) successfully booked!`
        );
        setNumberOfSeats("");
        setIsLoadingSeats(true);
        await fetchSeatData();
      }
    } catch (error: any) {
      console.error("Booking error:", error);
      if (
        !(
          error.message.includes("401") ||
          error.message.includes("Unauthorized")
        )
      ) {
        toast.error(error.message || "An error occurred during booking.");
      }
    } finally {
      setIsBooking(false);
      if (isLoadingSeats) setIsLoadingSeats(false);
    }
  };

  const resetInput = () => {
    setNumberOfSeats("");
  };

  const handleResetBookings = async () => {
    if (!token) {
      toast.error("Please log in to reset bookings.");
      return;
    }

    setIsResetting(true);
    setIsLoadingSeats(true);

    try {
      const headers: HeadersInit = {
        Authorization: `Bearer ${token}`,
      };

      const response = await fetch(`${API_BASE_URL}/seats/reset`, {
        method: "POST",
        headers: headers,
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Authorization failed.");
        } else {
          throw new Error(result.message);
        }
      } else {
        toast.success(result.message || "All bookings have been reset.");
        await fetchSeatData();
      }
    } catch (error: any) {
      console.error("Error resetting bookings:", error);
      if (!(error.message.includes("401") || error.message.includes("403"))) {
        toast.error(
          error.message || "An error occurred while resetting bookings."
        );
      }
    } finally {
      setIsResetting(false);
    }
  };

  const seatRows = [];
  if (!isLoadingSeats && Object.keys(seatMap).length > 0) {
    const sortedRowKeys = Object.keys(seatMap).sort(
      (a, b) => parseInt(a, 10) - parseInt(b, 10)
    );

    for (const rowKey of sortedRowKeys) {
      const rowSeats = seatMap[rowKey];
      seatRows.push(
        <div
          key={`row-${rowKey}`}
          className="flex gap-2 mb-2 justify-center flex-wrap"
        >
          {rowSeats.map((seat) => (
            <Seat
              key={seat.id}
              displayNumber={seat.id}
              isBooked={seat.isBooked}
            />
          ))}
        </div>
      );
    }
  }

  const showLoadingSkeletons = isLoadingSeats || isAuthLoading || isResetting;
  const canInteract = !showLoadingSkeletons && token;
  const canBook = canInteract && availableSeatsCount > 0;

  return (
    <div className="grid lg:grid-cols-[1fr_350px] gap-8">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center">
            {showLoadingSkeletons ? (
              <div className="w-full p-4">
                <Skeleton className="h-8 w-3/4 mb-4 mx-auto" />
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex justify-center gap-2">
                      {[...Array(7)].map((_, j) => (
                        <Skeleton key={j} className="h-10 w-10 rounded-md" />
                      ))}
                    </div>
                  ))}
                </div>
                <div className="flex justify-center gap-4 mt-6">
                  <Skeleton className="h-8 w-32 rounded-md" />
                  <Skeleton className="h-8 w-32 rounded-md" />
                  <Skeleton className="h-8 w-32 rounded-md" />
                </div>
              </div>
            ) : !token ? (
              <p className="text-center text-gray-500 py-10">
                Please log in to view seats.
              </p>
            ) : allSeats.length === 0 ? (
              <p className="text-center text-gray-500 py-10">
                No seats available or failed to load.
              </p>
            ) : (
              <>
                <div className="grid gap-2 mb-6 max-w-full overflow-x-auto px-2">
                  <div className="flex flex-col items-center">{seatRows}</div>
                </div>
                <div className="flex flex-wrap gap-4 mt-4 justify-center">
                  <Badge
                    variant="outline"
                    className="bg-red-400 text-white border-red-500 px-4 py-1 font-semibold"
                    aria-live="polite"
                  >
                    Booked: {bookedSeatsCount}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-green-500 text-white border-green-600 px-4 py-1 font-semibold"
                    aria-live="polite"
                  >
                    Available: {availableSeatsCount}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="px-4 py-1 font-semibold"
                    aria-live="polite"
                  >
                    Total: {totalSeats}
                  </Badge>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Book Seats</CardTitle>
          </CardHeader>
          <CardContent>
            {showLoadingSkeletons ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full mt-2" />
              </div>
            ) : !token ? (
              <p className="text-center text-gray-500">
                Please log in to book seats.
              </p>
            ) : (
              <div className="space-y-4">
                <div>
                  <Input
                    id="numberOfSeats"
                    type="number"
                    placeholder="Number of seats"
                    value={numberOfSeats}
                    onChange={(e) => setNumberOfSeats(e.target.value)}
                    min="1"
                    max={
                      availableSeatsCount > 0
                        ? availableSeatsCount.toString()
                        : "0"
                    }
                    disabled={
                      isBooking ||
                      isResetting ||
                      !canInteract ||
                      availableSeatsCount === 0
                    }
                    aria-label="Number of seats to book"
                    required
                  />
                </div>
                <Button
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  onClick={handleBooking}
                  disabled={
                    isBooking ||
                    isResetting ||
                    !canBook ||
                    !numberOfSeats ||
                    parseInt(numberOfSeats, 10) <= 0
                  }
                >
                  {isBooking ? "Booking..." : "Book"}
                </Button>

                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleResetBookings}
                  disabled={isBooking || isResetting || !canInteract}
                >
                  {isResetting ? "Resetting..." : "Reset All Bookings"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
