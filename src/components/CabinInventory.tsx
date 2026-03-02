import { Users, BedDouble, Bath, Wind, Droplets, Sparkles } from "lucide-react";
import { CABIN_TYPES } from "@/data/reservationData";
import { Badge } from "@/components/ui/badge";

const CabinInventory = () => {
  return (
    <div className="section-card">
      <h2 className="section-title">Cabin Inventory</h2>
      <p className="section-subtitle">
        All cabins include complete beddings, pillows, en suite full bathroom, air conditioning, hot &amp; cold shower, and basic toiletries.
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { icon: BedDouble, label: "Complete Beddings" },
          { icon: Bath, label: "En Suite Bathroom" },
          { icon: Wind, label: "Air Conditioning" },
          { icon: Droplets, label: "H/C Shower" },
          { icon: Sparkles, label: "Basic Toiletries" },
        ].map(({ icon: Icon, label }) => (
          <span key={label} className="inline-flex items-center gap-1.5 text-xs bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full">
            <Icon className="w-3.5 h-3.5" />
            {label}
          </span>
        ))}
      </div>

      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-1">9 Bunk Cabins</h3>
          <p className="text-xs text-muted-foreground">Good for 2 pax each — twin berth configuration</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-1">4 Queen Suites</h3>
          <p className="text-xs text-muted-foreground">Ideal for couples or sharing — spacious queen-size bed</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
        {CABIN_TYPES.map((cabin) => {
          const available = cabin.totalInventory - cabin.booked;
          return (
            <div key={cabin.id} className="border rounded-lg p-4 bg-background">
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-sm font-semibold text-foreground">{cabin.label}</h4>
                <Badge variant={available > 3 ? "default" : available > 0 ? "secondary" : "destructive"} className="text-[10px]">
                  {available} left
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{cabin.description}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="w-3 h-3" />
                <span>{cabin.capacity}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CabinInventory;
