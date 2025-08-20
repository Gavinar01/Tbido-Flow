import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Clock, Users, Building2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { CreateReservationRequest, CreateReservationResponse, AVAILABLE_VENUES } from "@shared/api";
import { cn } from "@/lib/utils";

interface ReservationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReservationCreated: () => void;
}

export default function ReservationModal({ open, onOpenChange, onReservationCreated }: ReservationModalProps) {
  const [date, setDate] = useState<Date>();
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [venue, setVenue] = useState("");
  const [purpose, setPurpose] = useState("");
  const [participantCount, setParticipantCount] = useState(1);
  const [participantNames, setParticipantNames] = useState<string[]>(['']);
  const [organizerName, setOrganizerName] = useState("");
  const [organizerOrganization, setOrganizerOrganization] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Generate time options from 8 AM to 5 PM
  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 8; hour <= 17; hour++) {
      const time24 = `${hour.toString().padStart(2, '0')}:00`;
      const time12 = hour <= 12 ? `${hour}:00 AM` : `${hour - 12}:00 PM`;
      if (hour === 12) {
        times.push({ value: time24, label: "12:00 PM" });
      } else {
        times.push({ value: time24, label: time12 });
      }
      
      // Add half-hour option
      if (hour < 17) {
        const time24Half = `${hour.toString().padStart(2, '0')}:30`;
        const time12Half = hour < 12 ? `${hour}:30 AM` : hour === 12 ? "12:30 PM" : `${hour - 12}:30 PM`;
        times.push({ value: time24Half, label: time12Half });
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  // Handle participant count changes and update names array
  const handleParticipantCountChange = (count: number) => {
    setParticipantCount(count);

    // Adjust participant names array
    const newNames = [...participantNames];
    if (count > newNames.length) {
      // Add empty strings for new participants
      for (let i = newNames.length; i < count; i++) {
        newNames.push('');
      }
    } else if (count < newNames.length) {
      // Remove excess names
      newNames.splice(count);
    }
    setParticipantNames(newNames);
  };

  // Handle individual participant name changes
  const handleParticipantNameChange = (index: number, name: string) => {
    const newNames = [...participantNames];
    newNames[index] = name;
    setParticipantNames(newNames);
  };

  const validateTimeRange = () => {
    if (!startTime || !endTime) return true;
    
    const start = new Date(`2000-01-01 ${startTime}`);
    const end = new Date(`2000-01-01 ${endTime}`);
    
    return start < end;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !startTime || !endTime || !venue || !purpose || !organizerName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (!validateTimeRange()) {
      toast({
        title: "Invalid Time Range",
        description: "End time must be after start time.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const reservationData: CreateReservationRequest = {
        venue,
        purpose,
        date: date.toISOString().split('T')[0], // YYYY-MM-DD format
        startTime,
        endTime,
        participantCount,
        participantNames: participantNames.filter(name => name.trim() !== ''), // Filter out empty names
        organizerName,
        organizerOrganization: organizerOrganization || undefined,
      };

      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(reservationData),
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          console.error("Failed to parse error response:", parseError);
        }
        throw new Error(errorMessage);
      }

      const result: CreateReservationResponse = await response.json();

      toast({
        title: "Reservation Confirmed!",
        description: `Your booking for ${venue} on ${format(date, "PPP")} has been confirmed.`,
      });

      // Reset form
      setDate(undefined);
      setStartTime("");
      setEndTime("");
      setVenue("");
      setPurpose("");
      setParticipantCount(1);
      setParticipantNames(['']);
      setOrganizerName("");
      setOrganizerOrganization("");

      onReservationCreated();
      onOpenChange(false);
    } catch (error) {
      console.error("Reservation error:", error);
      toast({
        title: "Booking Failed",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2F2fe4f7fd04a545f08056b89b3f633e83%2Fd6db581a27c74d93a3adde635d94c3cf?format=webp&width=800"
              alt="Make a Reservation Icon"
              className="h-5 w-5"
            />
            Make a Reservation
          </DialogTitle>
          <DialogDescription>
            Book a venue for your event or meeting. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date Selection */}
          <div className="space-y-2">
            <Label>Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Start Time *
              </Label>
              <Select value={startTime} onValueChange={setStartTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Select start time" />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.slice(0, -1).map((time) => (
                    <SelectItem key={time.value} value={time.value}>
                      {time.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>End Time *</Label>
              <Select value={endTime} onValueChange={setEndTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Select end time" />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.filter((time) => !startTime || time.value > startTime).map((time) => (
                    <SelectItem key={time.value} value={time.value}>
                      {time.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Venue Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Venue *
            </Label>
            <Select value={venue} onValueChange={setVenue}>
              <SelectTrigger>
                <SelectValue placeholder="Select a venue" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_VENUES.map((venueOption) => (
                  <SelectItem key={venueOption} value={venueOption}>
                    {venueOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Event Details */}
          <div className="space-y-2">
            <Label>Purpose/Event Description *</Label>
            <Textarea
              placeholder="Describe the purpose of your reservation..."
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>

          {/* Organizer Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Organizer Name *</Label>
              <Input
                placeholder="Your full name"
                value={organizerName}
                onChange={(e) => setOrganizerName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Organization (Optional)</Label>
              <Input
                placeholder="Your organization"
                value={organizerOrganization}
                onChange={(e) => setOrganizerOrganization(e.target.value)}
              />
            </div>
          </div>

          {/* Participant Count */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Number of Participants * (Max: 20)
            </Label>
            <Input
              type="number"
              min="1"
              max="20"
              value={participantCount}
              onChange={(e) => handleParticipantCountChange(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
            />
          </div>

          {/* Participant Names */}
          {participantCount > 0 && (
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Participant Names (Fill up to {participantCount} participants)
              </Label>
              <div className="grid gap-3 max-h-40 overflow-y-auto p-2 border rounded-lg bg-muted/50">
                {Array.from({ length: participantCount }, (_, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground w-8 flex-shrink-0">
                      {index + 1}.
                    </span>
                    <Input
                      placeholder={index === 0 ? "Organizer (you)" : `Participant ${index + 1} name`}
                      value={participantNames[index] || ''}
                      onChange={(e) => handleParticipantNameChange(index, e.target.value)}
                      className="flex-1"
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                💡 Tip: Leave empty for participants whose names are unknown. You can add them later.
              </p>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? "Creating Reservation..." : "Confirm Booking"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
