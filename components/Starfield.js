import { useEffect, useRef } from 'react'

const Starfield = () => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animationFrameId
    let stars = []

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    // Create stars
    const createStars = () => {
      stars = []
      const numStars = Math.floor((window.innerWidth * window.innerHeight) / 10000)
      
      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2,
          speed: Math.random() * 0.5
        })
      }
    }

    // Animate stars
    const animate = () => {
      try {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        
        stars.forEach(star => {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
          ctx.beginPath()
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
          ctx.fill()
          
          star.y += star.speed
          
          if (star.y > canvas.height) {
            star.y = 0
            star.x = Math.random() * canvas.width
          }
        })
        
        // Throttle the animation to ~30fps for better performance
        setTimeout(() => {
          animationFrameId = requestAnimationFrame(animate)
        }, 1000 / 30)
      } catch (error) {
        console.error('Starfield animation error:', error)
        // Attempt to recover
        cancelAnimationFrame(animationFrameId)
        setTimeout(() => {
          animationFrameId = requestAnimationFrame(animate)
        }, 1000)
      }
    }

    // Initialize
    setCanvasSize()
    createStars()
    animate()

    // Handle window resize
    window.addEventListener('resize', () => {
      setCanvasSize()
      createStars()
    })

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', setCanvasSize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none"
      style={{ zIndex: -1 }}
    />
  )
}

export default Starfield 