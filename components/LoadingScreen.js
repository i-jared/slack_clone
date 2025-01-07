import React from 'react'

const LoadingScreen = ({ message = "Establishing connection to the Galactic Network..." }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col items-center justify-center">
      {/* Star Wars style loading animation */}
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 border-4 border-t-yellow-400 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        <div className="absolute inset-2 border-4 border-r-yellow-400 border-t-transparent border-b-transparent border-l-transparent rounded-full animate-spin-reverse"></div>
        <div className="absolute inset-4 border-4 border-b-yellow-400 border-r-transparent border-t-transparent border-l-transparent rounded-full animate-spin"></div>
      </div>
      
      {/* Loading text */}
      <div className="text-yellow-400 font-orbitron text-center">
        <p className="text-lg mb-2">{message}</p>
        <div className="flex items-center justify-center space-x-2">
          <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
          <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse delay-100"></span>
          <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse delay-200"></span>
        </div>
      </div>
    </div>
  )
}

export default LoadingScreen 