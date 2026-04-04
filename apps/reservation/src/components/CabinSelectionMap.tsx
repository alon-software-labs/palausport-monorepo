import React from 'react';
import { Users, Camera } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface CabinNode {
  id: string; // e.g., S1, T2
  baseType: 'suite' | 'twin';
  status: 'available' | 'booked';
  label: string;
}

// Fixed mock data to simulate inventory state matching 3 suites and 9 twins
const CABINS_DATA: CabinNode[] = [
  { id: 'S1', baseType: 'suite', status: 'available', label: 'Suite 1' },
  { id: 'S2', baseType: 'suite', status: 'available', label: 'Suite 2' },
  { id: 'S3', baseType: 'suite', status: 'available', label: 'Suite 3' },
  { id: 'T1', baseType: 'twin', status: 'available', label: 'Twin Cabin 1' },
  { id: 'T2', baseType: 'twin', status: 'available', label: 'Twin Cabin 2' },
  { id: 'T3', baseType: 'twin', status: 'available', label: 'Twin Cabin 3' },
  { id: 'T4', baseType: 'twin', status: 'available', label: 'Twin Cabin 4' },
  { id: 'T5', baseType: 'twin', status: 'available', label: 'Twin Cabin 5' },
  { id: 'T6', baseType: 'twin', status: 'available', label: 'Twin Cabin 6' },
  { id: 'T7', baseType: 'twin', status: 'available', label: 'Twin Cabin 7' },
  { id: 'T8', baseType: 'twin', status: 'available', label: 'Twin Cabin 8' },
  { id: 'T9', baseType: 'twin', status: 'available', label: 'Twin Cabin 9' },
];

export interface CabinSelectionMapProps {
  onSelect: (cabinIds: string[]) => void;
  selectedCabinIds?: string[];
  bookedCabinIds?: string[];
}

