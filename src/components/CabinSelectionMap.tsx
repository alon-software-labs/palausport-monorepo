import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { CABIN_TYPES } from "@/data/reservationData";

export interface CabinNode {
  id: string; // e.g., Q1, T2
  baseType: 'queen' | 'twin';
  status: 'available' | 'booked';
  label: string;
  deck: 1 | 2;
}

// Fixed mock data to simulate inventory state securely matching 4 queens (1 booked) and 9 twins (3 booked)
const CABINS_DATA: CabinNode[] = [
  { id: 'Q1', baseType: 'queen', status: 'available', label: 'Queen Suite 1', deck: 1 },
  { id: 'Q2', baseType: 'queen', status: 'booked', label: 'Queen Suite 2', deck: 1 },
  { id: 'Q3', baseType: 'queen', status: 'available', label: 'Queen Suite 3', deck: 2 },
  { id: 'Q4', baseType: 'queen', status: 'available', label: 'Queen Suite 4', deck: 2 },
  { id: 'T1', baseType: 'twin', status: 'available', label: 'Twin Cabin 1', deck: 1 },
  { id: 'T2', baseType: 'twin', status: 'available', label: 'Twin Cabin 2', deck: 1 },
  { id: 'T3', baseType: 'twin', status: 'booked', label: 'Twin Cabin 3', deck: 1 },
  { id: 'T4', baseType: 'twin', status: 'available', label: 'Twin Cabin 4', deck: 1 },
  { id: 'T5', baseType: 'twin', status: 'booked', label: 'Twin Cabin 5', deck: 1 },
  { id: 'T6', baseType: 'twin', status: 'available', label: 'Twin Cabin 6', deck: 1 },
  { id: 'T7', baseType: 'twin', status: 'available', label: 'Twin Cabin 7', deck: 2 },
  { id: 'T8', baseType: 'twin', status: 'booked', label: 'Twin Cabin 8', deck: 2 },
  { id: 'T9', baseType: 'twin', status: 'available', label: 'Twin Cabin 9', deck: 2 },
];

export interface CabinSelectionMapProps {
  onSelect: (cabinId: string, baseType: 'queen' | 'twin') => void;
  selectedCabinId?: string;
}

