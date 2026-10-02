import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { redirect } from 'next/navigation'
import React from 'react'
import ProfileForm from '../components/ProfileForm'

export default async function WriterProfilePage() {
  const reqHeaders = await headers()
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: reqHeaders })

  if (!user) redirect('/admin/login')

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-8">My Profile</h1>
      
      <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden max-w-2xl">
        <div className="px-6 py-4 border-b border-border bg-muted/20">
          <h2 className="text-lg font-bold text-foreground">Public Information</h2>
        </div>
        <div className="p-6">
          <ProfileForm user={user} />
        </div>
      </div>
    </div>
  )
}
