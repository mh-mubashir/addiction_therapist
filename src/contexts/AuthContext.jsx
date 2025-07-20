import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, dbService } from '../services/supabase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [patientProfile, setPatientProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        console.log('🔍 Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Session error:', error);
          setLoading(false);
          return;
        }
        
        console.log('📋 Session data:', session);
        
        if (session?.user) {
          console.log('👤 User found:', session.user.email);
          setUser(session.user);
          await loadPatientProfile(session.user.id);
        } else {
          console.log('❌ No user session found');
          setUser(null);
          setPatientProfile(null);
        }
      } catch (error) {
        console.error('❌ Error getting session:', error);
        setUser(null);
        setPatientProfile(null);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.email);
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('✅ User signed in:', session.user.email);
          setUser(session.user);
          await loadPatientProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          console.log('🚪 User signed out');
          setUser(null);
          setPatientProfile(null);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          console.log('🔄 Token refreshed for:', session.user.email);
          setUser(session.user);
          // Don't reload profile on token refresh to avoid unnecessary calls
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadPatientProfile = async (userId) => {
    // Add timeout wrapper to prevent infinite hanging
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => {
        console.log('🕐 [', new Date().toISOString(), '] ⚠️ Profile loading timeout reached (30 seconds)');
        reject(new Error('Profile loading timeout'));
      }, 30000)
    );

    const profilePromise = async () => {
      try {
        console.log('🕐 [', new Date().toISOString(), '] 🔍 Loading patient profile for user:', userId);
        
        // First, verify authentication
        console.log('🕐 [', new Date().toISOString(), '] Verifying authentication...');
        const authStart = Date.now();
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        const authEnd = Date.now();
        console.log('🕐 [', new Date().toISOString(), '] Auth verification completed in', authEnd - authStart, 'ms');
        
        if (authError || !session?.user) {
          console.error('❌ Authentication verification failed:', authError);
          throw new Error('User not authenticated');
        }
        
        console.log('✅ Authentication verified for:', session.user.email);
        
        // First, let's test the database connection
        console.log('🕐 [', new Date().toISOString(), '] Testing database connection...');
        const dbStart = Date.now();
        const { data: testData, error: testError } = await supabase
          .from('patient_profiles')
          .select('count')
          .limit(1);
        const dbEnd = Date.now();
        console.log('🕐 [', new Date().toISOString(), '] Database connection test completed in', dbEnd - dbStart, 'ms');
        
        if (testError) {
          console.error('❌ Database connection test failed:', testError);
          throw new Error(`Database connection failed: ${testError.message}`);
        }
        
        console.log('✅ Database connection test passed');
        
        // Now try to get the profile
        console.log('🕐 [', new Date().toISOString(), '] Querying for existing profile...');
        const queryStart = Date.now();
        const { data, error } = await supabase
          .from('patient_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();
        const queryEnd = Date.now();
        console.log('🕐 [', new Date().toISOString(), '] Profile query completed in', queryEnd - queryStart, 'ms');
        
        if (error) {
          console.log('📋 Profile query error:', error);
          if (error.code === 'PGRST116') {
            // Profile doesn't exist, create one
            console.log('🕐 [', new Date().toISOString(), '] 📝 No patient profile found, creating one...');
            try {
              const profileData = {
                user_id: userId,
                patient_summary: 'New user profile created.',
                recovery_stage: 'early',
                primary_addiction: 'not_specified',
                support_network_available: true
              };
              
              console.log('🕐 [', new Date().toISOString(), '] Creating profile with data:', profileData);
              const createStart = Date.now();
              const newProfile = await dbService.createPatientProfile(profileData);
              const createEnd = Date.now();
              console.log('🕐 [', new Date().toISOString(), '] Profile creation completed in', createEnd - createStart, 'ms');
              console.log('✅ Created new patient profile:', newProfile);
              setPatientProfile(newProfile);
            } catch (createError) {
              console.error('❌ Error creating patient profile:', createError);
              // Set a default profile to prevent infinite loading
              const fallbackProfile = {
                id: 'temp-' + Date.now(),
                user_id: userId,
                patient_summary: 'Profile creation failed - using fallback.',
                recovery_stage: 'early',
                primary_addiction: 'not_specified',
                support_network_available: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              };
              console.log('🔄 Setting fallback profile:', fallbackProfile);
              setPatientProfile(fallbackProfile);
            }
            return;
          }
          throw error;
        }
        
        console.log('✅ Patient profile loaded:', data);
        setPatientProfile(data);
      } catch (error) {
        console.error('❌ Error loading patient profile:', error);
        // Set a default profile to prevent infinite loading
        const fallbackProfile = {
          id: 'temp-' + Date.now(),
          user_id: userId,
          patient_summary: 'Profile loading failed - using fallback.',
          recovery_stage: 'early',
          primary_addiction: 'not_specified',
          support_network_available: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        console.log('🔄 Setting fallback profile due to error:', fallbackProfile);
        setPatientProfile(fallbackProfile);
      }
    };

    try {
      await Promise.race([profilePromise(), timeoutPromise]);
    } catch (timeoutError) {
      console.error('❌ Profile loading timed out:', timeoutError);
      // Set a fallback profile to prevent infinite loading
      const fallbackProfile = {
        id: 'temp-timeout-' + Date.now(),
        user_id: userId,
        patient_summary: 'Profile loading timed out - using fallback.',
        recovery_stage: 'early',
        primary_addiction: 'not_specified',
        support_network_available: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      console.log('🔄 Setting timeout fallback profile:', fallbackProfile);
      setPatientProfile(fallbackProfile);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const refreshProfile = async () => {
    if (user) {
      await loadPatientProfile(user.id);
    }
  };

  const createProfileManually = async () => {
    if (!user) {
      console.error('❌ No user to create profile for');
      return;
    }
    
    console.log('🔧 Manually creating profile for user:', user.id);
    try {
      const profileData = {
        user_id: user.id,
        patient_summary: 'Manually created profile.',
        recovery_stage: 'early',
        primary_addiction: 'not_specified',
        support_network_available: true
      };
      
      const newProfile = await dbService.createPatientProfile(profileData);
      console.log('✅ Manually created profile:', newProfile);
      setPatientProfile(newProfile);
    } catch (error) {
      console.error('❌ Manual profile creation failed:', error);
    }
  };

  const value = {
    user,
    patientProfile,
    loading,
    signOut,
    refreshProfile,
    createProfileManually
  };

  console.log('🔄 AuthContext state:', { user: !!user, profile: !!patientProfile, loading });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 