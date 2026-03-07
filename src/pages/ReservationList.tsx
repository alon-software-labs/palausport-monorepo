import { Link } from "react-router-dom";
import HeroBanner from "@/components/HeroBanner";
import { MyReservations } from "@/components/MyReservations";
import { ClientRouteGuard } from "@/components/ClientRouteGuard";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Anchor, Plus } from "lucide-react";

function HeaderBar({ user }: { user: { email: string } }) {
  const { logout } = useAuth();
  return (
    <div className="flex justify-between items-center gap-3 px-4 py-2 border-b bg-background/80">
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/">Home</Link>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/reservations">My Reservations</Link>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/reservations/new">
            <Plus className="w-4 h-4 mr-1" />
            New Reservation
          </Link>
        </Button>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Signed in as {user.email}</span>
        <Button variant="ghost" size="sm" onClick={() => logout()}>
          Log out
        </Button>
      </div>
    </div>
  );
}

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
      <HeaderBar user={currentUser} />
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
