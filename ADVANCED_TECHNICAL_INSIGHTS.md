# FutoraOne: Advanced Technical Insights

This document summarizes the final 5% of advanced, non-breaking architectural knowledge for FutoraOne. These insights are for awareness and safe maintenance.

## 1️⃣ TESTING STATUS

- **Current Coverage**: **No tests present in codebase.**
- **Verification**: No `tests/` directory found; no files matching `*.test.ts` or `*.spec.ts` exist in the repository.
- **Normal Locations**: In a standard React/Vite project, unit tests would reside in `src/__tests__/` and E2E tests in a root `e2e/` folder using Playwright or Cypress.
- **Risk**: Without automated tests, any modification to core logic (like `useFeedLogic.ts` or RLS triggers) requires manual regression testing across the entire app to prevent breaking existing features.

---

## 2️⃣ CI / CD & DEPLOYMENT AUTOMATION

- **Status**: **No CI/CD configured.**
- **Verification**: No `.github/workflows` folder or third-party CI config files (e.g., `vercel.json`, `netlify.toml`) are present in the root.
- **Triggers**: Deployment is currently a **manual process**.
- **Process**: On push to the `main` branch, no automated build or deployment is triggered from within this repository. Deployment likely occurs via manual terminal commands (e.g., `npm run build` followed by a manual upload of `dist/`).

---

## 3️⃣ INFRASTRUCTURE & SERVICE BOUNDARIES

The application operates across four distinct service boundaries:

| Service | Responsibility | Management |
| :--- | :--- | :--- |
| **Supabase** | Database, Auth, Storage, Edge Functions, RLS | **Fully Managed** |
| **Google Gemini**| Generative AI and content enhancement logic | **Managed API** |
| **Firebase** | PWA Cloud Messaging (FCM) and Notifications | **Managed API** |
| **Frontend** | Routing, State, UI, and client-side validation | **Project Code** |

**Single Points of Failure:**
- **Supabase Connectivity**: If the Supabase project is paused or keys are rotated incorrectly, the entire app (Auth + Data) goes offline.
- **Gemini API Key**: If the key is revoked or quota-limited, all AI features (Mentor, Roadmap, Enhancer) stop working immediately.

---

## 4️⃣ SCALING & COST AWARENESS

Based on the current architecture, resource usage scales as follows:

| Feature | Resource Impact | Cost Risk |
| :--- | :--- | :--- |
| **Feed & Reels** | High Database Reads (Media heavy) | **Medium** |
| **AI Tools** | Edge Function Invocations & Gemini API Hits | **High** |
| **Global Chat** | Realtime Channel connections & Broadcasts | **Medium** |
| **Leaderboards** | CPU-intensive aggregate queries | **Low** |

**Scaling Risks:**
- **Realtime Load**: As concurrent users increase, the proximity/broadcast usage in `UserPresenceContext` will consume more Supabase Realtime slots.
- **Media Costs**: Heavy video usage in `TechReels` will increase Supabase Storage bandwidth consumption.

---

## 5️⃣ DATA BACKUP & RECOVERY STATUS

- **Automated Backups**: Depends on Supabase project tier (usually daily automated backups for Pro tier, none for Free tier by default).
- **Manual Backups**: No dedicated backup scripts found in `scripts/`. `setup-db.js` is for initialization, not recovery.
- **Recovery Limitations**: Recovery is limited to the latest database snapshot provided by Supabase. Point-in-time recovery depends on specific Supabase settings.

---

## 6️⃣ SECURITY POSTURE

- **RLS Coverage**: RLS is **enforced** on all core tables (profiles, posts, messages).
- **Public Access**: Tables like `profiles` have public `SELECT` access, but `UPDATE` is strictly locked to the authenticated owner.
- **Secret Hygiene**: No `SERVICE_ROLE_KEY` is exposed in the `src/` directory. All admin-privileged actions are siloed in the `scripts/` folder or handled inside Edge Functions.
- **Frontend Reliance**: Some navigation logic (admin dashboard access) relies on frontend context (`useIsAdmin.tsx`), but the underlying API is secured by database-level policies.

---

## 7️⃣ OWNERSHIP & MAINTENANCE

- **Manual Monitoring**: Supabase Edge Function logs and Gemini API usage must be monitored manually via their respective dashboards.
- **Managed Lifecycle**: Supabase automatically handles database patching, scaling (if enabled), and security at the infrastructure level.
- **Technical Debt**: The absence of a test suite is the primary maintenance risk as the project grows or new developers join the team.
