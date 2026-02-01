// Simple test script without dependencies
const fs = require('fs')
const path = require('path')

// Read .env.local
const envPath = path.join(__dirname, '..', '.env.local')
let envContent = ''

try {
  envContent = fs.readFileSync(envPath, 'utf8')
} catch (err) {
  console.error('Could not read .env.local:', err.message)
  process.exit(1)
}

// Parse environment variables
const envVars = {}
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/)
  if (match) {
    envVars[match[1]] = match[2]
  }
})

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('Environment check:')
console.log(`- NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✓ Set' : '✗ Missing'}`)
console.log(`- NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✓ Set' : '✗ Missing'}`)

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('\nMissing required environment variables')
  process.exit(1)
}

console.log('\n=== MISSION CONTROL REAL-TIME SETUP ===')
console.log('\n1. Database Migration:')
console.log('   Run this SQL in Supabase SQL Editor:')
console.log('   (See: supabase/migrations/20250201170000_create_mission_control_tables.sql)')

console.log('\n2. Enable Real-Time:')
console.log('   In Supabase Dashboard > Database > Replication:')
console.log('   - Add tables: agents, tasks, messages, activities')
console.log('   - Or run SQL: ALTER PUBLICATION supabase_realtime ADD TABLE <table_name>;')

console.log('\n3. Test Setup:')
console.log('   - Start dev server: npm run dev')
console.log('   - Visit: http://localhost:3000/mission-control-test')
console.log('   - Check connection status for each table')

console.log('\n4. Available React Hooks:')
console.log('   - useAgents() - Agent status changes')
console.log('   - useTasks() - Task updates with filtering')
console.log('   - useActivities() - Activity feed')
console.log('   - useMessages(taskId) - Task comments')

console.log('\n5. Files Created:')
const files = [
  'src/hooks/useRealtimeSubscription.ts',
  'src/hooks/useAgents.ts',
  'src/hooks/useTasks.ts',
  'src/hooks/useActivities.ts',
  'src/hooks/useMessages.ts',
  'src/hooks/index.ts',
  'src/app/mission-control-test/page.tsx',
  'supabase/migrations/20250201170000_create_mission_control_tables.sql',
  'MISSION_CONTROL_REALTIME_SETUP.md'
]

files.forEach(file => {
  const filePath = path.join(__dirname, '..', file)
  const exists = fs.existsSync(filePath)
  console.log(`   ${exists ? '✓' : '✗'} ${file}`)
})

console.log('\n=== NEXT STEPS ===')
console.log('1. Run the SQL migration to create tables')
console.log('2. Enable real-time on tables in Supabase')
console.log('3. Build UI components using the hooks')
console.log('4. Integrate with agent spawning logic')