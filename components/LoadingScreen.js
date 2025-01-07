import React from 'react'

const LoadingScreen = ({ message }) => {
  return (
    <div className="sw-loading">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 border-4 border-yellow-400/30 rounded-full animate-spin"></div>
        <div className="absolute inset-0 border-4 border-transparent border-t-yellow-400 rounded-full animate-spin-slow"></div>
      </div>
      <p className="sw-loading-text animate-pulse">
        {message}
      </p>
    </div>
  )
}

export default LoadingScreen 