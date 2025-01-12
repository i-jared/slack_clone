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

# Lessons Learned: Real-Time Message Display

## Issue: Messages Only Appearing After Page Refresh

### Symptoms
- Messages not appearing immediately after sending
- Required page refresh to see new messages
- Inconsistent real-time updates
- Multiple duplicate subscriptions causing race conditions

### Debugging Steps Taken

1. **Analyzed Subscription Setup**
   - Found multiple competing subscriptions to same channel
   - Identified race conditions in state updates
   - Discovered non-unique channel names causing conflicts
   - Located inefficient full re-fetch on every change

2. **Fixed Subscription Architecture**
   - Consolidated multiple subscriptions into single subscription
   - Used unique channel names with format `channel-messages-${channelId}`
   - Implemented proper cleanup with `isMounted` flag
   - Added granular event handling (INSERT/UPDATE/DELETE)

3. **Improved State Management**
   - Added proper loading states
   - Implemented optimistic updates
   - Added proper error handling
   - Ensured state updates respect React's batching

### Key Findings

1. **Subscription Issues**
   - Multiple subscriptions caused race conditions
   - Generic channel names led to cross-talk
   - Full re-fetches were inefficient
   - Missing cleanup led to memory leaks

2. **State Management Problems**
   - Direct state updates bypassed React's batching
   - Missing loading states caused UI jank
   - Lack of error handling led to silent failures
   - No optimistic updates made UI feel slow

3. **Real-Time Best Practices**
   ```javascript
   // Good: Single subscription with unique channel name
   const subscription = supabase
     .channel(`channel-messages-${channelId}`)
     .on('postgres_changes', {
       event: '*',
       schema: 'public',
       table: 'messages',
       filter: `channel_id=eq.${channelId}`
     }, async (payload) => {
       if (!isMounted) return
       
       if (payload.eventType === 'INSERT') {
         setMessages(prev => [...prev, payload.new])
       }
     })
     .subscribe()

   // Bad: Multiple competing subscriptions
   const sub1 = supabase.channel('messages')...
   const sub2 = supabase.channel('messages')...
   ```

### Lessons for Future Issues

1. **Always Check These First**
   - Are there multiple subscriptions to same channel?
   - Are channel names unique per use case?
   - Is proper cleanup implemented?
   - Are state updates batched correctly?

2. **Debugging Process**
   - Add detailed logging for subscription lifecycle
   - Monitor state updates with React DevTools
   - Check for memory leaks with browser tools
   - Verify proper cleanup on unmount

3. **Logging Best Practices**
   - Log subscription creation/cleanup
   - Log all real-time events with payload
   - Track state updates
   - Monitor performance impact

4. **Common Solutions**
   - Use unique channel names
   - Implement proper cleanup
   - Add loading states
   - Use optimistic updates

### Prevention Checklist

Before deploying real-time features:
- [ ] Verify unique subscription names
- [ ] Check for proper cleanup
- [ ] Test concurrent updates
- [ ] Monitor memory usage
- [ ] Verify state consistency
- [ ] Test error handling
- [ ] Check performance impact

### Testing Flow
1. Test single message send
2. Test rapid message sends
3. Test concurrent users
4. Test connection drops
5. Test cleanup on unmount
6. Test error recovery

### Monitoring
- Watch for duplicate subscriptions
- Monitor memory usage
- Track message latency
- Check error rates
- Monitor state consistency

Remember: Most real-time issues are related to subscription management, state updates, or cleanup. Start debugging there first.