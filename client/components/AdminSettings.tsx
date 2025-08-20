import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Users, Building2, Shield, Bell, Database, Save, X, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { debounce } from "@/lib/resize-observer-error-handler";

interface AdminSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

export default function AdminSettings({ isOpen, onClose, user }: AdminSettingsProps) {
  const [systemSettings, setSystemSettings] = useState({
    siteName: 'Flow',
    adminEmail: 'admin@venuebook.com',
    maxReservationDays: 30,
    reservationTimeSlot: 60,
    autoApproval: false,
    maintenanceMode: false,
    registrationOpen: true
  });

  const [venues, setVenues] = useState([
    { id: 1, name: '4th Flr. NALLRC Office', capacity: 30, active: true }
  ]);

  const [newVenue, setNewVenue] = useState({ name: '', capacity: '', description: '' });
  const [emailSettings, setEmailSettings] = useState({
    smtpServer: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUsername: '',
    smtpPassword: '',
    fromEmail: 'noreply@venuebook.com',
    enableEmailNotifications: true
  });

  const [userManagement, setUserManagement] = useState({
    allowUserRegistration: true,
    requireEmailVerification: true,
    defaultUserRole: 'user',
    sessionTimeout: 7200,
    maxLoginAttempts: 5
  });

  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSystemSettingsSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "System Settings Saved",
        description: "System configuration has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save system settings.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVenueAdd = () => {
    if (!newVenue.name || !newVenue.capacity) {
      toast({
        title: "Invalid Data",
        description: "Please fill in venue name and capacity.",
        variant: "destructive",
      });
      return;
    }

    const venue = {
      id: Date.now(),
      name: newVenue.name,
      capacity: parseInt(newVenue.capacity),
      active: true,
      description: newVenue.description
    };

    setVenues(prev => [...prev, venue]);
    setNewVenue({ name: '', capacity: '', description: '' });
    
    toast({
      title: "Venue Added",
      description: `${venue.name} has been added successfully.`,
    });
  };

  const handleVenueToggle = (venueId: number) => {
    setVenues(prev => prev.map(venue => 
      venue.id === venueId ? { ...venue, active: !venue.active } : venue
    ));
  };

  const handleVenueDelete = (venueId: number) => {
    setVenues(prev => prev.filter(venue => venue.id !== venueId));
    toast({
      title: "Venue Deleted",
      description: "Venue has been removed successfully.",
    });
  };

  const handleEmailSettingsSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Email Settings Saved",
        description: "Email configuration has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save email settings.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserManagementSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "User Settings Saved",
        description: "User management settings have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save user management settings.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestEmail = useCallback(debounce(() => {
    toast({
      title: "Test Email Sent",
      description: "Test email has been sent to your admin email address.",
    });
  }, 300), [toast]);

  if (!user?.isAdmin) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-[95vw] max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Admin Settings
          </DialogTitle>
          <DialogDescription>
            Manage system configuration and settings
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="system" className="w-full h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-5 flex-shrink-0">
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="venues">Venues</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4">
            <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Configuration</CardTitle>
                <CardDescription>Manage general system settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input
                      id="siteName"
                      value={systemSettings.siteName}
                      onChange={(e) => setSystemSettings(prev => ({ ...prev, siteName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adminEmail">Admin Email</Label>
                    <Input
                      id="adminEmail"
                      type="email"
                      value={systemSettings.adminEmail}
                      onChange={(e) => setSystemSettings(prev => ({ ...prev, adminEmail: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxDays">Max Reservation Days Ahead</Label>
                    <Input
                      id="maxDays"
                      type="number"
                      value={systemSettings.maxReservationDays}
                      onChange={(e) => setSystemSettings(prev => ({ ...prev, maxReservationDays: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timeSlot">Time Slot Duration (minutes)</Label>
                    <Select value={systemSettings.reservationTimeSlot.toString()} onValueChange={(value) => setSystemSettings(prev => ({ ...prev, reservationTimeSlot: parseInt(value) }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                        <SelectItem value="240">4 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="autoApproval">Auto-approve Reservations</Label>
                      <p className="text-sm text-muted-foreground">Automatically approve new reservations</p>
                    </div>
                    <Switch
                      id="autoApproval"
                      checked={systemSettings.autoApproval}
                      onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, autoApproval: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="registrationOpen">Open Registration</Label>
                      <p className="text-sm text-muted-foreground">Allow new users to register</p>
                    </div>
                    <Switch
                      id="registrationOpen"
                      checked={systemSettings.registrationOpen}
                      onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, registrationOpen: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="maintenance">Maintenance Mode</Label>
                      <p className="text-sm text-muted-foreground">Put system in maintenance mode</p>
                    </div>
                    <Switch
                      id="maintenance"
                      checked={systemSettings.maintenanceMode}
                      onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, maintenanceMode: checked }))}
                    />
                  </div>
                </div>

                <Button onClick={handleSystemSettingsSave} disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Saving...' : 'Save System Settings'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="venues" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Venue Management</CardTitle>
                <CardDescription>Add, edit, and manage venue spaces</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/50">
                  <div className="space-y-2">
                    <Label htmlFor="venueName">Venue Name</Label>
                    <Input
                      id="venueName"
                      placeholder="New Office Space"
                      value={newVenue.name}
                      onChange={(e) => setNewVenue(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="venueCapacity">Capacity</Label>
                    <Input
                      id="venueCapacity"
                      type="number"
                      placeholder="20"
                      value={newVenue.capacity}
                      onChange={(e) => setNewVenue(prev => ({ ...prev, capacity: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="addVenue">&nbsp;</Label>
                    <Button onClick={handleVenueAdd} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Venue
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  {venues.map((venue) => (
                    <div key={venue.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <h4 className="font-medium">{venue.name}</h4>
                          <p className="text-sm text-muted-foreground">Capacity: {venue.capacity} people</p>
                        </div>
                        <Badge variant={venue.active ? "default" : "secondary"}>
                          {venue.active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={venue.active}
                          onCheckedChange={() => handleVenueToggle(venue.id)}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVenueDelete(venue.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Configure user registration and access settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="userRegistration">Allow User Registration</Label>
                      <p className="text-sm text-muted-foreground">Enable new user sign-ups</p>
                    </div>
                    <Switch
                      id="userRegistration"
                      checked={userManagement.allowUserRegistration}
                      onCheckedChange={(checked) => setUserManagement(prev => ({ ...prev, allowUserRegistration: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emailVerification">Require Email Verification</Label>
                      <p className="text-sm text-muted-foreground">Users must verify email before accessing</p>
                    </div>
                    <Switch
                      id="emailVerification"
                      checked={userManagement.requireEmailVerification}
                      onCheckedChange={(checked) => setUserManagement(prev => ({ ...prev, requireEmailVerification: checked }))}
                    />
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Session Timeout (seconds)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={userManagement.sessionTimeout}
                      onChange={(e) => setUserManagement(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxAttempts">Max Login Attempts</Label>
                    <Input
                      id="maxAttempts"
                      type="number"
                      value={userManagement.maxLoginAttempts}
                      onChange={(e) => setUserManagement(prev => ({ ...prev, maxLoginAttempts: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>

                <Button onClick={handleUserManagementSave} disabled={isLoading}>
                  <Users className="h-4 w-4 mr-2" />
                  {isLoading ? 'Saving...' : 'Save User Settings'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="email" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Configuration</CardTitle>
                <CardDescription>Configure SMTP settings for email notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Label htmlFor="enableEmail">Enable Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send automated emails to users</p>
                  </div>
                  <Switch
                    id="enableEmail"
                    checked={emailSettings.enableEmailNotifications}
                    onCheckedChange={(checked) => setEmailSettings(prev => ({ ...prev, enableEmailNotifications: checked }))}
                  />
                </div>

                {emailSettings.enableEmailNotifications && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="smtpServer">SMTP Server</Label>
                        <Input
                          id="smtpServer"
                          value={emailSettings.smtpServer}
                          onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpServer: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="smtpPort">SMTP Port</Label>
                        <Input
                          id="smtpPort"
                          value={emailSettings.smtpPort}
                          onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpPort: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="smtpUsername">SMTP Username</Label>
                        <Input
                          id="smtpUsername"
                          value={emailSettings.smtpUsername}
                          onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpUsername: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="smtpPassword">SMTP Password</Label>
                        <Input
                          id="smtpPassword"
                          type="password"
                          value={emailSettings.smtpPassword}
                          onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpPassword: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fromEmail">From Email Address</Label>
                      <Input
                        id="fromEmail"
                        type="email"
                        value={emailSettings.fromEmail}
                        onChange={(e) => setEmailSettings(prev => ({ ...prev, fromEmail: e.target.value }))}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleEmailSettingsSave} disabled={isLoading}>
                        <Save className="h-4 w-4 mr-2" />
                        {isLoading ? 'Saving...' : 'Save Email Settings'}
                      </Button>
                      <Button variant="outline" onClick={handleTestEmail}>
                        <Bell className="h-4 w-4 mr-2" />
                        Send Test Email
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage system security and access controls</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Database Status</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Database Connected</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Authentication Active</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm">SSL Certificate Valid</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">System Information</h4>
                    <div className="space-y-2 text-sm">
                      <div>Version: 1.0.0</div>
                      <div>Node.js: 18.x</div>
                      <div>Database: MongoDB</div>
                      <div>Last Backup: Today</div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-semibold">System Actions</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" onClick={() => toast({ title: "Backup Created", description: "System backup has been initiated." })}>
                      <Database className="h-4 w-4 mr-2" />
                      Create Backup
                    </Button>
                    <Button variant="outline" onClick={() => toast({ title: "Logs Cleared", description: "System logs have been cleared." })}>
                      <Shield className="h-4 w-4 mr-2" />
                      Clear Logs
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            </TabsContent>
          </div>
        </Tabs>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
