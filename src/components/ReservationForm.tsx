import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { User } from "@/contexts/AuthContext";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Ship, UserPlus, FileText, PenLine, ChevronDown } from "lucide-react";
import { createSupabaseClient } from "@/lib/supabase/client";
import { getEventId, cabinTypeIdToDb } from "@/lib/reservation-mapping";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";

import { TRIP_DESTINATIONS, TRIP_SCHEDULES, TRIP_TYPES, CABIN_TYPES, GENDER_OPTIONS, BOOKING_METHODS } from "@/data/reservationData";

function availabilityBadgeVariant(count: number, threshold = 5): "default" | "secondary" | "destructive" {
  if (count > threshold) return "default";
  if (count > 0) return "secondary";
  return "destructive";
}
import { CabinSelectionMap } from "./CabinSelectionMap";

const reservationSchema = z.object({
  tripDestination: z.string().min(1, "Please select a trip destination"),
  tripSchedule: z.string().min(1, "Please select a trip schedule"),
  bookingMethod: z.string().min(1, "Please select a booking method"),
  agentCompany: z.string().optional(),
  agentContact: z.string().optional(),
  fullName: z.string().trim().min(1, "Full name is required").max(200),
  gender: z.string().min(1, "Please select gender"),
  address: z.string().trim().min(1, "Address is required").max(500),
  email: z.string().trim().email("Invalid email address"),
  phone: z.string().trim().min(1, "Phone number is required").max(30),
  numberOfPassengers: z.coerce.number().min(1, "At least 1 passenger").max(22, "Maximum 22 passengers"),
  selectedCabinId: z.string().min(1, "Please select a specific cabin from the map"),
  preferredCabin: z.string().min(1, "Please select an occupancy rate for your cabin"),
  passengers: z.array(z.object({
    fullName: z.string().trim().min(1, "Passenger name is required").max(200),
    cabinType: z.string().min(1, "Cabin type is required"),
    foodAllergies: z.string().optional(),
  })),
  notes: z.string().optional(),
  termsAccepted: z.literal(true, { errorMap: () => ({ message: "You must accept the terms and conditions" }) }),
  agreementName: z.string().trim().min(1, "Please type your full name for agreement").max(200),
}).refine((data) => {
  if (data.bookingMethod === "agent") {
    return data.agentCompany && data.agentCompany.trim().length > 0;
  }
  return true;
}, { message: "Company name is required for agent bookings", path: ["agentCompany"] })
  .refine((data) => {
    if (data.bookingMethod === "agent") {
      return data.agentContact && data.agentContact.trim().length > 0;
    }
    return true;
  }, { message: "Contact person is required for agent bookings", path: ["agentContact"] });

type ReservationFormData = z.infer<typeof reservationSchema>;

interface ReservationFormProps {
  currentUser?: User | null;
}

