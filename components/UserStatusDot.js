import React from 'react'

export default function UserStatusDot({ status }) {
  return (
    <span 
      className={`inline-block w-2 h-2 rounded-full ${
        status === 'ONLINE' 
          ? 'bg-green-500' 
          : 'bg-gray-500'
      }`}
      title={status === 'ONLINE' ? 'Online' : 'Offline'}
    />
  )
} 