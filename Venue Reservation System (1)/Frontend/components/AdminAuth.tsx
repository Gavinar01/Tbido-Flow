import React, { useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Alert, AlertDescription } from './ui/alert'
import { Shield, Calendar } from 'lucide-react'
import { supabase } from '../utils/supabase/client'

interface AdminAuthProps {
  onSuccess: () => void
  onBackToUser: () => void
}

export function AdminAuth({ onSuccess, onBackToUser }: AdminAuthProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (signInError) throw signInError

      // Check if user is actually an admin
      if (!data.user?.user_metadata?.isAdmin) {
        await supabase.auth.signOut()
        throw new Error('Access denied. Admin privileges required.')
      }

      onSuccess()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center venue-auth-gradient p-4">
      <Card className="w-full max-w-md venue-card">
        <CardHeader className="text-center venue-gradient-muted rounded-t-lg">
          <div className="mx-auto w-12 h-12 venue-gradient-secondary rounded-lg flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-slate-800">Admin Access</CardTitle>
          <p className="text-sm text-muted-foreground">
            Restricted access for authorized administrators only
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Admin Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full venue-btn-secondary" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In as Admin'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Button variant="ghost" size="sm" onClick={onBackToUser}>
              Back to User Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}