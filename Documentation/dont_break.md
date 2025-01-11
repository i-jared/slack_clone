# **dont_break.md**

This file lists **all** Supabase objects—**tables**, **columns**, **relationships**, and **indexes**—that have been created so far. **Do not rename**, **remove**, or otherwise modify** them. Doing so will break our application logic, foreign key references, ORM configurations, and existing code.

You **can add** new fields or tables, but must **not** change or delete any item in the existing schema described below.

---

## **1. Tables and Relationships**

These tables and their columns are the **foundation** of our application (chat system, AI training, user profiles, etc.). The **table names** and **column names** must remain **exactly** as shown.

### **1.1. `messages`**

- **`id`** *(Primary Key)*
- **`user_id`** *(Foreign Key → `user_profiles.id`)*
- **`content`** *(Text content of the message)*
- **`created_at`** *(Timestamp – automatically set when created)*
- **`updated_at`** *(Timestamp – automatically set when updated)*

**Relationships & Constraints**:
- `messages.user_id` → references `user_profiles.id`
- No renaming (`messages` → `message` or otherwise) allowed.

### **1.2. `message_attachments`**

> **Important**: Must remain as **`message_attachments`**, **not** `message-attachments` or anything else.

- **`id`** *(Primary Key)*
- **`message_id`** *(Foreign Key → `messages.id`)*
- **`file_url`** *(URL or path to the stored attachment)*
- **`file_type`** *(MIME type or descriptor)*
- **`created_at`**
- **`updated_at`**

**Relationships & Constraints**:
- `message_attachments.message_id` → references `messages.id`
- Changing this name (e.g., to `message-attachments`) **will break** all references.

### **1.3. `message_reactions`**

- **`id`** *(Primary Key)*
- **`message_id`** *(Foreign Key → `messages.id`)*
- **`user_id`** *(Foreign Key → `user_profiles.id`)*
- **`reaction_type`** *(Stores emoji or reaction string)*
- **`created_at`** *(Timestamp)*

**Relationships & Constraints**:
- `message_reactions.message_id` → references `messages.id`
- `message_reactions.user_id` → references `user_profiles.id`

### **1.4. `user_profiles`**

- **`id`** *(Primary Key, typically UUID)*
- **`email`**
- **`display_name`**
- **`avatar_url`**
- **`ai_persona`** *(For storing AI personalization data, e.g., user’s style or persona)*
- **`created_at`**
- **`updated_at`**

**Relationships & Constraints**:
- Referenced by `messages.user_id`, `message_reactions.user_id`, `user_settings.user_id`, and possibly others.
- Do **not** rename columns, e.g., `display_name` → `displayName`.

### **1.5. `user_settings`**

- **`id`** *(Primary Key; may or may not match `user_id`—depending on design)*
- **`user_id`** *(Foreign Key → `user_profiles.id`)*
- **`notifications_enabled`** *(Boolean)*
- **`theme_preference`** *(e.g., `light`, `dark`)*
- **`created_at`**
- **`updated_at`**

**Relationships & Constraints**:
- `user_settings.user_id` → references `user_profiles.id`

### **1.6. `ai_model_training`**

*(Only if your app is currently storing user-specific AI training data in Supabase.)*

- **`id`** *(Primary Key)*
- **`user_id`** *(Foreign Key → `user_profiles.id`)*
- **`model_type`** *(Which AI model is trained? GPT, BERT, custom, etc.)*
- **`training_data`** *(JSON or text containing user-provided examples, prompts, etc.)*
- **`created_at`**
- **`updated_at`**

**Relationships & Constraints**:
- `ai_model_training.user_id` → references `user_profiles.id`
- If you have a different table name for AI training data, **do not rename** it.

---

## **2. Indexes and Other Constraints**

Below are the key indexes and constraints we set up. These must **remain unchanged** to avoid performance issues or broken queries.

1. **`messages_pkey`**: Primary key on `messages.id`.  
2. **`message_attachments_pkey`**: Primary key on `message_attachments.id`.  
3. **`message_attachments_message_id_fk`**: Foreign key constraint linking `message_attachments.message_id` → `messages.id`.  
4. **`message_reactions_pkey`**: Primary key on `message_reactions.id`.  
5. **`message_reactions_message_id_fk`**: Foreign key constraint linking `message_reactions.message_id` → `messages.id`.  
6. **`message_reactions_user_id_fk`**: Foreign key constraint linking `message_reactions.user_id` → `user_profiles.id`.  
7. **`user_profiles_pkey`**: Primary key on `user_profiles.id`.  
8. **`user_settings_pkey`**: Primary key on `user_settings.id`.  
9. **`user_settings_user_id_fk`**: Foreign key constraint linking `user_settings.user_id` → `user_profiles.id`.  
10. **`ai_model_training_pkey`**: Primary key on `ai_model_training.id`.  
11. **`ai_model_training_user_id_fk`**: Foreign key constraint linking `ai_model_training.user_id` → `user_profiles.id`.

(Exact index naming may vary if Supabase auto-generates some names, but the references must remain intact.)

---

## **3. Why These Must Remain Unchanged**

- **Foreign Key Integrations**: Any schema change (renaming a table or column) breaks references in relational tables and causes query errors or silent failures.
- **Frontend & API Dependencies**: The front-end code references these **exact** table and column names. If changed, the UI or API calls will fail (404, 500, or unexpected data).
- **ORM / Supabase Client Configurations**: If you’re using Prisma, Supabase JS, or any other tooling, it expects these schema definitions. Changes cause migrations to fail or data to become inaccessible.
- **Event Triggers & Functions**: If we have any stored procedures or triggers referencing these names, renaming them invalidates those references.

---

## **4. Acceptable Modifications**

1. **Adding New Tables/Columns**: You can add new fields like `archived_at` or new tables like `audit_logs`—just do **not** delete or rename existing ones.
2. **Adding New Indexes**: Additional indexes to improve performance are allowed, as long as they don’t conflict with existing constraints.
3. **Altering Data Types**: Only if absolutely necessary and it does **not** break existing data relationships or code assumptions. (In most cases, data type changes should be avoided without a major version bump or a thorough migration plan.)
4. **Adding / Updating Default Values**: If you need default values for new columns, that’s fine. Just don’t remove or rename the existing columns in the process.

---

## **5. What Happens If Something Breaks**

1. **Immediately Revert** the change in both the database and the code.
2. **Remove or fix** any migrations or references that caused the break.
3. **Run All Tests** (unit, integration, e2e) to ensure everything is back to normal.
4. **Notify** the team if deeper fixes or data migrations are required.

---

## **6. Final Warnings & Best Practices**

- **Stick to snake_case** for any new tables and columns.  
- **Never** rename `message_attachments` to `message-attachments` or `messageAttachments`.  
- **Always** check with senior devs or consult this document before editing the database schema.
- **Keep timestamps** (`created_at`, `updated_at`) exactly as is, with auto-updates if possible.

**If in doubt, stop and ask.** Maintaining consistency in these critical schema components is crucial to our entire application.

---

### **This Document is Binding**

Any changes to items listed in **Sections 1 and 2** can cause complete disruption of essential features: chat, AI model training, user profiles, and more. Please handle with extreme caution.

**Add, do not replace.**

**Thank you for keeping our system stable!**