export const CabinSelectionMap: React.FC<CabinSelectionMapProps> = ({ onSelect, selectedCabinIds = [], bookedCabinIds = [] }) => {
  const handleToggleCabin = (id: string) => {
    const isSelected = selectedCabinIds.includes(id);
    if (isSelected) {
      onSelect(selectedCabinIds.filter(cid => cid !== id));
    } else {
      onSelect([...selectedCabinIds, id]);
    }
  };

  return (
    <div className="w-full py-4 sm:py-6 relative z-10">
      {/* Scroll hint - only visible on small screens */}
      <p className="sm:hidden text-xs text-muted-foreground text-center mb-2 italic">← Swipe to view full deck plan →</p>

      {/* Scrollable wrapper for mobile */}
      <div className="overflow-x-auto pb-2">

        {/* Main Floor Plan Container - Shifted right slightly to accommodate extending boats */}
        <div className="w-full min-w-[700px] max-w-[900px] mx-auto ml-auto bg-blue-50/50 dark:bg-slate-900/50 rounded-l-[1rem] rounded-r-[6rem] sm:rounded-r-[12rem] border-[3px] sm:border-4 border-slate-300 dark:border-slate-800 p-2 sm:p-4 shadow-inner relative flex font-sans items-center overflow-visible">

          {/* Outer Deck Water Background */}
          <div className="absolute inset-0 bg-blue-100/30 dark:bg-blue-900/10 pointer-events-none rounded-l-[1rem] rounded-r-[6rem] sm:rounded-r-[12rem]" />

          {/* Ship layout inner wrapper */}
          <div className="w-full flex h-44 sm:h-60 z-10 px-1 sm:px-2 py-1 items-stretch overflow-visible">

            {/* Aft Section (Left side: Chase Boats & Boat Deck) */}
            <div className="w-24 sm:w-36 flex flex-col justify-between border-r-2 border-slate-400 dark:border-slate-600 pr-2 shrink-0 h-full py-3 relative overflow-visible">

              {/* Top Chase Boat (Speed Boat Style) */}
              <div className="absolute -left-6 sm:-left-10 top-2 w-[110%] h-[28%] group overflow-visible">
                <ChaseBoat label="CHASE BOAT" />
              </div>

              {/* Middle Boat Deck Area with Table */}
              <div className="flex-1 flex flex-col items-center justify-center relative my-4">
                <span className="text-[7px] sm:text-[9px] font-bold text-slate-600 mb-2 z-10 uppercase tracking-wider bg-white/50 px-1 rounded">BOAT DECK</span>
                {/* Table representation */}
                <div className="w-16 sm:w-24 h-5 sm:h-7 bg-amber-200/90 dark:bg-amber-800/90 border border-amber-300 dark:border-amber-700 rounded-sm flex justify-center items-center relative shadow-sm">
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-full h-[1px] bg-amber-300/40"></div>
                  </div>

                  {/* Chairs positioned around the table */}
                  <Chair className="-top-1.5 left-2" />
                  <Chair className="-top-1.5 left-7 sm:left-10" />
                  <Chair className="-top-1.5 left-12 sm:left-18" />

                  <Chair className="-bottom-1.5 left-2" />
                  <Chair className="-bottom-1.5 left-7 sm:left-10" />
                  <Chair className="-bottom-1.5 left-12 sm:left-18" />

                  <Chair className="top-1/2 -translate-y-1/2 -left-1.5 rotate-90" />
                  <Chair className="top-1/2 -translate-y-1/2 -right-1.5 -rotate-90" />
                </div>
              </div>

              {/* Bottom Chase Boat (Speed Boat Style) */}
              <div className="absolute -left-6 sm:-left-10 bottom-2 w-[110%] h-[28%] group overflow-visible">
                <ChaseBoat label="CHASE BOAT" />
              </div>
            </div>

            {/* Main Cabin Area */}
            <div className="flex-1 relative z-10 bg-white dark:bg-slate-900 border-y-2 border-slate-400 dark:border-slate-600 px-1 sm:px-2 flex flex-col justify-center">

              {/* Top Row (Port) */}
              <div className="flex h-[40%] gap-1 sm:gap-1.5 mb-1 sm:mb-2 w-[98%] mx-auto">
                <div className="flex-[3] grid grid-cols-2 gap-1 sm:gap-1.5 h-full">
                  <CabinBlock cabin={CABINS_DATA.find(c => c.id === 'S1')!} selected={selectedCabinIds.includes('S1')} bookedCabinIds={bookedCabinIds} onSelect={handleToggleCabin} className="h-full shadow-sm border-amber-200/60 dark:border-amber-900/50" />
                  <CabinBlock cabin={CABINS_DATA.find(c => c.id === 'S3')!} selected={selectedCabinIds.includes('S3')} bookedCabinIds={bookedCabinIds} onSelect={handleToggleCabin} className="h-full shadow-sm border-amber-200/60 dark:border-amber-900/50" />
                </div>
                <div className="flex-[4] grid grid-cols-4 gap-1 sm:gap-1.5 h-full">
                  <CabinBlock cabin={CABINS_DATA.find(c => c.id === 'T1')!} selected={selectedCabinIds.includes('T1')} bookedCabinIds={bookedCabinIds} onSelect={handleToggleCabin} className="h-full" />
                  <CabinBlock cabin={CABINS_DATA.find(c => c.id === 'T2')!} selected={selectedCabinIds.includes('T2')} bookedCabinIds={bookedCabinIds} onSelect={handleToggleCabin} className="h-full" />
                  <CabinBlock cabin={CABINS_DATA.find(c => c.id === 'T3')!} selected={selectedCabinIds.includes('T3')} bookedCabinIds={bookedCabinIds} onSelect={handleToggleCabin} className="h-full" />
                  <CabinBlock cabin={CABINS_DATA.find(c => c.id === 'T4')!} selected={selectedCabinIds.includes('T4')} bookedCabinIds={bookedCabinIds} onSelect={handleToggleCabin} className="h-full" />
                </div>
              </div>

              {/* Corridor visual (Middle) */}
              <div className="h-[12%] sm:h-[15%] w-full bg-amber-900/60 dark:bg-amber-950/80 flex items-center justify-between px-4 sm:px-8 text-[6px] sm:text-[9px] text-amber-200 font-bold uppercase tracking-widest shadow-inner my-0.5">
                <span>Main Corridor</span>
              </div>

              {/* Bottom Row (Starboard) */}
              <div className="flex h-[40%] gap-1 sm:gap-1.5 mt-1 sm:mt-2 w-[98%] mx-auto">
                <div className="flex-[2] flex items-end min-w-0">
                  <CabinBlock cabin={CABINS_DATA.find(c => c.id === 'S2')!} selected={selectedCabinIds.includes('S2')} bookedCabinIds={bookedCabinIds} onSelect={handleToggleCabin} className="flex-1 w-full h-[75%] shadow-sm border-amber-200/60 dark:border-amber-900/50" />
                </div>
                <div className="flex-[5] grid grid-cols-5 gap-1 sm:gap-1.5 h-full min-w-0">
                  <CabinBlock cabin={CABINS_DATA.find(c => c.id === 'T5')!} selected={selectedCabinIds.includes('T5')} bookedCabinIds={bookedCabinIds} onSelect={handleToggleCabin} className="h-full min-w-0" />
                  <CabinBlock cabin={CABINS_DATA.find(c => c.id === 'T6')!} selected={selectedCabinIds.includes('T6')} bookedCabinIds={bookedCabinIds} onSelect={handleToggleCabin} className="h-full min-w-0" />
                  <CabinBlock cabin={CABINS_DATA.find(c => c.id === 'T7')!} selected={selectedCabinIds.includes('T7')} bookedCabinIds={bookedCabinIds} onSelect={handleToggleCabin} className="h-full min-w-0" />
                  <CabinBlock cabin={CABINS_DATA.find(c => c.id === 'T8')!} selected={selectedCabinIds.includes('T8')} bookedCabinIds={bookedCabinIds} onSelect={handleToggleCabin} className="h-full min-w-0" />
                  <CabinBlock cabin={CABINS_DATA.find(c => c.id === 'T9')!} selected={selectedCabinIds.includes('T9')} bookedCabinIds={bookedCabinIds} onSelect={handleToggleCabin} className="h-full min-w-0" />
                </div>
              </div>

            </div>

            {/* Bow / Bridge Section - Pointed to follow the ship's nose */}
            <div className="flex-none w-20 sm:w-32 bg-slate-200 dark:bg-slate-800 border-y-2 border-r-2 border-slate-400 dark:border-slate-600 shadow-sm overflow-hidden relative flex items-center justify-center rounded-r-full">
              <div className="absolute left-0 w-1 bg-slate-400/50 h-full"></div>
              <span className="[writing-mode:vertical-rl] tracking-widest text-[8px] sm:text-xs font-bold text-slate-500 uppercase ml-[-20%] sm:ml-[-25%] z-10">BRIDGE</span>
              {/* Window/Reflections detail for the bridge arc */}
              <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-slate-400/20 to-transparent pointer-events-none rounded-r-full"></div>
            </div>
          </div>
        </div>

      </div> {/* end scroll wrapper */}

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-6 text-xs sm:text-sm relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-white border-2 border-slate-300 shadow-sm" />
          <span className="text-muted-foreground">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-slate-100 border-2 border-slate-200 relative overflow-hidden flex items-center justify-center text-[8px] sm:text-[10px] text-slate-400 font-bold">
            <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,#ccc_2px,#ccc_3px)] opacity-50" />
            X
          </div>
          <span className="text-muted-foreground">Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-primary border-2 border-primary ring-2 ring-primary/20 ring-offset-1" />
          <span className="text-muted-foreground">Selected</span>
        </div>
        <div className="flex items-center gap-2 ml-2 sm:ml-4 border-l pl-4 sm:pl-6 border-slate-200 dark:border-slate-800">
          <div className="w-4 h-4 sm:w-5 sm:h-5 bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-700 flex items-center justify-center text-[6px] sm:text-[8px] font-bold text-blue-700 dark:text-blue-300 rounded-[2px]">WC</div>
          <span className="text-muted-foreground text-[10px] sm:text-xs">Comfort Room / Washroom</span>
        </div>
      </div>
    </div>
  );
};

