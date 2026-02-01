#!/usr/bin/env node

/**
 * Test Supabase connection and check Mission Control tables
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials in .env.local')
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  console.log('Testing Supabase connection...')
  console.log(`URL: ${supabaseUrl}`)
  
  // Test basic connection
  try {
    const { data, error } = await supabase.from('subagent_runs').select('count', { count: 'exact', head: true }).limit(1)
    
    if (error) {
      console.error('❌ Connection failed:', error.message)
      return false
    }
    
    console.log('✅ Connected to Supabase successfully')
    return true
  } catch (err) {
    console.error('❌ Connection error:', err.message)
    return false
  }
}

async function checkTables() {
  console.log('\nChecking Mission Control tables...')
  
  const tables = [
    'agents',
    'tasks',
    'messages',
    'activities'
  ]
  
  let allExist = true
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('count', { count: 'exact', head: true })
        .limit(1)
      
      if (error) {
        console.log(`  ❌ ${table}: ${error.message}`)
        allExist = false
      } else {
        console.log(`  ✅ ${table}: Exists`)
      }
    } catch (err) {
      console.log(`  ❌ ${table}: ${err.message}`)
      allExist = false
    }
  }
  
  return allExist
}

async function checkExistingData() {
  console.log('\nChecking existing data...')
  
  // Check agents
  const { data: agents, error: agentsError } = await supabase
    .from('agents')
    .select('*')
    .limit(5)
  
  if (agentsError) {
    console.log(`  Agents: Table doesn't exist or can't be accessed`)
  } else {
    console.log(`  Agents: ${agents.length} records found`)
    if (agents.length > 0) {
      agents.forEach(agent => {
        console.log(`    - ${agent.name} (${agent.status})`)
      })
    }
  }
  
  // Check tasks with Mission Control columns
  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select('id, title, status, assignee_ids')
    .limit(5)
  
  if (tasksError) {
    console.log(`  Tasks: ${tasksError.message}`)
  } else {
    console.log(`  Tasks: ${tasks.length} records found`)
    if (tasks.length > 0) {
      tasks.forEach(task => {
        console.log(`    - "${task.title}" (${task.status}) - ${task.assignee_ids?.length || 0} assignees`)
      })
    }
  }
}

async function main() {
  const connected = await testConnection()
  if (!connected) {
    process.exit(1)
  }
  
  const tablesExist = await checkTables()
  await checkExistingData()
  
  console.log('\n=== SUMMARY ===')
  if (!tablesExist) {
    console.log('❌ Mission Control tables need to be created')
    console.log('\nRun the SQL migration:')
    console.log('supabase/migrations/20250201170000_create_mission_control_tables.sql')
  } else {
    console.log('✅ Mission Control tables exist')
  }
  
  console.log('\nNext steps:')
  console.log('1. Run the SQL migration if tables don\'t exist')
  console.log('2. Enable real-time on tables in Supabase Dashboard')
  console.log('3. Start dev server: npm run dev')
  console.log('4. Test at: http://localhost:3000/mission-control-test')
}

main().catch(console.error)