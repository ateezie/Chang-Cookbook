const fs = require('fs');
const path = require('path');

// Create Open Graph default image as SVG then we can convert if needed
function generateOGImageSVG() {
  const svgContent = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#faf8f5" />
      <stop offset="50%" stop-color="#f5f1eb" />
      <stop offset="100%" stop-color="#fff" />
    </linearGradient>
    <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ff9966" />
      <stop offset="100%" stop-color="#e6824e" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-opacity="0.1"/>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bgGradient)"/>
  
  <!-- Decorative elements -->
  <circle cx="100" cy="100" r="60" fill="#ffab80" opacity="0.1"/>
  <circle cx="1100" cy="530" r="80" fill="#ff9966" opacity="0.1"/>
  <rect x="200" y="50" width="800" height="2" fill="#chang-orange-400" opacity="0.3"/>
  <rect x="200" y="578" width="800" height="2" fill="#chang-orange-400" opacity="0.3"/>
  
  <!-- Logo Circle -->
  <circle cx="300" cy="315" r="80" fill="url(#logoGradient)" filter="url(#shadow)"/>
  
  <!-- Chef emoji in logo -->
  <text x="300" y="340" text-anchor="middle" font-size="60" fill="white">👨‍🍳</text>
  
  <!-- Main Title -->
  <text x="450" y="280" font-family="'Segoe UI', system-ui, sans-serif" font-size="72" font-weight="bold" fill="#4a3429">
    Chang Cookbook
  </text>
  
  <!-- Subtitle -->
  <text x="450" y="340" font-family="'Segoe UI', system-ui, sans-serif" font-size="28" fill="#6b4f3a">
    Delicious recipes for every occasion
  </text>
  
  <!-- URL -->
  <text x="450" y="390" font-family="'Segoe UI', system-ui, sans-serif" font-size="22" fill="#8b6f52">
    cook.alexthip.com
  </text>
  
  <!-- Food icons decoration -->
  <text x="950" y="200" font-size="40" opacity="0.6">🍜</text>
  <text x="1050" y="250" font-size="35" opacity="0.6">🥘</text>
  <text x="1000" y="300" font-size="30" opacity="0.6">🍝</text>
  <text x="1080" y="350" font-size="35" opacity="0.6">🥗</text>
  
  <!-- Featured recipes text -->
  <text x="450" y="480" font-family="'Segoe UI', system-ui, sans-serif" font-size="20" fill="#6b4f3a" opacity="0.8">
    21 tested recipes • Thai, Italian, and fusion cuisine
  </text>
</svg>`.trim();

  return svgContent;
}

// Generate and save the OG image
function main() {
  const ogDir = path.join(__dirname, 'public', 'images', 'og');
  
  // Ensure directory exists
  if (!fs.existsSync(ogDir)) {
    fs.mkdirSync(ogDir, { recursive: true });
  }
  
  const svgContent = generateOGImageSVG();
  const svgPath = path.join(ogDir, 'default.svg');
  
  try {
    fs.writeFileSync(svgPath, svgContent);
    console.log('✅ Generated Open Graph default image:', svgPath);
    
    // Also create a simple HTML preview
    const htmlPreview = `
<!DOCTYPE html>
<html>
<head>
  <title>Chang Cookbook OG Image Preview</title>
  <style>
    body { font-family: system-ui; text-align: center; padding: 20px; background: #f0f0f0; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    img { max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 4px; }
    .meta { margin-top: 20px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Chang Cookbook - Open Graph Image Preview</h1>
    <img src="default.svg" alt="Chang Cookbook Open Graph Image" />
    <div class="meta">
      <p><strong>Size:</strong> 1200x630px (Facebook/Twitter optimal)</p>
      <p><strong>Format:</strong> SVG (scalable, small file size)</p>
      <p><strong>Usage:</strong> Social media sharing, search results</p>
    </div>
  </div>
</body>
</html>`;
    
    fs.writeFileSync(path.join(ogDir, 'preview.html'), htmlPreview);
    console.log('✅ Generated preview:', path.join(ogDir, 'preview.html'));
    
  } catch (error) {
    console.error('❌ Error generating OG image:', error);
  }
}

if (require.main === module) {
  main();
}

module.exports = { generateOGImageSVG };