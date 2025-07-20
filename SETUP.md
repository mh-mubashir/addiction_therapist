# Setup Guide - Fix Loading Issue

## 🔧 Quick Fix Steps

### 1. Database Setup (Most Likely Issue)

The "Loading" issue is usually caused by missing database tables. Follow these steps:

1. **Go to your Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project: `sdcbgfykkfywnetgakqx`

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run the Database Schema**
   - Copy the entire contents of `supabase-schema.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute

4. **Verify Tables Created**
   - Go to "Table Editor" in the left sidebar
   - You should see these tables:
     - `patient_profiles`
     - `conversation_sessions`
     - `messages`
     - `trigger_history`
     - `recovery_progress`

### 2. Check Environment Variables

Your `.env` file looks correct, but verify these values:

### 3. Test the Application

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open browser console** (F12) to see debug messages

3. **Look for the debug panel** in the top-right corner showing:
   - Auth State
   - Environment variables
   - Database connection status

### 4. Common Issues & Solutions

#### Issue: "Database connection error"
**Solution:** Run the database schema in Supabase SQL Editor

#### Issue: "No patient profile found"
**Solution:** This is normal for new users - the app will create one automatically

#### Issue: "Environment variables missing"
**Solution:** Check that your `.env` file is in the project root and has the correct values

#### Issue: "Supabase project not found"
**Solution:** Verify your project URL and anon key in the Supabase dashboard

### 5. Manual Database Test

You can test the database connection manually:

1. **Open browser console** (F12)
2. **Run this test:**
   ```javascript
   // Test Supabase connection
   fetch('https://sdcbgfykkfywnetgakqx.supabase.co/rest/v1/patient_profiles?select=count', {
     headers: {
       'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkY2JnZnlra2Z5d25ldGdha3F4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5Nzk4NTMsImV4cCI6MjA2ODU1NTg1M30.NZdb7NhvHcpz93SvIkAMQ5RI0oj6bspd7c88o41vJ_I',
       'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkY2JnZnlra2Z5d25ldGdha3F4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5Nzk4NTMsImV4cCI6MjA2ODU1NTg1M30.NZdb7NhvHcpz93SvIkAMQ5RI0oj6bspd7c88o41vJ_I'
     }
   }).then(r => r.json()).then(console.log).catch(console.error)
   ```

### 6. Expected Behavior After Fix

1. **First load:** Should redirect to `/auth` for login/registration
2. **After login:** Should show the chat interface
3. **Debug panel:** Should show "✅ Connected" for database
4. **Console:** Should show successful profile loading

### 7. Remove Debug Component (After Fix)

Once everything is working, remove the debug component:

1. Remove this line from `src/App.jsx`:
   ```jsx
   <DebugInfo />
   ```

2. Delete the file `src/components/DebugInfo.jsx`

## 🆘 Still Having Issues?

If the problem persists:

1. **Check browser console** for specific error messages
2. **Verify Supabase project** is active and not paused
3. **Test with a fresh browser session** (incognito mode)
4. **Check network tab** for failed API requests

## 📞 Support

The most common cause is missing database tables. Make sure to run the `supabase-schema.sql` file in your Supabase SQL Editor! 