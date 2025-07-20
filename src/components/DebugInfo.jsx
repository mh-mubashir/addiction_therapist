import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';

const DebugInfo = () => {
  const { user, patientProfile, loading, createProfileManually } = useAuth();
  const [dbStatus, setDbStatus] = useState('checking');
  const [envVars, setEnvVars] = useState({});
  const [dbError, setDbError] = useState('');
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);

  useEffect(() => {
    // Check environment variables
    setEnvVars({
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing',
      supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing',
      claudeKey: import.meta.env.VITE_CLAUDE_API_KEY ? '✅ Set' : '❌ Missing'
    });

    // Test database connection
    const testConnection = async () => {
      try {
        console.log('🕐 [', new Date().toISOString(), '] Starting database connection test...');
        setDbStatus('checking...');
        
        // Test 0: Basic network connectivity
        console.log('🕐 [', new Date().toISOString(), '] Test 0: Testing basic network connectivity...');
        const pingStart = Date.now();
        try {
          const response = await fetch(import.meta.env.VITE_SUPABASE_URL + '/rest/v1/', {
            method: 'GET',
            headers: {
              'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
              'Authorization': 'Bearer ' + import.meta.env.VITE_SUPABASE_ANON_KEY
            }
          });
          const pingEnd = Date.now();
          console.log('🕐 [', new Date().toISOString(), '] Network ping completed in', pingEnd - pingStart, 'ms, status:', response.status);
        } catch (pingError) {
          console.error('❌ Network ping failed:', pingError);
          setDbStatus('❌ Network Failed');
          setDbError(`Network error: ${pingError.message}`);
          return;
        }
        
        // Test 1: Basic Supabase connection
        console.log('🕐 [', new Date().toISOString(), '] Test 1: Testing basic Supabase connection...');
        const authStart = Date.now();
        const { data: authData, error: authError } = await supabase.auth.getSession();
        const authEnd = Date.now();
        console.log('🕐 [', new Date().toISOString(), '] Auth test completed in', authEnd - authStart, 'ms');
        
        if (authError) {
          console.error('❌ Auth connection failed:', authError);
          setDbStatus('❌ Auth Failed');
          setDbError(`Auth error: ${authError.message}`);
          return;
        }
        console.log('✅ Auth connection successful');
        
        // Test 2: Check if tables exist (without RLS)
        console.log('🕐 [', new Date().toISOString(), '] Test 2: Checking if tables exist...');
        const tableStart = Date.now();
        try {
          const { data: tableCheck, error: tableError } = await supabase
            .from('patient_profiles')
            .select('count')
            .limit(1);
          const tableEnd = Date.now();
          console.log('🕐 [', new Date().toISOString(), '] Table check completed in', tableEnd - tableStart, 'ms');
          
          if (tableError) {
            console.error('❌ Table check failed:', tableError);
            if (tableError.message.includes('does not exist')) {
              setDbStatus('❌ Tables Missing');
              setDbError('Tables not created. Run supabase-schema.sql in Supabase SQL Editor');
              return;
            } else if (tableError.message.includes('permission')) {
              setDbStatus('❌ Permission Denied');
              setDbError('RLS policy blocking access. Check authentication.');
              return;
            } else {
              setDbStatus('❌ Table Error');
              setDbError(tableError.message);
              return;
            }
          }
          console.log('✅ Tables exist and accessible');
        } catch (tableErr) {
          const tableEnd = Date.now();
          console.error('❌ Table check exception after', tableEnd - tableStart, 'ms:', tableErr);
          setDbStatus('❌ Table Exception');
          setDbError(`Table check failed: ${tableErr.message}`);
          return;
        }
        
        // Test 3: Test with timeout (original test)
        console.log('🕐 [', new Date().toISOString(), '] Test 3: Testing with timeout...');
        const timeoutStart = Date.now();
        
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => {
            console.log('🕐 [', new Date().toISOString(), '] Timeout reached after 10 seconds');
            reject(new Error('Database connection timeout'));
          }, 10000)
        );
        
        const connectionPromise = supabase
          .from('patient_profiles')
          .select('count')
          .limit(1);
        
        const { data, error } = await Promise.race([connectionPromise, timeoutPromise]);
        const timeoutEnd = Date.now();
        console.log('🕐 [', new Date().toISOString(), '] Timeout test completed in', timeoutEnd - timeoutStart, 'ms');
        
        if (error) {
          console.error('❌ Connection test failed:', error);
          setDbStatus('❌ Connection Failed');
          setDbError(error.message);
        } else {
          console.log('✅ All connection tests passed');
          setDbStatus('✅ Connected');
          setDbError('');
        }
      } catch (err) {
        console.error('❌ Database test failed with exception:', err);
        setDbStatus('❌ Failed');
        setDbError(err.message);
      }
    };

    const handleCreateProfile = async () => {
      setIsCreatingProfile(true);
      try {
        await createProfileManually();
      } finally {
        setIsCreatingProfile(false);
      }
    };

    testConnection();
  }, []);

  const handleRetest = () => {
    console.log('🔄 Retesting database connection...');
    testConnection();
  };

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.9)',
      color: 'white',
      padding: '15px',
      borderRadius: '8px',
      fontSize: '12px',
      maxWidth: '350px',
      zIndex: 9999,
      fontFamily: 'monospace'
    }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#ffd700' }}>🔧 Debug Info</h4>
      
      <div style={{ marginBottom: '8px' }}>
        <strong style={{ color: '#87ceeb' }}>Auth State:</strong>
        <div>Loading: {loading ? '🔄 Yes' : '✅ No'}</div>
        <div>User: {user ? '✅ ' + user.email : '❌ None'}</div>
        <div>Profile: {patientProfile ? '✅ Loaded' : '❌ None'}</div>
        {user && (
          <div style={{ fontSize: '10px', color: '#888', marginTop: '2px' }}>
            User ID: {user.id.substring(0, 8)}...
          </div>
        )}
      </div>

      <div style={{ marginBottom: '8px' }}>
        <strong style={{ color: '#87ceeb' }}>Environment:</strong>
        <div>Supabase URL: {envVars.supabaseUrl}</div>
        <div>Supabase Key: {envVars.supabaseKey}</div>
        <div>Claude Key: {envVars.claudeKey}</div>
        {import.meta.env.VITE_SUPABASE_URL && (
          <div style={{ fontSize: '10px', color: '#888', marginTop: '2px' }}>
            URL: {import.meta.env.VITE_SUPABASE_URL.substring(0, 30)}...
          </div>
        )}
      </div>

      <div style={{ marginBottom: '8px' }}>
        <strong style={{ color: '#87ceeb' }}>Database:</strong>
        <div>{dbStatus}</div>
        {dbError && (
          <div style={{ 
            color: '#ff6b6b', 
            fontSize: '11px', 
            marginTop: '4px',
            padding: '4px',
            background: 'rgba(255,107,107,0.1)',
            borderRadius: '4px'
          }}>
            <strong>Error:</strong> {dbError}
          </div>
        )}
        <button 
          onClick={handleRetest}
          style={{
            background: '#2196F3',
            color: 'white',
            border: 'none',
            padding: '4px 8px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '10px',
            marginTop: '4px'
          }}
        >
          🔄 Retest
        </button>
      </div>

      {patientProfile && (
        <div style={{ marginBottom: '8px' }}>
          <strong style={{ color: '#87ceeb' }}>Profile ID:</strong>
          <div>{patientProfile.id}</div>
        </div>
      )}

      {user && !patientProfile && dbStatus === '✅ Connected' && (
        <div style={{ marginTop: '10px' }}>
          <button 
            onClick={handleCreateProfile}
            disabled={isCreatingProfile}
            style={{
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '4px',
              cursor: isCreatingProfile ? 'not-allowed' : 'pointer',
              fontSize: '11px',
              opacity: isCreatingProfile ? 0.6 : 1
            }}
          >
            {isCreatingProfile ? 'Creating...' : 'Create Profile'}
          </button>
        </div>
      )}

      {dbError && dbError.includes('does not exist') && (
        <div style={{
          marginTop: '10px',
          padding: '8px',
          background: 'rgba(255,215,0,0.2)',
          border: '1px solid #ffd700',
          borderRadius: '4px',
          fontSize: '11px'
        }}>
          <strong style={{ color: '#ffd700' }}>🔧 Quick Fix:</strong>
          <div>1. Go to Supabase Dashboard</div>
          <div>2. Open SQL Editor</div>
          <div>3. Run supabase-schema.sql</div>
        </div>
      )}
    </div>
  );
};

export default DebugInfo; 