import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { renderHook } from '@testing-library/react-hooks'
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import DirectMessage from '../components/DirectMessage'
import { useDirectMessages } from '../lib/useDirectMessages'
import { sendDirectMessage } from '../lib/Store'
import { supabase } from '../lib/supabaseClient'
import { DocumentIcon, ChatIcon, PinIcon } from '@heroicons/react/24/outline'

// Mock HeroIcons
vi.mock('@heroicons/react/24/outline', () => ({
  DocumentIcon: () => <div data-testid="document-icon" />,
  ChatIcon: () => <div data-testid="chat-icon" />,
  PinIcon: () => <div data-testid="pin-icon" />
}))

// Mock Supabase client
vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      user: () => ({
        id: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
        display_name: 'Test User',
        phone_number: '+1234567890',
        avatar_url: 'https://example.com/avatar.jpg',
        description: 'Test user description',
        status: 'online',
        faction: 'rebels',
        last_seen: new Date().toISOString(),
        is_bot: false,
        preferences: {
          theme: 'dark',
          notifications: 'all'
        },
        ai_persona: {
          model: 'gpt-4',
          personality: 'helpful'
        },
        gamification: {
          level: 1,
          points: 100
        },
        metadata: {
          timezone: 'UTC'
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({
            data: null,
            error: null
          }))
        }))
      })),
      insert: vi.fn(() => ({
        single: vi.fn(() => ({
          data: null,
          error: null
        }))
      }))
    }))
  }
}))

