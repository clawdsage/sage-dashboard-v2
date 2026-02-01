#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

// Read the migration SQL
const migrationPath = path.join(__dirname, 'supabase/migrations/20260201170000_create_mission_control_tables.sql');
const sql = fs.readFileSync(migrationPath, 'utf8');

console.log('🚀 Running Mission Control migration...\n');

// Execute SQL via Supabase REST API
const url = new URL('/rest/v1/rpc/exec_sql', SUPABASE_URL.replace('//', '//'));
const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': SERVICE_KEY,
    'Authorization': `Bearer ${SERVICE_KEY}`,
    'Prefer': 'return=minimal'
  }
};

// Split into manageable chunks (Supabase has query length limits)
const statements = sql
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'))
  .map(s => s + ';');

console.log(`📝 Found ${statements.length} SQL statements\n`);

async function execSQL(sql) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });
    
    req.on('error', reject);
    req.write(JSON.stringify({ query: sql }));
    req.end();
  });
}

// Run migration
(async () => {
  let succeeded = 0;
  let failed = 0;
  
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    process.stdout.write(`[${i+1}/${statements.length}] Executing... `);
    
    try {
      await execSQL(stmt);
      console.log('✅');
      succeeded++;
    } catch (err) {
      // Ignore "already exists" errors
      if (err.message.includes('already exists') || err.message.includes('IF NOT EXISTS')) {
        console.log('⏭️  (already exists)');
        succeeded++;
      } else {
        console.log(`❌ ${err.message}`);
        failed++;
      }
    }
  }
  
  console.log(`\n✨ Migration complete: ${succeeded} succeeded, ${failed} failed\n`);
  
  if (failed === 0) {
    console.log('✅ All Mission Control tables created successfully!\n');
    console.log('Next steps:');
    console.log('1. Verify tables in Supabase dashboard');
    console.log('2. Push to git to deploy to Vercel');
    console.log('3. Test at https://sage-dashboard-v2.vercel.app/mission-control\n');
  } else {
    console.log('⚠️  Some statements failed. Check errors above.\n');
  }
})();