// Helper Components for visual elements
const ChaseBoat = ({ label }: { label: string }) => (
  <div className="w-full h-full bg-slate-100/95 dark:bg-slate-700/95 border-2 border-blue-500 shadow-xl relative flex items-center justify-center [clip-path:polygon(0%_15%,0%_85%,90%_100%,100%_50%,90%_0%)] ring-2 ring-blue-400/40 ring-offset-1 dark:ring-offset-slate-900">
    <div className="absolute left-0 w-1.5 sm:w-2 h-[70%] bg-slate-800 dark:bg-black rounded-r-sm outline outline-1 outline-blue-400/20" /> {/* Motor */}
    <span className="text-[5px] sm:text-[8px] font-black text-slate-600 dark:text-slate-200 z-10 tracking-[0.2em]">{label}</span>
  </div>
);

const Chair = ({ className }: { className: string }) => (
  <div className={cn("absolute w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 bg-yellow-400/60 border border-yellow-500/50 rounded-[2px] shadow-sm", className)}>
    <div className="w-full h-[2px] bg-yellow-600/30 absolute bottom-0 rounded-b-[1px]"></div>
  </div>
);

const CabinBlock = ({
  cabin,
  selected,
  bookedCabinIds = [],
  onSelect,
  className
}: {
  cabin: CabinNode | undefined;
  selected: boolean;
  bookedCabinIds?: string[];
  onSelect: (id: string) => void;
  className?: string;
}) => {
  if (!cabin) return null; // Safe fallback

  const isAvailable = cabin.status === 'available' && !bookedCabinIds.includes(cabin.id);

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            disabled={!isAvailable}
            onClick={(e) => {
              e.preventDefault(); // Prevent accidental form submission
              if (isAvailable) onSelect(cabin.id);
            }}
            className={cn(
              "relative flex flex-col items-center justify-center rounded-sm border-[1.5px] sm:border-2 transition-all duration-300 overflow-hidden font-medium select-none shadow-sm",
              className,
              !isAvailable && "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed",
              isAvailable && !selected && "bg-white border-slate-300 text-slate-700 hover:border-primary/50 hover:bg-primary/5 cursor-pointer dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200",
              selected && "bg-primary border-primary text-primary-foreground shadow-md ring-2 ring-primary/20 ring-offset-1 scale-105 z-20",
              cabin.baseType === 'suite' && "text-base sm:text-lg",
              cabin.baseType === 'twin' && "text-xs sm:text-sm",
            )}
          >
            {/* Inner styling */}
            <span className="z-10 relative font-bold leading-none mb-0.5">{cabin.id}</span>
            <span className="text-[7px] sm:text-[9px] opacity-70 mt-0 z-10 hidden sm:block relative font-semibold uppercase tracking-wider">
              {cabin.baseType === 'suite' ? 'Suite' : 'Twin'}
            </span>

            {/* WC Indicator */}
            <div className={cn(
              "absolute bottom-0.5 right-0.5 sm:bottom-1 sm:right-1 w-3.5 h-3.5 sm:w-5 sm:h-5 bg-blue-100/80 dark:bg-blue-900/60 border border-blue-300/80 dark:border-blue-700/80 rounded-[2px] flex items-center justify-center text-[5px] sm:text-[7px] text-blue-700 dark:text-blue-300 font-bold z-10 shadow-sm transition-colors",
              selected && "bg-white/20 border-white/40 text-white shadow-none",
              !isAvailable && !selected && "grayscale opacity-50"
            )}>
              WC
            </div>

            {/* Sub-beds indicator for twins */}
            {cabin.baseType === 'twin' && isAvailable && !selected && (
              <>
                <div className="absolute top-1 left-1 w-2 h-4 border border-slate-200 dark:border-slate-600 rounded-[1px] opacity-50 bg-slate-50 dark:bg-slate-700 pointer-events-none hidden sm:block"></div>
                <div className="absolute top-1 right-1 w-2 h-4 border border-slate-200 dark:border-slate-600 rounded-[1px] opacity-50 bg-slate-50 dark:bg-slate-700 pointer-events-none hidden sm:block"></div>
              </>
            )}

            {/* Couch indicator for suite */}
            {cabin.baseType === 'suite' && isAvailable && !selected && (
              <div className="absolute top-2 left-2 w-6 h-3 border border-amber-200 dark:border-slate-600 rounded-sm opacity-60 bg-amber-50 dark:bg-slate-700 pointer-events-none hidden sm:block"></div>
            )}

            {/* Booked cross pattern */}
            {!isAvailable && (
              <div className="absolute inset-0 pointer-events-none opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,#000_5px,#000_6px)]" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-popover border text-popover-foreground shadow-2xl p-0 overflow-hidden min-w-[260px] max-w-[280px] z-50 rounded-xl animate-in zoom-in-95 duration-200">
          <div className="relative h-32 w-full overflow-hidden bg-muted">
            <img
              src={cabin.baseType === 'suite' ? '/suite.png' : '/twin.png'}
              alt={cabin.label}
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
              onError={(e) => {
                // Fallback icon if image doesn't exist
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center');
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-3">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-white/20 backdrop-blur-md">
                  <Camera className="w-3 h-3 text-white" />
                </div>
                <p className="text-white font-bold text-sm tracking-tight">{cabin.label}</p>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-100">
            <div className="flex items-center justify-between">
              <Badge variant={isAvailable ? "outline" : "secondary"} className={cn(
                "text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider",
                isAvailable ? "border-green-500/50 text-green-600 bg-green-50/50" : "text-slate-500 bg-slate-100"
              )}>
                {isAvailable ? 'Available' : 'Booked'}
              </Badge>
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                <Users className="w-3.5 h-3.5" />
                <span>2 Guests</span>
              </div>
            </div>

            <p className="text-[12px] text-muted-foreground leading-relaxed italic">
              {cabin.baseType === 'suite'
                ? "Experience luxury in our spacious suites, perfectly appointed for couples or premium solo stays."
                : "Comfortable twin berth cabin designed for efficiency and relaxation during your voyage."}
            </p>

            <div className="space-y-2 pt-2 border-t border-border/50">
              <div className="flex items-center gap-2 text-[10px] text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-tight">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500/20 border border-blue-500/40"></div>
                Private Bathroom Included
              </div>

              {isAvailable ? (
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-primary animate-in fade-in slide-in-from-left-2 delay-300">
                  <div className="w-2 h-2 rounded-full bg-primary animate-ping opacity-75"></div>
                  Ready for Reservation
                </div>
              ) : (
                <div className="text-[11px] font-bold text-destructive flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-destructive"></div>
                  Currently Occupied
                </div>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};



