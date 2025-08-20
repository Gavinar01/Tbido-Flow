import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Building2, Calendar, Users, FileText, Settings, LogOut, Shield, TrendingUp, Download, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { GetReservationsResponse } from "@shared/api";
import AdminSettings from "@/components/AdminSettings";

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [reservations, setReservations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<any>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
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
    const headers = ["Date", "Venue", "Organizer", "Purpose", "Time", "Participants", "Participant Names", "Status"];
    const csvContent = [
      headers.join(","),
      ...reservations.map(r => {
        const participantNamesText = r.participantNames && r.participantNames.length > 0
          ? r.participantNames.filter(name => name.trim() !== '').join('; ')
          : 'Names not provided';

        return [
          new Date(r.date).toLocaleDateString(),
          `"${r.venue}"`,
          `"${r.organizerName}"`,
          `"${r.purpose}"`,
          `"${formatTime(r.startTime)} - ${formatTime(r.endTime)}"`,
          r.participantCount,
          `"${participantNamesText}"`,
          r.status
        ].join(",");
      })
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
    if (reservations.length === 0) {
      toast({
        title: "No Data",
        description: "No reservations to export.",
        variant: "destructive",
      });
      return;
    }

    // Generate PDF content (simplified version)
    const pdfContent = reservations.map(r => {
      const organizer = typeof r.userId === 'object'
        ? `${r.userId.firstName} ${r.userId.lastName}`
        : r.organizerName;
      const participantNamesText = r.participantNames && r.participantNames.length > 0
        ? r.participantNames.filter(name => name.trim() !== '').join(', ')
        : 'Names not provided';
      return `${new Date(r.date).toLocaleDateString()} | ${r.venue} | ${organizer} | ${r.purpose} | ${r.participantCount} attendees | Participants: ${participantNamesText} | ${r.status}`;
    }).join('\n');

    // Create a simple text file for PDF simulation
    const blob = new Blob([`VENUE RESERVATION ATTENDANCE REPORT\n${'='.repeat(50)}\n\n${pdfContent}`], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-report-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Report Generated",
      description: "Attendance report has been generated successfully.",
    });
  };

  const handleReservationStatusUpdate = async (reservationId: string, status: 'confirmed' | 'cancelled') => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/reservations/${reservationId}/status`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update reservation status");
      }

      // Refresh reservations
      await fetchAllReservations();

      toast({
        title: status === 'confirmed' ? "Reservation Approved" : "Reservation Rejected",
        description: `The reservation has been ${status === 'confirmed' ? 'approved' : 'rejected'} successfully.`,
      });
    } catch (error) {
      console.error("Error updating reservation status:", error);
      toast({
        title: "Error",
        description: "Failed to update reservation status.",
        variant: "destructive",
      });
    }
  };

  const handleViewAttendanceLists = () => {
    if (reservations.length === 0) {
      toast({
        title: "No Data",
        description: "No reservations available for attendance tracking.",
        variant: "destructive",
      });
      return;
    }
    setShowAttendanceModal(true);
  };

  const handleViewReservationAttendance = (reservation: any) => {
    setSelectedReservation(reservation);
  };

  const handleExportAttendanceCSV = (reservation?: any) => {
    const dataToExport = reservation ? [reservation] : reservations;

    if (dataToExport.length === 0) {
      toast({
        title: "No Data",
        description: "No attendance data to export.",
        variant: "destructive",
      });
      return;
    }

    // Create detailed attendance CSV
    const headers = ["Date", "Venue", "Event/Purpose", "Organizer", "Organization", "Start Time", "End Time", "Expected Attendees", "Participant Names", "Status"];
    const csvContent = [
      headers.join(","),
      ...dataToExport.map(r => {
        const organizer = typeof r.userId === 'object'
          ? `${r.userId.firstName} ${r.userId.lastName}`
          : r.organizerName;
        const organization = typeof r.userId === 'object'
          ? r.userId.organization || 'N/A'
          : r.organizerOrganization || 'N/A';

        // Format participant names
        const participantNamesText = r.participantNames && r.participantNames.length > 0
          ? r.participantNames.filter(name => name.trim() !== '').join('; ')
          : 'Names not provided';

        return [
          new Date(r.date).toLocaleDateString(),
          `"${r.venue}"`,
          `"${r.purpose}"`,
          `"${organizer}"`,
          `"${organization}"`,
          formatTime(r.startTime),
          formatTime(r.endTime),
          r.participantCount,
          `"${participantNamesText}"`,
          r.status
        ].join(",");
      })
    ].join("\n");

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = reservation
      ? `attendance-${reservation.venue.replace(/\s+/g, '-')}-${new Date(reservation.date).toISOString().split('T')[0]}.csv`
      : `all-attendance-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: `Attendance data exported successfully.`,
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
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      {/* Header */}
      <header className="w-full px-6 py-4 border-b bg-white/70 backdrop-blur-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <Building2 className="h-8 w-8" style={{color: '#C94E5D'}} />
            <span className="text-2xl font-bold text-foreground">Flow</span>
            <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full" style={{backgroundColor: '#C94E5D20', color: '#C94E5D'}}>
              ADMIN
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              Admin: {user?.firstName}
            </span>
            <Button variant="ghost" size="sm" className="gap-2" onClick={() => setIsSettingsOpen(true)}>
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
            <Shield className="h-8 w-8" style={{color: '#C94E5D'}} />
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
                <Building2 className="h-8 w-8" style={{color: '#C94E5D'}} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">

            <Card>
              <CardHeader>
                <CardTitle className="text-white bg-red-500 px-4 py-2 rounded-t-lg">
                  Venue Reservation Management
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {reservations.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No reservations yet</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Reservation data will appear here as users book venues
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Organizer</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Venue</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Purpose</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reservations.map((reservation) => {
                          const organizer = typeof reservation.userId === 'object'
                            ? `${reservation.userId.firstName} ${reservation.userId.lastName}`
                            : reservation.organizerName;

                          return (
                            <tr key={reservation._id} className="border-b hover:bg-gray-50">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  <span className="text-sm">{organizer}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-sm">{reservation.venue}</td>
                              <td className="py-3 px-4 text-sm">{reservation.purpose}</td>
                              <td className="py-3 px-4">
                                <div className="flex flex-col gap-1">
                                  <span className={`px-2 py-1 text-xs rounded-full inline-block w-fit ${
                                    reservation.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                    reservation.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                    reservation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-blue-100 text-blue-800'
                                  }`}>
                                    {reservation.status}
                                  </span>
                                  {reservation.status === 'pending' && (
                                    <span className="text-xs text-gray-500">Pending</span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex gap-2">
                                  {reservation.status !== 'confirmed' && (
                                    <Button
                                      size="sm"
                                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-xs"
                                      onClick={() => handleReservationStatusUpdate(reservation._id, 'confirmed')}
                                    >
                                      Approve
                                    </Button>
                                  )}
                                  {reservation.status !== 'cancelled' && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="border-red-500 text-red-500 hover:bg-red-50 px-3 py-1 text-xs"
                                      onClick={() => handleReservationStatusUpdate(reservation._id, 'cancelled')}
                                    >
                                      Reject
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
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
                <Dialog open={showAttendanceModal} onOpenChange={setShowAttendanceModal}>
                  <DialogTrigger asChild>
                    <Button className="w-full gap-2" onClick={handleViewAttendanceLists}>
                      <Eye className="h-4 w-4" />
                      View Attendance Lists
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Attendance Management</DialogTitle>
                      <DialogDescription>
                        Manage attendance for all venue reservations
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      {reservations.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">No reservations available</p>
                      ) : (
                        <div className="space-y-3">
                          {reservations.map((reservation) => {
                            const organizer = typeof reservation.userId === 'object'
                              ? `${reservation.userId.firstName} ${reservation.userId.lastName}`
                              : reservation.organizerName;

                            return (
                              <div key={reservation._id} className="p-4 border rounded-lg">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <h4 className="font-semibold">{reservation.venue}</h4>
                                      <Badge variant={reservation.status === 'confirmed' ? 'default' : 'destructive'}>
                                        {reservation.status}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-1">{reservation.purpose}</p>
                                    <div className="text-xs text-muted-foreground space-y-1">
                                      <div>📅 {new Date(reservation.date).toLocaleDateString()}</div>
                                      <div>🕐 {formatTime(reservation.startTime)} - {formatTime(reservation.endTime)}</div>
                                      <div>👤 {organizer}</div>
                                      <div>👥 Expected: {reservation.participantCount} attendees</div>
                                    </div>
                                  </div>
                                  <div className="flex flex-col gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleViewReservationAttendance(reservation)}
                                    >
                                      <Eye className="h-4 w-4 mr-1" />
                                      Details
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleExportAttendanceCSV(reservation)}
                                    >
                                      <Download className="h-4 w-4 mr-1" />
                                      Export
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>

                <Button variant="outline" className="w-full gap-2" onClick={handleExportPDF}>
                  <FileText className="h-4 w-4" />
                  Export Report (PDF)
                </Button>
                <Button variant="outline" className="w-full gap-2" onClick={() => handleExportAttendanceCSV()}>
                  <Download className="h-4 w-4" />
                  Export All (CSV)
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

      {/* Individual Reservation Attendance Modal */}
      {selectedReservation && (
        <Dialog open={!!selectedReservation} onOpenChange={() => setSelectedReservation(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Attendance Details</DialogTitle>
              <DialogDescription>
                {selectedReservation.venue} - {selectedReservation.purpose}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h5 className="font-semibold mb-2">Event Information</h5>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Venue:</span> {selectedReservation.venue}</div>
                    <div><span className="font-medium">Purpose:</span> {selectedReservation.purpose}</div>
                    <div><span className="font-medium">Date:</span> {new Date(selectedReservation.date).toLocaleDateString()}</div>
                    <div><span className="font-medium">Time:</span> {formatTime(selectedReservation.startTime)} - {formatTime(selectedReservation.endTime)}</div>
                    <div><span className="font-medium">Status:</span>
                      <Badge className="ml-2" variant={selectedReservation.status === 'confirmed' ? 'default' : 'destructive'}>
                        {selectedReservation.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div>
                  <h5 className="font-semibold mb-2">Organizer Information</h5>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Name:</span> {
                      typeof selectedReservation.userId === 'object'
                        ? `${selectedReservation.userId.firstName} ${selectedReservation.userId.lastName}`
                        : selectedReservation.organizerName
                    }</div>
                    <div><span className="font-medium">Organization:</span> {
                      typeof selectedReservation.userId === 'object'
                        ? selectedReservation.userId.organization || 'N/A'
                        : selectedReservation.organizerOrganization || 'N/A'
                    }</div>
                    <div><span className="font-medium">Expected Attendees:</span> {selectedReservation.participantCount}</div>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="font-semibold mb-3">Attendance Tracking</h5>
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">{selectedReservation.participantCount}</div>
                      <div className="text-xs text-muted-foreground">Expected</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">0</div>
                      <div className="text-xs text-muted-foreground">Checked In</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600">0</div>
                      <div className="text-xs text-muted-foreground">No Show</div>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  * Attendance tracking is currently simulated. Integrate with check-in system for real-time data.
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleExportAttendanceCSV(selectedReservation)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Attendance
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    toast({
                      title: "Email Sent",
                      description: "Attendance reminder sent to organizer.",
                    });
                  }}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Send Reminder
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Admin Settings Modal */}
      <AdminSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={user}
      />
    </div>
  );
}
