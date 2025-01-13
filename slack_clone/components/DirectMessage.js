import { useDirectMessages } from '~/lib/useDirectMessages'
import Message from './Message'
import MessageInput from './MessageInput'

export default function DirectMessage({ roomId, recipient, workspaceId }) {
  // uses the updated hook with the new schema referencing workspaceId
  const { messages, loading } = useDirectMessages(roomId, workspaceId)

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {loading ? (
          <div className="text-gray-400">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-gray-500">No messages yet</div>
        ) : (
          messages.map(msg => <Message key={msg.id} message={msg} />)
        )}
      </div>
      <div className="border-t border-gray-700 p-4">
        <MessageInput
          isDirect
          dm_room_id={roomId}
          workspace_id={workspaceId}
        />
      </div>
    </div>
  )
}