import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Calendar, Users, MapPin, Clock, Download, Printer, Trash2, Plus, X } from 'lucide-react'
import { supabase } from '../utils/supabase/client'
import { projectId, publicAnonKey } from '../utils/supabase/info'

interface AdminPanelProps {
  user: any
}

export function AdminPanel({ user }: AdminPanelProps) {
  const [reservations, setReservations] = useState<any[]>([])
  const [venues, setVenues] = useState<any[]>([])
  const [selectedReservation, setSelectedReservation] = useState<any>(null)
  const [attendees, setAttendees] = useState<string[]>([])
  const [newAttendee, setNewAttendee] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (selectedReservation) {
      // Ensure attendance is always an array, even if null or undefined
      const attendanceList = selectedReservation.attendance || []
      setAttendees(Array.isArray(attendanceList) ? attendanceList : [])
    }
  }, [selectedReservation])

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      const [venuesRes, reservationsRes] = await Promise.all([
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-1bbfbc2f/venues`, {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }),
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-1bbfbc2f/reservations`, {
          headers: { 'Authorization': `Bearer ${session?.access_token}` }
        })
      ])

      const [venuesData, reservationsData] = await Promise.all([
        venuesRes.json(),
        reservationsRes.json()
      ])

      setVenues(venuesData || [])
      setReservations(reservationsData || [])
    } catch (error) {
      console.log('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteReservation = async (id: string) => {
    if (!confirm('Delete this reservation?')) return
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-1bbfbc2f/reservations/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      })
      
      fetchData()
    } catch (error) {
      console.log('Error deleting reservation:', error)
    }
  }

  const updateAttendance = async (reservationId: string, attendance: string[]) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-1bbfbc2f/reservations/${reservationId}/attendance`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ attendance })
      })
      
      // Refresh data and update the selected reservation
      await fetchData()
      
      // Update the selected reservation with the latest data
      if (selectedReservation && selectedReservation.id === reservationId) {
        const updatedReservation = { ...selectedReservation, attendance }
        setSelectedReservation(updatedReservation)
      }
    } catch (error) {
      console.log('Error updating attendance:', error)
    }
  }

  const addAttendee = () => {
    if (newAttendee.trim() && !attendees.includes(newAttendee.trim())) {
      const newList = [...attendees, newAttendee.trim()]
      setAttendees(newList)
      setNewAttendee('')
      if (selectedReservation) {
        updateAttendance(selectedReservation.id, newList)
      }
    }
  }

  const removeAttendee = (index: number) => {
    const newList = attendees.filter((_, i) => i !== index)
    setAttendees(newList)
    if (selectedReservation) {
      updateAttendance(selectedReservation.id, newList)
    }
  }

  const exportAttendance = async (reservation: any) => {
    // Fetch the latest reservation data to ensure we have current attendance
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-1bbfbc2f/reservations`, {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      })
      
      const latestReservations = await response.json()
      const latestReservation = latestReservations.find((r: any) => r.id === reservation.id)
      
      // Use the latest attendance data or current data as fallback
      const attendanceList = latestReservation?.attendance || reservation.attendance || []
      const finalAttendanceList = Array.isArray(attendanceList) ? attendanceList : []
      
      const csv = [
        'Name,Event,Date,Time,Venue',
        ...finalAttendanceList.map((name: string) => 
          `"${name || 'N/A'}","${reservation.purpose || 'N/A'}","${reservation.date || 'N/A'}","${reservation.startTime || 'N/A'}-${reservation.endTime || 'N/A'}","${getVenueName(reservation.venue) || 'N/A'}"`
        )
      ].join('\n')
      
      // If no attendees, add a note
      if (finalAttendanceList.length === 0) {
        const csvWithNote = [
          'Name,Event,Date,Time,Venue',
          `"No attendees recorded","${reservation.purpose || 'N/A'}","${reservation.date || 'N/A'}","${reservation.startTime || 'N/A'}-${reservation.endTime || 'N/A'}","${getVenueName(reservation.venue) || 'N/A'}"`
        ].join('\n')
        
        const blob = new Blob([csvWithNote], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `attendance-${reservation.date || 'unknown'}.csv`
        a.click()
        URL.revokeObjectURL(url)
        return
      }
      
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `attendance-${reservation.date || 'unknown'}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.log('Error exporting attendance:', error)
      // Fallback to original method if API call fails
      const attendanceList = Array.isArray(reservation.attendance) ? reservation.attendance : []
      
      const csv = [
        'Name,Event,Date,Time,Venue',
        ...attendanceList.map((name: string) => 
          `"${name || 'N/A'}","${reservation.purpose || 'N/A'}","${reservation.date || 'N/A'}","${reservation.startTime || 'N/A'}-${reservation.endTime || 'N/A'}","${getVenueName(reservation.venue) || 'N/A'}"`
        )
      ].join('\n')
      
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `attendance-${reservation.date || 'unknown'}.csv`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const printAttendance = async (reservation: any) => {
    // Fetch the latest reservation data to ensure we have current attendance
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-1bbfbc2f/reservations`, {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      })
      
      const latestReservations = await response.json()
      const latestReservation = latestReservations.find((r: any) => r.id === reservation.id)
      
      // Use the latest attendance data or current data as fallback
      const attendanceList = latestReservation?.attendance || reservation.attendance || []
      const finalAttendanceList = Array.isArray(attendanceList) ? attendanceList : []
      
      const printContent = `
        <html>
          <head><title>Attendance Sheet</title></head>
          <body style="font-family: Arial; padding: 20px;">
            <h1>Attendance Sheet</h1>
            <h2>${reservation.purpose || 'N/A'}</h2>
            <p><strong>Venue:</strong> ${getVenueName(reservation.venue) || 'N/A'}</p>
            <p><strong>Date:</strong> ${reservation.date || 'N/A'}</p>
            <p><strong>Time:</strong> ${reservation.startTime || 'N/A'} - ${reservation.endTime || 'N/A'}</p>
            <p><strong>Organizer:</strong> ${reservation.userName || 'N/A'}</p>
            <table border="1" cellpadding="8" style="width: 100%; margin-top: 20px;">
              <tr><th>#</th><th>Name</th><th>Signature</th></tr>
              ${finalAttendanceList.map((name: string, i: number) => 
                `<tr><td>${i + 1}</td><td>${name || 'N/A'}</td><td></td></tr>`
              ).join('')}
              ${Array(Math.max(0, 10 - finalAttendanceList.length)).fill(0).map((_, i) => 
                `<tr><td>${finalAttendanceList.length + i + 1}</td><td></td><td></td></tr>`
              ).join('')}
            </table>
            ${finalAttendanceList.length === 0 ? '<p style="margin-top: 20px; color: #666;"><em>No attendees recorded yet.</em></p>' : ''}
          </body>
        </html>
      `
      
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(printContent)
        printWindow.document.close()
        printWindow.print()
      }
    } catch (error) {
      console.log('Error printing attendance:', error)
      // Fallback to original method if API call fails
      const attendanceList = Array.isArray(reservation.attendance) ? reservation.attendance : []
      
      const printContent = `
        <html>
          <head><title>Attendance Sheet</title></head>
          <body style="font-family: Arial; padding: 20px;">
            <h1>Attendance Sheet</h1>
            <h2>${reservation.purpose || 'N/A'}</h2>
            <p><strong>Venue:</strong> ${getVenueName(reservation.venue) || 'N/A'}</p>
            <p><strong>Date:</strong> ${reservation.date || 'N/A'}</p>
            <p><strong>Time:</strong> ${reservation.startTime || 'N/A'} - ${reservation.endTime || 'N/A'}</p>
            <p><strong>Organizer:</strong> ${reservation.userName || 'N/A'}</p>
            <table border="1" cellpadding="8" style="width: 100%; margin-top: 20px;">
              <tr><th>#</th><th>Name</th><th>Signature</th></tr>
              ${attendanceList.map((name: string, i: number) => 
                `<tr><td>${i + 1}</td><td>${name || 'N/A'}</td><td></td></tr>`
              ).join('')}
              ${Array(Math.max(0, 10 - attendanceList.length)).fill(0).map((_, i) => 
                `<tr><td>${attendanceList.length + i + 1}</td><td></td><td></td></tr>`
              ).join('')}
            </table>
            ${attendanceList.length === 0 ? '<p style="margin-top: 20px; color: #666;"><em>No attendees recorded yet.</em></p>' : ''}
          </body>
        </html>
      `
      
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(printContent)
        printWindow.document.close()
        printWindow.print()
      }
    }
  }

  const getVenueName = (venueId: string) => {
    const venue = venues.find(v => v.id === venueId)
    return venue?.name || venueId
  }

  const formatTime = (time: string) => {
    const [hour] = time.split(':')
    const h = parseInt(hour)
    return h > 12 ? `${h - 12}:00 PM` : h === 12 ? '12:00 PM' : `${h}:00 AM`
  }

  const todaysReservations = reservations.filter(r => 
    r.date === new Date().toISOString().split('T')[0]
  )

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2">Loading...</p>
      </div>
    )
  }

  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="reservations">All Reservations</TabsTrigger>
        <TabsTrigger value="attendance">Attendance</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="venue-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="venue-gradient-primary p-2 rounded-lg">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <div>
                  <p className="text-2xl text-slate-800">{reservations.length}</p>
                  <p className="text-muted-foreground">Total Reservations</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="venue-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="venue-gradient-secondary p-2 rounded-lg">
                  <Clock className="h-8 w-8 text-white" />
                </div>
                <div>
                  <p className="text-2xl text-slate-800">{todaysReservations.length}</p>
                  <p className="text-muted-foreground">Today's Events</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="venue-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="venue-gradient-accent p-2 rounded-lg">
                  <MapPin className="h-8 w-8 text-white" />
                </div>
                <div>
                  <p className="text-2xl text-slate-800">{venues.length}</p>
                  <p className="text-muted-foreground">Available Venues</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {todaysReservations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Today's Reservations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todaysReservations.map((reservation) => (
                  <div key={reservation.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p>{reservation.purpose}</p>
                      <p className="text-sm text-muted-foreground">
                        {getVenueName(reservation.venue)} • {formatTime(reservation.startTime)} - {formatTime(reservation.endTime)}
                      </p>
                    </div>
                    <Badge>{reservation.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="reservations" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>All Reservations ({reservations.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reservations.map((reservation) => (
                <div key={reservation.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <h3>{reservation.purpose}</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <p><MapPin className="h-4 w-4 inline mr-1" />{getVenueName(reservation.venue)}</p>
                        <p><Calendar className="h-4 w-4 inline mr-1" />{reservation.date}</p>
                        <p><Clock className="h-4 w-4 inline mr-1" />
                          {formatTime(reservation.startTime)} - {formatTime(reservation.endTime)}
                        </p>
                        <p><Users className="h-4 w-4 inline mr-1" />
                          {reservation.userName} ({reservation.maxParticipants || 0} max)
                        </p>
                      </div>
                      {reservation.organization && (
                        <p className="text-sm">Organization: {reservation.organization}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="venue-badge-accent">{reservation.status}</Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedReservation(reservation)}
                        className="venue-btn-secondary text-white border-0"
                      >
                        <Users className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteReservation(reservation.id)}
                        className="venue-btn-accent text-white border-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="attendance" className="space-y-6">
        {selectedReservation ? (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Attendance: {selectedReservation.purpose}</CardTitle>
                  <p className="text-muted-foreground mt-1">
                    {getVenueName(selectedReservation.venue)} • {selectedReservation.date} • 
                    {formatTime(selectedReservation.startTime)} - {formatTime(selectedReservation.endTime)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => printAttendance(selectedReservation)}
                    className="venue-btn-secondary text-white border-0"
                  >
                    <Printer className="h-4 w-4 mr-1" />Print
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => exportAttendance(selectedReservation)}
                    className="venue-btn-accent text-white border-0"
                  >
                    <Download className="h-4 w-4 mr-1" />Export
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setSelectedReservation(null)}
                    className="venue-btn-primary text-white border-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add attendee name"
                  value={newAttendee}
                  onChange={(e) => setNewAttendee(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addAttendee()}
                />
                <Button onClick={addAttendee} className="venue-btn-accent text-white">
                  <Plus className="h-4 w-4 mr-1" />Add
                </Button>
              </div>
              
              <div>
                <Label>Attendees ({attendees.length})</Label>
                {attendees.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No attendees yet</p>
                ) : (
                  <div className="space-y-2 mt-2">
                    {attendees.map((attendee, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span>{attendee}</span>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => removeAttendee(index)}
                          className="venue-btn-primary text-white border-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3>Select a Reservation</h3>
              <p className="text-muted-foreground">
                Go to reservations and click the attendance button to manage attendees.
              </p>
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  )
}