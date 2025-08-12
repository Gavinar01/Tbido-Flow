import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Calendar, Clock, Users, Settings, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { GetReservationsResponse } from "@shared/api";
import ReservationModal from "@/components/ReservationModal";
import VenueAvailability from "@/components/VenueAvailability";

export default function UserDashboard() {
  const [user, setUser] = useState<any>(null);
  const [reservations, setReservations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      toast({
        title: "Please Sign In",
        description: "You need to sign in to access the dashboard.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    setUser(JSON.parse(userData));
    fetchReservations();
  }, [navigate, toast]);

  const fetchReservations = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/reservations/my", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch reservations");
      }

      const data: GetReservationsResponse = await response.json();
      setReservations(data.reservations);
    } catch (error) {
      console.error("Error fetching reservations:", error);
      toast({
        title: "Error",
        description: "Failed to load your reservations.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast({
      title: "Signed Out",
      description: "You have been signed out successfully.",
    });
    navigate("/");
  };

  const handleMakeReservation = () => {
    setIsReservationModalOpen(true);
  };

  const handleReservationCreated = () => {
    fetchReservations(); // Refresh the reservations list
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Calendar className="h-12 w-12 mx-auto mb-4 animate-pulse" style={{color: '#C94E5D'}} />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      {/* Header */}
      <header className="w-full px-6 py-4 border-b bg-white/70 backdrop-blur-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2F2fe4f7fd04a545f08056b89b3f633e83%2Fdba04484f1fb4da0949c0f8e5a34c75b?format=webp&width=800"
              alt="Flow Logo"
              className="h-8 w-8"
            />
            <span className="text-2xl font-bold text-foreground">Flow</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              Welcome, {user?.firstName}!
            </span>
            <Button variant="ghost" size="sm" className="gap-2" onClick={() => toast({ title: "Settings", description: "Settings panel coming soon!" })}>
              <Settings className="h-4 w-4" />
              Settings
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome Back, {user?.firstName}!</h1>
          <p className="text-muted-foreground">Ready to book your next venue? Let's get started.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets%2F2fe4f7fd04a545f08056b89b3f633e83%2Fd6db581a27c74d93a3adde635d94c3cf?format=webp&width=800"
                    alt="Reservation Icon"
                    className="h-5 w-5"
                  />
                  Make a Reservation
                </CardTitle>
                <CardDescription>
                  Book a venue for your upcoming event or meeting
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border-2 border-dashed border-border rounded-lg text-center">
                    <img
                      src="https://cdn.builder.io/api/v1/image/assets%2F2fe4f7fd04a545f08056b89b3f633e83%2Fd6db581a27c74d93a3adde635d94c3cf?format=webp&width=800"
                      alt="Book Now Icon"
                      className="h-8 w-8 mx-auto mb-2"
                    />
                    <h3 className="font-semibold text-foreground mb-1">Book Now</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Quick access to venue reservation form
                    </p>
                    <Button className="w-full" onClick={handleMakeReservation}>Book Now</Button>
                  </div>

                  <VenueAvailability onMakeReservation={handleMakeReservation} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Reservations</CardTitle>
                <CardDescription>
                  Your personal bookings ({reservations.length}) • Venue availability shows all users' bookings
                </CardDescription>
              </CardHeader>
              <CardContent>
                {reservations.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No reservations yet</p>
                    <Button variant="outline" className="mt-4" onClick={handleMakeReservation}>
                      Make Your First Booking
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reservations.slice(0, 3).map((reservation) => (
                      <div key={reservation._id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{reservation.venue}</h4>
                            <p className="text-sm text-muted-foreground">{reservation.purpose}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(reservation.date).toLocaleDateString()} • {formatTime(reservation.startTime)} - {formatTime(reservation.endTime)}
                            </p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            reservation.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            reservation.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {reservation.status}
                          </span>
                        </div>
                      </div>
                    ))}
                    {reservations.length > 3 && (
                      <p className="text-center text-sm text-muted-foreground">
                        + {reservations.length - 3} more reservations
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" style={{color: '#C94E5D'}} />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Bookings</span>
                  <span className="font-semibold">{reservations.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">This Month</span>
                  <span className="font-semibold">
                    {reservations.filter(r => {
                      const resDate = new Date(r.date);
                      const now = new Date();
                      return resDate.getMonth() === now.getMonth() && resDate.getFullYear() === now.getFullYear();
                    }).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Confirmed</span>
                  <span className="font-semibold">
                    {reservations.filter(r => r.status === 'confirmed').length}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span className="text-sm">Booking System Online</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span className="text-sm">Database Connected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span className="text-sm">Email Notifications Active</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Reservation Modal */}
      <ReservationModal
        open={isReservationModalOpen}
        onOpenChange={setIsReservationModalOpen}
        onReservationCreated={handleReservationCreated}
      />
    </div>
  );
}
