import { Ship, Anchor, MapPin } from "lucide-react";

const HeroBanner = () => {
  return (
    <header className="hero-gradient py-10 md:py-16 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Ship className="w-8 h-8 text-primary-foreground" />
          <Anchor className="w-5 h-5 text-primary-foreground opacity-60" />
          <MapPin className="w-5 h-5 text-primary-foreground opacity-60" />
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
