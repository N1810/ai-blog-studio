'use client'

import React, { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { CheckCircle2 } from 'lucide-react'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const registered = searchParams.get('registered')
  const returnTo = searchParams.get('returnTo') || '/writer'

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
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
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || data.errors?.[0]?.message || 'Login failed')
      }
      
      router.push(returnTo)
      router.refresh() // important to re-run server layout fetches
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen lg:h-screen bg-background flex flex-col lg:flex-row relative">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 hidden lg:block overflow-hidden pointer-events-none">
         <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-br from-primary/10 via-background to-background dark:from-primary/5 dark:via-background dark:to-background"></div>
         <div className="absolute top-1/4 left-[10%] w-[40vw] h-[40vw] bg-primary/20 dark:bg-primary/10 rounded-full blur-[100px] opacity-50 mix-blend-multiply dark:mix-blend-screen"></div>
      </div>

      {/* Left Side — Creative Hero Section */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 lg:p-12 xl:p-16 relative z-10 lg:overflow-y-auto">
        <div className="max-w-xl mx-auto lg:mx-0 lg:max-w-2xl w-full">
          <Link href="/" className="inline-flex items-center space-x-2 mb-12">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
            </div>
            <span className="font-bold text-xl tracking-tight text-foreground">AI Blog Studio</span>
          </Link>
          
          <div className="mb-8">
            <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6 uppercase tracking-wider">
              AI-Powered Writing Platform
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-4 leading-tight">
              Turn Your Ideas into <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">Impact</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-8">
              Write, refine, and publish amazing content with the power of AI. Join a growing community of writers and share your knowledge with the world.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-12">
            {[
              'Create and write with markdown',
              'Get your content reviewed',
              'Publish and grow your audience',
              'Build your personal brand'
            ].map((feature, i) => (
              <div key={i} className="flex items-center text-muted-foreground">
                <CheckCircle2 className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                <span className="font-medium text-sm">{feature}</span>
              </div>
            ))}
          </div>

          <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden shadow-2xl border border-border mt-6">
             <Image 
               src="/login_illustration.jpg" 
               alt="A creative person writing a blog post with AI on a laptop" 
               fill 
               className="object-cover" 
               priority
             />
          </div>
        </div>
      </div>

      {/* Right Side — Login Card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 relative z-10 lg:bg-muted/10 lg:border-l lg:border-border lg:overflow-y-auto">
        <div className="max-w-md w-full bg-card rounded-2xl shadow-xl border border-border p-8 sm:p-10 relative">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-foreground mb-2">Welcome back</h2>
            <p className="text-sm text-muted-foreground">Sign in to your AI Blog Studio account.</p>
          </div>
          
          {registered && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 rounded-lg text-sm text-center font-medium">
              Registration successful! Please sign in.
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-sm text-center font-medium">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Email address</label>
              <input 
                type="email" 
                name="email"
                required
                value={formData.email} 
                onChange={handleChange}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-foreground transition-all shadow-sm"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-foreground">Password</label>
                <Link href="#" className="text-sm font-medium text-primary hover:underline">Forgot password?</Link>
              </div>
              <input 
                type="password" 
                name="password"
                required
                value={formData.password} 
                onChange={handleChange}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-foreground transition-all shadow-sm"
                placeholder="••••••••"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 shadow-md hover:shadow-lg mt-4"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-border flex flex-col space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account? <Link href="/register" className="text-primary font-semibold hover:underline">Create a writer account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>}>
      <LoginContent />
    </Suspense>
  )
}
