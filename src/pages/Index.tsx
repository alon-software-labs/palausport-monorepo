import { Link } from "react-router-dom";
import HeroBanner from "@/components/HeroBanner";
import CabinInventory from "@/components/CabinInventory";
import ReservationForm from "@/components/ReservationForm";
import { MyReservations } from "@/components/MyReservations";
import { ClientRouteGuard } from "@/components/ClientRouteGuard";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Anchor } from "lucide-react";

function HeaderBar({ user }: { user: { email: string } }) {
  const { logout } = useAuth();
  return (
    <div className="flex justify-end items-center gap-3 px-4 py-2 border-b bg-background/80">
      <span className="text-sm text-muted-foreground">Signed in as {user.email}</span>
      <Button variant="ghost" size="sm" onClick={() => logout()}>
        Log out
      </Button>
    </div>
  );
}

const Index = () => {
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

  return (
    <div className="min-h-screen bg-background">
      {currentUser && (
        <HeaderBar user={currentUser} />
      )}
      <HeroBanner />

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {currentUser ? (
          <>
            <MyReservations />
            <CabinInventory />
            <ReservationForm />
          </>
        ) : (
          <div className="flex flex-col items-center gap-4 py-12 text-center">
            <p className="text-muted-foreground">Sign in to make a reservation or view your bookings.</p>
            <div className="flex gap-3">
              <Button asChild>
                <Link to="/login">Sign in</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/signup">Sign up</Link>
              </Button>
            </div>
          </div>
        )}
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
