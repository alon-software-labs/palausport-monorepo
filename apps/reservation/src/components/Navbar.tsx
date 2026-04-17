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
    <nav className="flex min-w-0 flex-nowrap items-center justify-between gap-2 sm:gap-3 px-4 py-2 border-b bg-background/80">
      <div className="flex min-w-0 flex-1 flex-nowrap items-center gap-2 sm:gap-3">
        <Link
          to="/"
          className="flex min-w-0 items-center gap-2 sm:gap-3 rounded-md outline-none ring-ring/40 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background -m-1 p-1"
          title="PalauSport Reservations"
          aria-label="PalauSport Reservations — Home"
        >
          <img
            src={logoUrl}
            alt=""
            width={160}
            height={48}
            className="h-8 w-auto shrink-0 object-contain sm:h-9"
          />
          <div className="hidden sm:inline min-w-0 leading-tight text-left">
            <div className="truncate font-semibold tracking-tight text-foreground text-sm sm:text-base md:text-lg">
              PalauSport
            </div>
            <div className="text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground sm:text-[0.6875rem] sm:tracking-[0.18em]">
              Reservations
            </div>
          </div>
        </Link>
        <div className="flex shrink-0 gap-1 sm:gap-2">
          <Button variant="ghost" size="sm" className="shrink-0 px-2 sm:px-3" asChild>
            <Link to="/reservations">
              <List className="w-4 h-4 sm:mr-1" />
              <span className="hidden md:inline">My Reservations</span>
              <span className="md:hidden">Reservations</span>
            </Link>
          </Button>
          <Button variant="ghost" size="sm" className="shrink-0 px-2 sm:px-3" asChild>
            <Link to="/reservations/new">
              <Plus className="w-4 h-4 sm:mr-1" />
              <span className="hidden md:inline">New Reservation</span>
              <span className="md:hidden">New</span>
            </Link>
          </Button>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <span className="hidden min-w-0 truncate text-sm text-muted-foreground sm:block sm:max-w-[9rem] md:max-w-[14rem] lg:max-w-[18rem] xl:max-w-[24rem]">
          {user.email}
        </span>
        <Button variant="ghost" size="sm" className="shrink-0" onClick={() => logout()}>
          Log out
        </Button>
      </div>
    </nav>
  );
}
