import { useState } from 'react'
import { DocumentIcon, PhotoIcon } from '@heroicons/react/24/outline'

export default function AttachmentPreview({ attachment }) {
  const [imageError, setImageError] = useState(false)
  
  if (!attachment) return null

  const isImage = attachment.type?.startsWith('image/') || 
    attachment.url?.match(/\.(jpg|jpeg|png|gif|webp)$/i)

  if (isImage && !imageError) {
    return (
      <div className="relative group">
        <img
          src={attachment.url}
          alt={attachment.name || 'Image attachment'}
          className="max-w-sm rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
          onError={() => setImageError(true)}
        />
        <a 
          href={attachment.url}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
        >
          <span className="text-white text-sm">Open in new tab</span>
        </a>
      </div>
    )
  }

  return (
    <a
      href={attachment.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center space-x-2 p-2 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors max-w-sm"
    >
      {isImage ? (
        <PhotoIcon className="w-5 h-5 text-gray-400" />
      ) : (
        <DocumentIcon className="w-5 h-5 text-gray-400" />
      )}
      <span className="text-sm text-gray-300 truncate">
        {attachment.name || 'Attachment'}
      </span>
    </a>
  )
} 