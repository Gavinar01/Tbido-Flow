import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Alert, AlertDescription } from './ui/alert'
import { CheckCircle, MapPin, Calendar, Clock, Users } from 'lucide-react'
import { supabase } from '../utils/supabase/client'
import { projectId, publicAnonKey } from '../utils/supabase/info'

interface BookingFormProps {
  user: any
}

export function BookingForm({ user }: BookingFormProps) {
  const [venues, setVenues] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    venue: '',
    purpose: '',
    date: '',
    startTime: '08:00',
    endTime: '09:00',
    name: user?.user_metadata?.name || '',
    organization: '',
    maxParticipants: ''
  })

  useEffect(() => {
    fetchVenues()
  }, [])

  const fetchVenues = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-1bbfbc2f/venues`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      })
      const data = await response.json()
      setVenues(data || [])
    } catch (error) {
      console.log('Error fetching venues:', error)
    }
  }

  const generateTimeOptions = () => {
    const times = []
    // Changed from hour <= 18 to hour <= 17 to restrict to 5 PM only
    for (let hour = 8; hour <= 17; hour++) {
      const time24 = `${hour.toString().padStart(2, '0')}:00`
      const time12 = hour > 12 ? `${hour - 12}:00 PM` : hour === 12 ? '12:00 PM' : `${hour}:00 AM`
      times.push({ value: time24, label: time12 })
    }
    return times
  }

  const timeOptions = generateTimeOptions()

  const validateTime = () => {
    const startHour = parseInt(formData.startTime.split(':')[0])
    const endHour = parseInt(formData.endTime.split(':')[0])
    
    // Updated validation to check for 5 PM instead of 6 PM
    if (startHour < 8 || endHour > 17) {
      return 'Times must be between 8:00 AM and 5:00 PM'
    }
    
    if (startHour >= endHour) {
      return 'End time must be after start time'
    }
    
    return null
  }

  const validateParticipants = () => {
    const participants = parseInt(formData.maxParticipants)
    if (participants > 20) {
      return 'Maximum participants cannot exceed 20 people'
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const timeError = validateTime()
    if (timeError) {
      setError(timeError)
      return
    }

    const participantsError = validateParticipants()
    if (participantsError) {
      setError(participantsError)
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-1bbfbc2f/reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          ...formData,
          maxParticipants: parseInt(formData.maxParticipants) || 0
        })
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Failed to create reservation')
      } else {
        setSuccess('Reservation confirmed! You will receive a confirmation email shortly.')
        setFormData({
          venue: '',
          purpose: '',
          date: '',
          startTime: '08:00',
          endTime: '09:00',
          name: user?.user_metadata?.name || '',
          organization: '',
          maxParticipants: ''
        })
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError('')
    setSuccess('')
  }

  const getTomorrowDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  return (
    <Card className="max-w-2xl mx-auto venue-card">
      <CardHeader className="venue-gradient-muted rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <div className="venue-gradient-accent p-2 rounded-lg">
            <MapPin className="h-5 w-5 text-white" />
          </div>
          Reserve a Venue
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive" className="venue-gradient-crimson text-white border-0">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="venue-gradient-success text-white border-0">
              <CheckCircle className="h-4 w-4 text-white" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="venue" className="text-slate-700">Venue *</Label>
              <Select value={formData.venue} onValueChange={(value) => handleChange('venue', value)}>
                <SelectTrigger className="venue-input-focus">
                  <SelectValue placeholder="Select venue" />
                </SelectTrigger>
                <SelectContent>
                  {venues.map((venue) => (
                    <SelectItem key={venue.id} value={venue.id}>
                      {venue.name} (Capacity: {Math.min(venue.capacity || 20, 20)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="text-slate-700">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                min={getTomorrowDate()}
                required
                className="venue-input-focus"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime" className="text-slate-700">Start Time *</Label>
              <Select value={formData.startTime} onValueChange={(value) => handleChange('startTime', value)}>
                <SelectTrigger className="venue-input-focus">
                  <SelectValue />
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
              <Label htmlFor="endTime" className="text-slate-700">End Time *</Label>
              <Select value={formData.endTime} onValueChange={(value) => handleChange('endTime', value)}>
                <SelectTrigger className="venue-input-focus">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.filter(time => time.value > formData.startTime).map((time) => (
                    <SelectItem key={time.value} value={time.value}>
                      {time.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose" className="text-slate-700">Purpose of Use *</Label>
            <Textarea
              id="purpose"
              placeholder="e.g., Team meeting, Training session..."
              value={formData.purpose}
              onChange={(e) => handleChange('purpose', e.target.value)}
              required
              className="venue-input-focus"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-700">Name/Contact Person *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
                className="venue-input-focus"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="organization" className="text-slate-700">Organization</Label>
              <Input
                id="organization"
                value={formData.organization}
                onChange={(e) => handleChange('organization', e.target.value)}
                placeholder="Optional"
                className="venue-input-focus"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxParticipants" className="text-slate-700">Max Participants (up to 20 people) *</Label>
            <Input
              id="maxParticipants"
              type="number"
              value={formData.maxParticipants}
              onChange={(e) => handleChange('maxParticipants', e.target.value)}
              min="1"
              max="20"
              placeholder="Number of people (max 20)"
              required
              className="venue-input-focus"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full venue-btn-primary" 
            disabled={loading}
          >
            {loading ? 'Creating Reservation...' : 'Confirm Reservation'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}