# Database Troubleshooting Guide

## Issue: Diary entries and memories not saving to database

### Quick Diagnosis Steps

1. **Navigate to Test Page**: Go to `http://localhost:8081/test-features`
2. **Run Database Tests**: Click "Run Database Tests" button to see what's failing
3. **Check Browser Console**: Open Developer Tools (F12) → Console tab to see errors

### Common Issues & Solutions

#### 1. **Tables Don't Exist**
**Symptoms**: "relation does not exist" errors in console
**Solution**: 
- Go to [Supabase Dashboard](https://supabase.com/dashboard)
- Select project: `iwkmhcpuohbaeziohbqj`
- Go to SQL Editor
- Copy and run the contents of `src/database_setup.sql`

#### 2. **Authentication Issues**
**Symptoms**: "Not logged in" or "No couple" in test results
**Solution**:
- Login with: `harika@luv.com` / `password123`
- Or: `yash@luv.com` / `password123`
- Make sure you're in a couple (should auto-create)

#### 3. **RLS (Row Level Security) Issues**
**Symptoms**: "insufficient privileges" errors
**Solution**: The setup script includes permissive RLS policies, but if needed, run:
```sql
-- Disable RLS temporarily for testing
ALTER TABLE diary_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE photos DISABLE ROW LEVEL SECURITY;
```

#### 4. **Environment Variables**
**Symptoms**: "Supabase not configured" message
**Check your `.env` file**:
```
VITE_SUPABASE_URL=https://iwkmhcpuohbaeziohbqj.supabase.co 
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Testing Steps

1. **Basic Connection Test**
   - Open `http://localhost:8081/test-features`
   - Click "Run Database Tests"
   - Should show ✅ for all tests

2. **Manual Diary Test**
   - Go to "Diary Test" tab
   - Try adding a new entry
   - Should appear in list immediately
   - Check browser console for errors

3. **Manual Memory Test**
   - Go to "Memory Test" tab  
   - Try adding a new memory
   - Should appear in gallery immediately
   - Check browser console for errors

### Debug Information Available

The test page shows:
- ✅ Database connection status
- ✅ User authentication status  
- ✅ Couple relationship status
- ✅ Individual test results for each operation
- ✅ Detailed error messages

### Expected Behavior

**When Working Correctly:**
- Diary entries save and appear immediately
- Memories save and appear immediately  
- No infinite loading spinners
- Success toasts appear
- Data persists after page refresh
- Partner can see each other's entries

**When NOT Working:**
- Infinite loading spinners
- "Failed to save" error toasts
- Entries disappear after page refresh
- Console shows Supabase errors

### Quick Fix Commands

If tables are missing, run this in Supabase SQL Editor:
```sql
-- Quick table creation (basic version)
CREATE TABLE IF NOT EXISTS diary_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL,
  author_id UUID NOT NULL,
  author_name TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  mood TEXT,
  attachments TEXT[] DEFAULT '{}',
  is_private BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL,
  uploader_id UUID NOT NULL,
  uploader_name TEXT NOT NULL,
  data TEXT NOT NULL,
  caption TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Allow all operations (for testing)
ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on diary_entries" ON diary_entries FOR ALL USING (true);
CREATE POLICY "Allow all operations on photos" ON photos FOR ALL USING (true);
```

### Contact Points

- **Test Page**: `http://localhost:8081/test-features`
- **Console Logs**: Browser Developer Tools → Console
- **Supabase Dashboard**: https://supabase.com/dashboard/project/iwkmhcpuohbaeziohbqj
