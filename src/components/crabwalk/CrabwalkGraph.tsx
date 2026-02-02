'use client'

import { memo, useCallback, useMemo } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Panel,
  type Edge,
  type Node,
  type OnSelectionChangeParams,
  type NodeProps,
  type EdgeProps,
  ConnectionLineType,
  MarkerType,
} from 'reactflow'
import 'reactflow/dist/style.css'

import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import type { MissionControlAgentRun, MissionControlAgentRunEvent } from '@/types'

// Custom Node Components
const AgentNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div
      className={cn(
        'relative rounded-2xl border p-4 transition-all duration-200',
        'border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50',
        'shadow-sm hover:shadow-md',
        selected && 'ring-2 ring-orange-400 ring-offset-2'
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
          <span className="text-lg">🤖</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-orange-900 truncate">{data.label}</div>
          <div className="text-xs text-orange-600 mt-1">Agent</div>
        </div>
      </div>
      {data.meta?.status && (
        <div className="mt-3">
          <Badge
            variant={data.meta.status === 'active' ? 'default' : 'secondary'}
            className={cn(
              'text-xs',
              data.meta.status === 'active' && 'bg-orange-100 text-orange-800 border-orange-200'
            )}
          >
            {data.meta.status}
          </Badge>
        </div>
      )}
    </div>
  )
})

AgentNode.displayName = 'AgentNode'

