import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import MessageReactions from '../components/MessageReactions'
import { supabase } from '../lib/supabaseClient'
import { UserContext } from '../lib/UserContext'

// Mock Supabase client
vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn()
    }))
  }
}))

// Mock emoji-mart
vi.mock('@emoji-mart/react', () => ({
  default: () => <div data-testid="emoji-picker">Emoji Picker</div>
}))

describe('MessageReactions', () => {
  const mockUser = {
    id: 'user-1',
    name: 'Test User'
  }

  const mockWorkspace = {
    id: 'workspace-1',
    name: 'Test Workspace',
    owner_id: 'user-1'
  }

  const mockMessage = {
    id: 'message-1',
    content: 'Test message'
  }

  const mockReactions = [
    {
      message_id: 'message-1',
      user_id: 'user-1',
      emoji: '👍',
      metadata: { timestamp: '2024-01-01T00:00:00Z' }
    },
    {
      message_id: 'message-1',
      user_id: 'user-2',
      emoji: '👍',
      metadata: { timestamp: '2024-01-01T00:00:00Z' }
    },
    {
      message_id: 'message-1',
      user_id: 'user-3',
      emoji: '❤️',
      metadata: { timestamp: '2024-01-01T00:00:00Z' }
    }
  ]

  beforeEach(() => {
    // Mock workspace fetch
    supabase.from.mockImplementation((table) => {
      if (table === 'workspaces') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({ data: mockWorkspace })
        }
      }
      if (table === 'message_reactions') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          delete: vi.fn().mockResolvedValue({ data: null, error: null }),
          insert: vi.fn().mockResolvedValue({ data: null, error: null }),
          match: vi.fn().mockReturnThis()
        }
      }
      return {
        select: vi.fn(),
        eq: vi.fn(),
        delete: vi.fn(),
        insert: vi.fn(),
        match: vi.fn()
      }
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  test('loads and displays initial reactions', async () => {
    // Mock the initial reactions fetch
    supabase.from('message_reactions').select.mockImplementation(() => ({
      eq: vi.fn().mockResolvedValue({ data: mockReactions, error: null })
    }))

    render(
      <UserContext.Provider value={{ user: mockUser }}>
        <MessageReactions message={mockMessage} />
      </UserContext.Provider>
    )

    await waitFor(() => {
      expect(screen.getByText('👍')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument() // Count for 👍
      expect(screen.getByText('❤️')).toBeInTheDocument()
      expect(screen.getByText('1')).toBeInTheDocument() // Count for ❤️
    })
  })

  test('handles adding a new reaction', async () => {
    render(
      <UserContext.Provider value={{ user: mockUser }}>
        <MessageReactions message={mockMessage} />
      </UserContext.Provider>
    )

    // Click the add reaction button
    const addButton = screen.getByText('😊')
    fireEvent.click(addButton)

    // Verify emoji picker is shown
    expect(screen.getByTestId('emoji-picker')).toBeInTheDocument()
  })

  test('handles removing a reaction', async () => {
    // Mock initial reactions with user's reaction
    supabase.from('message_reactions').select.mockImplementation(() => ({
      eq: vi.fn().mockResolvedValue({
        data: [
          {
            message_id: 'message-1',
            user_id: mockUser.id,
            emoji: '👍',
            metadata: { timestamp: '2024-01-01T00:00:00Z' }
          }
        ],
        error: null
      })
    }))

    render(
      <UserContext.Provider value={{ user: mockUser }}>
        <MessageReactions message={mockMessage} />
      </UserContext.Provider>
    )

    await waitFor(() => {
      const reactionButton = screen.getByText('👍')
      fireEvent.click(reactionButton)
      expect(supabase.from('message_reactions').delete).toHaveBeenCalled()
    })
  })

  test('handles subscription events', async () => {
    const { rerender } = render(
      <UserContext.Provider value={{ user: mockUser }}>
        <MessageReactions message={mockMessage} />
      </UserContext.Provider>
    )

    // Verify subscription was set up
    expect(supabase.channel).toHaveBeenCalledWith(`message-reactions-${mockMessage.id}`)

    // Test subscription cleanup on unmount
    rerender(<div />)
  })

  test('handles errors gracefully', async () => {
    // Mock an error when fetching reactions
    supabase.from('message_reactions').select.mockImplementation(() => ({
      eq: vi.fn().mockResolvedValue({ data: null, error: new Error('Failed to fetch') })
    }))

    render(
      <UserContext.Provider value={{ user: mockUser }}>
        <MessageReactions message={mockMessage} />
      </UserContext.Provider>
    )

    // Verify the component doesn't crash and renders the add reaction button
    expect(screen.getByText('😊')).toBeInTheDocument()
  })
}) 