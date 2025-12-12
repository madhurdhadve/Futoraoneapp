# Lovable/Cursor Prompt: Complete Backend Implementation for New Features

**Context:**
I have just updated the frontend of "FutoraOne" with enhanced Gamification, Category Pages, and Topic Pages. Currently, these pages rely on frontend filtering or demo data. I need you to implement the **Database Schema, Triggers, and Edge Functions** in Supabase to make these features fully functional and persistent.

**Goal:**
Update the Supabase backend to support:
1.  **Real Categorization**: Posts should have real categories/tags.
2.  **Topic Following**: Users should be able to follow hashtags (e.g., #React, #AI).
3.  **Active Gamification**: Triggers to automatically award XP and achievements.

---

## 🛠️ Tech Stack
- **Database**: Supabase (PostgreSQL)
- **ORM/Query**: Supabase JS Client
- **Language**: PL/pgSQL (for database functions/triggers)

---

## 📋 Requirements

### 1. Categories & Topics System
The `CategoryPage` and `TopicPage` currently filter posts on the client side. We need database support.

*   **Modify `posts` table**:
    *   Add a `category` column (text or enum) to store the main category (e.g., 'AI & ML', 'Web Dev').
    *   Add a `tags` column (text array `text[]`) to store hashtags extracted from content (e.g., `['#react', '#typescript']`).
*   **Auto-Extraction Trigger**:
    *   Create a DB trigger that automatically extracts hashtags from `content` whenever a post is inserted/updated and populates the `tags` column.
*   **Topic Follows**:
    *   Create a new table `topic_follows`:
        *   `id` (uuid, pk)
        *   `user_id` (uuid, ref profiles.id)
        *   `topic` (text, e.g., 'react')
        *   `created_at`

### 2. Gamification Triggers (XP & Badges)
We have the frontend animations, now we need the logic.

*   **XP System**:
    *   Create a function `give_xp(user_id, amount)` that updates `profiles.xp` and recalculates `profiles.level`.
    *   **Triggers**:
        *   **New Post**: +50 XP
        *   **New Comment**: +20 XP
        *   **Received Like**: +10 XP (to the post author)
*   **Achievement System**:
    *   Ensure `achievements` and `user_achievements` tables exist.
    *   **Seed Data**: Insert default achievements if missing:
        *   "First Post" (ID: first-post)
        *   "Social Butterfly" (ID: 50-likes)
        *   "Commentator" (ID: 10-comments)
    *   **Unlock Logic**:
        *   Write a trigger that checks conditions after every Post/Like/Comment action and inserts into `user_achievements` if criteria are met.

### 3. Performance Indexes
To support the "Mutual Followers" and "Topic Search" features:

*   Add a **GIN Index** on `posts.tags` for fast array searching.
*   Add a composite index on `follows(follower_id, following_id)` for the mutual followers check.
*   Add an index on `topic_follows(user_id, topic)`.

---

## 📝 Deliverables

Please provide a **single SQL Migration file** (e.g., `20251210_backend_features.sql`) that:
1.  Alters the `posts` table.
2.  Creates the `topic_follows` table with RLS policies (Users can manage their own follows).
3.  Creates the Hashtag Extraction function & trigger.
4.  Creates the XP & Leveling functions & triggers.
5.  Inserts the Seed Data for Achievements.
6.  Adds the necessary Indices.

**Note:** Ensure all RLS (Row Level Security) policies are secure.
