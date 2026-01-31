'use client'

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import { Providers } from './providers'
import { useReviewQueue } from '@/hooks/useReviewQueue'
import { useAgents } from '@/hooks/useAgents'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

const inter = Inter({ subsets: ['latin'] })

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { agents: allAgents } = useAgents()
  const { reviews } = useReviewQueue()
  const activeAgents = allAgents.filter(agent => agent.status === 'active')
  const activeCount = activeAgents.length

  const { data: todayCost = 0 } = useQuery({
    queryKey: ['todayCost'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('subagent_runs')
        .select('cost')
        .gte('started_at', today)
        .lt('started_at', new Date(new Date(today).getTime() + 24 * 60 * 60 * 1000).toISOString())

      if (error) throw error
      return data.reduce((sum, run) => sum + run.cost, 0)
    },
  })

  return (
    <div className="flex h-screen">
      <Sidebar
        pendingReviewCount={reviews.length}
        activeAgentCount={activeCount}
        todayCost={todayCost}
      />
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