export const CabinSelectionMap: React.FC<CabinSelectionMapProps> = ({ onSelect, selectedCabinId }) => {
  const [selectedDeck, setSelectedDeck] = React.useState<1 | 2>(1);
  const [hoveredBaseType, setHoveredBaseType] = React.useState<'queen' | 'twin' | null>(null);

  return (
    <div className="w-full py-4 sm:py-6">

      {/* Deck Selector */}
      <div className="flex justify-center mb-6">
        <div className="bg-slate-200/50 dark:bg-slate-800 rounded-full p-1 inline-flex shadow-inner">
          <button
            type="button"
            onClick={() => setSelectedDeck(1)}
            className={cn(
              "px-5 sm:px-8 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200",
              selectedDeck === 1
                ? "bg-white dark:bg-slate-700 text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-white/30 dark:hover:bg-slate-700/50"
            )}
          >
            Main Deck (Deck 1)
          </button>
          <button
            type="button"
            onClick={() => setSelectedDeck(2)}
            className={cn(
              "px-5 sm:px-8 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200",
              selectedDeck === 2
                ? "bg-white dark:bg-slate-700 text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-white/30 dark:hover:bg-slate-700/50"
            )}
          >
            Upper Deck (Deck 2)
          </button>
        </div>
      </div>

      <div className="w-full max-w-[800px] mx-auto bg-blue-50/50 dark:bg-slate-900/50 rounded-full border-[3px] sm:border-4 border-slate-300 dark:border-slate-800 p-4 sm:p-8 shadow-inner relative flex font-sans overflow-hidden">

        {/* Deck Indicator Label inside bounds, centered in the middle of the ship */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-bold tracking-widest text-slate-200 dark:text-slate-700 text-2xl sm:text-4xl uppercase opacity-50 z-0 pointer-events-none whitespace-nowrap">
          {selectedDeck === 1 ? 'DECK 1 - MAIN' : 'DECK 2 - UPPER'}
        </div>

        {/* Bow (Front) indicator */}
        <div className="absolute top-1/2 -right-4 sm:-right-8 -translate-y-1/2 w-10 h-10 sm:w-16 sm:h-16 border-t-[6px] sm:border-t-8 border-r-[6px] sm:border-r-8 border-slate-300 dark:border-slate-800 rotate-45 rounded-tr-xl sm:rounded-tr-3xl" />

        {/* Ship layout inner wrapper */}
        <div className="w-full flex h-32 sm:h-48 z-10 px-2 sm:px-6 py-1">

          {/* Main Cabin Area */}
          <div className="flex-1 grid grid-cols-9 gap-x-1 sm:gap-x-2 gap-y-3 sm:gap-y-6 relative z-10">
            {/* Corridor visual */}
            <div className="absolute top-1/2 left-0 right-0 h-3 sm:h-5 -translate-y-1/2 bg-slate-200/50 dark:bg-slate-700/50 rounded-full flex items-center justify-between px-2 sm:px-8 text-[6px] sm:text-[9px] text-slate-400 font-bold uppercase tracking-widest">
              <span>Aft Stairs</span>
              <span className="hidden sm:inline">{selectedDeck === 1 ? 'Main Corridor' : 'Upper Corridor'}</span>
              <span>Forward Lounge</span>
            </div>

            {selectedDeck === 1 ? (
              <>
                {/* Top Row (Port) - Deck 1 */}
                <CabinBlock cabin={CABINS_DATA.find(c => c.id === 'T1')!} selected={selectedCabinId === 'T1'} onSelect={onSelect} hoveredBaseType={hoveredBaseType} />
                <CabinBlock cabin={CABINS_DATA.find(c => c.id === 'T3')!} selected={selectedCabinId === 'T3'} onSelect={onSelect} hoveredBaseType={hoveredBaseType} />
                <CabinBlock cabin={CABINS_DATA.find(c => c.id === 'T5')!} selected={selectedCabinId === 'T5'} onSelect={onSelect} hoveredBaseType={hoveredBaseType} />
                <div className="col-span-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-md text-slate-400 text-[6px] sm:text-[9px] text-center p-0.5 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-center">Restaurant</div>
                <CabinBlock cabin={CABINS_DATA.find(c => c.id === 'Q1')!} selected={selectedCabinId === 'Q1'} onSelect={onSelect} hoveredBaseType={hoveredBaseType} className="col-span-2 shadow-sm border-amber-200/60 dark:border-amber-900/50" />
                <div className="col-span-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-md text-slate-400 text-[6px] sm:text-[9px] text-center p-0.5 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-center">Spa</div>

                {/* Bottom Row (Starboard) - Deck 1 */}
                <CabinBlock cabin={CABINS_DATA.find(c => c.id === 'T2')!} selected={selectedCabinId === 'T2'} onSelect={onSelect} hoveredBaseType={hoveredBaseType} />
                <CabinBlock cabin={CABINS_DATA.find(c => c.id === 'T4')!} selected={selectedCabinId === 'T4'} onSelect={onSelect} hoveredBaseType={hoveredBaseType} />
                <CabinBlock cabin={CABINS_DATA.find(c => c.id === 'T6')!} selected={selectedCabinId === 'T6'} onSelect={onSelect} hoveredBaseType={hoveredBaseType} />
                <div className="col-span-1 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-md text-slate-400 text-[6px] sm:text-[9px] text-center p-0.5 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-center">Lobby</div>
                <div className="col-span-1 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-md text-slate-400 text-[6px] sm:text-[9px] text-center p-0.5 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-center">Galley</div>
                <CabinBlock cabin={CABINS_DATA.find(c => c.id === 'Q2')!} selected={selectedCabinId === 'Q2'} onSelect={onSelect} hoveredBaseType={hoveredBaseType} className="col-span-2 shadow-sm border-amber-200/60 dark:border-amber-900/50" />
                <div className="col-span-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-md text-slate-400 text-[6px] sm:text-[9px] text-center p-0.5 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-center">Gym</div>
              </>
            ) : (
              <>
                {/* Top Row (Port) - Deck 2 */}
                <div className="col-span-2 border-2 border-dashed border-slate-300/60 dark:border-slate-600/60 rounded-md text-slate-400/80 text-[6px] sm:text-[9px] text-center p-0.5 bg-slate-50/30 dark:bg-slate-800/30 flex items-center justify-center relative"><div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,rgba(0,0,0,0.05)_4px,rgba(0,0,0,0.05)_8px)] pointer-events-none rounded-md"></div>Sun Deck</div>
                <CabinBlock cabin={CABINS_DATA.find(c => c.id === 'T7')!} selected={selectedCabinId === 'T7'} onSelect={onSelect} hoveredBaseType={hoveredBaseType} />
                <CabinBlock cabin={CABINS_DATA.find(c => c.id === 'T9')!} selected={selectedCabinId === 'T9'} onSelect={onSelect} hoveredBaseType={hoveredBaseType} />
                <div className="col-span-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-md text-slate-400 text-[6px] sm:text-[9px] text-center p-0.5 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-center">Lounge</div>
                <CabinBlock cabin={CABINS_DATA.find(c => c.id === 'Q3')!} selected={selectedCabinId === 'Q3'} onSelect={onSelect} hoveredBaseType={hoveredBaseType} className="col-span-2 shadow-sm border-amber-200/60 dark:border-amber-900/50" />
                <div className="col-span-1 border-2 border-dashed border-blue-300/60 dark:border-blue-500/60 rounded-md text-blue-500/80 text-[6px] sm:text-[9px] text-center p-0.5 bg-blue-50/50 dark:bg-blue-900/30 flex items-center justify-center">Pool</div>

                {/* Bottom Row (Starboard) - Deck 2 */}
                <div className="col-span-2 border-2 border-dashed border-slate-300/60 dark:border-slate-600/60 rounded-md text-slate-400/80 text-[6px] sm:text-[9px] text-center p-0.5 bg-slate-50/30 dark:bg-slate-800/30 flex items-center justify-center relative"><div className="absolute inset-0 bg-[repeating-linear-gradient(-45deg,transparent,transparent_4px,rgba(0,0,0,0.05)_4px,rgba(0,0,0,0.05)_8px)] pointer-events-none rounded-md"></div>Sun Deck</div>
                <CabinBlock cabin={CABINS_DATA.find(c => c.id === 'T8')!} selected={selectedCabinId === 'T8'} onSelect={onSelect} hoveredBaseType={hoveredBaseType} />
                <div className="col-span-1 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-md text-slate-400 text-[6px] sm:text-[9px] text-center p-0.5 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-center">Stairs</div>
                <div className="col-span-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-md text-slate-400 text-[6px] sm:text-[9px] text-center p-0.5 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-center">Bar</div>
                <CabinBlock cabin={CABINS_DATA.find(c => c.id === 'Q4')!} selected={selectedCabinId === 'Q4'} onSelect={onSelect} hoveredBaseType={hoveredBaseType} className="col-span-2 shadow-sm border-amber-200/60 dark:border-amber-900/50" />
                <div className="col-span-1 border-2 border-dashed border-blue-300/60 dark:border-blue-500/60 rounded-md text-blue-500/80 text-[6px] sm:text-[9px] text-center p-0.5 bg-blue-50/50 dark:bg-blue-900/30 flex items-center justify-center">Pool</div>
              </>
            )}
          </div>

          <div className="w-[1px] bg-slate-300 dark:bg-slate-700 mx-1.5 sm:mx-4" />

          {/* Bridge (Front) */}
          <div className="w-8 sm:w-16 flex flex-col items-center justify-center rounded-r-[1.5rem] sm:rounded-r-[2rem] bg-slate-200 dark:bg-slate-800 border-l border-slate-300 dark:border-slate-700 shadow-sm text-[8px] sm:text-xs font-semibold text-slate-500 overflow-hidden">
            <span className="[writing-mode:vertical-rl] tracking-widest hidden sm:block">BRIDGE</span>
            <span className="sm:hidden block">Br.</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-6 text-xs sm:text-sm">
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
      </div>

      {/* Room Details Section */}
      <div className="mt-8 pt-6 border-t border-border max-w-4xl mx-auto space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Available Room Types & Options</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {CABIN_TYPES.map(type => {
            const isHovered = hoveredBaseType === (type.id.startsWith('queen') ? 'queen' : 'twin');
            return (
              <div
                key={type.id}
                onMouseEnter={() => setHoveredBaseType(type.id.startsWith('queen') ? 'queen' : 'twin')}
                onMouseLeave={() => setHoveredBaseType(null)}
                className={cn(
                  "p-3 sm:p-4 border rounded-xl bg-card text-card-foreground flex flex-col gap-1.5 shadow-sm transition-all duration-300 hover:border-primary/50 cursor-default",
                  isHovered && "ring-1 ring-primary/30 border-primary/50 bg-primary/5 scale-[1.01]"
                )}
              >
                <div className="flex justify-between items-start gap-2">
                  <span className="font-semibold text-sm leading-tight text-foreground">{type.label}</span>
                  <span className="text-[10px] sm:text-xs px-2 py-0.5 bg-primary/10 text-primary font-medium rounded-full shrink-0">
                    {type.capacity}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed flex-1">{type.description}</p>
                <div className="text-[10px] text-muted-foreground/80 font-medium mt-1 pt-1 border-t flex justify-between">
                  <span>Rate Type:</span>
                  <span className="text-foreground/80 font-semibold">{type.priceLabel}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const CabinBlock = ({
  cabin,
  selected,
  onSelect,
  hoveredBaseType,
  className
}: {
  cabin: CabinNode | undefined;
  selected: boolean;
  onSelect: (id: string, baseType: 'queen' | 'twin') => void;
  hoveredBaseType?: 'queen' | 'twin' | null;
  className?: string;
}) => {
  if (!cabin) return null; // Safe fallback

  const isAvailable = cabin.status === 'available';

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            disabled={!isAvailable}
            onClick={(e) => {
              e.preventDefault(); // Prevent accidental form submission
              if (isAvailable) onSelect(cabin.id, cabin.baseType);
            }}
            className={cn(
              "relative flex flex-col items-center justify-center rounded-md border-2 transition-all duration-300 overflow-hidden font-medium select-none shadow-sm",
              className,
              !isAvailable && "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed",
              isAvailable && !selected && "bg-white border-slate-300 text-slate-700 hover:border-primary/50 hover:bg-primary/5 cursor-pointer dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200",
              selected && "bg-primary border-primary text-primary-foreground shadow-md ring-2 ring-primary/20 ring-offset-2 scale-105 z-20",
              cabin.baseType === 'queen' && "text-lg",
              cabin.baseType === 'twin' && "text-sm",
              hoveredBaseType !== null && hoveredBaseType !== cabin.baseType && "opacity-30 grayscale saturate-0 scale-95",
              hoveredBaseType !== null && hoveredBaseType === cabin.baseType && !selected && "ring-2 ring-primary/40 border-primary/50 bg-primary/10 scale-105 z-20 shadow-md",
            )}
          >
            {/* Inner styling */}
            <span className="z-10 relative font-bold text-[11px] sm:text-sm">{cabin.id}</span>
            <span className="text-[8px] sm:text-[10px] opacity-70 mt-0 sm:mt-0.5 z-10 hidden sm:block relative">
              {cabin.baseType === 'queen' ? 'Queen' : 'Twin'}
            </span>

            {/* Booked cross pattern */}
            {!isAvailable && (
              <div className="absolute inset-0 pointer-events-none opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,#000_5px,#000_6px)]" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-popover border text-popover-foreground shadow-lg px-4 py-3 min-w-[200px] z-50">
          <div className="space-y-1">
            <p className="font-semibold text-sm flex items-center justify-between">
              {cabin.label}
              <span className={cn(
                "text-[10px] px-2 py-0.5 rounded-full ml-4",
                isAvailable ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
              )}>
                {isAvailable ? 'Available' : 'Booked'}
              </span>
            </p>
            <p className="text-xs text-muted-foreground break-words pb-1 max-w-[220px]">
              {cabin.baseType === 'queen'
                ? "Spacious queen suite with premium amenities. Perfect for couples or comfortable solo travel."
                : "Bunk-style cabin. Great value, comfortably sleeps two."}
            </p>
            {isAvailable ? (
              <p className="text-xs font-medium text-primary pt-1 border-t mt-1">Click to select this cabin</p>
            ) : (
              <p className="text-xs font-medium text-destructive pt-1 border-t mt-1">This cabin is unavailable</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
