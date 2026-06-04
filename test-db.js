const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

let url, key;
try {
  const envContent = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf8');
  const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL\s*=\s*(.*)/);
  const keyMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY\s*=\s*(.*)/);
  if (urlMatch) url = urlMatch[1].trim();
  if (keyMatch) key = keyMatch[1].trim();
} catch (e) {
  console.error("Failed to read .env.local:", e.message);
}

if (!url || !key) {
  console.error("Missing env vars!");
  process.exit(1);
}

const supabase = createClient(url, key);

async function run() {
  console.log("Checking dsa_problems table...");
  const { data: dsa, error: dsaErr } = await supabase.from('dsa_problems').select('*').limit(1);
  if (dsaErr) {
    console.log("Error querying dsa_problems:", dsaErr.message);
  } else {
    console.log("Success! dsa_problems table exists. Data:", dsa);
  }

  console.log("Checking resources table...");
  const { data: res, error: resErr } = await supabase.from('resources').select('*').limit(1);
  if (resErr) {
    console.log("Error querying resources:", resErr.message);
  } else {
    console.log("Success! resources table exists. Data:", res);
  }

  console.log("Checking users table...");
  const { data: users, error: userError } = await supabase.from('users').select('*').limit(1);
  if (userError) {
    console.log("Error querying users table:", userError.message);
  } else {
    console.log("Success! Users table exists. Data:", users);
  }
}

run();
