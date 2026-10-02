'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    const logout = async () => {
      try {
        await fetch('/api/users/logout', { method: 'POST' })
        router.push('/login')
        router.refresh()
      } catch (e) {
        console.error('Logout failed', e)
        router.push('/login')
      }
    }
    logout()
  }, [router])

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-2">Signing out...</h1>
        <p className="text-muted-foreground">Please wait a moment.</p>
      </div>
    </div>
  )
}
