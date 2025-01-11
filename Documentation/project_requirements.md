Below is a **Project Requirements Document** (PRD) specifically **tailored for junior developers**. The goal is to be **deterministic**, **explicit**, and **highly specific**, ensuring no guesswork. Junior devs can reference this PRD to know exactly **what** we’re building, **why** we’re building it, and **how** each piece connects—no ambiguity involved.

---

# **Project Requirements Document (Junior Developer Edition)**

## **1. Overview & Objectives**

1. **Project Name**: **Talk2D2**  
   - **Goal**: Create a **Slack/Discord-like** real-time Star Wars–themed messaging platform with **advanced AI integration**.

2. **Core Objectives**:
   1. **Star Wars Theming**: Avatars, backgrounds, emojis, etc.  
   2. **Channels & Workspaces**: Slack/Discord-like structure.  
   3. **Direct Messages**: 1-to-1 or group DMs.  
   4. **AI Features**:  
      - **Auto Summaries**: Summaries pinned at thread tops or in a special table.  
      - **Real-Time AI Suggestions**: Provide possible completions while user types.  
      - **AI Auto-Reply**: If user sets “AI persona,” the system responds to `@mentions`.  
   5. **Voice Calls**: WebRTC calls with user or AI TTS.  
   6. **Notifications, Reactions, Pinned Items,** etc.

3. **Audience**: Anyone wanting real-time chat with a Star Wars flair plus advanced AI.  

4. **Constraints**:
   - Must use **Supabase** for DB, Auth, Realtime, and Storage.  
   - The DB schema is designed so we **never** do migrations again (using JSONB placeholders).

---

## **2. Detailed Scope & Features**

### **2.1 User Onboarding & Profiles**

- **Users** sign up via **Supabase Auth** (email/password or OAuth).
- After sign-up, the user sees a **Profile Setup** wizard:
  1. **Pick a Star Wars avatar** from a bucket (`avatars`).  
  2. **Choose display name & username** (username must be unique).  
  3. **Optional**: Upload writing samples or doc references to `ai_documents` for advanced AI persona.  
  4. **Set preferences** like “AI auto-reply on/off,” “faction,” “status.”  

- The user can always **edit** these in the **Profile Page**.  
- The `users` table has columns: 
  - `id, email, username, display_name, avatar_url, status, faction, preferences, ai_persona, metadata, etc.`  
- **Implementation**: 
  - Insert into `users` with `id=auth.uid()`.  
  - RLS ensures only the user can update their row.

### **2.2 Workspaces & Channels**

- Each **workspace** (like a Slack “server”) can hold multiple **channels**:
  - `workspaces` table: `id, name, owner_id, workspace_type, ...`
  - `workspace_members` table: which user is in which workspace.  
- **Channels** can be text-based or voice-based:
  - `channels` table: `id, workspace_id, channel_type, name, description, is_private, ...`
  - `channel_members` table: track membership.  
- **“Less secure”** approach means any user can see the workspace and join. The channel listing is also open. Later, we can add more membership checks if needed.

### **2.3 Direct Messaging**

1. **dm_rooms**: A record representing a DM “room.”  
2. **dm_room_members**: Who is in that DM (2 or more users).  
3. **direct_messages**: The actual messages.  
4. **Implementation**: 
   - The user creates a `dm_room`.  
   - They add themselves + others to `dm_room_members`.  
   - Then post in `direct_messages`.  

**By default** in this project, all DMs are visible to all users due to minimal RLS. If you want privacy in the future, we add membership-based RLS checks.

### **2.4 Channel Messages, Reactions, Pinning**

1. **messages** table:
   - For **channel-based** messages.  
   - Columns: `id, channel_id, user_id, message_text, attachments, mentions, metadata, ...`.
2. **pinned_messages** table:
   - Ties a pinned item to a channel or DM.  
   - “Less secure” means no membership check, so any user can pin any message.  
3. **message_reactions**:
   - Tracks emoji reactions: `id, message_id, user_id, emoji, ...`.  
4. Optional **thread_summaries**:
   - If you want to store auto-generated thread summaries in a separate table.  

### **2.5 AI Summaries & Real-Time Suggestions**

- **Auto Summaries**: A background job calls GPT, takes recent messages from `messages`, generates a summary, and either:
  1. Inserts into `messages` with a “is_summary=true” metadata, or
  2. Inserts into `thread_summaries`.
- **Real-Time Suggestions**:
  - The user is typing in the front-end. You partially send the text to GPT.  
  - GPT returns next words. The user can accept or ignore. No special DB structure needed, ephemeral in the front-end.

### **2.6 Voice Calls**

- **call_sessions** table:
  - `id, call_type, channel_id, dm_room_id, initiator_id, participants JSON, started_at, ended_at, ...`
- Real-time voice typically uses WebRTC or a separate call server. We just store session metadata in `call_sessions`.
- For AI calls: 
  - TTS config can go in `call_sessions.metadata`.

### **2.7 Notifications**

- **notifications** table:
  - `id, user_id, notification_type, title, body, link, is_read, metadata`.
