import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '~/lib/supabaseClient'
import Layout from '~/components/Layout'
import Head from 'next/head'
import { logger } from '~/lib/logger'

const profileLogger = logger.withPrefix('Profile')

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    profileLogger.debug('Profile component mounted')
    checkUser()
  }, [])

  async function checkUser() {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError) {
        profileLogger.error('Error fetching user:', authError)
        setError(authError.message)
        return
      }

      if (user) {
        // Fetch additional user data from database
        const { data: userData, error: dbError } = await supabase
          .from('users')
          .select(`
            id,
            email,
            username,
            display_name,
            avatar_url
          `)
          .eq('id', user.id)
          .single()

        if (dbError) {
          profileLogger.error('Error fetching user data:', dbError)
          setError(dbError.message)
          return
        }

        profileLogger.debug('User data loaded:', userData)
        setUser(user)
        setEmail(userData.email || '')
        setUsername(userData.username || '')
        setDisplayName(userData.display_name || '')
        setAvatarUrl(userData.avatar_url || '')
      }
    } catch (err) {
      profileLogger.error('Unexpected error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = async (event) => {
    try {
      setUploading(true)
      setError(null)

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const filePath = `${user.id}-${Math.random()}.${fileExt}`

      profileLogger.debug('Uploading avatar:', { fileName: file.name, fileSize: file.size })

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) {
        profileLogger.error('Avatar upload error:', uploadError)
        throw uploadError
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      profileLogger.debug('Avatar uploaded successfully:', publicUrl)

      await updateProfile({ avatar_url: publicUrl })
      setAvatarUrl(publicUrl)
    } catch (error) {
      profileLogger.error('Error in handleAvatarUpload:', error)
      setError(error.message)
    } finally {
      setUploading(false)
    }
  }

  const updateProfile = async (updates) => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      profileLogger.debug('Updating profile with:', updates)

      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)

      if (error) {
        profileLogger.error('Profile update error:', error)
        throw error
      }

      profileLogger.debug('Profile updated successfully')
      setSuccess('Profile updated successfully!')
    } catch (error) {
      profileLogger.error('Error in updateProfile:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    await updateProfile({
      username,
      display_name: displayName,
      email,
      updated_at: new Date().toISOString()
    })
  }

  const handleSignOut = async () => {
    try {
      profileLogger.debug('Signing out user...')
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      profileLogger.debug('User signed out successfully')
      router.push('/auth')
    } catch (error) {
      profileLogger.error('Error signing out:', error)
      setError(error.message)
    }
  }

  return (
    <Layout>
      <Head>
        <title>Profile - Talk2D2</title>
      </Head>

      <div className="flex-1 overflow-y-auto bg-gray-900">
        <div className="max-w-3xl mx-auto py-8 px-4">
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-yellow-500/10">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-bold text-gray-100">Profile Settings</h1>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
              >
                Sign Out
              </button>
            </div>

            <div className="mb-8">
              <div className="flex items-center space-x-6">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-700 flex items-center justify-center">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl text-gray-400">?</span>
                    )}
                  </div>
                  <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <span className="text-sm text-white font-medium">
                      {uploading ? 'Uploading...' : 'Change'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-100">{displayName || username}</h2>
                  <p className="text-gray-400 text-sm">{email}</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-xl text-gray-100
                    focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50
                    placeholder-gray-500 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-xl text-gray-100
                    focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50
                    placeholder-gray-500 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-xl text-gray-100
                    focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50
                    placeholder-gray-500 transition-all duration-200"
                />
              </div>

              {error && (
                <div className="text-red-400 text-sm bg-red-500/10 px-4 py-2.5 rounded-lg">
                  {error}
                </div>
              )}

              {success && (
                <div className="text-green-400 text-sm bg-green-500/10 px-4 py-2.5 rounded-lg">
                  {success}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className={`
                    py-2.5 px-6 rounded-xl text-sm font-medium transition-all duration-200
                    ${loading
                      ? 'bg-yellow-500/50 cursor-not-allowed'
                      : 'bg-yellow-500 hover:bg-yellow-400 active:bg-yellow-600'
                    }
                    text-gray-900
                  `}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  )
} 