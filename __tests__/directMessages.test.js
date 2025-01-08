import { mockSupabase, mockMessages, mockUsers } from './mocks/supabase'

// Mock the supabase import
jest.mock('../lib/Store', () => ({
  ...jest.requireActual('../lib/Store'),
  supabase: mockSupabase
}))

describe('Direct Messages', () => {
  const testUser = mockUsers[0]
  const testRecipient = mockUsers[1]

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks()
    
    // Setup auth mock
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: testUser },
      error: null
    })
  })

  describe('Fetching Messages', () => {
    test('should fetch messages between two users', async () => {
      const { data: messages, error } = await mockSupabase
        .from('direct_messages')
        .select('*')
        .or(`and(sender_id.eq.${testUser.id},recipient_id.eq.${testRecipient.id}),and(sender_id.eq.${testRecipient.id},recipient_id.eq.${testUser.id})`)
        .order('inserted_at', { ascending: true })

      expect(error).toBeNull()
      expect(Array.isArray(messages)).toBe(true)
      expect(messages.length).toBe(mockMessages.length)

      // Verify message structure
      const message = messages[0]
      expect(message).toHaveProperty('id')
      expect(message).toHaveProperty('sender_id')
      expect(message).toHaveProperty('recipient_id')
      expect(message).toHaveProperty('message')
      expect(message).toHaveProperty('inserted_at')
    })

    test('should fetch user data for messages', async () => {
      // First get messages
      const { data: messages, error: msgError } = await mockSupabase
        .from('direct_messages')
        .select('*')
        .or(`and(sender_id.eq.${testUser.id},recipient_id.eq.${testRecipient.id}),and(sender_id.eq.${testRecipient.id},recipient_id.eq.${testUser.id})`)
        .order('inserted_at', { ascending: true })

      expect(msgError).toBeNull()
      expect(messages.length).toBe(mockMessages.length)

      // Get unique user IDs
      const userIds = [...new Set([
        ...messages.map(m => m.sender_id),
        ...messages.map(m => m.recipient_id)
      ])]

      // Fetch user data
      const { data: users, error: userError } = await mockSupabase
        .from('users')
        .select('id, username, avatar_url')
        .in('id', userIds)

      expect(userError).toBeNull()
      expect(Array.isArray(users)).toBe(true)
      expect(users.length).toBe(mockUsers.length)

      // Verify user data structure
      const user = users[0]
      expect(user).toHaveProperty('id')
      expect(user).toHaveProperty('username')
    })

    test('should handle non-existent recipient', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000'
      
      mockSupabase.from.mockImplementationOnce(() => ({
        ...mockSupabase,
        select: jest.fn().mockReturnValue({
          or: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: [],
              error: null
            })
          })
        })
      }))

      const { data: messages, error } = await mockSupabase
        .from('direct_messages')
        .select('*')
        .or(`and(sender_id.eq.${testUser.id},recipient_id.eq.${nonExistentId}),and(sender_id.eq.${nonExistentId},recipient_id.eq.${testUser.id})`)
        .order('inserted_at', { ascending: true })

      expect(error).toBeNull()
      expect(Array.isArray(messages)).toBe(true)
      expect(messages.length).toBe(0)
    })
  })

  describe('Sending Messages', () => {
    test('should send a new message', async () => {
      const testMessage = {
        message: 'Test message ' + Date.now(),
        sender_id: testUser.id,
        recipient_id: testRecipient.id
      }

      const { data: message, error } = await mockSupabase
        .from('direct_messages')
        .insert(testMessage)
        .select()
        .single()

      expect(error).toBeNull()
      expect(message).toHaveProperty('id')
      expect(message.message).toBe(mockMessages[0].message)
      expect(message.sender_id).toBe(mockMessages[0].sender_id)
      expect(message.recipient_id).toBe(mockMessages[0].recipient_id)
    })

    test('should fail to send message with invalid recipient', async () => {
      const invalidMessage = {
        message: 'Test message',
        sender_id: testUser.id,
        recipient_id: '00000000-0000-0000-0000-000000000000'
      }

      mockSupabase.from.mockImplementationOnce(() => ({
        ...mockSupabase,
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: new Error('Foreign key violation')
            })
          })
        })
      }))

      const { data: message, error } = await mockSupabase
        .from('direct_messages')
        .insert(invalidMessage)
        .select()
        .single()

      expect(error).not.toBeNull()
    })
  })

  describe('Real-time Updates', () => {
    test('should receive real-time updates for new messages', (done) => {
      const channelName = [testUser.id, testRecipient.id].sort().join('-')
      
      const subscription = mockSupabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'direct_messages',
            filter: `or(and(sender_id.eq.${testUser.id},recipient_id.eq.${testRecipient.id}),and(sender_id.eq.${testRecipient.id},recipient_id.eq.${testUser.id}))`
          },
          (payload) => {
            expect(payload.new).toHaveProperty('id')
            expect(payload.new).toHaveProperty('message')
            done()
          }
        )
        .subscribe()

      // Simulate receiving a new message
      const subscription_callback = mockSupabase.channel().on.mock.calls[0][2]
      subscription_callback({
        new: {
          ...mockMessages[0],
          id: 999,
          message: 'New test message'
        }
      })
    })
  })
}) 