import { renderHook, act } from '@testing-library/react'
import { mockSupabase, mockMessages, mockUsers } from './mocks/supabase'
import { UserContext } from '../lib/UserContext'

// Mock the Store module
jest.mock('../lib/Store', () => {
  const originalModule = jest.requireActual('../lib/Store')
  return {
    ...originalModule,
    supabase: mockSupabase,
    useDirectMessages: originalModule.useDirectMessages
  }
})

describe('useDirectMessages Hook', () => {
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

  const wrapper = ({ children }) => (
    <UserContext.Provider value={{ user: testUser }}>
      {children}
    </UserContext.Provider>
  )

  test('should initialize with loading state', () => {
    const { result } = renderHook(() => useDirectMessages({ recipientId: testRecipient.id }), { wrapper })
    
    expect(result.current.isLoading).toBe(true)
    expect(result.current.messages).toEqual([])
  })

  test('should fetch messages successfully', async () => {
    const { result, waitForNextUpdate } = renderHook(
      () => useDirectMessages({ recipientId: testRecipient.id }),
      { wrapper }
    )

    await waitForNextUpdate()

    expect(result.current.isLoading).toBe(false)
    expect(Array.isArray(result.current.messages)).toBe(true)
    expect(result.current.messages.length).toBe(mockMessages.length)

    // Verify message structure
    const message = result.current.messages[0]
    expect(message).toHaveProperty('id')
    expect(message).toHaveProperty('sender')
    expect(message).toHaveProperty('recipient')
    expect(message).toHaveProperty('message')
    expect(message).toHaveProperty('inserted_at')
  })

  test('should handle missing recipientId', () => {
    const { result } = renderHook(() => useDirectMessages({}), { wrapper })
    
    expect(result.current.isLoading).toBe(false)
    expect(result.current.messages).toEqual([])
  })

  test('should handle missing user context', () => {
    const { result } = renderHook(() => useDirectMessages({ recipientId: testRecipient.id }))
    
    expect(result.current.isLoading).toBe(false)
    expect(result.current.messages).toEqual([])
  })

  test('should update messages when new message is received', async () => {
    const { result, waitForNextUpdate } = renderHook(
      () => useDirectMessages({ recipientId: testRecipient.id }),
      { wrapper }
    )

    await waitForNextUpdate()
    const initialMessageCount = result.current.messages.length

    // Simulate receiving a new message
    await act(async () => {
      const subscription = mockSupabase.channel().on.mock.calls[0][2]
      subscription({
        new: {
          ...mockMessages[0],
          id: 999,
          message: 'New test message'
        }
      })
    })

    expect(result.current.messages.length).toBe(initialMessageCount + 1)
    expect(result.current.messages[result.current.messages.length - 1].message).toBe('New test message')
  })

  test('should cleanup subscription on unmount', async () => {
    const unsubscribeMock = jest.fn()
    mockSupabase.channel().subscribe.mockReturnValue({
      unsubscribe: unsubscribeMock
    })

    const { result, unmount, waitForNextUpdate } = renderHook(
      () => useDirectMessages({ recipientId: testRecipient.id }),
      { wrapper }
    )

    await waitForNextUpdate()
    unmount()

    expect(unsubscribeMock).toHaveBeenCalled()
  })
}) 