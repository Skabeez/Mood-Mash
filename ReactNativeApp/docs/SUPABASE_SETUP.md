# Supabase Database Setup

## Quick Setup Instructions

### 1. Run Database Schema

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `prgpmwgpyosfmnudllio`
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the entire contents of `supabase/schema.sql`
6. Paste into the SQL Editor
7. Click **Run** or press `Ctrl+Enter`

### 2. Configure Authentication Settings

1. In Supabase Dashboard, go to **Authentication** → **Providers**
2. Make sure **Email** provider is enabled
3. Go to **Authentication** → **URL Configuration**
4. Add your site URL: `http://localhost:8081`

### 3. Optional: Disable Email Confirmation (for testing)

If you want to test without email verification:

1. Go to **Authentication** → **Providers** → **Email**
2. Scroll down to **Email Settings**
3. **Uncheck** "Confirm email"
4. Click **Save**

### 4. Set Up Row Level Security (RLS) Policies

The schema.sql file includes RLS policies. After running it:

1. Go to **Authentication** → **Policies**
2. Verify policies are created for `users`, `user_preferences`, `recommendations`, etc.

### Common Issues

**"Database error saving new user"**
- Schema not run yet → Run schema.sql
- RLS blocking inserts → Check policies in the schema
- Users table doesn't exist → Run schema.sql

**"Invalid API key"**
- Wrong SUPABASE_ANON_KEY → Check `.env` file
- Wrong SUPABASE_URL → Check `.env` file

**"Email not confirmed"**
- Email verification required → Either set up email provider or disable confirmation

### Verify Setup

After running the schema, test by:
1. Try signing up with a new email
2. Check **Authentication** → **Users** in Supabase dashboard
3. Check **Table Editor** → **users** table

Your database should now have these tables:
- users
- user_preferences  
- recommendations
- recommendation_tracks
- listening_history
- user_favorites
- chat_sessions
- chat_messages
