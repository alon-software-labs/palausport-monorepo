import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { List, Plus } from "lucide-react";
import logoUrl from "@repo/assets/logo.webp";

interface NavbarProps {
  user: { email: string };
}

export function Navbar({ user }: NavbarProps) {
  const { logout } = useAuth();

  return (
    <nav className="flex flex-wrap justify-between items-center gap-x-3 gap-y-1 px-4 py-2 border-b bg-background/80">
      <div className="flex items-center gap-4 flex-wrap">
        <Link to="/" className="flex items-center shrink-0">
          <img
            src={logoUrl}
            alt="PalauSport"
            width={140}
            height={28}
            className="h-7 w-auto text-foreground"
          />
        </Link>
        <div className="flex gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/reservations">
            <List className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">My Reservations</span>
            <span className="sm:hidden">Reservations</span>
          </Link>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/reservations/new">
            <Plus className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">New Reservation</span>
            <span className="sm:hidden">New</span>
          </Link>
        </Button>
        </div>
      </div>
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-sm text-muted-foreground truncate max-w-[180px] sm:max-w-none hidden xs:block sm:block">{user.email}</span>
        <Button variant="ghost" size="sm" onClick={() => logout()}>
          Log out
        </Button>
      </div>
    </nav>
  );
}
