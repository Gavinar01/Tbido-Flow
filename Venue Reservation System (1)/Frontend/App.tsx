import React, { useState, useEffect } from 'react'
import { Button } from './components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import { Badge } from './components/ui/badge'
import { Calendar, Users, LogOut } from 'lucide-react'
import { BookingForm } from './components/BookingForm'
import { AdminPanel } from './components/AdminPanel'
import { Auth } from './components/Auth'
import { AdminAuth } from './components/AdminAuth'
import { supabase } from './utils/supabase/client'

export default function App() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isAdminMode, setIsAdminMode] = useState(false)
  const [showAdminLogin, setShowAdminLogin] = useState(false)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
    } catch (error) {
      console.log('Error checking user:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setIsAdminMode(false)
    setShowAdminLogin(false)
  }

  const handleAdminSuccess = () => {
    setIsAdminMode(true)
    setShowAdminLogin(false)
    checkUser()
  }

  const handleUserSuccess = () => {
    setIsAdminMode(false)
    setShowAdminLogin(false)
    checkUser()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center venue-auth-gradient">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-slate-700">Loading...</p>
        </div>
      </div>
    )
  }

  // Show admin login if requested
  if (showAdminLogin) {
    return (
      <AdminAuth 
        onSuccess={handleAdminSuccess}
        onBackToUser={() => setShowAdminLogin(false)}
      />
    )
  }

  // Show regular auth if no user
  if (!user) {
    return (
      <Auth 
        onSuccess={handleUserSuccess}
        onAdminLogin={() => setShowAdminLogin(true)}
      />
    )
  }

  const isAdmin = user.user_metadata?.isAdmin && isAdminMode

  return (
    <div className="min-h-screen bg-background">
      <header className="venue-header-gradient shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="venue-gradient-accent p-2 rounded-lg">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-slate-800">Venue Reservation System</h1>
              <p className="text-muted-foreground text-sm">
                {isAdmin ? 'Admin Dashboard' : 'Book and manage venues'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm text-slate-700">{user.user_metadata?.name || user.email}</p>
              {isAdmin && <Badge className="venue-badge-secondary">Admin</Badge>}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSignOut} 
              className="border-slate-300 text-slate-600 hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100 transition-all duration-300"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {isAdmin ? (
          <AdminPanel user={user} />
        ) : (
          <BookingForm user={user} />
        )}
      </main>
    </div>
  )
}