const ReservationForm = ({ currentUser }: ReservationFormProps) => {
  const navigate = useNavigate();
  const [passengerCount, setPassengerCount] = useState(1);
  const [selectedBaseType, setSelectedBaseType] = useState<'queen' | 'twin' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      tripDestination: "",
      tripSchedule: "",
      bookingMethod: "",
      agentCompany: "",
      agentContact: "",
      fullName: "",
      gender: "",
      address: "",
      email: "",
      phone: "",
      numberOfPassengers: 1,
      selectedCabinId: "",
      preferredCabin: "",
      passengers: [{ fullName: "", cabinType: "", foodAllergies: "" }],
      notes: "",
      termsAccepted: undefined as unknown as true,
      agreementName: "",
    },
  });

  const { fields, replace } = useFieldArray({
    control: form.control,
    name: "passengers",
  });

  useEffect(() => {
    if (currentUser) {
      const email = form.getValues("email");
      const fullName = form.getValues("fullName");
      if (!email) form.setValue("email", currentUser.email);
      if (!fullName) form.setValue("fullName", currentUser.name);
    }
  }, [currentUser, form]);

  const watchBookingMethod = form.watch("bookingMethod");
  const watchTrip = form.watch("tripSchedule");
  const watchDestination = form.watch("tripDestination");

  const availableSchedules = TRIP_SCHEDULES.filter(t => t.destinationId === watchDestination);
  const selectedTrip = TRIP_SCHEDULES.find(t => t.id === watchTrip);

  useEffect(() => {
    form.setValue("tripSchedule", "", { shouldValidate: false });
  }, [watchDestination, form]);

  const handlePassengerCountChange = (value: string) => {
    const count = parseInt(value) || 1;
    const clamped = Math.max(1, Math.min(22, count));
    setPassengerCount(clamped);
    form.setValue("numberOfPassengers", clamped);
    const newPassengers = Array.from({ length: clamped }, (_, i) => ({
      fullName: fields[i]?.fullName || "",
      cabinType: fields[i]?.cabinType || "",
      foodAllergies: fields[i]?.foodAllergies || "",
    }));
    replace(newPassengers);
  };

  const onSubmit = async (data: ReservationFormData) => {
    const selectedTrip = TRIP_SCHEDULES.find((t) => t.id === data.tripSchedule);
    if (!selectedTrip) {
      toast.error("Invalid trip schedule selected.");
      return;
    }

    setIsSubmitting(true);
    const supabase = createSupabaseClient();

    // 1. Find the corresponding event in the database
    const { data: events, error: eventError } = await supabase
      .from("cruise_events")
      .select("id")
      .eq("name", selectedTrip.label)
      .limit(1);

    if (eventError || !events || events.length === 0) {
      setIsSubmitting(false);
      toast.error("Error finding this voyage in the database.", {
        description: "Please make sure the trip schedule exists in the system."
      });
      return;
    }

    const eventId = events[0].id;

    const cabinType = cabinTypeIdToDb(data.preferredCabin);
    const passengers = data.passengers.map((p) => ({
      fullName: p.fullName,
      cabinType: p.cabinType,
      foodAllergies: p.foodAllergies || undefined,
    }));

    const { error } = await supabase.from("reservations").insert({
      event_id: eventId,
      cabin_id: data.selectedCabinId,
      cabin_type: cabinType,
      customer_name: data.fullName,
      customer_email: data.email,
      customer_phone: data.phone,
      passengers,
      status: "PENDING",
      total_guests: data.numberOfPassengers,
      total_price: 0,
      notes: (() => {
        const parts: string[] = [];
        if (data.bookingMethod === "agent" && data.agentCompany) {
          parts.push(`Agent: ${data.agentCompany}${data.agentContact ? `, Contact: ${data.agentContact}` : ""}`);
        }
        if (data.notes && data.notes.trim()) {
          parts.push(data.notes.trim());
        }
        return parts.length > 0 ? parts.join(" | ") : null;
      })(),
      invoice_generated: false,
    });

    if (error) {
      setIsSubmitting(false);
      toast.error("Failed to submit reservation", { description: error.message });
      return;
    }

    setIsSubmitting(false);
    toast.success("Reservation submitted successfully!", {
      description: "We'll send a confirmation to your email shortly.",
    });
    window.dispatchEvent(new CustomEvent("reservation-created"));
    navigate("/reservations");
  };

  const handleCabinSelect = (cabinId: string, baseType: 'queen' | 'twin') => {
    form.setValue("selectedCabinId", cabinId, { shouldValidate: true });
    setSelectedBaseType(baseType);
    // Reset rate specific to avoid mismatched options
    form.setValue("preferredCabin", "", { shouldValidate: true });
  };

  const SectionHeader = ({ step, title, subtitle }: { step: number; title: string; subtitle: string }) => (
    <div className="flex items-start gap-3 mb-6">
      <div className="step-indicator">{step}</div>
      <div>
        <h2 className="section-title !mb-0">{title}</h2>
        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
      </div>
    </div>
  );

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* STEP 1: Rates & Schedule */}
      <div className="section-card">
        <SectionHeader
          step={1}
          title="Rates & Schedule"
          subtitle="View our complete package rates, schedules, and voyage availability"
        />
        <div className="flex items-start gap-3 p-4 bg-background rounded-lg border border-primary/10">
          <FileText className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-sm text-foreground">
              Before proceeding, you may want to review our current packages.
            </p>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                toast.info("Opening Rates & Schedule PDF...");
              }}
              className="text-primary underline underline-offset-4 font-semibold hover:text-primary/80 transition-colors inline-flex items-center gap-1 mt-2"
            >
              View Package Rates & Availability
              <ChevronDown className="w-4 h-4 rotate-[270deg]" />
            </a>
          </div>
        </div>
      </div>

      {/* STEP 2: Trip Destination */}
      <div className="section-card">
        <SectionHeader step={2} title="Trip Destination" subtitle="Where would you like to dive?" />
        <RadioGroup
          onValueChange={(val) => form.setValue("tripDestination", val)}
          value={watchDestination}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
        >
          {TRIP_DESTINATIONS.map((dest) => (
            <label
              key={dest.id}
              className={`cabin-card flex items-start gap-3 ${watchDestination === dest.id ? "selected" : ""}`}
            >
              <RadioGroupItem value={dest.id} className="mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground">{dest.label}</p>
              </div>
            </label>
          ))}
        </RadioGroup>
        {form.formState.errors.tripDestination && (
          <p className="text-xs text-destructive mt-2">{form.formState.errors.tripDestination.message}</p>
        )}
      </div>

      {/* STEP 3: Trip Schedule */}
      <div className="section-card">
        <SectionHeader step={3} title="Trip Schedule" subtitle="Choose your preferred voyage date based on the selected destination" />
        {!watchDestination ? (
          <p className="text-sm text-muted-foreground italic p-4 bg-background rounded-md border text-center">
            Please select a trip destination first to view available schedules.
          </p>
        ) : availableSchedules.length === 0 ? (
          <p className="text-sm text-muted-foreground italic p-4 bg-background rounded-md border text-center">
            No schedules currently available for this destination.
          </p>
        ) : (
          <RadioGroup
            onValueChange={(val) => form.setValue("tripSchedule", val)}
            value={form.watch("tripSchedule")}
            className="grid grid-cols-1 md:grid-cols-2 gap-3"
          >
            {availableSchedules.map((trip) => (
              <label
                key={trip.id}
                className={`cabin-card flex items-start gap-3 ${form.watch("tripSchedule") === trip.id ? "selected" : ""} ${trip.slotsAvailable === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <RadioGroupItem value={trip.id} className="mt-0.5" disabled={trip.slotsAvailable === 0} />
                <div className="flex-[1]">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground">{trip.label}</p>
                    <Badge variant={availabilityBadgeVariant(trip.slotsAvailable)} className="text-[10px]">
                      {trip.slotsAvailable} slots
                    </Badge>
                  </div>
                </div>
              </label>
            ))}
          </RadioGroup>
        )}
        {form.formState.errors.tripSchedule && (
          <p className="text-xs text-destructive mt-2">{form.formState.errors.tripSchedule.message}</p>
        )}
      </div>

      {/* STEP 4: Booking Method */}
      <div className="section-card">
        <SectionHeader step={4} title="Booking Method" subtitle="How are you booking this trip?" />
        <RadioGroup
          onValueChange={(val) => form.setValue("bookingMethod", val)}
          value={watchBookingMethod}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          {BOOKING_METHODS.map((method) => (
            <label
              key={method.id}
              className={`cabin-card flex items-start gap-3 ${watchBookingMethod === method.id ? "selected" : ""}`}
            >
              <RadioGroupItem value={method.id} className="mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground">{method.label}</p>
              </div>
            </label>
          ))}
        </RadioGroup>
        {form.formState.errors.bookingMethod && (
          <p className="text-xs text-destructive mt-2">{form.formState.errors.bookingMethod.message}</p>
        )}

        {watchBookingMethod === "agent" && (
          <div className="form-grid mt-4 pt-4 border-t">
            <div>
              <Label htmlFor="agentCompany">Booking Agent Company Name *</Label>
              <Input id="agentCompany" {...form.register("agentCompany")} className="mt-1.5" placeholder="e.g. Travel Corp" />
              {form.formState.errors.agentCompany && (
                <p className="text-xs text-destructive mt-1">{form.formState.errors.agentCompany.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="agentContact">Contact Person *</Label>
              <Input id="agentContact" {...form.register("agentContact")} className="mt-1.5" placeholder="e.g. Juan Dela Cruz" />
              {form.formState.errors.agentContact && (
                <p className="text-xs text-destructive mt-1">{form.formState.errors.agentContact.message}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* STEP 5: Personal Details */}
      <div className="section-card">
        <SectionHeader step={5} title="Personal Details" subtitle="Your contact and booking information" />
        <div className="form-grid">
          <div className="md:col-span-2">
            <Label htmlFor="fullName">Full Name (as per ID) *</Label>
            <Input id="fullName" {...form.register("fullName")} className="mt-1.5" placeholder="Juan Dela Cruz" />
            {form.formState.errors.fullName && (
              <p className="text-xs text-destructive mt-1">{form.formState.errors.fullName.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="gender">Gender *</Label>
            <Select onValueChange={(val) => form.setValue("gender", val)} value={form.watch("gender")}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                {GENDER_OPTIONS.map((g) => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.gender && (
              <p className="text-xs text-destructive mt-1">{form.formState.errors.gender.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input id="email" type="email" {...form.register("email")} className="mt-1.5" placeholder="you@email.com" />
            {form.formState.errors.email && (
              <p className="text-xs text-destructive mt-1">{form.formState.errors.email.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="phone">Phone / Mobile Number *</Label>
            <Input id="phone" {...form.register("phone")} className="mt-1.5" placeholder="+63 917 123 4567" />
            {form.formState.errors.phone && (
              <p className="text-xs text-destructive mt-1">{form.formState.errors.phone.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="numberOfPassengers">Number of Passengers *</Label>
            <Input
              id="numberOfPassengers"
              type="number"
              min={1}
              max={22}
              value={passengerCount}
              onChange={(e) => handlePassengerCountChange(e.target.value)}
              className="mt-1.5"
            />
            {form.formState.errors.numberOfPassengers && (
              <p className="text-xs text-destructive mt-1">{form.formState.errors.numberOfPassengers.message}</p>
            )}
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="address">Complete Address *</Label>
            <Textarea id="address" {...form.register("address")} className="mt-1.5" placeholder="House/Unit No., Street, City, Province" rows={2} />
            {form.formState.errors.address && (
              <p className="text-xs text-destructive mt-1">{form.formState.errors.address.message}</p>
            )}
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="notes">Notes / Special Requests (Optional)</Label>
            <Textarea id="notes" {...form.register("notes")} className="mt-1.5" placeholder="e.g. dietary needs, special accommodations, other requests..." rows={3} />
          </div>
        </div>
      </div>

      {/* STEP 6: Preferred Cabin */}
      <div className="section-card">
        <SectionHeader step={6} title="Preferred Cabin" subtitle="Select your preferred cabin location on the deck plan, then choose your occupancy rate" />

        {/* The New Map */}
        <div className="mb-6">
          <CabinSelectionMap
            onSelect={handleCabinSelect}
            selectedCabinId={form.watch("selectedCabinId")}
          />
          {form.formState.errors.selectedCabinId && (
            <p className="text-xs text-destructive mt-2 text-center">{form.formState.errors.selectedCabinId.message}</p>
          )}
        </div>

        {selectedBaseType && (
          <div className="pt-6 border-t animate-in fade-in slide-in-from-top-4">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-foreground">Occupancy Rate for {form.watch("selectedCabinId")}</h3>
              <p className="text-xs text-muted-foreground">Select how you will be occupying this cabin</p>
            </div>
            <RadioGroup
              onValueChange={(val) => form.setValue("preferredCabin", val)}
              value={form.watch("preferredCabin")}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            >
              {CABIN_TYPES.filter(c => c.id.startsWith(selectedBaseType)).map((cabin) => {
                const available = cabin.totalInventory - cabin.booked;
                return (
                  <label
                    key={cabin.id}
                    className={`cabin-card flex items-start gap-3 ${form.watch("preferredCabin") === cabin.id ? "selected" : ""}`}
                  >
                    <RadioGroupItem value={cabin.id} className="mt-0.5" disabled={available === 0} />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <p className="text-sm font-semibold text-foreground">{cabin.label}</p>
                        <Badge variant={availabilityBadgeVariant(available, 2)} className="text-[10px] ml-2 shrink-0">
                          {available} left
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{cabin.description}</p>
                    </div>
                  </label>
                );
              })}
            </RadioGroup>
            {form.formState.errors.preferredCabin && (
              <p className="text-xs text-destructive mt-2">{form.formState.errors.preferredCabin.message}</p>
            )}
          </div>
        )}
      </div>

      {/* STEP 7: Passenger Details */}
      <div className="section-card">
        <SectionHeader step={7} title="Passenger Details" subtitle={`Enter details for each of your ${passengerCount} passenger(s)`} />
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="border rounded-lg p-4 bg-background">
              <div className="flex items-center gap-2 mb-3">
                <UserPlus className="w-4 h-4 text-primary" />
                <p className="text-sm font-semibold text-foreground">Passenger {index + 1}</p>
              </div>
              <div className="form-grid">
                <div>
                  <Label>Full Name *</Label>
                  <Input
                    {...form.register(`passengers.${index}.fullName`)}
                    className="mt-1.5"
                    placeholder="Full name as per ID"
                  />
                  {form.formState.errors.passengers?.[index]?.fullName && (
                    <p className="text-xs text-destructive mt-1">{form.formState.errors.passengers[index]?.fullName?.message}</p>
                  )}
                </div>
                <div>
                  <Label>Cabin Type *</Label>
                  <Select
                    onValueChange={(val) => form.setValue(`passengers.${index}.cabinType`, val)}
                    value={form.watch(`passengers.${index}.cabinType`)}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select cabin" />
                    </SelectTrigger>
                    <SelectContent>
                      {CABIN_TYPES.map((cabin) => (
                        <SelectItem key={cabin.id} value={cabin.id}>
                          {cabin.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.passengers?.[index]?.cabinType && (
                    <p className="text-xs text-destructive mt-1">{form.formState.errors.passengers[index]?.cabinType?.message}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <Label>Food Allergies (Optional)</Label>
                  <Input
                    {...form.register(`passengers.${index}.foodAllergies`)}
                    className="mt-1.5"
                    placeholder="e.g. Peanuts, Shellfish, None"
                  />
                  {form.formState.errors.passengers?.[index]?.foodAllergies && (
                    <p className="text-xs text-destructive mt-1">{form.formState.errors.passengers[index]?.foodAllergies?.message}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* STEP 8: Terms & Conditions */}
      <div className="section-card">
        <SectionHeader step={8} title="Terms & Conditions" subtitle="Please review and accept before proceeding" />
        <div className="bg-secondary/50 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-2">
            <FileText className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-sm text-foreground">
                Please read our complete{" "}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    toast.info("Terms & Conditions PDF would open here.");
                  }}
                  className="text-primary underline underline-offset-2 font-medium hover:text-primary/80 transition-colors"
                >
                  Terms and Conditions
                </a>{" "}
                before proceeding with your reservation.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                By checking the box below, you confirm that you have read, understood, and agree to the terms.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Checkbox
            id="termsAccepted"
            checked={form.watch("termsAccepted") === true}
            onCheckedChange={(checked) => form.setValue("termsAccepted", checked === true ? true : undefined as unknown as true)}
          />
          <Label htmlFor="termsAccepted" className="text-sm leading-relaxed cursor-pointer">
            I have read and agree to the <span className="font-semibold text-primary">Terms and Conditions</span> of this cruise reservation. *
          </Label>
        </div>
        {form.formState.errors.termsAccepted && (
          <p className="text-xs text-destructive mt-2">{form.formState.errors.termsAccepted.message}</p>
        )}
      </div>

      {/* STEP 9: Agreement & Approval */}
      <div className="section-card">
        <SectionHeader step={9} title="Agreement & Approval" subtitle="Type your full name as your digital signature" />
        <div className="flex items-start gap-2 mb-4">
          <PenLine className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <p className="text-sm text-muted-foreground">
            By typing your full name below, you acknowledge that all information provided is accurate and you authorize this reservation.
          </p>
        </div>
        <div>
          <Label htmlFor="agreementName">Full Name (Digital Signature) *</Label>
          <Input
            id="agreementName"
            {...form.register("agreementName")}
            className="mt-1.5 font-body text-lg"
            placeholder="Type your full name here"
          />
          {form.formState.errors.agreementName && (
            <p className="text-xs text-destructive mt-1">{form.formState.errors.agreementName.message}</p>
          )}
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-center pb-8">
        <Button type="submit" size="lg" className="px-12 text-base font-semibold" disabled={isSubmitting}>
          <Ship className="w-5 h-5 mr-2" />
          {isSubmitting ? "Submitting..." : "Submit Reservation"}
        </Button>
      </div>
    </form>
  );
};

export default ReservationForm;
