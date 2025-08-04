import React, { useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Alert, AlertDescription } from './ui/alert'
import { Calendar } from 'lucide-react'
import { supabase } from '../utils/supabase/client'
import { projectId, publicAnonKey } from '../utils/supabase/info'

interface AuthProps {
  onSuccess: () => void
  onAdminLogin: () => void
}

export function Auth({ onSuccess, onAdminLogin }: AuthProps) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isSignUp) {
        // Sign up as regular user (not admin)
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-1bbfbc2f/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ email, password, name, isAdmin: false })
        })

        const result = await response.json()
        if (!response.ok) {
          throw new Error(result.error)
        }

        // Sign in after successful signup
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (signInError) throw signInError
        onSuccess()
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (error) throw error
        onSuccess()
      }
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
          <div className="mx-auto w-12 h-12 venue-gradient-primary rounded-lg flex items-center justify-center mb-4">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-slate-800">{isSignUp ? 'Create Account' : 'Sign In'}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {isSignUp ? 'Create an account to reserve venues' : 'Welcome back'}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
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

            <Button type="submit" className="w-full venue-btn-primary" disabled={loading}>
              {loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </Button>
          </form>

          <div className="mt-4 space-y-2 text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </Button>
            
            <div className="border-t pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onAdminLogin}
                className="text-xs venue-btn-secondary text-white border-0"
              >
                Admin Access
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}