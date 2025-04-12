import { SeatBooking } from "@/components/seat-booking";
import { Navbar } from "@/components/navbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <Navbar />
      <main className="container mx-auto py-8 px-4 max-w-6xl">
        <SeatBooking />
      </main>
    </div>
  );
}
