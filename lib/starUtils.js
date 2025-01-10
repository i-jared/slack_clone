function getStarColor() {
  const colors = [
    'rgba(255, 255, 255, VAR_OPACITY)', // Pure white (most common)
    'rgba(255, 255, 255, VAR_OPACITY)',
    'rgba(255, 255, 255, VAR_OPACITY)',
    'rgba(255, 255, 255, VAR_OPACITY)',
    'rgba(255, 254, 250, VAR_OPACITY)', // Slightly warm
    'rgba(250, 255, 255, VAR_OPACITY)', // Slightly cool
    'rgba(255, 250, 240, VAR_OPACITY)', // Warm white
    'rgba(240, 250, 255, VAR_OPACITY)', // Cool white
    'rgba(255, 222, 200, VAR_OPACITY)', // Red giant
    'rgba(200, 222, 255, VAR_OPACITY)', // Blue giant
    'rgba(255, 255, 220, VAR_OPACITY)', // Yellow star
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

function createBrightStar(x, y, intensity = 1) {
  const baseOpacity = Math.random() * 0.3 + 0.7; // Brighter base (0.7-1.0)
  const color = getStarColor().replace('VAR_OPACITY', baseOpacity.toString());
  const blur = Math.random() > 0.5 ? `${Math.random() * 1}px` : '0';
  let star = `${x}px ${y}px ${blur} ${color}`;
  
  // Add glow layers for brighter stars
  if (intensity > 1) {
    const glowColor = color.replace('VAR_OPACITY', (baseOpacity * 0.4).toString());
    star += `, ${x}px ${y}px ${intensity * 2}px ${glowColor}`;
    star += `, ${x}px ${y}px ${intensity * 4}px ${glowColor.replace('VAR_OPACITY', (baseOpacity * 0.2).toString())}`;
  }
  
  return star;
}

function createStarCluster(baseX, baseY, count, spread) {
  let cluster = '';
  // Create a bright center star
  cluster += createBrightStar(baseX, baseY, 2) + ',';
  
  // Create surrounding stars in a more natural pattern
  for (let i = 0; i < count; i++) {
    const distance = Math.random() * spread * (1 - i/count); // Closer to center is more dense
    const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5); // More even distribution
    const offsetX = Math.cos(angle) * distance;
    const offsetY = Math.sin(angle) * distance;
    const x = baseX + offsetX;
    const y = baseY + offsetY;
    const intensity = Math.random() > 0.7 ? 1.5 : 1;
    cluster += createBrightStar(x, y, intensity) + ',';
  }
  return cluster;
}

export function generateStars(count, size) {
  let stars = '';
  const viewportWidth = 32000; // Much wider coverage
  const viewportHeight = 32000;
  
  // Generate individual stars (60% of total)
  const individualStarCount = Math.floor(count * 0.6);
  for (let i = 0; i < individualStarCount; i++) {
    const x = Math.floor(Math.random() * viewportWidth - viewportWidth/2);
    const y = Math.floor(Math.random() * viewportHeight - viewportHeight/2);
    const intensity = Math.random() > 0.95 ? 2.5 : // Super bright (5%)
                     Math.random() > 0.8 ? 2 : // Very bright (15%)
                     Math.random() > 0.6 ? 1.5 : // Bright (20%)
                     1; // Normal (60%)
    stars += createBrightStar(x, y, intensity) + ',';
  }
  
  // Generate star clusters (40% of total)
  const clusterCount = Math.floor((count * 0.4) / 8); // Average 8 stars per cluster
  for (let i = 0; i < clusterCount; i++) {
    const baseX = Math.floor(Math.random() * viewportWidth - viewportWidth/2);
    const baseY = Math.floor(Math.random() * viewportHeight - viewportHeight/2);
    const clusterSize = Math.floor(Math.random() * 6) + 5; // 5-10 stars per cluster
    stars += createStarCluster(baseX, baseY, clusterSize, 200); // Larger spread
  }
  
  return stars.slice(0, -1);
}

export function generateStaticStars(count) {
  let stars = '';
  
  // Create a mix of individual stars and clusters
  const individualStarCount = Math.floor(count * 0.7);
  const clusterCount = Math.floor((count * 0.3) / 6);
  
  // Individual stars
  for (let i = 0; i < individualStarCount; i++) {
    const x = Math.random() * 500 - 200; // Even wider range
    const y = Math.random() * 500 - 200;
    const intensity = Math.random() > 0.9 ? 2.5 :
                     Math.random() > 0.7 ? 2 : 1;
    const size = Math.random() * 2 + (intensity > 1 ? 1 : 0);
    stars += createBrightStar(x, y, intensity).replace('px', '%') + ',';
  }
  
  // Clusters
  for (let i = 0; i < clusterCount; i++) {
    const baseX = Math.random() * 500 - 200;
    const baseY = Math.random() * 500 - 200;
    // Create a bright center star
    const centerIntensity = Math.random() > 0.5 ? 2.5 : 2;
    stars += createBrightStar(baseX, baseY, centerIntensity).replace('px', '%') + ',';
    
    // Surrounding stars
    const starCount = Math.floor(Math.random() * 4) + 4; // 4-7 stars per cluster
    for (let j = 0; j < starCount; j++) {
      const angle = (j / starCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const distance = Math.random() * 12 + 6;
      const x = baseX + Math.cos(angle) * distance;
      const y = baseY + Math.sin(angle) * distance;
      stars += createBrightStar(x, y, 1.5).replace('px', '%') + ',';
    }
  }
  
  return stars.slice(0, -1);
}

export function generateNebula(count) {
  let nebulae = '';
  const colors = [
    'rgba(255, 100, 100, VAR_OPACITY)', // Red nebula
    'rgba(100, 100, 255, VAR_OPACITY)', // Blue nebula
    'rgba(255, 200, 100, VAR_OPACITY)', // Orange nebula
    'rgba(200, 100, 255, VAR_OPACITY)', // Purple nebula
    'rgba(100, 255, 200, VAR_OPACITY)', // Cyan nebula
    'rgba(255, 150, 150, VAR_OPACITY)', // Pink nebula
    'rgba(150, 150, 255, VAR_OPACITY)', // Light blue nebula
    'rgba(255, 200, 150, VAR_OPACITY)', // Peach nebula
  ];
  
  for (let i = 0; i < count; i++) {
    const x = Math.floor(Math.random() * 500 - 200);
    const y = Math.floor(Math.random() * 500 - 200);
    const size = Math.random() * 300 + 200; // Even larger nebulas
    const opacity = Math.random() * 0.12 + 0.03;
    const color = colors[Math.floor(Math.random() * colors.length)].replace('VAR_OPACITY', opacity.toString());
    
    // Add multiple layers for each nebula with different sizes and opacities
    const baseSize = size * 0.7;
    nebulae += `${x}% ${y}% ${baseSize}px ${color},`; // Base layer
    nebulae += `${x}% ${y}% ${size}px ${color.replace('VAR_OPACITY', (opacity * 0.6).toString())},`; // Outer layer
    nebulae += `${x}% ${y}% ${baseSize * 0.5}px ${color.replace('VAR_OPACITY', (opacity * 1.5).toString())},`; // Inner bright core
    nebulae += `${x}% ${y}% ${size * 1.5}px ${color.replace('VAR_OPACITY', (opacity * 0.3).toString())},`; // Extra outer glow
  }
  
  return nebulae.slice(0, -1);
} 