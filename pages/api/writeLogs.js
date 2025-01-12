import fs from 'fs'
import path from 'path'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { logs } = req.body
    if (!logs) {
      return res.status(400).json({ message: 'No logs provided' })
    }

    // Get the root directory path
    const rootDir = process.cwd()
    const filePath = path.join(rootDir, 'console_logs.txt')

    // Write logs to file, overwriting any existing content
    fs.writeFileSync(filePath, logs)

    res.status(200).json({ message: 'Logs written successfully' })
  } catch (error) {
    console.error('Error writing logs to file:', error)
    res.status(500).json({ message: 'Error writing logs', error: error.message })
  }
} 