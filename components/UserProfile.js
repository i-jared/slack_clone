import { useState, useContext, useEffect } from 'react'
import { supabase } from '~/lib/Store'
import UserContext from '~/lib/UserContext'

export default function UserProfile() {
  const { user, signOut } = useContext(UserContext)
  const [profile, setProfile] = useState({
    username: user?.username || '',
    display_name: user?.display_name || '',
    phone_number: user?.phone_number || '',
    avatar_url: user?.avatar_url || '',
    description: user?.description || '',
    status: user?.status || '',
    faction: user?.faction || '',
    is_bot: user?.is_bot || false,
    preferences: user?.preferences || {},
    ai_persona: user?.ai_persona || {},
    gamification: user?.gamification || {},
    metadata: user?.metadata || {},
    placeholder_col_1: user?.placeholder_col_1 || null,
    placeholder_col_2: user?.placeholder_col_2 || {}
  })
  const [isEditing, setIsEditing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [userData, setUserData] = useState(null)

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          email,
          username,
          display_name,
          phone_number,
          avatar_url,
          description,
          status,
          faction,
          last_seen,
          is_bot,
          preferences,
          ai_persona,
          gamification,
          metadata,
          placeholder_col_1,
          placeholder_col_2,
          created_at,
          updated_at
        `)
        .eq('id', user.id)
        .single()

      if (error) throw error
      if (data) {
        setProfile({
          username: data.username || '',
          display_name: data.display_name || '',
          phone_number: data.phone_number || '',
          avatar_url: data.avatar_url || '',
          description: data.description || '',
          status: data.status || '',
          faction: data.faction || '',
          is_bot: data.is_bot || false,
          preferences: data.preferences || {},
          ai_persona: data.ai_persona || {},
          gamification: data.gamification || {},
          metadata: data.metadata || {},
          placeholder_col_1: data.placeholder_col_1 || null,
          placeholder_col_2: data.placeholder_col_2 || {}
        })
        setUserData(data)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const uploadAvatar = async (event) => {
    try {
      setUploading(true)
      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const filePath = `${user.id}-${Math.random()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      await updateProfile({ avatar_url: publicUrl })
      setProfile({ ...profile, avatar_url: publicUrl })
    } catch (error) {
      console.error('Error uploading avatar:', error)
    } finally {
      setUploading(false)
    }
  }

  const updateProfile = async (updates) => {
    try {
      const currentData = userData || {}
      
      const { error } = await supabase
        .from('users')
        .update({
          ...updates,
          preferences: updates.preferences || currentData.preferences,
          ai_persona: updates.ai_persona || currentData.ai_persona,
          gamification: updates.gamification || currentData.gamification,
          metadata: updates.metadata || currentData.metadata,
          placeholder_col_1: updates.placeholder_col_1 || currentData.placeholder_col_1,
          placeholder_col_2: updates.placeholder_col_2 || currentData.placeholder_col_2,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error
      
      if (updates.username) setProfile({ ...profile, username: updates.username })
      if (updates.display_name) setProfile({ ...profile, display_name: updates.display_name })
      if (updates.avatar_url) setProfile({ ...profile, avatar_url: updates.avatar_url })
      if (updates.description) setProfile({ ...profile, description: updates.description })
      if (updates.faction) setProfile({ ...profile, faction: updates.faction })
      
      await fetchProfile()
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  if (!user) return null

  return (
    <>
      {isEditing ? (
        <div className="p-4 bg-gray-800 shadow-lg">
          <h3 className="text-lg font-bold mb-4 text-white">Profile Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-2 text-white">Avatar</label>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl text-white">{profile.username?.charAt(0)?.toUpperCase()}</span>
                  )}
                </div>
                <label className="cursor-pointer bg-yellow-500 text-black px-4 py-2 rounded hover:bg-yellow-400">
                  {uploading ? 'Uploading...' : 'Upload'}
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={uploadAvatar}
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm mb-2 text-white">Username</label>
              <input
                type="text"
                value={profile.username}
                onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
            </div>
            <div>
              <label className="block text-sm mb-2 text-white">Display Name</label>
              <input
                type="text"
                value={profile.display_name}
                onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
            </div>
            <div>
              <label className="block text-sm mb-2 text-white">Description</label>
              <textarea
                value={profile.description}
                onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                className="w-full p-2 rounded bg-gray-700 text-white"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm mb-2 text-white">Faction</label>
              <select
                value={profile.faction}
                onChange={(e) => setProfile({ ...profile, faction: e.target.value })}
                className="w-full p-2 rounded bg-gray-700 text-white"
              >
                <option value="">Select a faction</option>
                <option value="Jedi">Jedi</option>
                <option value="Sith">Sith</option>
                <option value="Rebel">Rebel</option>
                <option value="Empire">Empire</option>
              </select>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={() => updateProfile({
                  username: profile.username,
                  display_name: profile.display_name,
                  description: profile.description,
                  faction: profile.faction
                })}
                className="px-4 py-2 rounded bg-yellow-500 text-black hover:bg-yellow-400"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-gray-800 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl text-white">{profile.username?.charAt(0)?.toUpperCase()}</span>
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{profile.display_name || profile.username}</h3>
                <p className="text-sm text-gray-400">@{profile.username}</p>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 rounded bg-yellow-500 text-black hover:bg-yellow-400"
            >
              Edit Profile
            </button>
          </div>
          {profile.description && (
            <p className="text-white mb-4">{profile.description}</p>
          )}
          {profile.faction && (
            <p className="text-sm text-gray-400">Faction: {profile.faction}</p>
          )}
        </div>
      )}
    </>
  )
} 