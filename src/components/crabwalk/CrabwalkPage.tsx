'use client'

import { useMemo, useState } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type Edge,
  type Node,
  type OnSelectionChangeParams,
} from 'reactflow'
import 'reactflow/dist/style.css'

import { useCrabwalkGraph } from '@/hooks/useCrabwalkGraph'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function CrabwalkPage() {
  const { nodes, edges, isLoading, error, refetch } = useCrabwalkGraph()
  const [selected, setSelected] = useState<Node | null>(null)

  const onSelectionChange = (params: OnSelectionChangeParams) => {
    const n = params.nodes?.[0] ?? null
    setSelected(n)
  }

  const header = useMemo(() => {
    return (
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Crabwalk</h1>
          <p className="text-sm text-muted-foreground">
            Live graph of agents → runs → events. Updates in realtime.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => refetch()} disabled={isLoading}>
            Refresh
          </Button>
        </div>
      </div>
    )
  }, [isLoading, refetch])

  return (
    <div className="min-h-[calc(100vh-56px)] bg-[var(--cream)]">
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6">
        {header}

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
          <Card className="lg:col-span-9 overflow-hidden">
            <div className="relative h-[70vh] min-h-[520px] w-full">
              {error ? (
                <div className="p-4 text-sm text-red-700">{error}</div>
              ) : null}
              {isLoading ? (
                <div className="p-4 text-sm text-muted-foreground">Loading graph…</div>
              ) : null}

              <ReactFlow
                nodes={nodes as any}
                edges={edges as any}
                onSelectionChange={onSelectionChange}
                fitView
                proOptions={{ hideAttribution: true }}
              >
                <Background gap={16} size={1} color="rgba(0,0,0,0.06)" />
                <Controls />
                <MiniMap pannable zoomable />
              </ReactFlow>
            </div>
          </Card>

          <Card className="lg:col-span-3">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">Inspector</h2>
                {selected ? (
                  <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>
                    Clear
                  </Button>
                ) : null}
              </div>
              <div className="mt-3">
                {!selected ? (
                  <p className="text-sm text-muted-foreground">
                    Tap a node to see details.
                  </p>
                ) : (
                  <div className="space-y-2 text-sm">
                    <div>
                      <div className="text-xs text-muted-foreground">Type</div>
                      <div className="font-medium">{(selected.data as any)?.kind ?? selected.type ?? 'node'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Label</div>
                      <div className="font-medium">{(selected.data as any)?.label ?? selected.id}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">ID</div>
                      <div className="break-all font-mono text-[11px]">{selected.id}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-4">
          <Card>
            <div className="p-4">
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <div className="font-semibold">Legend</div>
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-orange-500" /> Agent
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-amber-500" /> Run
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-slate-500" /> Event
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
