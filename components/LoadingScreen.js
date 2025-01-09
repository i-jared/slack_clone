import { useEffect, useState } from 'react'

export default function LoadingScreen({ message = "Loading...", onHide }) {
  const [isVisible, setIsVisible] = useState(true)
  const [timeoutCount, setTimeoutCount] = useState(0)

  useEffect(() => {
    // First timeout after 10 seconds
    const timeout = setTimeout(() => {
      setTimeoutCount(prev => prev + 1)
      if (timeoutCount >= 2) { // After second timeout, force hide
        setIsVisible(false)
        if (onHide) onHide()
      }
    }, 10000)

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // When tab becomes visible, increment timeout counter
        setTimeoutCount(prev => prev + 1)
        if (timeoutCount >= 2) {
          setIsVisible(false)
          if (onHide) onHide()
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearTimeout(timeout)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [onHide, timeoutCount])

  if (!isVisible) return null

  return (
    <div className="sw-loading fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="text-center">
        <div className="relative w-24 h-24 mx-auto mb-4">
          <div className="absolute inset-0 border-4 border-blue-400/30 rounded-full animate-spin"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-blue-400 rounded-full animate-spin-slow">
            <div className="absolute top-0 left-1/2 w-1 h-4 -ml-0.5 bg-blue-400 blur-sm"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
          </div>
        </div>
        <p className="text-xl font-semibold text-blue-400 animate-pulse">
          {message || "Traveling through hyperspace..."}
        </p>
        {timeoutCount > 0 && (
          <button 
            onClick={() => {
              setIsVisible(false)
              if (onHide) onHide()
            }}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Force Load Page
          </button>
        )}
      </div>

      <style jsx>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  )
} 