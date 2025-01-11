Below is a **Tech Stack Document** specifically designed for **junior developers**, with **deterministic** details on which technologies are used, how they fit together, and why we chose them. We’ve aimed for a level of **explicit specificity** that leaves no ambiguity.

---

# **Tech Stack Document (Junior Dev Edition)**

## **1. Overall Architecture**

We are building a **Slack/Discord-like** real-time messaging platform with **Star Wars** theming, plus **advanced AI** integration. The entire stack is oriented around **Supabase** for the database, authentication, real-time events, and storage. On the front-end, we can use **Next.js** (or React) to handle user interfaces and calls to Supabase. The AI features rely on external LLM APIs (like GPT) plus optional TTS and STT services.

**Bird’s-Eye View**:
1. **Front-End**: Next.js or React code that calls `supabase` client.  
2. **Back-End**: Database + Auth + Real-time in **Supabase**.  
3. **AI Integration**: GPT or other LLM calls from front-end or serverless environment.  
4. **Storage**: Supabase storage buckets for avatars, attachments, custom emojis.

---

## **2. Components of the Tech Stack**

### **2.1 Database Layer (Postgres via Supabase)**

- **Location**: We use Supabase’s hosted Postgres.  
- **Schema**: Everything in `public` with ~15 tables (as described in the “Backend Structure Document”).  
- **RLS**: Row-Level Security is enabled on each table. “Less secure” approach means broad read access and minimal membership checks.

**Key Advantages**:
1. **No separate Postgres** hosting needed.  
2. **RLS** integrated with Supabase Auth → easy to block unauthorized writes.  
3. **Auto** real-time update feeds.

**Junior Dev Tip**: All queries are done through Supabase’s JavaScript client or the SQL Editor.

### **2.2 Authentication (Supabase Auth)**

- **Sign-Up**: Email/password or OAuth.  
- **Session**: On success, a JWT is stored. The user’s `auth.uid()` is used in RLS.  
- **User Data**: The `users` table references the same user `id`. They must match for RLS to allow updates.

**Key Variables**:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Junior Dev Tip**: If you see errors about “policy violation,” check that the user’s `id` matches `auth.uid()` in the data.

### **2.3 Real-Time Events (Supabase Realtime)**

- We use `supabase.channel('...').on('postgres_changes', ...)` to subscribe to inserts/updates/deletes on tables like `messages`.
- Because of RLS, only the rows the user can “select” show up in the feed.

**Flow**:
1. Front-end calls `supabase.channel('any-string')`.
2. We attach `.on('postgres_changes', { table: 'messages' }, callback)`.
3. We call `.subscribe()`.
4. Callback fires whenever a new row is inserted, updated, or deleted.

### **2.4 File & Media Storage (Supabase Storage)**

- **Buckets**: 
  - `avatars` for user avatars, 
  - `message_attachments` for chat attachments, 
  - `custom-emojis` (optional).
- **Policies**: We can define who can upload or read. Currently, we keep them fairly open for dev.

**Usage**:
1. **Front-End** calls `supabase.storage.from('avatars').upload(...)` to store a file.  
2. The DB references the resulting `publicURL` or signed URL in columns like `users.avatar_url`.

**Junior Dev Tip**: If a user tries to attach a file in a message, the front-end must first upload the file to `message_attachments`, then store the link in `messages.attachments`.

---

## **3. Front-End / Client**

Although the main “tech stack doc” focuses on the back end, let’s clarify the front-end:

1. **Next.js** or **React** for UI.  
2. **Supabase JS Client** for DB queries and real-time. 
3. **Optional** ephemeral logic for AI suggestions in the text box.

**Typical File**: `lib/supabaseClient.js`:

