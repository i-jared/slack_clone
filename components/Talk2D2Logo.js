import { useEffect, useState } from 'react'

const Talk2D2Logo = () => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Hide the logo after 3 seconds
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-90 z-50">
      <div className="text-center">
        <h1 className="talk2d2-logo text-6xl mb-4">Talk2D2</h1>
        <p className="text-yellow-400 text-xl">Your Galactic Chat Hub</p>
      </div>
    </div>
  )
}

export default Talk2D2Logo 