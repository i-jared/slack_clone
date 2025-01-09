import { render, screen, fireEvent } from '@testing-library/react'
import AttachmentPreview from '~/components/AttachmentPreview'

describe('AttachmentPreview Component', () => {
  test('renders nothing when attachment is null', () => {
    const { container } = render(<AttachmentPreview attachment={null} />)
    expect(container).toBeEmptyDOMElement()
  })

  test('renders image preview for image attachments', () => {
    const attachment = {
      url: 'https://example.com/image.jpg',
      name: 'test-image.jpg',
      type: 'image/jpeg'
    }
    render(<AttachmentPreview attachment={attachment} />)
    const img = screen.getByAltText('test-image.jpg')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', attachment.url)
  })

  test('renders document preview for non-image attachments', () => {
    const attachment = {
      url: 'https://example.com/document.pdf',
      name: 'test-document.pdf',
      type: 'application/pdf'
    }
    render(<AttachmentPreview attachment={attachment} />)
    expect(screen.getByText('test-document.pdf')).toBeInTheDocument()
  })

  test('handles image load errors gracefully', () => {
    const attachment = {
      url: 'https://example.com/broken-image.jpg',
      name: 'broken-image.jpg',
      type: 'image/jpeg'
    }
    render(<AttachmentPreview attachment={attachment} />)
    const img = screen.getByAltText('broken-image.jpg')
    fireEvent.error(img)
    // Should now show document preview instead
    expect(screen.getByText('broken-image.jpg')).toBeInTheDocument()
  })

  test('renders fallback name when attachment name is missing', () => {
    const attachment = {
      url: 'https://example.com/file',
      type: 'application/octet-stream'
    }
    render(<AttachmentPreview attachment={attachment} />)
    expect(screen.getByText('Attachment')).toBeInTheDocument()
  })

  test('detects image type from URL when MIME type is missing', () => {
    const attachment = {
      url: 'https://example.com/image.png',
      name: 'test.png'
    }
    render(<AttachmentPreview attachment={attachment} />)
    expect(screen.getByAltText('test.png')).toBeInTheDocument()
  })

  test('opens attachment in new tab when clicked', () => {
    const attachment = {
      url: 'https://example.com/document.pdf',
      name: 'test-document.pdf'
    }
    render(<AttachmentPreview attachment={attachment} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', attachment.url)
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })
}) 