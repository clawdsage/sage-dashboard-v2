const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  console.log('Running Mission Control migration...')
  
  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250201170000_mission_control_tables.sql')
    const migrationSql = fs.readFileSync(migrationPath, 'utf8')
    
    // Split by semicolons to execute statements one by one
    const statements = migrationSql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0)
    
    console.log(`Found ${statements.length} SQL statements to execute`)
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i]
      console.log(`\nExecuting statement ${i + 1}/${statements.length}...`)
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: stmt + ';' })
        
        if (error) {
          // If the RPC doesn't exist, try direct SQL (this won't work without proper permissions)
          console.warn(`Failed to execute via RPC: ${error.message}`)
          console.warn('You may need to run this migration manually in the Supabase SQL Editor')
          console.warn('Migration file:', migrationPath)
          break
        }
        
        console.log('✓ Statement executed successfully')
      } catch (err) {
        console.error(`Error executing statement:`, err.message)
        console.warn('You may need to run this migration manually in the Supabase SQL Editor')
        console.warn('Migration file:', migrationPath)
        break
      }
    }
    
    console.log('\n✅ Migration completed!')
    console.log('\nNote: If the migration failed, please run the SQL manually in:')
    console.log('1. Go to https://supabase.com/dashboard/project/kunkqedkkpwaspsucytj/sql')
    console.log('2. Copy the contents of:', migrationPath)
    console.log('3. Paste and run in the SQL Editor')
    
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

runMigration()