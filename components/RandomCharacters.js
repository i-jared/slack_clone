import { useEffect, useState } from 'react'
import Image from 'next/image'

const characters = [
  {
    name: 'Darth Vader',
    image: '/images/darthVader.png',
    position: 'bottom-0 left-0',
    size: { width: 96, height: 128 }
  },
  {
    name: 'Luke Skywalker',
    image: '/images/lukeSkywalker.png',
    position: 'bottom-0 right-0',
    size: { width: 96, height: 128 }
  }
]

const RandomCharacters = () => {
  const [visibleCharacter, setVisibleCharacter] = useState(null)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    let timeoutId = null
    
    const showRandomCharacter = () => {
      try {
        if (Math.random() < 0.2) {
          const randomCharacter = characters[Math.floor(Math.random() * characters.length)]
          setVisibleCharacter(randomCharacter)
          setImageError(false)
          
          // Clear previous timeout if exists
          if (timeoutId) {
            clearTimeout(timeoutId)
          }
          
          timeoutId = setTimeout(() => {
            setVisibleCharacter(null)
            timeoutId = null
          }, 5000)
        } else {
          setVisibleCharacter(null)
        }
      } catch (error) {
        console.error('Error in RandomCharacters:', error)
        setVisibleCharacter(null)
      }
    }

    // Increase interval to reduce resource usage
    const interval = setInterval(showRandomCharacter, 15000)
    
    return () => {
      clearInterval(interval)
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [])

  if (!visibleCharacter || imageError) return null

  return (
    <div 
      className={`fixed ${visibleCharacter.position} pointer-events-none z-10 opacity-0 animate-fade-in`}
      style={{
        animation: 'fadeIn 1s ease-out forwards, fadeOut 1s ease-in forwards 4s'
      }}
    >
      <div className="relative" style={visibleCharacter.size}>
        <Image 
          src={visibleCharacter.image}
          alt={visibleCharacter.name}
          fill
          sizes="96px"
          className="object-contain filter brightness-75"
          priority={false}
          onError={() => {
            console.error('Failed to load character image:', visibleCharacter.image)
            setImageError(true)
          }}
        />
      </div>
    </div>
  )
}

export default RandomCharacters

// Add to tailwind.config.js:
// animation: {
//   'fade-in': 'fadeIn 1s ease-out'
// },
// keyframes: {
//   fadeIn: {
//     '0%': { opacity: '0' },
//     '100%': { opacity: '0.75' }
//   }
// } 