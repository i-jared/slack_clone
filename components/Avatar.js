import React from 'react'

export default function Avatar({ url, className = '' }) {
  const defaultClasses = 'w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden'
  const combinedClasses = `${defaultClasses} ${className}`.trim()

  if (!url) {
    return (
      <div className={combinedClasses}>
        <span className="text-sm text-white">?</span>
      </div>
    )
  }

  return (
    <div className={combinedClasses}>
      <img 
        src={url} 
        alt="User avatar"
        className="w-full h-full object-cover"
        onError={(e) => {
          e.target.style.display = 'none'
          e.target.parentElement.innerHTML = '<span class="text-sm text-white">?</span>'
        }}
      />
    </div>
  )
} 