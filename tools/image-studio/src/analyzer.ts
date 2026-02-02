/**
 * Image analysis utilities for evaluating and scoring images
 */

/**
 * Calculate luminance from hex color
 * @param hexColor - Hex color code
 * @returns Luminance value (0-1)
 */
export function calculateLuminance(hexColor: string): number {
  if (!hexColor || hexColor === '#ffffff' || hexColor === '#fff') {
    return 1.0; // White is brightest
  }
  
  // Remove the hash if present
  const hex = hexColor.replace('#', '');
  
  // Handle short hex codes
  const fullHex = hex.length === 3 ? 
    hex.split('').map(char => char + char).join('') : 
    hex;
  
  // Convert to RGB
  const r = parseInt(fullHex.substring(0, 2), 16) || 0;
  const g = parseInt(fullHex.substring(2, 4), 16) || 0;
  const b = parseInt(fullHex.substring(4, 6), 16) || 0;
  
  // Calculate relative luminance (ITU-R BT.709)
  const sRGB = [r, g, b].map(channel => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
}

/**
 * Estimate dominant color family from hex
 * @param hexColor - Hex color code
 * @returns Color information
 */
export function estimateDominantColor(hexColor: string): {
  family: string;
  warmth: string;
  suitability: number;
} {
  if (!hexColor) return { family: 'unknown', warmth: 'neutral', suitability: 0 };
  
  const hex = hexColor.replace('#', '');
  const fullHex = hex.length === 3 ? 
    hex.split('').map(char => char + char).join('') : 
    hex;
  
  const r = parseInt(fullHex.substring(0, 2), 16) || 0;
  const g = parseInt(fullHex.substring(2, 4), 16) || 0;
  const b = parseInt(fullHex.substring(4, 6), 16) || 0;
  
  // Determine dominant color family
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const saturation = max === 0 ? 0 : (max - min) / max;
  
  let family = 'neutral';
  let warmth = 'neutral';
  let suitability = 0.5; // Base suitability for dark backgrounds
  
  if (saturation < 0.2) {
    // Low saturation - grayscale
    family = 'grayscale';
    suitability = 0.8; // Grayscale is great for text overlays
  } else if (r > g && r > b) {
    family = 'red';
    warmth = 'warm';
    suitability = 0.4; // Red can be tricky for text
  } else if (g > r && g > b) {
    family = 'green';
    warmth = 'cool';
    suitability = 0.6; // Green can work well
  } else if (b > r && b > g) {
    family = 'blue';
    warmth = 'cool';
    suitability = 0.7; // Blue is often good for backgrounds
  } else if (r > b && g > b) {
    family = 'yellow';
    warmth = 'warm';
    suitability = 0.3; // Yellow is usually too bright
  } else if (r > g && b > g) {
    family = 'purple';
    warmth = 'cool';
    suitability = 0.7; // Purple can be elegant
  }
  
  return { family, warmth, suitability };
}

/**
 * Calculate overall image score for dark background suitability
 * @param luminance - Luminance value
 * @param colorInfo - Dominant color information
 * @param priority - Strategy priority
 * @returns Score (0-1)
 */
export function calculateImageScore(
  luminance: number, 
  colorInfo: { family: string; warmth: string; suitability: number }, 
  priority: string = 'medium'
): number {
  let score = 0;
  
  // Luminance score (darker is better)
  const luminanceScore = 1 - luminance; // Invert so darker = higher score
  score += luminanceScore * 0.6; // 60% weight
  
  // Color suitability score
  score += colorInfo.suitability * 0.3; // 30% weight
  
  // Strategy priority bonus
  const priorityBonus: Record<string, number> = {
    'high': 0.1,
    'medium': 0.05,
    'low': 0
  };
  score += priorityBonus[priority] || 0; // 10% weight
  
  return Math.min(score, 1); // Cap at 1
}

/**
 * Check if a hex color is dark enough for white text
 * @param hexColor - Hex color code
 * @returns True if dark enough
 */
export function isDarkColor(hexColor: string): boolean {
  const luminance = calculateLuminance(hexColor);
  return luminance < 0.5;
}