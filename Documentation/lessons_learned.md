# Lessons Learned: Debugging Signup Flow

## Issue: 500 Internal Server Error during Signup

### Symptoms
- Users received 500 Internal Server Error when trying to sign up
- Error message: "Database error saving new user"
- Inconsistent behavior (worked sometimes, failed others)

### Debugging Steps Taken

1. **Added Extensive Logging**
   - Pre-signup checks (database connectivity, schema access)
   - Full payload logging
   - Response logging
   - Error state capture
   - Session state tracking

2. **Fixed Database Policies**
   - Created proper RLS policies for user creation
   - Added policy for anonymous users during signup
   - Fixed authenticated user policies
   - Added trigger for automatic profile creation

3. **Improved Error Handling**
   - Added duplicate email check
   - Better error messages for users
   - Proper session handling after signup
   - Removed email confirmation requirement

### Key Findings

1. **RLS Policy Issues**
   - Anonymous users needed explicit insert permissions
   - Trigger needed SECURITY DEFINER to bypass RLS
   - User profile creation needed proper error handling

2. **Duplicate User Handling**
   - Many 500 errors were actually duplicate email attempts
   - Added explicit check before signup attempt
   - Improved user feedback for existing accounts

3. **Session Management**
   - Needed immediate signin after signup
   - Better handling of session state
   - Proper redirection after successful signup

### Lessons for Future Issues

1. **Always Check These First**
   - Is the email already registered?
   - Are RLS policies correctly configured?
   - Can anonymous users insert during signup?
   - Is the trigger function working?

2. **Debugging Process**
   ```sql
   -- Check RLS policies
   SELECT * FROM pg_policies WHERE tablename = 'users';
   
   -- Test anonymous access
   CREATE POLICY "Allow signup insert" ON public.users 
   FOR INSERT TO anon WITH CHECK (true);
   
   -- Check trigger function
   CREATE OR REPLACE FUNCTION public.handle_new_user()
   RETURNS trigger AS $$ ... $$
   LANGUAGE plpgsql SECURITY DEFINER;
   ```

3. **Logging Best Practices**
   - Log pre-signup state
   - Log exact payload being sent
   - Log raw response
   - Log session state
   - Track all database operations

4. **Common Solutions**
   - Enable RLS: `ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;`
   - Allow anon signup: Create policy for INSERT to anon
   - Fix profile creation: Use SECURITY DEFINER in trigger
   - Handle duplicates: Check before signup attempt

### Prevention Checklist

Before deploying signup changes:
- [ ] Test with new email
- [ ] Test with existing email
- [ ] Verify RLS policies
- [ ] Check trigger function
- [ ] Verify session handling
- [ ] Test error messages
- [ ] Verify redirect flow

### Testing Flow
1. Test basic signup (new email)
2. Test duplicate email
3. Test database access
4. Test session creation
5. Test profile creation
6. Test redirection

### Monitoring
- Watch for 500 errors in auth logs
- Monitor failed signups
- Check trigger execution
- Monitor session creation
- Track user profile creation

Remember: Most signup issues are related to permissions, duplicate users, or session handling. Start debugging there first.

### General Lessons: What Worked Well

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

Remember: Good debugging is about being systematic, documenting everything, and testing incrementally. The combination of detailed logging, Supabase dashboard usage, and methodical testing proved most effective.
