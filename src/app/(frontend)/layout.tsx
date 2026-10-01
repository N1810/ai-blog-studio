import React from 'react'
// @ts-expect-error - Next.js resolves CSS imports natively
import '@/app/globals.css'

export const metadata = {
  description: 'AI-powered blog CMS and publishing platform',
  title: 'AI Blog Studio',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">{children}</body>
    </html>
  )
}
