import { useState, useEffect, useContext } from 'react'
import { supabase } from '~/lib/supabaseClient'
import { UserContext } from '~/lib/UserContext'

export default function UserProfile() {
  const { user } = useContext(UserContext)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadProfile = async () => {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()
    if (!error && data) {
      setProfile(data)
    } else {
      setError(error?.message || 'Error loading profile')
    }
    setLoading(false)
  }

  useEffect(() => {
    loadProfile()
  }, [user])

  const handleUpdate = async (updates) => {
    if (!user) return
    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)
    if (error) {
      setError(error.message)
    } else {
      await loadProfile()
    }
  }

  if (!user) return <div className="p-4 text-gray-300">Not signed in</div>
  if (loading) return <div className="p-4 text-gray-300">Loading profile...</div>
  if (error) return <div className="p-4 text-red-400">{error}</div>

  return (
    <div className="p-4 text-gray-200">
      <h2 className="text-xl mb-4">User Profile</h2>
      {profile && (
        <div>
          <p><strong>Username:</strong> {profile.username}</p>
          <p><strong>Display Name:</strong> {profile.display_name}</p>
          {/* etc. for faction, phone_number, preferences, etc. */}
        </div>
      )}
    </div>
  )
}