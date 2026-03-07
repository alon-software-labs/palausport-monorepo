import { Link } from "react-router-dom";
import HeroBanner from "@/components/HeroBanner";
import { ClientRouteGuard } from "@/components/ClientRouteGuard";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Anchor, ClipboardList, List, Plus, Ticket } from "lucide-react";

function HeaderBar({ user }: { user: { email: string } }) {
  const { logout } = useAuth();
  return (
    <div className="flex justify-between items-center gap-3 px-4 py-2 border-b bg-background/80">
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/reservations">
            <List className="w-4 h-4 mr-1" />
            My Reservations
          </Link>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/reservations/new">
            <Plus className="w-4 h-4 mr-1" />
            New Reservation
          </Link>
        </Button>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">
          Signed in as {user.email}
        </span>
        <Button variant="ghost" size="sm" onClick={() => logout()}>
          Log out
        </Button>
      </div>
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
      {currentUser && <HeaderBar user={currentUser} />}
      <HeroBanner />

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {currentUser ? (
          <div className="flex flex-col items-center gap-8 py-12">
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-6 w-full max-w-2xl">
              <Link
                to="/reservations"
                className="group flex flex-1 min-w-0 items-center gap-6 p-8 rounded-2xl bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:shadow-primary/25 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98] border-2 border-primary/80 hover:border-primary opacity-0 animate-[fade-in-up_0.6s_ease-out_0.2s_forwards]"
              >
                <div className="flex-shrink-0 w-20 h-20 rounded-xl bg-primary-foreground/15 flex items-center justify-center group-hover:animate-[icon-float_2s_ease-in-out_infinite]">
                  <ClipboardList
                    className="w-10 h-10 text-primary-foreground"
                    strokeWidth={2}
                  />
                </div>
                <div className="text-left">
                  <h2 className="font-display text-xl md:text-2xl font-bold tracking-tight">
                    View My Reservations
                  </h2>
                  <p className="text-primary-foreground/80 text-sm mt-1">
                    See your booked cruises and cabin details
                  </p>
                </div>
              </Link>
              <Link
                to="/reservations/new"
                className="group flex flex-1 min-w-0 items-center gap-6 p-8 rounded-2xl bg-secondary text-secondary-foreground border-2 border-primary/30 shadow-lg hover:shadow-xl hover:border-primary/60 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98] opacity-0 animate-[fade-in-up_0.6s_ease-out_0.35s_forwards]"
              >
                <div className="flex-shrink-0 w-20 h-20 rounded-xl bg-primary/15 flex items-center justify-center group-hover:animate-[icon-pulse_2s_ease-in-out_infinite]">
                  <Ticket className="w-10 h-10 text-primary" strokeWidth={2} />
                </div>
                <div className="text-left">
                  <h2 className="font-display text-xl md:text-2xl font-bold tracking-tight text-primary">
                    Make a New Reservation
                  </h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    Book your island-hopping adventure
                  </p>
                </div>
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 py-12 text-center">
            <p className="text-muted-foreground">
              Sign in to make a reservation or view your bookings.
            </p>
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
