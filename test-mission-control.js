// Simple test to verify Mission Control components
console.log('Mission Control Components Test')
console.log('===============================')

const fs = require('fs')
const path = require('path')

const components = [
  'src/app/mission-control/page.tsx',
  'src/components/mission-control/AgentColumn.tsx',
  'src/components/mission-control/KanbanBoard.tsx',
  'src/components/mission-control/ActivityFeed.tsx',
  'src/components/mission-control/CreateTaskModal.tsx',
  'src/components/mission-control/TaskDetailModal.tsx',
  'src/components/mission-control/TaskCard.tsx',
  'src/hooks/useMissionControl.ts'
]

let allExist = true

components.forEach(component => {
  const fullPath = path.join(__dirname, component)
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${component}`)
  } else {
    console.log(`❌ ${component} - MISSING`)
    allExist = false
  }
})

console.log('\nMigration Files:')
// Check for migration file with either naming pattern
const migrationPaths = [
  path.join(__dirname, 'supabase/migrations/20250201170000_mission_control_tables.sql'),
  path.join(__dirname, 'supabase/migrations/20260201170000_create_mission_control_tables.sql')
]

let migrationPath = null
for (const mp of migrationPaths) {
  if (fs.existsSync(mp)) {
    migrationPath = mp
    break
  }
}

if (migrationPath) {
  console.log('✅ Migration SQL file exists')
  const migrationContent = fs.readFileSync(migrationPath, 'utf8')
  const tables = [
    'mission_control_agents',
    'mission_control_tasks', 
    'mission_control_messages',
    'mission_control_activities'
  ]
  
  tables.forEach(table => {
    if (migrationContent.includes(`CREATE TABLE IF NOT EXISTS ${table}`)) {
      console.log(`  ✅ ${table} table defined`)
    } else {
      console.log(`  ❌ ${table} table NOT defined`)
      allExist = false
    }
  })
} else {
  console.log('❌ Migration SQL file missing')
  allExist = false
}

console.log('\nPackage Dependencies:')
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'))
const requiredDeps = ['react-beautiful-dnd', 'date-fns']
requiredDeps.forEach(dep => {
  if (packageJson.dependencies[dep]) {
    console.log(`✅ ${dep} installed`)
  } else {
    console.log(`❌ ${dep} NOT installed`)
    allExist = false
  }
})

console.log('\n' + '='.repeat(40))
if (allExist) {
  console.log('✅ All Mission Control components are ready!')
  console.log('\nNext steps:')
  console.log('1. Run the migration SQL in Supabase SQL Editor')
  console.log('2. Start dev server: npm run dev')
  console.log('3. Navigate to: /mission-control')
} else {
  console.log('❌ Some components are missing or incomplete')
  console.log('Please check the errors above and fix them.')
}

process.exit(allExist ? 0 : 1)