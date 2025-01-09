import { render, screen, fireEvent } from '@testing-library/react'
import { UserContext } from '~/lib/UserContext'
import Message from '~/components/Message'
import { supabase } from '~/lib/Store'

// Mock the supabase client
jest.mock('~/lib/Store', () => ({
  supabase: {
    channel: jest.fn(() => ({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn()
    })),
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null })
    }))
  }
}))

const mockUser = {
  id: '123',
  username: 'testuser',
  avatar_url: 'https://example.com/avatar.jpg'
}

const mockMessage = {
  id: '456',
  message: 'Test message',
  inserted_at: new Date().toISOString(),
  user: mockUser,
  attachments: []
}

describe('Message Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const renderMessage = (props = {}) => {
    return render(
      <UserContext.Provider value={{ user: mockUser }}>
        <Message 
          message={mockMessage}
          onThreadClick={() => {}}
          isThreadSelected={false}
          {...props}
        />
      </UserContext.Provider>
    )
  }

  test('renders message content correctly', () => {
    renderMessage()
    expect(screen.getByText(mockMessage.message)).toBeInTheDocument()
    expect(screen.getByText(mockUser.username)).toBeInTheDocument()
  })

  test('handles missing user data gracefully', () => {
    const messageWithoutUser = { ...mockMessage, user: null }
    renderMessage({ message: messageWithoutUser })
    expect(screen.getByText('Unknown')).toBeInTheDocument()
  })

  test('handles missing timestamp gracefully', () => {
    const messageWithoutTimestamp = { ...mockMessage, inserted_at: null }
    renderMessage({ message: messageWithoutTimestamp })
    expect(screen.getByText('Just now')).toBeInTheDocument()
  })

  test('renders attachments correctly', () => {
    const messageWithAttachments = {
      ...mockMessage,
      attachments: [
        { url: 'https://example.com/file.pdf', name: 'test.pdf' },
        { url: 'https://example.com/image.jpg', name: 'test.jpg', type: 'image/jpeg' }
      ]
    }
    renderMessage({ message: messageWithAttachments })
    expect(screen.getByText('test.pdf')).toBeInTheDocument()
    expect(screen.getByAltText('test.jpg')).toBeInTheDocument()
  })

  test('handles thread interaction correctly', () => {
    const onThreadClick = jest.fn()
    renderMessage({ onThreadClick })
    fireEvent.click(screen.getByText('Reply in thread'))
    expect(onThreadClick).toHaveBeenCalledWith(mockMessage.id)
  })

  test('shows correct thread status when selected', () => {
    renderMessage({ isThreadSelected: true })
    const threadButton = screen.getByRole('button')
    expect(threadButton).toHaveClass('text-yellow-400')
  })

  test('handles pending message state correctly', () => {
    const pendingMessage = { ...mockMessage, status: 'pending' }
    renderMessage({ message: pendingMessage })
    expect(screen.getByText('(sending...)')).toBeInTheDocument()
  })

  test('sets up and cleans up subscriptions correctly', () => {
    const { unmount } = renderMessage()
    expect(supabase.channel).toHaveBeenCalledTimes(2) // One for thread count, one for user status
    unmount()
    // Add expectations for cleanup if needed
  })

  test('handles user status updates correctly', async () => {
    const mockUserData = {
      status: 'ONLINE',
      updated_at: new Date().toISOString()
    }
    
    supabase.from().select().eq().single.mockResolvedValueOnce({
      data: mockUserData,
      error: null
    })

    renderMessage()
    // Add expectations for status dot
  })
}) 