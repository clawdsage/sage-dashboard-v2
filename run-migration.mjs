#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import dotenv from 'dotenv'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load environment variables
dotenv.config({ path: join(__dirname, '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

// Create Supabase client with service role
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Read the migration SQL
const migrationPath = join(__dirname, 'supabase/migrations/20260201170000_create_mission_control_tables.sql')
const sql = readFileSync(migrationPath, 'utf8')

console.log('🚀 Running Mission Control migration...\n')

// Execute SQL via RPC
const { data, error } = await supabase.rpc('exec', { sql })

if (error) {
  console.error('❌ Migration failed:', error.message)
  process.exit(1)
}

console.log('✅ Migration completed successfully!\n')
console.log('Next steps:')
console.log('1. Check tables in Supabase dashboard')
console.log('2. Git commit and push to deploy to Vercel')
console.log('3. Test at https://sage-dashboard-v2.vercel.app/mission-control\n')
