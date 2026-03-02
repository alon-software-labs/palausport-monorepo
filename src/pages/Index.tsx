import HeroBanner from "@/components/HeroBanner";
import CabinInventory from "@/components/CabinInventory";
import ReservationForm from "@/components/ReservationForm";
import { Anchor } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroBanner />

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <CabinInventory />
        <ReservationForm />
      </main>

      <footer className="border-t py-6 text-center">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Anchor className="w-4 h-4" />
          <span>Cruise Reservation System</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
