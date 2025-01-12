# To-Do List for Full Compatibility

1. **Check handle_new_user triggers**:
   - If your DB automatically inserts into `public.users` on user creation (via `auth.users`), ensure the function references the correct columns in `public.users`.
   - If you do not want that automatic insertion, remove the trigger and handle it manually in code.

2. **Check references to old columns**:
   - If your old code references `users.status` or `users.username`, confirm that it aligns with the new table definitions. The new schema has `username`, `status`, and `email` as text columns. Make sure we are populating them properly.
   - If you see references to `auth.users.email`, confirm if that is needed or replaced by `public.users.email`.

3. **Confirm the new table: `users`**:
   - The new schema has columns (id, email, username, display_name, etc.). Make sure your code is not referencing a nonexistent field like `name` or `auth_id`.

4. **Validate all supabase function calls**:
   - Check `lib/Store.js`, `_app.js`, `Layout.js` for any direct references to the old `auth.users` approach or mismatched column names. Update them accordingly.

5. **Retest**:
   - After these changes, sign up a new user. 
   - Confirm the user is inserted into `auth.users` (by Supabase) and `public.users` (by your handle_new_user function or manually).

6. **Ensure Polices are correct**:
   - In the new schema, you have RLS policies. Make sure your user insertion policy matches (`INSERT` policy “Insert your own user row”). If you see an error “Database error saving new user,” likely the user policy or a constraint is failing.