- Example:
  - If the user is mentioned, a row is inserted.  
  - The user sees it in the front-end.  
  - RLS ensures only `user_id=auth.uid()` can see it.

### **2.8 Moderation (Optional)**

- **moderation_actions** table:
  - `id, workspace_id, channel_id, acted_upon_id, acted_by_id, action_type, reason, expires_at, metadata`.
- We allow everyone to see everything (“less secure”), but typically only “admins” insert or update.

### **2.9 Custom Emojis & Slash Commands**

- **custom_emojis**:
  - `id, emoji_name, image_url, is_global, metadata, ...`
  - The user can add them referencing a Supabase Storage bucket with Star Wars icons.
- **slash_commands**:
  - `id, command, description, permissions, ...`
  - If the user types `/poll`, the system looks it up in this table, triggers the code.

---

## **3. Data Architecture & RLS**

1. **All** tables are in the `public` schema.  
2. Each table has **RLS** enabled.  
3. **Reading** typically uses `USING (true)` → everyone can see.  
4. **Writing** uses checks like `WITH CHECK ( user_id = auth.uid() )` or `WITH CHECK ( pinned_by = auth.uid() )`. 
5. **No** future migrations needed because:
   - Each table has `metadata`, `placeholder_1`, `placeholder_2`, or similar columns to store expansions.

**Yes**, that means any user can read almost everything (DMs, channels, workspaces). That is the official design for now.

---

## **4. Implementation Details**

### **4.1 Table Creation & Policies**

- Refer to the **Backend Structure Document** for the **exact** SQL commands.
- For each table, run:

```sql
DROP TABLE IF EXISTS public.<table_name> CASCADE;
CREATE TABLE public.<table_name> (...);
ALTER TABLE public.<table_name> ENABLE ROW LEVEL SECURITY;
CREATE POLICY ...
```

**Important**: If you run them in a different order or skip lines, you might end up with dependency errors or missing data.

### **4.2 Using the Tables in Code**

1. **Inserting** to `messages` example:
   ```js
   const { data, error } = await supabase
     .from('messages')
     .insert([{
       id: crypto.randomUUID(),
       channel_id: someChannelId,
       user_id: userIdFromAuth,
       message_text: "Hello"
     }])
   ```
   - This passes RLS if `user_id == auth.uid()`.

2. **Selecting** from `messages`:
   ```js
   const { data, error } = await supabase
     .from('messages')
     .select('*')
     .eq('channel_id', someChannelId)
   ```
   - RLS is wide open for read, so no membership check is needed.

3. **Patching** a user row:
   ```js
   await supabase
     .from('users')
     .update({ display_name: "Luke Skywalker" })
     .eq('id', userIdFromAuth)
   ```
   - Must match `id=auth.uid()`. Otherwise fails RLS.

---

## **5. Project Phases**

1. **MVP**:
   - Basic sign-up, user profiles, channels, DMs, real-time messaging.  
   - Possibly one AI feature (auto summary or auto reply).
2. **Advanced**:
   - Voice calls with TTS, slash commands, ephemeral messages.  
   - Improved membership checks for real privacy.  
   - More robust moderation if large communities appear.

---

## **6. Junior Dev FAQ**

1. **“Why can I read everyone’s direct messages?”**  
   Because we set `USING (true)` in the RLS for “Select direct_messages.” If you want privacy, we must add a membership check.

2. **“I got a policy violation error inserting data. Why?”**  
   You likely used `user_id` not matching your `auth.uid()`, or pinned a message with `pinned_by` not matching your ID.

3. **“How do we store a user’s AI data?”**  
   - **Brief** preferences → in `users.ai_persona`.  
   - **Large** doc references → `ai_documents` with `owner_user_id`.

4. **“Why do we have placeholders?”**  
   - So we never do migrations again. We can put anything new in `metadata` or `placeholder_1`.  

5. **“Where do I store attachments?”**  
   - In `messages.attachments` or `direct_messages.attachments`, each is a JSON array of file info.  
   - The actual file goes in Supabase Storage.

---

## **7. Acceptance Criteria**

1. **Supabase** has all ~15 tables with the columns specified here.  
2. **RLS** is on each table.  
3. **User** can do basic flows: sign up, create workspace, create channel, send messages, see them in real time, react, pin, etc.  
4. **AI** auto-summaries or auto-replies are at least partly functional.  
5. **No** schema migrations needed later because we have placeholders for expansions.

---

## **8. Conclusion**

**This** Project Requirements Document spells out exactly:

- **What**: Slack/Discord-like Star Wars chat with AI.  
- **How**: Using 15 “less secure” RLS tables in Supabase.  
- **Why**: Future-proof, no migrations, easy theming, advanced AI.  
- **Where**: Each table in the `public` schema, with placeholders for expansions.

Please **follow** these instructions precisely. If you do, you’ll match the final spec exactly and create a consistent, frictionless dev environment. If something breaks, re-check your `RLS` policies or the user’s `auth.uid()`. 

**End** of Junior Dev PRD. If you have more questions, re-read these sections or contact the lead.