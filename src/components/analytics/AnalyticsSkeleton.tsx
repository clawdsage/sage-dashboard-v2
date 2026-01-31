import { Card, CardContent, CardHeader } from '@/components/ui/Card'

export function AnalyticsSkeleton() {
  return (
    <div className="p-6 space-y-6">
      {/* Header with time range buttons */}
      <div className="flex items-center justify-between mb-6">
        <div className="h-9 w-48 bg-bg-tertiary rounded"></div>
        <div className="flex space-x-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-9 w-20 bg-bg-tertiary rounded"></div>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="h-4 bg-bg-tertiary rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-bg-tertiary rounded mb-2"></div>
              <div className="h-3 bg-bg-tertiary rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-5 bg-bg-tertiary rounded w-1/3"></div>
            </CardHeader>
            <CardContent>
              <div className="h-80 bg-bg-tertiary rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Usage breakdown */}
      <Card>
        <CardHeader>
          <div className="h-5 bg-bg-tertiary rounded w-1/4"></div>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-bg-tertiary rounded mb-6"></div>
          <div className="h-48 bg-bg-tertiary rounded"></div>
        </CardContent>
      </Card>

      {/* Alerts & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-5 bg-bg-tertiary rounded w-1/4"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="flex items-start gap-3 p-3 border border-border-subtle rounded-md">
                    <div className="h-5 w-5 bg-bg-tertiary rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-bg-tertiary rounded w-3/4"></div>
                      <div className="h-3 bg-bg-tertiary rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top expensive runs table */}
      <Card>
        <CardHeader>
          <div className="h-5 bg-bg-tertiary rounded w-1/3"></div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  {[...Array(6)].map((_, i) => (
                    <th key={i} className="py-2">
                      <div className="h-4 bg-bg-tertiary rounded w-3/4 mx-auto"></div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-border-subtle">
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="py-3">
                        <div className="h-4 bg-bg-tertiary rounded w-4/5 mx-auto"></div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}