import { useState, useContext } from 'react'
import { UserContext } from '../lib/UserContext'
import { supabase } from '../lib/Store'

// Helper function to generate UUID v4
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

export default function CreateChannelButton() {
  const { user } = useContext(UserContext)
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      console.log('Creating channel with data:', {
        name,
        description,
        isPrivate,
        userId: user?.id
      })

      if (!user?.id) {
        throw new Error('User not authenticated')
      }

      // Create slug from name
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-')

      // First check if channel with this name already exists
      const { data: existingChannels, error: checkError } = await supabase
        .from('channels')
        .select('id, name')
        .eq('name', name)

      if (checkError) {
        console.error('Error checking existing channels:', checkError)
        throw checkError
      }

      if (existingChannels?.length > 0) {
        throw new Error('A channel with this name already exists')
      }

      const channelId = uuidv4()
      console.log('Generated channel ID:', channelId)

      // Create the channel
      const { data: channel, error: channelError } = await supabase
        .from('channels')
        .insert([{
          id: channelId,
          workspace_id: '00000000-0000-0000-0000-000000000001', // Default workspace
          channel_type: 'text',
          name,
          slug,
          description: description || null,
          is_private: isPrivate,
          metadata: {
            created_by_username: user.email.split('@')[0],
            custom_theme: null,
            default_thread_mode: 'inline'
          },
          placeholder_1: null,
          placeholder_2: null,
          created_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (channelError) {
        console.error('Error creating channel:', channelError)
        throw channelError
      }

      console.log('Channel created successfully:', channel)

      // Add creator as channel member with admin role
      const { error: memberError } = await supabase
        .from('channel_members')
        .insert([{
          id: uuidv4(),
          channel_id: channelId,
          user_id: user.id,
          role: 'admin',
          metadata: {
            added_by: user.id,
            added_reason: 'channel_creator'
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])

      if (memberError) {
        console.error('Error adding channel member:', memberError)
        throw memberError
      }

      console.log('Channel member added successfully')

      // Reset form and close modal
      setName('')
      setDescription('')
      setIsPrivate(false)
      setIsOpen(false)

      // Refresh the channels list
      window.location.reload()
    } catch (error) {
      console.error('Error in channel creation:', error)
      setError(error.message || 'Failed to create channel')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2 px-2 py-1 text-sm text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 rounded-md transition-colors duration-150"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
        <span>Add Channel</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md border border-gray-800">
            <h2 className="text-xl font-bold text-yellow-400 mb-4">Create New Channel</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Channel Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 text-white rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="e.g. general"
                  required
                  maxLength={50}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 text-white rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="What's this channel about?"
                  rows="3"
                  maxLength={200}
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPrivate"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="h-4 w-4 text-yellow-500 focus:ring-yellow-500 border-gray-700 rounded bg-gray-800"
                />
                <label htmlFor="isPrivate" className="ml-2 block text-sm text-gray-300">
                  Make private
                </label>
              </div>

              {error && (
                <div className="text-red-500 text-sm bg-red-500/10 p-2 rounded">
                  {error}
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors duration-150"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !name.trim()}
                  className="px-4 py-2 text-sm bg-yellow-500 text-gray-900 rounded-md hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:hover:bg-yellow-500 transition-colors duration-150"
                >
                  {isLoading ? 'Creating...' : 'Create Channel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 