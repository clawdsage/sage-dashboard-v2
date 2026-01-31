# Sage Dashboard V2

A modern, real-time dashboard for monitoring and managing AI agents, projects, and workflows. Built with Next.js, TypeScript, and Supabase.

## Features

- **Live Agent Monitoring**: Real-time tracking of agent runs with progress indicators and live updates
- **Projects V2**: Advanced project management with task tracking, progress visualization, and team collaboration
- **Task Management**: Create, organize, and track tasks within projects with drag-and-drop reordering
- **Review Queue**: Approve or reject agent outputs and project tickets before production deployment
- **Analytics Dashboard**: Comprehensive metrics and charts for performance analysis
  - **Cost Analytics**: Track spending over time with interactive charts
  - **Model Breakdown**: Visualize usage by AI model with pie and bar charts
  - **Usage Analytics**: Detailed breakdown of runs, tokens, and duration
  - **Smart Alerts**: Automated detection of cost spikes, failed runs, and anomalies
  - **AI Insights**: Intelligent recommendations for cost optimization and efficiency improvements
  - **Export Functionality**: Export analytics data in multiple formats
- **Activity Timeline**: Real-time activity feed with event notifications
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion animations
- **Data**: Supabase (PostgreSQL, real-time subscriptions)
- **State Management**: TanStack Query (React Query)
- **UI Components**: Custom component library with Lucide icons
- **Charts**: Recharts for data visualization

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd sage-dashboard-v2
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Analytics Features

The analytics dashboard provides comprehensive insights into agent performance and costs:

### Key Metrics
- **Total Runs**: Number of agent executions in selected time period
- **Total Cost**: Aggregate spending across all runs
- **Total Tokens**: Combined token usage for all models
- **Average Duration**: Mean execution time of completed runs

### Visualizations
- **Cost Over Time**: Line chart showing daily spending trends
- **Model Breakdown**: Pie and bar charts showing cost distribution by AI model
- **Usage Analytics**: Interactive charts with multiple view modes (cost, count, tokens, duration)
- **Top Expensive Runs**: Table listing the most costly agent executions

### Smart Features
- **Automated Alerts**: Real-time detection of:
  - Cost spikes (>100% increase from previous day)
  - High-cost runs (>$1.00 per run)
  - Failed runs and error patterns
- **AI-Powered Insights**: Intelligent recommendations including:
  - Cost optimization suggestions
  - Model usage diversification
  - Token efficiency improvements
  - Performance trend analysis

### Time Range Selection
- **Today**: Current day's metrics
- **7 Days**: Weekly trends and patterns
- **30 Days**: Monthly overview and long-term trends

### Accessibility
- Full keyboard navigation support
- Screen reader compatible with ARIA labels
- High contrast mode support
- Responsive design for all screen sizes

### Performance Optimizations
- Debounced search inputs (300ms delay)
- Memoized chart components to prevent unnecessary re-renders
- Code splitting for faster initial load
- Lazy loading of heavy visualization components

## Database Schema

The application uses the following main tables:

- `subagent_runs`: Agent execution records
- `projects`: Project management
- `tasks`: Task tracking within projects
- `activity_log`: System activity events
- `daily_stats`: Aggregated daily metrics

## Deployment

Build for production:
```bash
npm run build
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License