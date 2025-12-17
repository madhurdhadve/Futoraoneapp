# Instagram URL Integration - Summary

## Changes Made

I've successfully added Instagram URL support to your application with smart click handling! Here's what was implemented:

### 1. Database Schema
- **Migration File**: `supabase/migrations/20251217120000_add_instagram_url.sql`
- Added `instagram_url` column to the `profiles` table

### 2. TypeScript Types
- Updated `src/integrations/supabase/types.ts` to include `instagram_url` field in profiles Row, Insert, and Update types

### 3. Profile Components

#### UserProfile.tsx (Viewing other users' profiles)
- Added `instagram_url` to Profile interface
- Created `SocialLinkButton` component with smart click handling:
  - **If URL exists**: Opens the social media link in a new tab
  - **If URL doesn't exist and it's another user's profile**: Shows "Not Connected" toast
  - **If URL doesn't exist and it's your own profile**: Navigates to edit profile page

#### Profile.tsx (Your own profile)
- Added `instagram_url` to Profile interface  
- Integrated same `SocialLinkButton` component
- All social icons now show for everyone (grayed out if not connected)

#### EditProfileDialog.tsx
- Added Instagram URL input field between LinkedIn and Portfolio
- Updated form data state and submission to include Instagram URL

## Features

### Visual Indicators
- **Connected**: Full opacity social icon, clickable
- **Not Connected**: 50% opacity (grayed out), still clickable

### Smart Behavior
1. **For the profile owner (you)**:
   - Click on grayed out icon → Opens edit profile dialog
   - Shows toast: "Complete Your Profile - Add your Instagram URL in the edit profile section"

2. **For other users**:
   - Click on grayed out icon → Shows error toast
   - Toast message: "Not Connected - This user hasn't connected their Instagram account yet"

3. **For everyone when URL is added**:
   - Click opens the URL in a new tab

## How to Apply Database Migration

Since PowerShell execution is restricted, you need to apply the migration manually through Supabase Dashboard:

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** (in the left sidebar)
3. Click **+ New Query**
4. Copy and paste the migration SQL:

```sql
-- Add Instagram URL column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS instagram_url TEXT;

-- Add comment to the column
COMMENT ON COLUMN profiles.instagram_url IS 'User Instagram profile URL';
```

5. Click **Run** to execute the migration

## Testing

After applying the migration:

1. **View your own profile** → You should see 4 social icons (GitHub, LinkedIn, Instagram, Website)
2. **Click a grayed out icon** → Should open edit profile dialog
3. **Add your Instagram URL** in the edit profile
4. **View another user's profile** → Click their social icons
5. **Test the "Not Connected" toast** by clicking a grayed out icon on another user's profile

## Files Modified

- `supabase/migrations/20251217120000_add_instagram_url.sql` (new)
- `src/integrations/supabase/types.ts`
- `src/pages/UserProfile.tsx`
- `src/pages/Profile.tsx`
- `src/components/EditProfileDialog.tsx`

All changes are backward compatible - existing profiles without Instagram URLs will work perfectly!
