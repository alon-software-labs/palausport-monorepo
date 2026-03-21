import { Link } from "react-router-dom";
import HeroBanner from "@/components/HeroBanner";
import { Navbar } from "@/components/Navbar";
import { MyReservations } from "@/components/MyReservations";
import { ClientRouteGuard } from "@/components/ClientRouteGuard";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Anchor } from "lucide-react";

const ReservationList = () => {
  const { currentUser, userRole, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (userRole === "employee") {
    return <ClientRouteGuard requireAuth={false}>{null}</ClientRouteGuard>;
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
        <p className="text-muted-foreground">Sign in to view your reservations.</p>
        <Button asChild>
          <Link to="/login">Sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={currentUser} />
      <HeroBanner />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <MyReservations />
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

export default ReservationList;
