export const mockMessages = [
  {
    id: '1',
    message_text: 'Test message 1',
    dm_room_id: 'test-room-id',
    sender_id: '2a219aa0-843f-40c2-9a57-75cfdfc12348',
    created_at: '2025-01-07T22:48:18.041067+00',
    updated_at: '2025-01-07T22:48:18.041067+00',
    attachments: {},
    mentions: {},
    metadata: {}
  },
  {
    id: '2',
    message_text: 'Test message 2',
    dm_room_id: 'test-room-id',
    sender_id: 'e29fda9e-9e1e-44b0-8a59-c4e8b54e0333',
    created_at: '2025-01-07T22:49:18.041067+00',
    updated_at: '2025-01-07T22:49:18.041067+00',
    attachments: {},
    mentions: {},
    metadata: {}
  }
]

export const mockUsers = [
  {
    id: '2a219aa0-843f-40c2-9a57-75cfdfc12348',
    username: 'rharding1123a2aa7aazz@gmail.com',
    avatar_url: null
  },
  {
    id: 'e29fda9e-9e1e-44b0-8a59-c4e8b54e0333',
    username: 'john@gmail.com',
    avatar_url: null
  }
]

const createMockSupabase = () => {
  const mockDb = {
    from: jest.fn(),
    select: jest.fn(),
    insert: jest.fn(),
    delete: jest.fn(),
    eq: jest.fn(),
    or: jest.fn(),
    in: jest.fn(),
    order: jest.fn(),
    single: jest.fn()
  }

  // Make all methods chainable by default
  Object.keys(mockDb).forEach(key => {
    mockDb[key].mockReturnValue(mockDb)
  })

  const mockAuth = {
    signInWithPassword: jest.fn(),
    signOut: jest.fn(),
    getUser: jest.fn(),
    onAuthStateChange: jest.fn()
  }

  const mockChannel = {
    on: jest.fn().mockReturnThis(),
    subscribe: jest.fn().mockReturnValue({
      unsubscribe: jest.fn()
    })
  }

  const mockInstance = {
    auth: mockAuth,
    channel: jest.fn().mockReturnValue(mockChannel),
    ...mockDb
  }

  // Setup default responses
  mockInstance.from.mockImplementation((table) => {
    switch (table) {
      case 'direct_messages':
        return {
          ...mockDb,
          select: jest.fn().mockReturnValue({
            or: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({
                data: mockMessages,
                error: null
              })
            })
          }),
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: mockMessages[0],
                error: null
              })
            })
          })
        }
      case 'users':
        return {
          ...mockDb,
          select: jest.fn().mockReturnValue({
            in: jest.fn().mockResolvedValue({
              data: mockUsers,
              error: null
            }),
            eq: jest.fn().mockResolvedValue({
              data: mockUsers[0],
              error: null
            })
          })
        }
      default:
        return mockDb
    }
  })

  return mockInstance
}

export const mockSupabase = createMockSupabase() 