// Mock message objects
const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  username: 'testuser',
  display_name: 'Test User',
  phone_number: '+1234567890',
  avatar_url: 'https://example.com/avatar.jpg',
  description: 'Test user description',
  status: 'online',
  faction: 'rebels',
  last_seen: new Date().toISOString(),
  is_bot: false,
  preferences: {
    theme: 'dark',
    notifications: 'all'
  },
  ai_persona: {
    model: 'gpt-4',
    personality: 'helpful'
  },
  gamification: {
    level: 1,
    points: 100
  },
  metadata: {
    timezone: 'UTC'
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

const mockEditor = {
  ...mockUser,
  id: 'user-2',
  email: 'editor@example.com',
  username: 'editor',
  display_name: 'Editor User',
  avatar_url: 'https://example.com/editor-avatar.jpg'
}

const mockMessage = {
  id: 'msg-1',
  dm_room_id: 'room-1',
  workspace_id: 'workspace-1',
  sender_id: 'user-1',
  message_text: 'Hello world',
  parent_id: null,
  thread_id: null,
  edited_at: null,
  edited_by: null,
  is_pinned: false,
  reactions: {},
  reply_count: 0,
  is_announcement: false,
  is_ai_generated: false,
  ai_model: null,
  ai_prompt: null,
  ai_response_metadata: null,
  attachments: {},
  mentions: {},
  metadata: {},
  read_by: { 'user-1': new Date().toISOString() },
  delivery_status: 'sent',
  scheduled_for: null,
  expires_at: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  sender: mockUser
}

const mockAIMessage = {
  ...mockMessage,
  id: 'msg-2',
  message_text: 'AI generated response',
  is_ai_generated: true,
  ai_model: 'gpt-4',
  ai_prompt: 'Generate a response',
  ai_response_metadata: {
    temperature: 0.7,
    max_tokens: 100
  }
}

const mockAnnouncementMessage = {
  ...mockMessage,
  id: 'msg-3',
  message_text: 'Important announcement',
  is_announcement: true,
  is_pinned: true
}

const mockThreadedMessage = {
  ...mockMessage,
  id: 'msg-4',
  message_text: 'Thread parent',
  reply_count: 2,
  thread_id: 'thread-1'
}

const mockScheduledMessage = {
  ...mockMessage,
  id: 'msg-5',
  message_text: 'Scheduled message',
  scheduled_for: new Date(Date.now() + 86400000).toISOString(),
  delivery_status: 'scheduled'
}

const mockExpiringMessage = {
  ...mockMessage,
  id: 'msg-6',
  message_text: 'Expiring message',
  expires_at: new Date(Date.now() + 3600000).toISOString()
}

const mockEditedMessage = {
  ...mockMessage,
  id: 'msg-7',
  message_text: 'Edited message',
  edited_at: new Date().toISOString(),
  edited_by: mockEditor.id,
  editor: mockEditor
}

describe('Direct Messages', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks()
  })

  afterEach(() => {
    // Clean up after each test
    vi.resetAllMocks()
  })

  describe('Message Rendering', () => {
    test('renders regular message correctly', () => {
      render(<DirectMessage message={mockMessage} />)
      expect(screen.getByText('Hello world')).toBeInTheDocument()
      expect(screen.getByText('Test User')).toBeInTheDocument()
      expect(screen.getByAltText('Test User')).toHaveAttribute('src', 'https://example.com/avatar.jpg')
    })

    test('renders AI message correctly', () => {
      render(<DirectMessage message={mockAIMessage} />)
      expect(screen.getByText('AI generated response')).toBeInTheDocument()
      expect(screen.getByText('AI Generated')).toBeInTheDocument()
      expect(screen.getByText(/Generated by gpt-4/)).toBeInTheDocument()
      expect(screen.getByText(/Prompt: "Generate a response"/)).toBeInTheDocument()
    })

    test('renders announcement correctly', () => {
      render(<DirectMessage message={mockAnnouncementMessage} />)
      expect(screen.getByText('Important announcement')).toBeInTheDocument()
      expect(screen.getByText('Announcement')).toBeInTheDocument()
      expect(screen.getByText('Pinned')).toBeInTheDocument()
    })

    test('renders threaded message correctly', () => {
      render(<DirectMessage message={mockThreadedMessage} />)
      expect(screen.getByText('Thread parent')).toBeInTheDocument()
      expect(screen.getByText('2 replies')).toBeInTheDocument()
    })

    test('renders scheduled message correctly', () => {
      render(<DirectMessage message={mockScheduledMessage} />)
      expect(screen.getByText('Scheduled message')).toBeInTheDocument()
      expect(screen.getByText(/Scheduled for/)).toBeInTheDocument()
      expect(screen.getByText('scheduled')).toBeInTheDocument()
    })

    test('renders expiring message correctly', () => {
      render(<DirectMessage message={mockExpiringMessage} />)
      expect(screen.getByText('Expiring message')).toBeInTheDocument()
      expect(screen.getByText(/Expires/)).toBeInTheDocument()
    })

    test('renders edited message correctly', () => {
      render(<DirectMessage message={mockEditedMessage} />)
      expect(screen.getByText('Edited message')).toBeInTheDocument()
      expect(screen.getByText('(edited)')).toBeInTheDocument()
    })
  })

  describe('Message Interactions', () => {
    test('handles reactions correctly', () => {
      const messageWithReactions = {
        ...mockMessage,
        reactions: {
          '👍': { 'user-1': true, 'user-2': true },
          '❤️': { 'user-3': true }
        }
      }
      render(<DirectMessage message={messageWithReactions} />)
      expect(screen.getByText('👍')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText('❤️')).toBeInTheDocument()
      expect(screen.getByText('1')).toBeInTheDocument()
    })

    test('handles attachments correctly', () => {
      const messageWithAttachments = {
        ...mockMessage,
        attachments: {
          'file1.pdf': {
            name: 'Document.pdf',
            url: 'https://example.com/file1.pdf'
          },
          'image1.jpg': {
            name: 'Image.jpg',
            url: 'https://example.com/image1.jpg'
          }
        }
      }
      render(<DirectMessage message={messageWithAttachments} />)
      expect(screen.getByText('Document.pdf')).toBeInTheDocument()
      expect(screen.getByText('Image.jpg')).toBeInTheDocument()
    })

    test('handles mentions correctly', () => {
      const messageWithMentions = {
        ...mockMessage,
        mentions: {
          'user-2': 'johndoe',
          'user-3': 'janedoe'
        }
      }
      render(<DirectMessage message={messageWithMentions} />)
      expect(screen.getByText('@johndoe')).toBeInTheDocument()
      expect(screen.getByText('@janedoe')).toBeInTheDocument()
    })
  })

  describe('Real-time Updates', () => {
    test('handles new message event correctly', async () => {
      const mockSubscribe = vi.fn()
      const mockUnsubscribe = vi.fn()
      const mockChannel = vi.fn(() => ({
        on: vi.fn().mockReturnThis(),
        subscribe: mockSubscribe,
        unsubscribe: mockUnsubscribe
      }))

      vi.spyOn(supabase, 'channel').mockImplementation(mockChannel)

      const { unmount } = render(<DirectMessage message={mockMessage} />)

      // Simulate receiving a new message
      const payload = {
        eventType: 'INSERT',
        new: {
          ...mockMessage,
          id: 'new-msg-1',
          message_text: 'New message'
        }
      }

      // Get the subscription callback
      const onCallback = mockChannel().on.mock.calls[0][2]
      await onCallback(payload)

      // Verify the message was added
      expect(screen.getByText('New message')).toBeInTheDocument()

      // Clean up
      unmount()
      expect(mockUnsubscribe).toHaveBeenCalled()
    })

    test('handles message update event correctly', async () => {
      const mockSubscribe = vi.fn()
      const mockUnsubscribe = vi.fn()
      const mockChannel = vi.fn(() => ({
        on: vi.fn().mockReturnThis(),
        subscribe: mockSubscribe,
        unsubscribe: mockUnsubscribe
      }))

      vi.spyOn(supabase, 'channel').mockImplementation(mockChannel)

      const { unmount } = render(<DirectMessage message={mockMessage} />)

      // Simulate receiving an updated message
      const payload = {
        eventType: 'UPDATE',
        new: {
          ...mockMessage,
          message_text: 'Updated message',
          edited_at: new Date().toISOString(),
          edited_by: 'user-2'
        }
      }

      // Get the subscription callback
      const onCallback = mockChannel().on.mock.calls[0][2]
      await onCallback(payload)

      // Verify the message was updated
      expect(screen.getByText('Updated message')).toBeInTheDocument()
      expect(screen.getByText('(edited)')).toBeInTheDocument()

      // Clean up
      unmount()
      expect(mockUnsubscribe).toHaveBeenCalled()
    })

    test('handles message delete event correctly', async () => {
      const mockSubscribe = vi.fn()
      const mockUnsubscribe = vi.fn()
      const mockChannel = vi.fn(() => ({
        on: vi.fn().mockReturnThis(),
        subscribe: mockSubscribe,
        unsubscribe: mockUnsubscribe
      }))

      vi.spyOn(supabase, 'channel').mockImplementation(mockChannel)

      const { unmount } = render(<DirectMessage message={mockMessage} />)

      // Simulate receiving a delete event
      const payload = {
        eventType: 'DELETE',
        old: {
          id: mockMessage.id
        }
      }

      // Get the subscription callback
      const onCallback = mockChannel().on.mock.calls[0][2]
      await onCallback(payload)

      // Verify the message was removed
      expect(screen.queryByText('Hello world')).not.toBeInTheDocument()

      // Clean up
      unmount()
      expect(mockUnsubscribe).toHaveBeenCalled()
    })

    test('handles unknown event type correctly', async () => {
      const mockSubscribe = vi.fn()
      const mockUnsubscribe = vi.fn()
      const mockChannel = vi.fn(() => ({
        on: vi.fn().mockReturnThis(),
        subscribe: mockSubscribe,
        unsubscribe: mockUnsubscribe
      }))

      vi.spyOn(supabase, 'channel').mockImplementation(mockChannel)
      const consoleSpy = vi.spyOn(console, 'warn')

      const { unmount } = render(<DirectMessage message={mockMessage} />)

      // Simulate receiving an unknown event
      const payload = {
        eventType: 'UNKNOWN',
        new: mockMessage
      }

      // Get the subscription callback
      const onCallback = mockChannel().on.mock.calls[0][2]
      await onCallback(payload)

      // Verify warning was logged
      expect(consoleSpy).toHaveBeenCalledWith('Unknown event type:', 'UNKNOWN')

      // Clean up
      unmount()
      expect(mockUnsubscribe).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('Message Sending', () => {
    test('sends a regular message successfully', async () => {
      const mockInsert = vi.fn().mockResolvedValue({
        data: {
          ...mockMessage,
          id: 'new-msg-1',
          message_text: 'New test message'
        },
            error: null
          })

      vi.spyOn(supabase, 'from').mockImplementation(() => ({
        insert: mockInsert,
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: null
        })
      }))

      const result = await sendDirectMessage('New test message', 'user-2')
      expect(result).toEqual(expect.objectContaining({
        message_text: 'New test message',
        sender_id: 'user-1',
        delivery_status: 'sent'
      }))
      expect(mockInsert).toHaveBeenCalled()
    })

    test('sends a message with attachments', async () => {
      const attachments = {
        'file1.pdf': {
          name: 'Document.pdf',
          url: 'https://example.com/file1.pdf'
        }
      }

      const mockInsert = vi.fn().mockResolvedValue({
        data: {
          ...mockMessage,
          id: 'new-msg-2',
          message_text: 'Message with attachment',
          attachments
        },
            error: null
          })

      vi.spyOn(supabase, 'from').mockImplementation(() => ({
        insert: mockInsert,
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: null
        })
      }))

      const result = await sendDirectMessage('Message with attachment', 'user-2', {
        attachments
      })
      expect(result).toEqual(expect.objectContaining({
        message_text: 'Message with attachment',
        attachments
      }))
      expect(mockInsert).toHaveBeenCalled()
    })

    test('sends a scheduled message', async () => {
      const scheduledFor = new Date(Date.now() + 86400000).toISOString()

      const mockInsert = vi.fn().mockResolvedValue({
        data: {
          ...mockMessage,
          id: 'new-msg-3',
          message_text: 'Scheduled message',
          scheduled_for: scheduledFor,
          delivery_status: 'scheduled'
        },
        error: null
      })

      vi.spyOn(supabase, 'from').mockImplementation(() => ({
        insert: mockInsert,
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: null
        })
      }))

      const result = await sendDirectMessage('Scheduled message', 'user-2', {
        scheduled_for: scheduledFor
      })
      expect(result).toEqual(expect.objectContaining({
        message_text: 'Scheduled message',
        scheduled_for: scheduledFor,
        delivery_status: 'scheduled'
      }))
      expect(mockInsert).toHaveBeenCalled()
    })

    test('handles send failure', async () => {
      const mockInsert = vi.fn().mockResolvedValue({
        data: null,
        error: new Error('Failed to send message')
      })

      vi.spyOn(supabase, 'from').mockImplementation(() => ({
        insert: mockInsert,
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
              data: null,
          error: null
        })
      }))

      await expect(sendDirectMessage('Failed message', 'user-2')).rejects.toThrow('Failed to send message')
      expect(mockInsert).toHaveBeenCalled()
    })

    test('handles invalid recipient', async () => {
      const mockInsert = vi.fn().mockResolvedValue({
        data: null,
        error: new Error('Invalid recipient')
      })

      vi.spyOn(supabase, 'from').mockImplementation(() => ({
        insert: mockInsert,
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: null
        })
      }))

      await expect(sendDirectMessage('Test message', 'invalid-user')).rejects.toThrow('Invalid recipient')
      expect(mockInsert).toHaveBeenCalled()
    })
  })

  describe('Message Fetching', () => {
    test('fetches messages successfully', async () => {
      const mockMessages = [
        mockMessage,
        mockAIMessage,
        mockAnnouncementMessage
      ]

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: mockMessages,
            error: null
          })
        })
      })

      vi.spyOn(supabase, 'from').mockImplementation(() => ({
        select: mockSelect
      }))

      const { result } = renderHook(() => useDirectMessages('room-1'))
      
      // Wait for messages to be fetched
      await waitFor(() => {
        expect(result.current.messages).toHaveLength(3)
      })

      expect(result.current.messages[0]).toEqual(expect.objectContaining({
        message_text: 'Hello world'
      }))
      expect(result.current.messages[1]).toEqual(expect.objectContaining({
        message_text: 'AI generated response',
        is_ai_generated: true
      }))
      expect(result.current.messages[2]).toEqual(expect.objectContaining({
        message_text: 'Important announcement',
        is_announcement: true
      }))
    })

    test('handles fetch error', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: null,
            error: new Error('Failed to fetch messages')
          })
        })
      })

      vi.spyOn(supabase, 'from').mockImplementation(() => ({
        select: mockSelect
      }))

      const consoleSpy = vi.spyOn(console, 'error')
      const { result } = renderHook(() => useDirectMessages('room-1'))

      // Wait for error to be logged
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Error fetching messages:', expect.any(Error))
      })

      expect(result.current.messages).toHaveLength(0)
      consoleSpy.mockRestore()
    })

    test('handles empty room', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [],
            error: null
          })
        })
      })

      vi.spyOn(supabase, 'from').mockImplementation(() => ({
        select: mockSelect
      }))

      const { result } = renderHook(() => useDirectMessages('empty-room'))

      // Wait for messages to be fetched
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.messages).toHaveLength(0)
    })

    test('fetches user data for messages', async () => {
      const messages = [
        {
          ...mockMessage,
          sender_id: 'user-1'
        },
        {
          ...mockMessage,
          id: 'msg-2',
          sender_id: 'user-2',
          message_text: 'Another message'
        }
      ]

      const users = [
        mockUser,
        {
          ...mockUser,
          id: 'user-2',
          email: 'user2@example.com',
          username: 'user2',
          display_name: 'User Two',
          avatar_url: 'https://example.com/avatar2.jpg'
        }
      ]

      const mockSelect = vi.fn()
        .mockReturnValueOnce({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: messages,
              error: null
            })
          })
        })
        .mockReturnValueOnce({
          in: vi.fn().mockResolvedValue({
            data: users,
            error: null
          })
        })

      vi.spyOn(supabase, 'from').mockImplementation(() => ({
        select: mockSelect
      }))

      const { result } = renderHook(() => useDirectMessages('room-1'))

      // Wait for messages and user data to be fetched
      await waitFor(() => {
        expect(result.current.messages).toHaveLength(2)
      })

      expect(result.current.messages[0].sender).toEqual(expect.objectContaining({
        username: 'user1',
        display_name: 'User One'
      }))
      expect(result.current.messages[1].sender).toEqual(expect.objectContaining({
        username: 'user2',
        display_name: 'User Two'
      }))
    })
  })
}) 

// ... rest of the file ...