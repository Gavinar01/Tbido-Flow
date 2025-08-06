import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Calendar, Users, FileText, Settings, LogOut, Shield, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { GetReservationsResponse } from "@shared/api";

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [reservations, setReservations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is logged in and is admin
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      navigate("/admin/signin");
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (!parsedUser.isAdmin) {
      toast({
        title: "Access Denied",
        description: "Admin privileges required.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    setUser(parsedUser);
    fetchAllReservations();
  }, [navigate, toast]);

  const fetchAllReservations = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/reservations", {
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
        description: "Failed to load reservations.",
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
      title: "Admin Signed Out",
      description: "You have been signed out successfully.",
    });
    navigate("/admin/signin");
  };

  const handleExportCSV = () => {
    if (reservations.length === 0) {
      toast({
        title: "No Data",
        description: "No reservations to export.",
        variant: "destructive",
      });
      return;
    }

    // Create CSV content
    const headers = ["Date", "Venue", "Organizer", "Purpose", "Time", "Participants", "Status"];
    const csvContent = [
      headers.join(","),
      ...reservations.map(r => [
        new Date(r.date).toLocaleDateString(),
        `"${r.venue}"`,
        `"${r.organizerName}"`,
        `"${r.purpose}"`,
        `"${formatTime(r.startTime)} - ${formatTime(r.endTime)}"`,
        r.participantCount,
        r.status
      ].join(","))
    ].join("\n");

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reservations-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Reservations exported to CSV successfully.",
    });
  };

  const handleExportPDF = () => {
    toast({
      title: "PDF Export",
      description: "PDF export feature will be implemented in the next version.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const totalUsers = new Set(reservations.map(r => typeof r.userId === 'object' ? r.userId._id : r.userId)).size;
  const thisMonthReservations = reservations.filter(r => {
    const resDate = new Date(r.date);
    const now = new Date();
    return resDate.getMonth() === now.getMonth() && resDate.getFullYear() === now.getFullYear();
  }).length;

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      {/* Header */}
      <header className="w-full px-6 py-4 border-b bg-white/70 backdrop-blur-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">Flow</span>
            <span className="ml-2 px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
              ADMIN
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              Admin: {user?.firstName}
            </span>
            <Button variant="ghost" size="sm" className="gap-2" onClick={() => toast({ title: "Settings", description: "Admin settings panel coming soon!" })}>
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
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">Manage venue reservations, users, and system settings.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Reservations</p>
                  <p className="text-2xl font-bold text-foreground">{reservations.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                  <p className="text-2xl font-bold text-foreground">{totalUsers}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">This Month</p>
                  <p className="text-2xl font-bold text-foreground">{thisMonthReservations}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Venues Available</p>
                  <p className="text-2xl font-bold text-foreground">8</p>
                </div>
                <Building2 className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Venue Calendar View
                </CardTitle>
                <CardDescription>
                  Monitor venue availability and reservations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">Calendar Integration</h3>
                  <p className="text-muted-foreground mb-4">
                    Interactive calendar showing venue bookings and availability
                  </p>
                  <Button>View Full Calendar</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Reservations</CardTitle>
                <CardDescription>
                  Latest venue booking activity ({reservations.length} total)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {reservations.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No reservations yet</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Reservation data will appear here as users book venues
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reservations.slice(0, 5).map((reservation) => {
                      const organizer = typeof reservation.userId === 'object'
                        ? `${reservation.userId.firstName} ${reservation.userId.lastName}`
                        : reservation.organizerName;

                      return (
                        <div key={reservation._id} className="p-3 border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold">{reservation.venue}</h4>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  reservation.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                  reservation.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {reservation.status}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">{reservation.purpose}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <span>{organizer}</span>
                                <span>{new Date(reservation.date).toLocaleDateString()}</span>
                                <span>{formatTime(reservation.startTime)} - {formatTime(reservation.endTime)}</span>
                                <span>{reservation.participantCount} people</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {reservations.length > 5 && (
                      <p className="text-center text-sm text-muted-foreground">
                        + {reservations.length - 5} more reservations
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
                  <FileText className="h-5 w-5 text-primary" />
                  Attendance Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full gap-2" onClick={() => toast({ title: "Attendance Lists", description: "Attendance management feature coming soon!" })}>
                  <FileText className="h-4 w-4" />
                  View Attendance Lists
                </Button>
                <Button variant="outline" className="w-full gap-2" onClick={handleExportPDF}>
                  <FileText className="h-4 w-4" />
                  Export to PDF
                </Button>
                <Button variant="outline" className="w-full gap-2" onClick={handleExportCSV}>
                  <FileText className="h-4 w-4" />
                  Export to CSV
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span className="text-sm">Database Connected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span className="text-sm">Email Service Active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span className="text-sm">API Endpoints Online</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span className="text-sm">Authentication Working</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => toast({ title: "User Management", description: "User management feature coming soon!" })}>
                  Manage Users
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => toast({ title: "Venue Settings", description: "Venue configuration panel coming soon!" })}>
                  Venue Settings
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => toast({ title: "Email Templates", description: "Email template editor coming soon!" })}>
                  Email Templates
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => toast({ title: "System Logs", description: "System log viewer coming soon!" })}>
                  System Logs
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
