import React from 'react'

export default function UserStatusDot({ status }) {
  return (
    <span 
      className={`
        inline-block w-2 h-2 rounded-full 
        transition-all duration-300 ease-in-out
        ${status === 'ONLINE' 
          ? 'bg-green-500 shadow-sm shadow-green-500/50' 
          : 'bg-gray-500'
        }
      `}
      title={status === 'ONLINE' ? 'Online' : 'Offline'}
    />
  )
} 