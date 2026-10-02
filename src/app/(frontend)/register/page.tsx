'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || data.errors?.[0]?.message || 'Registration failed')
      }
      
      // Redirect to login after successful registration
      router.push('/login?registered=true')
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card rounded-2xl shadow-sm border border-border p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Create an Account</h1>
          <p className="text-sm text-muted-foreground">Join AI Blog Studio as a Writer.</p>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-md text-sm text-center">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Display Name</label>
            <input 
              type="text" 
              name="displayName"
              required
              value={formData.displayName} 
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-md focus:ring-1 focus:ring-primary focus:border-primary text-foreground transition-shadow"
              placeholder="Your Name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Email</label>
            <input 
              type="email" 
              name="email"
              required
              value={formData.email} 
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-md focus:ring-1 focus:ring-primary focus:border-primary text-foreground transition-shadow"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Password</label>
            <input 
              type="password" 
              name="password"
              required
              value={formData.password} 
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-md focus:ring-1 focus:ring-primary focus:border-primary text-foreground transition-shadow"
              placeholder="••••••••"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Get Started'}
          </button>
        </form>
        
        <div className="mt-8 text-center text-sm text-muted-foreground border-t border-border pt-6">
          Already have an account? <Link href="/login" className="text-primary font-medium hover:underline">Sign In</Link>
        </div>
      </div>
    </div>
  )
}
