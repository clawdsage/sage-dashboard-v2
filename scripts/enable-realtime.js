#!/usr/bin/env node

/**
 * Script to enable real-time on Supabase tables for Mission Control
 * Run this after creating the tables in the database
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
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local')
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Tables to enable real-time for
const tables = [
  'agents',
  'tasks',
  'messages', 
  'activities'
]

async function enableRealtime() {
  console.log('Enabling real-time for Mission Control tables...')
  
  for (const table of tables) {
    try {
      // Note: This requires running the SQL directly in Supabase SQL Editor
      // because the Supabase JS client doesn't have a method to enable real-time
      console.log(`\nTable: ${table}`)
      console.log(`Run this SQL in Supabase Dashboard > SQL Editor:`)
      console.log(`ALTER PUBLICATION supabase_realtime ADD TABLE ${table};`)
      
      // Check if table exists
      const { data, error } = await supabase
        .from(table)
        .select('count', { count: 'exact', head: true })
        .limit(1)
      
      if (error) {
        console.log(`  ❌ Table doesn't exist or can't be accessed: ${error.message}`)
      } else {
        console.log(`  ✅ Table exists`)
      }
    } catch (err) {
      console.log(`  ❌ Error checking table: ${err.message}`)
    }
  }
  
  console.log('\n=== IMPORTANT ===')
  console.log('To enable real-time subscriptions, you must:')
  console.log('1. Go to Supabase Dashboard > Database > Replication')
  console.log('2. Click "Add tables"')
  console.log('3. Select the tables: agents, tasks, messages, activities')
  console.log('4. Click "Save"')
  console.log('\nOr run the SQL commands shown above in SQL Editor.')
}

enableRealtime().catch(console.error)