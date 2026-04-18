import { Ship, Anchor, MapPin } from "lucide-react";
import logoUrl from "@repo/assets/logo.webp";

const HeroBanner = () => {
  return (
    <header className="hero-gradient py-10 md:py-16 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <div className="flex flex-col items-center gap-5 md:gap-6 mb-4">
          <img
            src={logoUrl}
            alt="PalauSport"
            width={360}
            height={94}
            className="h-28 sm:h-32 md:h-40 w-auto max-w-[min(100%,28rem)] object-contain drop-shadow-md"
          />
          <div className="flex items-center justify-center gap-2">
            <Ship className="w-8 h-8 text-primary-foreground" />
            <Anchor className="w-5 h-5 text-primary-foreground opacity-60" />
            <MapPin className="w-5 h-5 text-primary-foreground opacity-60" />
          </div>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-3 font-display">
          Cruise Reservation
        </h1>
        <p className="text-primary-foreground/80 text-base md:text-lg max-w-xl mx-auto font-body">
          Book your island-hopping adventure. Complete the form below to reserve your cabin and secure your spot.
        </p>
      </div>
    </header>
  );
};

export default HeroBanner;
