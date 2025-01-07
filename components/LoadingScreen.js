import { useEffect, useState } from 'react'

const LoadingScreen = () => {
  const [progress, setProgress] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => setIsVisible(false), 500) // Fade out after completion
          return 100
        }
        return prev + 2
      })
    }, 50)

    return () => clearInterval(interval)
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center transition-opacity duration-500">
      <div className="text-center">
        <h1 className="talk2d2-logo text-6xl mb-8">Talk2D2</h1>
        <div className="relative w-64 h-2 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="absolute top-0 left-0 h-full bg-yellow-400"
            style={{ 
              width: `${progress}%`,
              transition: 'width 0.3s ease-out',
              boxShadow: '0 0 10px rgba(255, 232, 31, 0.5)'
            }}
          />
        </div>
        <div className="mt-4 text-yellow-400">
          {progress < 100 ? (
            <div className="flex items-center space-x-2">
              <span>Establishing connection to the galaxy</span>
              <span className="inline-block w-4">
                {'.'.repeat(Math.floor((progress % 30) / 10) + 1)}
              </span>
            </div>
          ) : (
            <span>Connection established!</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default LoadingScreen 