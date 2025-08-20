import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Building2, Clock, Users, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { VenueAvailabilityResponse } from "@shared/api";

interface VenueAvailabilityProps {
  onMakeReservation: () => void;
}

export default function VenueAvailability({ onMakeReservation }: VenueAvailabilityProps) {
  const [availability, setAvailability] = useState<VenueAvailabilityResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const { toast } = useToast();

  const fetchAvailability = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No authentication token found");
        throw new Error("Authentication required");
      }

      const today = new Date().toISOString().split('T')[0];
      console.log("Fetching venue availability for date:", today);

      const response = await fetch(`/api/venues/availability?date=${today}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API error response:", errorText);
        throw new Error(`HTTP ${response.status}: Failed to fetch venue availability`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const responseText = await response.text();
        console.error("Non-JSON response:", responseText);
        throw new Error("Server returned non-JSON response");
      }

      const data: VenueAvailabilityResponse = await response.json();
      console.log("Received venue availability data:", data);
      setAvailability(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching venue availability:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load venue availability.",
        variant: "destructive",
      });
      // Only use fallback as last resort
      if (!availability) {
        setAvailabilityFallback();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const setAvailabilityFallback = () => {
    const VENUES = [
      '4th Flr. NALLRC Office'
    ];

    const fallbackData: VenueAvailabilityResponse = {
      date: new Date().toISOString().split('T')[0],
      venues: VENUES.map(venue => ({
        venue,
        status: 'available' as const,
        nextAvailable: null,
        currentReservation: null,
        reservations: []
      })),
      totalVenues: VENUES.length,
      availableVenues: VENUES.length
    };

    setAvailability(fallbackData);
    setLastUpdated(new Date());
  };

  useEffect(() => {
    fetchAvailability();
    
    // Auto-refresh every 2 minutes
    const interval = setInterval(fetchAvailability, 120000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getNextAvailableText = (venue: any) => {
    if (venue.status === 'available') {
      if (venue.reservations.length > 0) {
        const nextReservation = venue.reservations[0];
        return `Available until ${formatTime(nextReservation.startTime)}`;
      } else if (venue.nextAvailable) {
        return `Available until ${formatTime(venue.nextAvailable)}`;
      }
      return "Available all day";
    } else {
      return venue.nextAvailable ? `Free at ${formatTime(venue.nextAvailable)}` : "Occupied";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" style={{color: '#C94E5D'}} />
            Venue Availability
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading availability...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!availability) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" style={{color: '#C94E5D'}} />
            Venue Availability
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Unable to load venue availability</p>
            <Button variant="outline" onClick={fetchAvailability} className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2F2fe4f7fd04a545f08056b89b3f633e83%2Fd6db581a27c74d93a3adde635d94c3cf?format=webp&width=800"
                alt="Venue Availability Icon"
                className="h-5 w-5"
              />
              Venue Availability
            </CardTitle>
            <CardDescription>
              Real-time venue status for today
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchAvailability}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{availability.availableVenues}</div>
            <div className="text-xs text-muted-foreground">Available</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{availability.totalVenues - availability.availableVenues}</div>
            <div className="text-xs text-muted-foreground">Occupied</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold" style={{color: '#C94E5D'}}>{availability.totalVenues}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
        </div>

        <Separator className="mb-4" />

        {/* Venue List */}
        <div className="space-y-3">
          {availability.venues.map((venue) => (
            <div key={venue.venue} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{venue.venue}</h4>
                    <Badge 
                      variant={venue.status === 'available' ? 'default' : 'destructive'}
                      className={venue.status === 'available' ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''}
                    >
                      {venue.status === 'available' ? 'Available' : 'Occupied'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {getNextAvailableText(venue)}
                    </span>
                    
                    {venue.currentReservation && (
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {venue.currentReservation.purpose}
                      </span>
                    )}
                  </div>

                  {venue.status === 'occupied' && venue.currentReservation && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Currently: {venue.currentReservation.organizer} until {formatTime(venue.currentReservation.endTime)}
                    </div>
                  )}

                  {venue.status === 'available' && venue.reservations.length > 0 && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Next: {venue.reservations[0].purpose} at {formatTime(venue.reservations[0].startTime)}
                    </div>
                  )}
                </div>

                {venue.status === 'available' && (
                  <Button 
                    size="sm" 
                    onClick={onMakeReservation}
                    className="ml-4"
                  >
                    Book Now
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Last Updated */}
        <div className="text-center mt-4 pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>

        {/* Quick Book Button */}
        <Button
          onClick={onMakeReservation}
          className="w-full mt-4"
          size="lg"
        >
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2F2fe4f7fd04a545f08056b89b3f633e83%2Fd6db581a27c74d93a3adde635d94c3cf?format=webp&width=800"
            alt="Make Reservation Icon"
            className="h-4 w-4 mr-2"
          />
          Make Reservation
        </Button>
      </CardContent>
    </Card>
  );
}
