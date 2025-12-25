# FutoraOne Deep Technical Documentation

This document provides a low-level, technical overview of the FutoraOne application to facilitate safe debugging, full control, and zero-loss maintenance.

## 1️⃣ EXACT DATA FLOW

### Feed & Posts
**Flow:** `Feed.tsx` → `FeedPost.tsx` → `useFeedLogic.ts` → Supabase SDK → `public.posts` → RLS policies → JSON Response
- **Hook:** `useFeedLogic.ts` (Handles pagination, likes, saves, and real-time updates)
- **Tables:** `posts`, `profiles`, `likes`, `comments`, `saves`, `post_reactions`
- **Edge Functions:** None (Direct DB via SDK)
- **RLS Policy:** 
  - `posts`: `SELECT` (Authenticated), `INSERT/UPDATE/DELETE` (Owner)
  - `likes`: `SELECT` (Public), `INSERT/DELETE` (Auth user)
- **What breaks:** Feed disappears or fails to update; social interactions (like/save) fail.

### Authentication
**Flow:** `Welcome.tsx` → `Auth.tsx` → Supabase Auth → `auth.users` → DB Trigger → `public.profiles`
- **Hook:** None (Direct Supabase Auth SDK)
- **Tables:** `auth.users` (Internal), `public.profiles` (Mirrored)
- **What breaks:** Users cannot log in; profile data becomes desynced from Auth metadata.

### Profile
**Flow:** `Profile.tsx` → Supabase SDK → `public.profiles` → RLS Policy → Profile State
- **Hook:** Inline `useEffect` + `refreshProfile` callback
- **Tables:** `profiles`, `projects`, `follows`, `user_achievements`
- **RLS Policy:** `profiles` (Select: All, Update: Owner-only)
- **What breaks:** Users see blank profiles; bio/avatar updates fail.

### Chat & Messaging
**Flow:** `Messages.tsx` → `Chat.tsx` → Supabase Channel → `public.messages` → RLS → UI Update
- **Hook:** `useTypingIndicator.ts`, `useUnreadMessages.tsx`
- **Tables:** `conversations`, `conversation_participants`, `messages`, `tech_matches`
- **RLS Policy:** Access limited to users where `auth.uid() = user_id` in `conversation_participants`.
- **What breaks:** Messages fail to send; real-time updates stop; unauthorized access to private chats.

### AI Tools (Mentor, Companion, Enhancer)
**Flow:** `AIPage.tsx` / `useAIMentor.ts` → Supabase Edge Function (`ai-mentor`) → Google Gemini API → Response
- **Hook:** `useAIMentor.ts`
- **Edge Function:** `ai-mentor` (Handles system prompts for various modes)
- **Rate Limits:** Handled via Gemini API quotas.
- **What breaks:** "AI Service Error" appears; chatbots stop responding.

---

## 2️⃣ AUTHENTICATION LIFECYCLE

### 🟢 Signup
1. `Auth.tsx` calls `supabase.auth.signUp`.
2. Supabase Auth creates entry in `auth.users`.
3. **Database Trigger:** `on_auth_user_created` fires `public.handle_new_user()`.
4. **Table Touch:** `public.profiles` receives a new row with `id` from `auth.users`.
5. **Persistence:** Auth session is stored in `localStorage` by the SDK.

### 🟡 Session & Protection
- **Persistence:** `App.tsx` and `Auth.tsx` use `supabase.auth.onAuthStateChange` to listen for session events.
- **Protected Routes:** Enforced via component-level checks (e.g., `useEffect` with `navigate("/auth")` in `Feed.tsx`, `Profile.tsx`).
- **Refresh:** On page load, `supabase.auth.getSession()` restores the user from `localStorage`.

### 🔴 Logout
- `supabase.auth.signOut()` clear the `localStorage` session and triggers `onAuthStateChange`.
- UI redirects to `/` or `/auth`.

---

## 3️⃣ FILE USAGE MAP

