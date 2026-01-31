'use client'

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import { Providers } from './providers'
import { useReviewQueue } from '@/hooks/useReviewQueue'

const inter = Inter({ subsets: ['latin'] })

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { reviews } = useReviewQueue()

  return (
    <div className="flex h-screen">
      <Sidebar pendingReviewCount={reviews.length} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-bg-primary text-text-primary min-h-screen`}>
        <Providers>
          <LayoutContent>{children}</LayoutContent>
        </Providers>
      </body>
    </html>
  )
}