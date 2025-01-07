import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useStore } from '~/lib/Store'
import Layout from '~/components/Layout'
import Message from '~/components/Message'
import MessageInput from '~/components/MessageInput'
import LoadingScreen from '~/components/LoadingScreen'
import { useContext } from 'react'
import UserContext from '~/lib/UserContext'

const ChannelPageContent = () => {
  const router = useRouter()
  const { id } = router.query
  const { user } = useContext(UserContext)
  const [channel, setChannel] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const { channels, messages: storeMessages } = useStore({ channelId: id })

  // Update selected channel when channels or id changes
  useEffect(() => {
    if (channels?.length > 0 && id && router.isReady) {
      console.log('🔍 Finding channel:', id, 'from', channels?.length, 'channels')
      const selectedChannel = channels.find((x) => x.id === Number(id))
      console.log(selectedChannel ? '✅ Channel found:' : '❌ Channel not found:', selectedChannel?.slug)
      setChannel(selectedChannel)
      setIsLoading(false)
    }
  }, [channels, id, router.isReady])

  // Render null if user is not authenticated
  if (!user) {
    console.log('⚠️ No user, rendering null')
    return null
  }

  if (!router.isReady || isLoading) {
    console.log('⏳ Showing loading screen:', { isReady: router.isReady, isLoading })
    return <LoadingScreen message="Intercepting galactic transmissions..." />
  }

  console.log('🎨 Rendering channel page:', {
    channel: channel?.slug,
    messagesCount: storeMessages?.length
  })

  return (
    <div className="relative h-screen flex flex-col">
      <div className="px-4 py-2 border-b border-gray-700 bg-gray-800/90">
        <h2 className="text-2xl font-orbitron text-yellow-400">
          {channel?.slug || 'Loading...'}
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="py-4 space-y-2">
          {storeMessages?.map((message) => (
            <Message key={message.id} message={message} />
          ))}
        </div>
      </div>
      <MessageInput channel_id={Number(id)} />
    </div>
  )
}

const ChannelPage = () => {
  const router = useRouter()
  const { id } = router.query

  // Use key prop to force remount of entire component tree
  return (
    <Layout key={id}>
      <ChannelPageContent />
    </Layout>
  )
}

export default ChannelPage
