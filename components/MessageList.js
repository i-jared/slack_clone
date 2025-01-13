import React from 'react'
import { formatDistanceToNow } from 'date-fns'

export default function MessageList({ messages = [] }) {
  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div key={message.id} className="flex items-start">
          {/* Avatar */}
          {message.sender?.avatar_url ? (
            <img
              src={message.sender.avatar_url}
              alt=""
              className="w-10 h-10 rounded-full mr-3"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-700 mr-3 flex items-center justify-center">
              <span className="text-lg text-gray-400">
                {(message.sender?.display_name || message.sender?.username || 'U')[0].toUpperCase()}
              </span>
            </div>
          )}

          {/* Message Content */}
          <div className="flex-1 min-w-0">
            {/* Message Header */}
            <div className="flex items-baseline">
              <span className="font-medium text-gray-200">
                {message.sender?.display_name || message.sender?.username || 'Unknown User'}
              </span>
              <span className="ml-2 text-xs text-gray-500">
                {message.created_at && formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
              </span>
            </div>

            {/* Message Text */}
            <div className="mt-1 text-gray-300 whitespace-pre-wrap break-words">
              {message.message_text}
            </div>

            {/* Message Actions */}
            <div className="mt-1 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {message.edited_at && (
                <span className="text-xs text-gray-500">(edited)</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
} 