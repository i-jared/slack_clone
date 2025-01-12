General Lessons: What Worked Well

1. **Strategic Console Logging**
   - Using emoji prefixes made logs easier to scan (🚀, ❌, ✅, etc.)
   - Numbering logs (e.g., [1/20]) helped track flow
   - Logging both request and response data
   - Including timestamps for performance tracking
   - Redacting sensitive data (passwords, tokens)
   - Structured logging with consistent format

2. **Supabase Dashboard Usage**
   - Checking Authentication > Providers settings
   - Verifying RLS policies in Table Editor
   - Using SQL Editor for quick policy updates
   - Monitoring real-time logs
   - Testing queries directly in the dashboard

3. **Incremental Testing**
   - Testing minimal signup first
   - Adding features one at a time
   - Verifying each step before moving to next
   - Using test emails with timestamps
   - Maintaining a list of test cases

4. **Error Investigation**
   - Starting with client-side logs
   - Moving to database logs
   - Checking network requests
   - Verifying environment variables
   - Testing in different environments

5. **Documentation**
   - Documenting each error encountered
   - Recording successful fixes
   - Keeping SQL snippets for common fixes
   - Maintaining a debugging checklist
   - Updating lessons learned document

6. **Development Workflow**
   - Using version control for policy changes
   - Testing locally before production
   - Creating migration files
   - Backing up working state
   - Rolling back when needed
   - Using `--legacy-peer-deps` for npm conflicts
   - Checking package.json for dependency issues

7. **Dependency Management**
   - Installing packages with `--legacy-peer-deps` when needed
   - Checking for peer dependency conflicts
   - Verifying package versions in package.json
   - Running npm audit for security issues
   - Keeping dependencies up to date
   - Testing after dependency updates

8. **Environment Configuration**
   - Check .env files for hardcoded values
   - Update environment variables when ports change
   - Verify all URLs match the running port
   - Test after environment changes
   - Keep development and production configs separate
   - Document required environment variables
   - Use utility functions for dynamic URLs
   - Handle port changes automatically
   - Never hardcode URLs in components

9. **URL Management**
   - Create utility functions for URL handling
   - Use window.location.origin for client-side
   - Fallback to environment variables
   - Handle different environments gracefully
   - Test URLs across different ports
   - Update all navigation links
   - Consider using Next.js Link component
   - Document URL structure

10. **Real-Time Messaging Debugging**
   - **SQL Investigation Strategy**
     ```sql
     -- 1. First check workspace-channel relationship
     SELECT w.id as workspace_id, w.name as workspace_name, 
            c.id as channel_id, c.name as channel_name
     FROM workspaces w
     LEFT JOIN channels c ON c.workspace_id = w.id
     WHERE w.id = '[workspace_id]';

     -- 2. Verify message table structure and constraints
     SELECT column_name, data_type, is_nullable
     FROM information_schema.columns
     WHERE table_name = 'messages';

     -- 3. Check existing foreign key relationships
     SELECT tc.constraint_name, tc.table_name, kcu.column_name,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name 
     FROM information_schema.table_constraints tc 
     JOIN information_schema.key_column_usage kcu
       ON tc.constraint_name = kcu.constraint_name
     JOIN information_schema.constraint_column_usage ccu
       ON ccu.constraint_name = tc.constraint_name
     WHERE tc.table_name = 'messages';

     -- 4. Look for orphaned messages
     SELECT m.id, m.message_text, m.channel_id, m.workspace_id
     FROM messages m
     LEFT JOIN workspaces w ON m.workspace_id = w.id
     WHERE w.id IS NULL;
     ```
   - **Thought Process**
     1. Start at data layer: Verify relationships are correct
     2. Move to constraints: Check foreign keys are enforcing relationships
     3. Look for orphaned data: Find messages without proper associations
     4. Check real-time publication: Verify tables are enabled for real-time

   - **Supabase Real-Time Verification**
     ```sql
     -- Check if tables are in realtime publication
     SELECT * FROM pg_publication_tables 
     WHERE pubname = 'supabase_realtime';

     -- Verify realtime is enabled
     SELECT * FROM supabase_realtime.subscription;
     ```

   - **Debugging Flow**
     1. Use SQL queries to understand data state
     2. Check Supabase dashboard for real-time logs
     3. Add detailed console logging in React components
     4. Monitor network tab for subscription connections
     5. Test with multiple browser sessions

   - **Common Fixes**
     ```sql
     -- Enable realtime for messages table if needed
     ALTER PUBLICATION supabase_realtime ADD TABLE messages;

     -- Verify workspace relationships
     UPDATE messages 
     SET workspace_id = (
       SELECT workspace_id 
       FROM channels 
       WHERE channels.id = messages.channel_id
     )
     WHERE workspace_id IS NULL;
     ```

   - **React Component Strategy**
     - Use unique channel names per subscription
     - Implement proper cleanup on unmount
     - Add loading states for better UX
     - Use optimistic updates for immediate feedback
     - Handle all event types (INSERT/UPDATE/DELETE)

   - **Testing Approach**
     1. Send test message, verify immediate display
     2. Check console for subscription events
     3. Monitor SQL logs for data flow
     4. Test with multiple users simultaneously
     5. Verify cleanup on channel switch

Remember: When debugging real-time issues, always start at the data layer with SQL queries to understand the current state, then move up to the application layer to verify the data flow.
