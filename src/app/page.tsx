import { Card } from '@/components/ui/Card'

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, Tim</h1>
          <p className="text-text-secondary mt-1">3 agents active • $4.52 today</p>
        </div>
        <button className="bg-accent-blue hover:bg-accent-blue/80 text-white px-4 py-2 rounded-md transition-colors">
          Quick Add
        </button>
      </div>

      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-4">LIVE AGENTS (Hero Section)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-bg-tertiary p-4 rounded-lg">
            <div className="text-lg font-medium">Agent 1</div>
            <div className="text-2xl font-bold text-accent-blue">75%</div>
          </div>
          <div className="bg-bg-tertiary p-4 rounded-lg">
            <div className="text-lg font-medium">Agent 2</div>
            <div className="text-2xl font-bold text-accent-amber">50%</div>
          </div>
          <div className="bg-bg-tertiary p-4 rounded-lg">
            <div className="text-lg font-medium">Agent 3</div>
            <div className="text-2xl font-bold text-accent-green">25%</div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">RECENT ACTIVITY</h3>
          <div className="space-y-2">
            <div className="text-sm">• Agent completed task</div>
            <div className="text-sm">• Task created</div>
            <div className="text-sm">• Project updated</div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">TODAY'S METRICS</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">12</div>
              <div className="text-sm text-text-secondary">runs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">$4.5</div>
              <div className="text-sm text-text-secondary">cost</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">45k</div>
              <div className="text-sm text-text-secondary">tokens</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">2m</div>
              <div className="text-sm text-text-secondary">avg</div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">NEEDS ATTENTION (Review Queue Preview)</h3>
        <p className="text-text-secondary">[2 agents pending review] [View All →]</p>
      </Card>
    </div>
  )
}