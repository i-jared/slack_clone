import { useState } from 'react'
import { DocumentIcon } from '@heroicons/react/24/outline'

export default function AttachmentPreview({ attachment }) {
  const [errored, setErrored] = useState(false)
  if (!attachment) return null

  let isImage = false
  if (attachment.type && attachment.type.startsWith('image/')) {
    isImage = true
  } else if (attachment.url?.match(/\.(jpg|jpeg|png|gif)$/i)) {
    isImage = true
  }

  if (isImage && !errored) {
    return (
      <div className="relative group">
        <img
          src={attachment.url}
          alt={attachment.name || 'Image'}
          onError={() => setErrored(true)}
          className="w-32 h-32 object-cover rounded border border-gray-700"
        />
      </div>
    )
  }
  // fallback
  return (
    <div className="flex items-center space-x-2 p-2 bg-gray-700 rounded">
      <DocumentIcon className="w-5 h-5 text-gray-300" />
      <a
        href={attachment.url}
        target="_blank"
        rel="noreferrer"
        className="text-blue-400 hover:underline"
      >
        {attachment.name || 'Attachment'}
      </a>
    </div>
  )
}