import { useState, useEffect } from 'react'
import { logger } from '../lib/logger'

export default function LogViewer() {
  const [logs, setLogs] = useState([])
  const [filter, setFilter] = useState('all')

  // Update logs every second
  useEffect(() => {
    const interval = setInterval(() => {
      const allLogs = logger.getLogs()
      const filteredLogs = filter === 'all' 
        ? allLogs 
        : allLogs.filter(log => log.type === filter)
      setLogs(filteredLogs)
    }, 1000)

    return () => clearInterval(interval)
  }, [filter])

  const getLogStyle = (type) => {
    switch (type) {
      case 'error':
        return 'text-red-400'
      case 'warn':
        return 'text-yellow-400'
      case 'info':
        return 'text-blue-400'
      default:
        return 'text-gray-200'
    }
  }

  return (
    <div className="fixed right-0 top-0 w-96 h-screen bg-gray-900 border-l border-gray-800 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-yellow-400">System Logs</h2>
          <div className="flex space-x-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm text-gray-200"
            >
              <option value="all">All Logs</option>
              <option value="error">Errors</option>
              <option value="warn">Warnings</option>
              <option value="log">Logs</option>
              <option value="info">Info</option>
            </select>
            <button
              onClick={() => logger.downloadLogs()}
              className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 text-sm"
            >
              Download
            </button>
            <button
              onClick={() => {
                logger.clearLogs()
                setLogs([])
              }}
              className="px-3 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 text-sm"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Logs Container */}
      <div className="flex-1 overflow-y-auto font-mono text-sm p-4 space-y-2">
        {logs.map((log, index) => (
          <div key={index} className={`${getLogStyle(log.type)}`}>
            <div className="flex items-start space-x-2">
              <span className="text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
              <span className="uppercase text-xs bg-gray-800 px-1.5 py-0.5 rounded">
                {log.type}
              </span>
              {log.user && (
                <span className="text-gray-400">
                  @{log.user.username}
                </span>
              )}
            </div>
            <div className="ml-4 break-all whitespace-pre-wrap">
              {log.message}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 