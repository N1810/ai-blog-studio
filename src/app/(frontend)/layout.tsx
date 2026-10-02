import React from 'react'
// @ts-expect-error - Next.js resolves CSS imports natively
import '@/app/globals.css'

import { ThemeProvider } from '@/components/ThemeProvider'

export const metadata = {
  description: 'AI-powered blog CMS and publishing platform',
  title: 'AI Blog Studio',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
