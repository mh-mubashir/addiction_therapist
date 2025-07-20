// Test Supabase Connection with Authentication
// Run this with: node test-supabase-connection.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Testing Supabase Connection...');
console.log('URL:', supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : '❌ Missing');
console.log('Key:', supabaseKey ? `${supabaseKey.substring(0, 20)}...` : '❌ Missing');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('\n🔍 Test 1: Basic connection...');
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('❌ Auth test failed:', error);
      return;
    }
    console.log('✅ Auth connection successful');

    console.log('\n🔍 Test 2: Table access...');
    const { data: tableData, error: tableError } = await supabase
      .from('patient_profiles')
      .select('count')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Table access failed:', tableError);
      if (tableError.message.includes('does not exist')) {
        console.log('💡 Tables need to be created. Run supabase-schema.sql');
      } else if (tableError.message.includes('permission')) {
        console.log('💡 RLS policy blocking access');
      }
      return;
    }
    console.log('✅ Table access successful');

    console.log('\n🔍 Test 3: Testing with authentication...');
    
    // Try to sign in with a test user (this will fail but shows auth is working)
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'testpassword'
    });
    
    if (signInError) {
      console.log('✅ Auth system working (expected sign-in failure)');
    }

    console.log('\n🔍 Test 4: Check current policies...');
    const { data: policies, error: policyError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('schemaname', 'public')
      .eq('tablename', 'patient_profiles');
    
    if (policyError) {
      console.log('❌ Could not check policies:', policyError.message);
    } else {
      console.log('✅ Found', policies?.length || 0, 'policies for patient_profiles');
    }

    console.log('\n💡 To fix RLS issues:');
    console.log('1. Run fix-rls-policies.sql in Supabase SQL Editor');
    console.log('2. Ensure user is properly authenticated in the app');
    console.log('3. Check that auth.uid() matches user_id in inserts');
    
  } catch (error) {
    console.error('❌ Test failed with exception:', error);
  }
}

testConnection(); 