# Sage Dashboard V2

A modern, real-time dashboard for monitoring and managing AI agents, projects, and workflows. Built with Next.js, TypeScript, and Supabase.

## Features

- **Live Agent Monitoring**: Real-time tracking of agent runs with progress indicators and live updates
- **Project Management**: Organize tasks and projects with visual progress tracking
- **Review Queue**: Approve or reject agent outputs before production deployment
- **Analytics Dashboard**: Comprehensive metrics and charts for performance analysis
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