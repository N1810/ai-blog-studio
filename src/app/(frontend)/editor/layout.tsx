import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import Link from 'next/link'
import React from 'react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Home, FileText, User, LogOut, CheckSquare } from 'lucide-react'

export default async function EditorLayout({ children }: { children: React.ReactNode }) {
  const reqHeaders = await headers()
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: reqHeaders })

  if (!user || (user.role !== 'editor' && user.role !== 'admin')) {
    redirect('/login?returnTo=/editor')
  }

  if (user.accountStatus === 'suspended') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-background">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-4">Account Suspended</h1>
          <p className="text-muted-foreground">Your account has been suspended. Please contact the administrator.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-card border-r border-border flex flex-col justify-between md:min-h-screen sticky top-0 z-10">
        <div>
          <div className="p-6 border-b border-border">
            <Link href="/" className="flex items-center gap-2 group mb-1">
              <div className="bg-primary text-primary-foreground p-1 rounded-md flex items-center justify-center">
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
              </div>
              <h2 className="text-xl font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">AI Blog Studio</h2>
            </Link>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Editor Dashboard</p>
          </div>
          <nav className="p-4 space-y-1">
            <Link href="/editor" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-muted-foreground rounded-md hover:bg-muted hover:text-foreground transition-colors">
              <Home size={18} />
              Overview
            </Link>
            <Link href="/editor/review" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-muted-foreground rounded-md hover:bg-muted hover:text-foreground transition-colors">
              <CheckSquare size={18} />
              Review Queue
            </Link>
            <Link href="/admin" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-muted-foreground rounded-md hover:bg-muted hover:text-foreground transition-colors">
              <User size={18} />
              Admin Panel
            </Link>
          </nav>
        </div>
        <div className="p-4 border-t border-border space-y-4">
          <div className="flex justify-center">
            <ThemeToggle />
          </div>
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
              {user.displayName ? user.displayName[0] : (user.email ? user.email[0].toUpperCase() : 'E')}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-foreground truncate">{user.displayName || (user.role === 'admin' ? 'Admin' : 'Editor')}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          <Link href="/logout" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-destructive/80 hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors">
            <LogOut size={18} />
            Sign Out
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
