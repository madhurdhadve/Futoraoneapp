# Lovable/Cursor Prompt: Automate Gamification & XP System

**Context:**
I have set up the `profiles` table with `xp`, `level`, `current_streak`, and an `achievements` table in Supabase. The frontend components (`AchievementShowcase.tsx` and `GamificationWidget.tsx`) are already wired to display this data.

**Goal:**
I need you to implement the **Database Triggers and Edge Functions** to make this system "alive". Users should automatically earn XP and badges based on their actions.

**Requirements:**
Please create a Supabase Migration (SQL) or Edge Functions to handle the following logic:

### 1. XP Awards (Triggers)
- **Posting**: When a user inserts a row into `posts`, give them **50 XP**.
- **Liking**: When a user inserts a row into `likes`, give the *author* of the post **10 XP**.
- **Commenting**: When a user inserts a row into `comments`, give them **20 XP**.

### 2. Level Up Logic
- Calculate user level based on XP: `Level = floor(sqrt(XP / 100))`.
- Automatically update the `level` column in `profiles` whenever `xp` changes.

### 3. Achievement Unlocking
Create a trigger that checks conditions after every activity:
- **"First Steps"**: If `(SELECT count(*) FROM posts WHERE user_id = NEW.user_id) >= 1`, insert into `user_achievements` (if not exists).
- **"Regular Contributor"**: If post count >= 10.
- **"Social Butterfly"**: If received likes >= 50.

### 4. Daily Streak System
- When a user performs any action (or logs in), compare `last_activity_date` with `NOW()`.
- If it's the next day (consecutive), increment `current_streak`.
- If it's > 48 hours later, reset `current_streak` to 1.
- If it's the same day, do nothing.

**Deliverables:**
- A single `.sql` file containing all the necessary Functions and Triggers.
