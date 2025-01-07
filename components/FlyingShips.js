import { useEffect, useRef } from 'react'

const FlyingShips = () => {
  const canvasRef = useRef(null)
  const ships = useRef([])
  
  const createShip = () => {
    const shipTypes = [
      '/images/tie fighter facing left.png',
      '/images/tie fighter facing right.png',
      '/images/x wing facing left.png',
      '/images/x wing facing right.png'
    ]
    
    const isLeftToRight = Math.random() > 0.5
    const shipIndex = isLeftToRight ? [1, 3] : [0, 2]
    const randomShipType = shipTypes[shipIndex[Math.floor(Math.random() * 2)]]
    
    return {
      x: isLeftToRight ? -100 : window.innerWidth + 100,
      y: Math.random() * window.innerHeight,
      speed: 2 + Math.random() * 3,
      image: new Image(),
      imagePath: randomShipType,
      direction: isLeftToRight ? 1 : -1,
      size: 30 + Math.random() * 20
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animationFrameId
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const animate = () => {
      try {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        
        // Add new ship randomly with reduced frequency
        if (Math.random() < 0.002 && ships.current.length < 3) {
          const newShip = createShip()
          newShip.image.src = newShip.imagePath
          ships.current.push(newShip)
        }
        
        // Update and draw ships
        ships.current = ships.current.filter(ship => {
          ship.x += ship.speed * ship.direction
          
          if (ship.direction > 0 && ship.x > canvas.width + 100) return false
          if (ship.direction < 0 && ship.x < -100) return false
          
          if (ship.image.complete) {
            ctx.drawImage(ship.image, ship.x, ship.y, ship.size, ship.size * (ship.image.height / ship.image.width))
          }
          
          return true
        })
        
        // Throttle animation to ~30fps
        setTimeout(() => {
          animationFrameId = requestAnimationFrame(animate)
        }, 1000 / 30)
      } catch (error) {
        console.error('FlyingShips animation error:', error)
        // Attempt to recover
        cancelAnimationFrame(animationFrameId)
        setTimeout(() => {
          animationFrameId = requestAnimationFrame(animate)
        }, 1000)
      }
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animationFrameId)
      ships.current = []
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

export default FlyingShips 