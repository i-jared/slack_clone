import { useState, useEffect, useRef } from 'react'

const BackgroundMusic = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const audioRef = useRef(null)

  useEffect(() => {
    const audio = audioRef.current
    
    const attemptAutoplay = async () => {
      try {
        audio.preload = 'none' // Don't preload until user interaction
        audio.volume = 0.3
        audio.loop = true
        
        // Only try to play if user has interacted with the page
        if (document.documentElement.hasAttribute('data-user-interacted')) {
          await audio.play()
          setIsPlaying(true)
        } else {
          setShowControls(true)
        }
      } catch (error) {
        console.log('Autoplay prevented:', error)
        setShowControls(true)
      }
    }

    // Add interaction listener
    const handleInteraction = () => {
      document.documentElement.setAttribute('data-user-interacted', 'true')
      if (!isPlaying) {
        attemptAutoplay()
      }
    }
    
    document.addEventListener('click', handleInteraction, { once: true })
    
    // Try autoplay when component mounts
    attemptAutoplay()

    return () => {
      document.removeEventListener('click', handleInteraction)
      if (audio) {
        audio.pause()
        audio.src = '' // Clear the source
        audio.load() // Reset the audio element
      }
    }
  }, [isPlaying])

  const togglePlay = async () => {
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      try {
        await audioRef.current.play()
      } catch (error) {
        console.error('Error playing audio:', error)
      }
    }
    setIsPlaying(!isPlaying)
  }

  return (
    <>
      <audio ref={audioRef} src="/music/main-theme.mp3" />
      {showControls && (
        <button
          onClick={togglePlay}
          className="fixed bottom-4 right-4 z-50 bg-gray-900 text-yellow-400 p-2 rounded-full shadow-lg hover:bg-gray-800 transition-colors"
          title={isPlaying ? 'Mute Music' : 'Play Music'}
        >
          {isPlaying ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6v12m0-12L8 8H6a2 2 0 00-2 2v4a2 2 0 002 2h2l4 2V6z" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          )}
        </button>
      )}
    </>
  )
}

export default BackgroundMusic 