const emojiMap = {
  '👍': '⚔️', // Lightsaber
  '❤️': '🛸', // Millennium Falcon
  '😊': '🤖', // Droid face
  '👋': '✨', // Force power
  '🎉': '💫', // Star burst
  '💪': '🌟', // Force strength
  '🔥': '⚡', // Force lightning
  '👀': '🎯', // Target lock
  '🚀': '🌌', // Galaxy
  '💡': '🌠', // Star
  // Add more mappings as needed
}

const StarWarsEmoji = ({ emoji, className = '' }) => {
  const starWarsEmoji = emojiMap[emoji] || emoji

  return (
    <span 
      className={`inline-block ${className}`}
      role="img" 
      aria-label={`emoji-${emoji}`}
    >
      {starWarsEmoji}
    </span>
  )
}

export const replaceEmojis = (text) => {
  return text.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]/gu, (match) => {
    return emojiMap[match] || match
  })
}

export default StarWarsEmoji 