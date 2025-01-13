import React, { useContext } from 'react'
import Avatar from './Avatar'
import { supabase } from '~/lib/supabaseClient'
import { UserContext } from '~/lib/UserContext'
import MessageReactions from './MessageReactions'
import { formatDistanceToNow } from 'date-fns'

export default function Message({ message, onThreadClick }) {
  const { user } = useContext(UserContext)
  if (!message) return null

  const handleClickThread = () => {
    if (onThreadClick) {
      onThreadClick(message)
    }
  }

  return (
    <div className="p-2 hover:bg-gray-700/50">
      <div className="flex items-start">
        <Avatar url={message.user?.avatar_url} className="mr-3" />
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-yellow-400">
              {message.user?.display_name || message.user?.username || 'Unknown'}
            </span>
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
            </span>
          </div>
          <div className="mt-1 text-gray-200 whitespace-pre-line">
            {message.message_text}
          </div>
          {/* Reactions */}
          {message.reactions && (
            <div className="mt-1">
              <MessageReactions message={message} />
            </div>
          )}
          {/* Thread button */}
          <div className="mt-1">
            {message.reply_count > 0 ? (
              <button
                className="text-xs text-gray-400 hover:underline"
                onClick={handleClickThread}
              >
                {message.reply_count} replies
              </button>
            ) : (
              <button
                className="text-xs text-gray-400 hover:underline"
                onClick={handleClickThread}
              >
                Start thread
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}