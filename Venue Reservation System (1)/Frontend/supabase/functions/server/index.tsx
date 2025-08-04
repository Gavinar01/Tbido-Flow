import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'npm:@supabase/supabase-js@2'
import * as kv from './kv_store.tsx'

const app = new Hono()

app.use('*', cors({ origin: '*' }))
app.use('*', logger(console.log))

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

// Default venues - all with capacity 20 or less
const defaultVenues = [
  { id: '1', name: 'Conference Room A', capacity: 20 },
  { id: '2', name: 'Conference Room B', capacity: 15 },
  { id: '3', name: 'Meeting Room 1', capacity: 8 },
  { id: '4', name: 'Meeting Room 2', capacity: 6 },
  { id: '5', name: 'Main Hall', capacity: 20 }
]

// User signup
app.post('/make-server-1bbfbc2f/signup', async (c) => {
  try {
    const { email, password, name, isAdmin = false } = await c.req.json()
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, isAdmin },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    })

    if (error) {
      console.log('Signup error:', error)
      return c.json({ error: error.message }, 400)
    }

    return c.json({ user: data.user })
  } catch (error) {
    console.log('Server error during signup:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Get venues - force reset to ensure proper capacities
app.get('/make-server-1bbfbc2f/venues', async (c) => {
  try {
    // Always reset venues to ensure proper capacities
    await kv.set('venues', defaultVenues)
    return c.json(defaultVenues)
  } catch (error) {
    console.log('Error fetching venues:', error)
    return c.json({ error: 'Failed to fetch venues' }, 500)
  }
})

// Create reservation
app.post('/make-server-1bbfbc2f/reservations', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const reservationData = await c.req.json()
    
    // Validate time range (8 AM to 5 PM) and participants limit
    const startHour = parseInt(reservationData.startTime.split(':')[0])
    const endHour = parseInt(reservationData.endTime.split(':')[0])
    
    if (startHour < 8 || endHour > 17 || startHour >= endHour) {
      return c.json({ error: 'Invalid time range. Reservations must be between 8:00 AM and 5:00 PM.' }, 400)
    }

    if (reservationData.maxParticipants > 20) {
      return c.json({ error: 'Maximum participants cannot exceed 20 people.' }, 400)
    }
    
    const reservation = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      userEmail: user.email,
      userName: user.user_metadata?.name || user.email,
      ...reservationData,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    }

    // Get existing reservations and check for conflicts
    const reservations = await kv.get('reservations') || []
    
    const conflict = reservations.find((r: any) => 
      r.venue === reservation.venue &&
      r.date === reservation.date &&
      ((reservation.startTime >= r.startTime && reservation.startTime < r.endTime) ||
       (reservation.endTime > r.startTime && reservation.endTime <= r.endTime) ||
       (reservation.startTime <= r.startTime && reservation.endTime >= r.endTime))
    )

    if (conflict) {
      return c.json({ error: 'Time slot conflicts with existing reservation' }, 400)
    }

    reservations.push(reservation)
    await kv.set('reservations', reservations)

    // Mock email notification
    console.log(`Email notification sent to ${user.email}: Venue reservation confirmed for ${reservation.date} from ${reservation.startTime} to ${reservation.endTime}`)

    return c.json({ reservation })
  } catch (error) {
    console.log('Error creating reservation:', error)
    return c.json({ error: 'Failed to create reservation' }, 500)
  }
})

// Get reservations
app.get('/make-server-1bbfbc2f/reservations', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const reservations = await kv.get('reservations') || []
    
    // If admin, return all reservations, otherwise only user's reservations
    const isAdmin = user.user_metadata?.isAdmin
    const filteredReservations = isAdmin ? reservations : reservations.filter((r: any) => r.userId === user.id)
    
    return c.json(filteredReservations)
  } catch (error) {
    console.log('Error fetching reservations:', error)
    return c.json({ error: 'Failed to fetch reservations' }, 500)
  }
})

// Update attendance
app.put('/make-server-1bbfbc2f/reservations/:id/attendance', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (!user?.id || !user.user_metadata?.isAdmin) {
      return c.json({ error: 'Admin access required' }, 401)
    }

    const reservationId = c.req.param('id')
    const { attendance } = await c.req.json()

    const reservations = await kv.get('reservations') || []
    const reservationIndex = reservations.findIndex((r: any) => r.id === reservationId)

    if (reservationIndex === -1) {
      return c.json({ error: 'Reservation not found' }, 404)
    }

    reservations[reservationIndex].attendance = attendance
    await kv.set('reservations', reservations)

    return c.json({ success: true })
  } catch (error) {
    console.log('Error updating attendance:', error)
    return c.json({ error: 'Failed to update attendance' }, 500)
  }
})

// Delete reservation
app.delete('/make-server-1bbfbc2f/reservations/:id', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const reservationId = c.req.param('id')
    const reservations = await kv.get('reservations') || []
    
    const reservationIndex = reservations.findIndex((r: any) => r.id === reservationId)
    if (reservationIndex === -1) {
      return c.json({ error: 'Reservation not found' }, 404)
    }

    const reservation = reservations[reservationIndex]
    
    // Allow deletion by reservation owner or admin
    if (reservation.userId !== user.id && !user.user_metadata?.isAdmin) {
      return c.json({ error: 'Unauthorized to delete this reservation' }, 403)
    }

    reservations.splice(reservationIndex, 1)
    await kv.set('reservations', reservations)

    return c.json({ success: true })
  } catch (error) {
    console.log('Error deleting reservation:', error)
    return c.json({ error: 'Failed to delete reservation' }, 500)
  }
})

Deno.serve(app.fetch)