const RunNode = memo(({ data, selected }: NodeProps) => {
  const meta = data.meta as MissionControlAgentRun
  const isRunning = meta?.status === 'running'
  
  return (
    <div
      className={cn(
        'relative rounded-xl border p-4 transition-all duration-200',
        'border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50',
        'shadow-sm hover:shadow-md',
        selected && 'ring-2 ring-amber-400 ring-offset-2',
        isRunning && 'animate-pulse border-amber-300'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className={cn(
              'h-2 w-2 rounded-full',
              isRunning ? 'bg-amber-500 animate-ping' : 'bg-amber-400'
            )} />
            <div className="font-medium text-amber-900 truncate">{data.label}</div>
          </div>
          <div className="text-xs text-amber-600 mt-1">Run</div>
          
          {meta?.title && (
            <div className="mt-2 text-sm text-amber-800 line-clamp-2">{meta.title}</div>
          )}
          
          {meta?.started_at && (
            <div className="mt-2 text-xs text-amber-500">
              {new Date(meta.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>
        
        {isRunning && (
          <div className="flex-shrink-0">
            <div className="h-6 w-6 rounded-full border-2 border-amber-300 border-t-transparent animate-spin" />
          </div>
        )}
      </div>
      
      <div className="mt-3 flex flex-wrap gap-1">
        <Badge
          variant={isRunning ? 'default' : 'secondary'}
          className={cn(
            'text-xs',
            isRunning && 'bg-amber-100 text-amber-800 border-amber-200'
          )}
        >
          {meta?.status || 'unknown'}
        </Badge>
        
        {meta?.session_key && (
          <Badge variant="outline" className="text-xs">
            {meta.session_key.slice(0, 8)}
          </Badge>
        )}
      </div>
    </div>
  )
})

RunNode.displayName = 'RunNode'

const EventNode = memo(({ data, selected }: NodeProps) => {
  const meta = data.meta as MissionControlAgentRunEvent
  const levelColor = {
    info: 'bg-blue-100 text-blue-800 border-blue-200',
    warn: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    error: 'bg-red-100 text-red-800 border-red-200',
  }[meta?.level || 'info']

  return (
    <div
      className={cn(
        'relative rounded-lg border p-3 transition-all duration-200',
        'border-slate-200 bg-gradient-to-br from-slate-50 to-gray-50',
        'shadow-sm hover:shadow',
        selected && 'ring-2 ring-slate-400 ring-offset-2'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="font-medium text-slate-900 truncate">{data.label}</div>
          <div className="text-xs text-slate-600 mt-1">Event</div>
          
          {meta?.message && (
            <div className="mt-2 text-sm text-slate-700 line-clamp-2">{meta.message}</div>
          )}
          
          {meta?.created_at && (
            <div className="mt-2 text-xs text-slate-500">
              {new Date(meta.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
          )}
        </div>
        
        {meta?.level && (
          <div className="flex-shrink-0">
            <Badge variant="outline" className={cn('text-xs', levelColor)}>
              {meta.level}
            </Badge>
          </div>
        )}
      </div>
      
      <div className="mt-2 flex flex-wrap gap-1">
        {meta?.verb && (
          <Badge variant="secondary" className="text-xs">
            {meta.verb}
          </Badge>
        )}
      </div>
    </div>
  )
})

EventNode.displayName = 'EventNode'

// Custom Edge Component with animation
const AnimatedEdge = memo(({ 
  sourceX, 
  sourceY, 
  targetX, 
  targetY, 
  sourcePosition, 
  targetPosition, 
  style = {}, 
  markerEnd, 
  data 
}: EdgeProps) => {
  const isRunning = data?.isRunning || false
  
  const edgePath = `M ${sourceX},${sourceY} L ${targetX},${targetY}`
  
  return (
    <>
      <path
        id="edge-path"
        d={edgePath}
        fill="none"
        stroke={isRunning ? 'rgba(249, 115, 22, 0.3)' : 'rgba(148, 163, 184, 0.2)'}
        strokeWidth={isRunning ? 4 : 2}
        className="transition-all duration-300"
      />
      <path
        d={edgePath}
        fill="none"
        stroke={isRunning ? 'rgb(249, 115, 22)' : 'rgb(148, 163, 184)'}
        strokeWidth={isRunning ? 2 : 1}
        strokeDasharray={isRunning ? '5,5' : 'none'}
        className={cn(
          'transition-all duration-300',
          isRunning && 'animate-[dash_1s_linear_infinite]'
        )}
        style={{
          animation: isRunning ? 'dash 1s linear infinite' : 'none',
        }}
      />
      <style jsx>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -20;
          }
        }
      `}</style>
    </>
  )
})

AnimatedEdge.displayName = 'AnimatedEdge'

// Node types configuration
const nodeTypes = {
  agent: AgentNode,
  run: RunNode,
  event: EventNode,
  default: AgentNode,
}

// Edge types configuration
const edgeTypes = {
  animated: AnimatedEdge,
}

interface CrabwalkGraphProps {
  nodes: Node[]
  edges: Edge[]
  isLoading: boolean
  error: string | null
  selectedNode: Node | null
  onSelectionChange: (params: OnSelectionChangeParams) => void
  onClearSelection: () => void
  onRefresh: () => void
}

export function CrabwalkGraph({
  nodes,
  edges,
  isLoading,
  error,
  selectedNode,
  onSelectionChange,
  onClearSelection,
  onRefresh,
}: CrabwalkGraphProps) {
  // Enhanced edges with animation data
  const enhancedEdges = useMemo(() => {
    return edges.map(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source)
      const isRunning = sourceNode?.data?.meta?.status === 'running'
      
      return {
        ...edge,
        type: 'animated',
        data: { isRunning },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 15,
          height: 15,
          color: isRunning ? 'rgb(249, 115, 22)' : 'rgb(148, 163, 184)',
        },
        style: {
          ...edge.style,
          strokeWidth: isRunning ? 2 : 1,
        },
      }
    })
  }, [edges, nodes])

  // Responsive layout configuration
  const fitViewOptions = useMemo(() => ({
    padding: 0.1,
    minZoom: 0.5,
    maxZoom: 2,
  }), [])

  const handleFitView = useCallback(() => {
    // This would be handled by ReactFlow's fitView prop
  }, [])

  return (
    <div className="flex flex-col h-full">
      {/* Graph Container */}
      <Card className="flex-1 overflow-hidden relative">
        <div className="absolute inset-0">
          {error ? (
            <div className="flex items-center justify-center h-full p-4">
              <div className="text-center">
                <div className="text-red-600 font-medium">Error loading graph</div>
                <div className="text-sm text-red-500 mt-1">{error}</div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRefresh}
                  className="mt-3"
                >
                  Retry
                </Button>
              </div>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-amber-500 border-r-transparent" />
                <div className="text-sm text-muted-foreground mt-3">Loading graph data...</div>
              </div>
            </div>
          ) : (
            <ReactFlow
              nodes={nodes}
              edges={enhancedEdges}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              onSelectionChange={onSelectionChange}
              fitView
              fitViewOptions={fitViewOptions}
              proOptions={{ hideAttribution: true }}
              connectionLineType={ConnectionLineType.Straight}
              minZoom={0.1}
              maxZoom={2}
              defaultEdgeOptions={{
                type: 'animated',
                animated: false,
                style: { strokeWidth: 1.5 },
              }}
              nodesDraggable={true}
              nodesConnectable={false}
              elementsSelectable={true}
              selectNodesOnDrag={false}
            >
              <Background 
                gap={20} 
                size={1} 
                color="rgba(0,0,0,0.05)" 
                variant="dots"
              />
              <Controls 
                showInteractive={false}
                className="!bg-white !border !border-gray-200 !rounded-lg !shadow-sm"
              />
              <MiniMap 
                pannable 
                zoomable
                nodeStrokeColor={(n) => {
                  if (n.data?.kind === 'agent') return '#fb923c'
                  if (n.data?.kind === 'run') return '#f59e0b'
                  return '#64748b'
                }}
                nodeColor={(n) => {
                  if (n.data?.kind === 'agent') return '#ffedd5'
                  if (n.data?.kind === 'run') return '#fef3c7'
                  return '#f8fafc'
                }}
                className="!bg-white/80 !backdrop-blur-sm !border !border-gray-200 !rounded-lg !shadow-sm"
              />
              
              {/* Custom Controls Panel */}
              <Panel position="top-right" className="!mt-2 !mr-2">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onRefresh}
                    className="bg-white/90 backdrop-blur-sm"
                  >
                    Refresh
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleFitView}
                    className="bg-white/90 backdrop-blur-sm"
                  >
                    Fit View
                  </Button>
                </div>
              </Panel>
              
              {/* Legend Panel */}
              <Panel position="bottom-left" className="!mb-2 !ml-2">
                <Card className="p-3 bg-white/90 backdrop-blur-sm shadow-sm">
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <div className="font-semibold text-gray-700">Legend</div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-3 w-3 rounded-full bg-orange-500" />
                      <span className="text-gray-600">Agent</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-3 w-3 rounded-full bg-amber-500" />
                      <span className="text-gray-600">Run</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-3 w-3 rounded-full bg-slate-500" />
                      <span className="text-gray-600">Event</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                      </div>
                      <span className="text-gray-600">Running</span>
                    </div>
                  </div>
                </Card>
              </Panel>
            </ReactFlow>
          )}
        </div>
      </Card>
    </div>
  )
}