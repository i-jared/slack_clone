import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '~/components/Layout'
import { useStore } from '~/lib/Store'

export default function ChannelsIndex() {
  const router = useRouter()
  const { channels } = useStore()

  useEffect(() => {
    if (channels && channels.length > 0) {
      // Redirect to the first channel
      router.push(`/channels/${channels[0].id}`)
    }
  }, [channels, router])

  return (
    <Layout>
      <div className="p-4 text-gray-100">
        <h1 className="text-xl mb-2">Channels</h1>
        <p>Loading channels...</p>
      </div>
    </Layout>
  )
}