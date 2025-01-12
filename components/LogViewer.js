import { useEffect, useState } from 'react'
import { logger } from '~/lib/logger'

const LogViewer = ({ onClose }) => {
  const [logs, setLogs] = useState(logger.getLogs())

  useEffect(() => {
    // Subscribe to log updates
    const unsubscribe = logger.subscribe(setLogs)
    return () => unsubscribe()
  }, [])

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-gray-900 rounded-lg shadow-xl w-[800px] h-[600px] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-gray-200">Application Logs</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4 font-mono text-sm">
          {logs.map((log, i) => (
            <div
              key={i}
              className={`mb-1 ${
                log.level === 'ERROR' 
                  ? 'text-red-400' 
                  : log.level === 'WARN'
                  ? 'text-yellow-400'
                  : 'text-gray-300'
              }`}
            >
              {log.message}
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-gray-800 flex justify-end space-x-4">
          <button
            onClick={() => logger.clear()}
            className="px-4 py-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
          >
            Clear Logs
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-gray-200 rounded hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default LogViewer 