| Path | Status | Use / Dependencies | Criticality |
| :--- | :--- | :--- | :--- |
| `src/hooks/useFeedLogic.ts` | **YES** | Core logic for the main feed | 🔴 Critical |
| `src/contexts/UserPresenceContext.tsx` | **YES** | Real-time presence tracking | 🟡 Conditional |
| `src/integrations/supabase/types.ts` | **YES** | Generated database types | 🔴 Critical |
| `public/OneSignalSDKWorker.js` | **NO** | Legacy. Replaced by Firebase/FCM | 🟢 Safe |
| `supabase/migrations/*.sql` | **YES** | Database schema and RLS | 🔴 Critical |
| `public/firebase-messaging-sw.js` | **YES** | Service worker for FCM notifications | 🔴 Critical |


---

## 4️⃣ ENVIRONMENT VARIABLES & SECRETS

| Variable | Public/Private | Component Access | Impact of Change |
| :--- | :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | **Public** | `client.ts` | Site breaks (no database connection) |
| `VITE_SUPABASE_ANON_KEY`| **Public** | `client.ts` | Permission denied errors |
| `GEMINI_API_KEY` | **Private** | `ai-mentor` (EF) | AI tools fail to respond |
| `FIREBASE_SERVER_KEY` | **Private** | `send-fcm-notification` (EF)| Push notifications fail |
| `SUPABASE_SERVICE_ROLE_KEY`| **Private** | Admin Scripts | DANGEROUS: Bypasses RLS |

---

## 5️⃣ EDGE FUNCTIONS & API CONTRACTS

### `ai-mentor`
- **Caller:** `useAIMentor.ts`
- **Payload:** `{ messages: Message[], mode: string }`
- **Response:** `{ generatedText: string }`
- **Security:** Requires `anon` key or JWT for access.

### `send-fcm-notification`
- **Caller:** Post/Comment hooks or UI
- **Payload:** `{ tokens: string[], title: string, body: string, data?: object }`
- **Security:** Requires Service Role key on server; internal use only.

---

## 6️⃣ REAL-TIME & SUBSCRIPTIONS

1. **Tables using Realtime:** `messages`, `conversations`, `notifications`, `likes`, `comments`.
2. **Lifecycle:** Channels are opened in `useEffect` and cleaned up using `supabase.removeChannel(channel)`.
3. **Risks:** 
   - **Memory Leaks:** Forgetting to remove channels on component unmount (partially handled in `Chat.tsx`).
   - **Disconnects:** Handled by Supabase SDK auto-reconnect.
4. **Broadcast:** Presence and Typing indicators use `broadcast` events, which are non-persistent.

---

## 7️⃣ ERROR HANDLING & DEBUGGING

- **Frontend:** Handled by `GlobalErrorBoundary.tsx` (catches crashes) and `use-toast` (notifies user).
- **Supabase:** Errors returned in `{ data, error }` objects.
- **Failures:** 
  - `ChunkLoadError`: Caught by Error Boundary, triggers auto-refresh.
  - `RLS Violation`: Appears in Console as `403 Forbidden`.
- **Debugging:**
  1. Check `import.meta.env` values in Network tab.
  2. Inspect Supabase Edge Function logs in the Supabase Dashboard.

---

## 8️⃣ PERFORMANCE & COST RISK

- **Slowdown:** `Profile.tsx` fetches all data (posts, projects, follows) in parallel; as datasets grow, this will increase load time.
- **Reads:** Real-time subscriptions for message lists trigger many re-fetches.
- **Caching:** Global `queryClient` (React Query) handles persistence with a 1-hour GC time.

---

## 9️⃣ SAFE CLEANUP PREVIEW

- **Unused Assets:** `public/OneSignalSDKWorker.js`, `public/OneSignalSDKWorker.js.map`.
- **Redundant Env:** Any reference to `VITE_ONESIGNAL_APP_ID` in older `.env.example` files.
- **Legacy Components:** None identified; the current component tree in `src/components/chat` is actively used by `Messages.tsx` and `Chat.tsx`.

