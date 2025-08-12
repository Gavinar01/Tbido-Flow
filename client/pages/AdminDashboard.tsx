import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, FileText, Settings, LogOut, Shield, TrendingUp, ChevronDown, Eye, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { GetReservationsResponse } from "@shared/api";

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [reservations, setReservations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAttendance, setShowAttendance] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<any>(null);
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

  const handleStatusChange = async (reservationId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/reservations/${reservationId}/status`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      // Refresh reservations
      fetchAllReservations();
      
      toast({
        title: "Status Updated",
        description: `Reservation status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update reservation status.",
        variant: "destructive",
      });
    }
  };

  const handleViewAttendance = () => {
    setShowAttendance(true);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 animate-pulse" style={{color: '#C94E5D'}} />
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (showAttendance) {
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
              <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full" style={{backgroundColor: '#C94E5D20', color: '#C94E5D'}}>
                ADMIN
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => setShowAttendance(false)}>
                Back to Dashboard
              </Button>
              <Button variant="outline" size="sm" className="gap-2" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </header>

        {/* Attendance View */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
              <Users className="h-8 w-8" style={{color: '#C94E5D'}} />
              Venue Guest Lists
            </h1>
            <p className="text-muted-foreground">Complete attendance records for all venue reservations.</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Reservations - Guest Lists</CardTitle>
              <CardDescription>
                Showing {reservations.length} reservations with guest details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-semibold">Date</th>
                      <th className="text-left p-3 font-semibold">Venue</th>
                      <th className="text-left p-3 font-semibold">Organizer</th>
                      <th className="text-left p-3 font-semibold">Purpose</th>
                      <th className="text-left p-3 font-semibold">Time</th>
                      <th className="text-left p-3 font-semibold">Guests</th>
                      <th className="text-left p-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.map((reservation) => {
                      const organizer = typeof reservation.userId === 'object'
                        ? `${reservation.userId.firstName} ${reservation.userId.lastName}`
                        : reservation.organizerName;

                      return (
                        <tr key={reservation._id} className="border-b hover:bg-gray-50">
                          <td className="p-3">{new Date(reservation.date).toLocaleDateString()}</td>
                          <td className="p-3 font-medium">{reservation.venue}</td>
                          <td className="p-3">{organizer}</td>
                          <td className="p-3">{reservation.purpose}</td>
                          <td className="p-3">
                            {formatTime(reservation.startTime)} - {formatTime(reservation.endTime)}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" style={{color: '#C94E5D'}} />
                              <span className="font-semibold">{reservation.participantCount} attendees</span>
                            </div>
                            {reservation.organizerOrganization && (
                              <div className="text-sm text-muted-foreground mt-1">
                                Organization: {reservation.organizerOrganization}
                              </div>
                            )}
                          </td>
                          <td className="p-3">
                            <Badge className={getStatusColor(reservation.status)}>
                              {reservation.status}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {reservations.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No reservations found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
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
            <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full" style={{backgroundColor: '#C94E5D20', color: '#C94E5D'}}>
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <div className="p-4 rounded-lg border-l-4 mb-6" style={{borderLeftColor: '#C94E5D', backgroundColor: '#C94E5D10'}}>
            <p className="text-sm text-muted-foreground">
              Only authorized personnel are permitted beyond this point. Use your credentials to view, manage, and monitor venue reservations securely. For assistance, contact the technical team at admin@flow.com.
            </p>
          </div>
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
                <Calendar className="h-8 w-8" style={{color: '#C94E5D'}} />
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
                <Users className="h-8 w-8" style={{color: '#C94E5D'}} />
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
                <TrendingUp className="h-8 w-8" style={{color: '#C94E5D'}} />
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
                <Calendar className="h-8 w-8" style={{color: '#C94E5D'}} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Reservation Management */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader style={{backgroundColor: '#C94E5D', color: 'white'}}>
                <CardTitle className="text-white">Venue Reservation Management</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left p-4 font-semibold">Organizer</th>
                        <th className="text-left p-4 font-semibold">Venue</th>
                        <th className="text-left p-4 font-semibold">Purpose</th>
                        <th className="text-left p-4 font-semibold">Status</th>
                        <th className="text-left p-4 font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reservations.slice(0, 8).map((reservation) => {
                        const organizer = typeof reservation.userId === 'object'
                          ? `${reservation.userId.firstName} ${reservation.userId.lastName}`
                          : reservation.organizerName;

                        return (
                          <tr key={reservation._id} className="border-b hover:bg-gray-50">
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{backgroundColor: 
                                  reservation.status === 'confirmed' ? '#10B981' : 
                                  reservation.status === 'pending' ? '#F59E0B' : '#EF4444'
                                }}></div>
                                {organizer}
                              </div>
                            </td>
                            <td className="p-4 font-medium">{reservation.venue}</td>
                            <td className="p-4">{reservation.purpose}</td>
                            <td className="p-4">
                              <Select 
                                value={reservation.status} 
                                onValueChange={(value) => handleStatusChange(reservation._id, value)}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="confirmed">Confirmed</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="p-4">
                              <Button 
                                size="sm" 
                                style={{backgroundColor: '#C94E5D', color: 'white'}}
                                className="hover:opacity-90"
                                onClick={() => handleStatusChange(reservation._id, 'confirmed')}
                              >
                                Approve
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                
                {reservations.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No reservations found</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Reservations */}
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
                                <Badge className={getStatusColor(reservation.status)}>
                                  {reservation.status}
                                </Badge>
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
                  <FileText className="h-5 w-5" style={{color: '#C94E5D'}} />
                  Attendance Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  className="w-full gap-2 hover:opacity-90" 
                  style={{backgroundColor: '#C94E5D', color: 'white'}}
                  onClick={handleViewAttendance}
                >
                  <Eye className="h-4 w-4" />
                  View Attendance Lists
                </Button>
                <Button variant="outline" className="w-full gap-2" onClick={handleExportCSV}>
                  <Download className="h-4 w-4" />
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
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Database Connected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Email Service Active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">API Endpoints Online</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Authentication Working</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