```js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

**Call Example**:
```js
// Insert a message
await supabase.from('messages').insert([
  {
    id: crypto.randomUUID(),
    channel_id: currentChannelId,
    user_id: authUserId, // must match auth.uid()
    message_text: "Hello from front-end"
  }
])
```

---

## **4. AI Integration**

1. **LLM** (like GPT-4 or GPT-3.5) for Summaries and In-Line Suggestions.  
   - Typically, we call the LLM from front-end or from a serverless function. 
   - Summaries get inserted into `thread_summaries` or posted as `messages` with `metadata.is_summary = true`.
2. **TTS** (Text-to-Speech) for voice calls with AI characters (like Vader). 
   - Possibly use a third-party like Eleven Labs. 
   - The entire call session’s data is stored in `call_sessions.metadata`.

**Key Flow**:
- **Auto-Summaries**: A background job or scheduled function queries recent messages → calls GPT → inserts summary.  
- **Auto-Reply**: If `users.preferences.ai_auto_reply = true`, we detect mentions → call GPT with user’s style → post response to `messages` or `direct_messages`.

**Junior Dev Tip**: Store large user docs in `ai_documents` (via `owner_user_id`). Don’t bloat the `users` table.

---

## **5. RLS & Security Model**

- **Less Secure**: Everyone can read almost everything. Only when writing do we confirm “the user is the same as the row’s user_id.” 
- If you see a “policy violation,” it means the user’s ID in the row didn’t match `auth.uid()`, or you tried to do something not allowed by the policy.

**Example**: If your code tries:

```js
await supabase
  .from('messages')
  .insert([{ user_id: "someone-else-id", message_text: "Oops" }])
```
You get a policy error because `user_id` != `auth.uid()`.

---

## **6. Deployment**

1. **Supabase**:
   - Hosted automatically. 
   - Manage environment variables in `.env.local` or in a serverless environment. 
2. **Front-End**: 
   - If Next.js, we can deploy to Vercel or Netlify. 
   - Must ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set in build environment.

**Junior Dev Tip**: Always ensure your `.env.local` matches your actual Supabase project. A mismatch leads to “auth or policy errors.”

---

## **7. Step-by-Step Setup for Junior Devs**

1. **Clone** the project repo.
2. **Install** dependencies (`npm install` or `yarn install`).
3. **Create `.env.local`** with:
   ```dotenv
   NEXT_PUBLIC_SUPABASE_URL="https://<your-supabase-ref>.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="<your-anon-key>"
   ```
4. **Supabase Setup**:
   1. Go to the Supabase dashboard → “SQL Editor.”  
   2. Copy/paste all the destructive queries from the “Backend Structure Document” in the correct order.  
   3. Confirm each table is created and RLS is enabled.  
5. **Run** the dev server: `npm run dev` or `yarn dev`.
6. **Test** sign-up, sign-in, channel creation, DM creation, etc.  
7. If you see errors:
   - Check `.env.local`.  
   - Check RLS policies.  
   - Ensure you’re using the user’s actual `id=auth.uid()` in your queries.

---

## **8. Additional Tools**

1. **Supabase Admin**: The “Table Editor” and “Policies” tabs help you see if RLS is enabled and what the policies are.  
2. **Storage**: The “Storage” tab to check or upload files.  
3. **Edge Functions**: For advanced serverless functions if we need scheduled tasks (like auto-summaries).
4. **AI API**: We might store an `OPENAI_KEY` or similar in a serverless environment. Junior devs just call `fetch` to that API with the user’s text.

---

## **9. Conclusion**

This **Tech Stack** is straightforward:

1. **Database** = Supabase Postgres  
2. **Auth** = Supabase Auth  
3. **Realtime** = Supabase Realtime w/ minimal RLS checks  
4. **Storage** = Supabase Storage for attachments, avatars, custom emojis  
5. **AI** = GPT for suggestions & summaries; TTS for voice calls  
6. **Front-End** = Next.js or React, using the `supabase` JavaScript client  
7. **Deployment** = Hosted on Vercel or Netlify + Supabase

**Follow** these instructions precisely, no guesswork. If you do, you’ll create a consistent, stable environment for building **Talk2D2** with real-time chat, AI enhancements, and Star Wars theming—**no** migrations needed later, and all with the full power of Supabase’s “less secure but frictionless dev” RLS.

**End** of Tech Stack Document. If anything fails, re-check each step—**the code** and **the environment** must match. Any new dev can read this doc and replicate the exact same environment.