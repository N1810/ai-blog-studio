'use client'

import React, { useState } from 'react'

export default function ProfileForm({ user }: { user: any }) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    displayName: user.displayName || '',
    bio: user.bio || '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')
    try {
      // payload local api or rest
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.errors?.[0]?.message || 'Failed to update profile')
      }

      setMessage('Profile updated successfully.')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {error && <div className="p-4 bg-destructive/10 text-destructive rounded-md text-sm border border-destructive/20">{error}</div>}
      {message && <div className="p-4 bg-green-500/10 text-green-700 dark:text-green-400 rounded-md text-sm border border-green-500/20">{message}</div>}
      
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Display Name</label>
        <input 
          type="text" 
          name="displayName"
          value={formData.displayName} 
          onChange={handleChange}
          className="w-full px-4 py-2 bg-background border border-border rounded-md focus:ring-1 focus:ring-primary focus:border-primary text-foreground transition-shadow"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Bio</label>
        <textarea 
          name="bio"
          value={formData.bio} 
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-2 bg-background border border-border rounded-md focus:ring-1 focus:ring-primary focus:border-primary text-foreground transition-shadow"
        />
      </div>
      <div>
        <button 
          type="submit" 
          disabled={loading}
          className="px-6 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Update Profile'}
        </button>
      </div>
    </form>
  )
}
