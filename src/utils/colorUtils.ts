// Color utility functions for dynamic theming
export interface ColorTheme {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  primaryBg: string;
  primaryText: string;
  primaryBorder: string;
  primaryHover: string;
}

// Predefined color mappings for common colors
const colorMappings: Record<string, ColorTheme> = {
  green: {
    primary: 'green-500',
    primaryLight: 'green-400',
    primaryDark: 'green-600',
    primaryBg: 'bg-green-500',
    primaryText: 'text-green-500',
    primaryBorder: 'border-green-500',
    primaryHover: 'hover:bg-green-600',
  },
  blue: {
    primary: 'blue-500',
    primaryLight: 'blue-400',
    primaryDark: 'blue-600',
    primaryBg: 'bg-blue-500',
    primaryText: 'text-blue-500',
    primaryBorder: 'border-blue-500',
    primaryHover: 'hover:bg-blue-600',
  },
  purple: {
    primary: 'purple-500',
    primaryLight: 'purple-400',
    primaryDark: 'purple-600',
    primaryBg: 'bg-purple-500',
    primaryText: 'text-purple-500',
    primaryBorder: 'border-purple-500',
    primaryHover: 'hover:bg-purple-600',
  },
  red: {
    primary: 'red-500',
    primaryLight: 'red-400',
    primaryDark: 'red-600',
    primaryBg: 'bg-red-500',
    primaryText: 'text-red-500',
    primaryBorder: 'border-red-500',
    primaryHover: 'hover:bg-red-600',
  },
  orange: {
    primary: 'orange-500',
    primaryLight: 'orange-400',
    primaryDark: 'orange-600',
    primaryBg: 'bg-orange-500',
    primaryText: 'text-orange-500',
    primaryBorder: 'border-orange-500',
    primaryHover: 'hover:bg-orange-600',
  },
  pink: {
    primary: 'pink-500',
    primaryLight: 'pink-400',
    primaryDark: 'pink-600',
    primaryBg: 'bg-pink-500',
    primaryText: 'text-pink-500',
    primaryBorder: 'border-pink-500',
    primaryHover: 'hover:bg-pink-600',
  },
  indigo: {
    primary: 'indigo-500',
    primaryLight: 'indigo-400',
    primaryDark: 'indigo-600',
    primaryBg: 'bg-indigo-500',
    primaryText: 'text-indigo-500',
    primaryBorder: 'border-indigo-500',
    primaryHover: 'hover:bg-indigo-600',
  },
  teal: {
    primary: 'teal-500',
    primaryLight: 'teal-400',
    primaryDark: 'teal-600',
    primaryBg: 'bg-teal-500',
    primaryText: 'text-teal-500',
    primaryBorder: 'border-teal-500',
    primaryHover: 'hover:bg-teal-600',
  },
  yellow: {
    primary: 'yellow-500',
    primaryLight: 'yellow-400',
    primaryDark: 'yellow-600',
    primaryBg: 'bg-yellow-500',
    primaryText: 'text-yellow-500',
    primaryBorder: 'border-yellow-500',
    primaryHover: 'hover:bg-yellow-600',
  },
  gray: {
    primary: 'gray-500',
    primaryLight: 'gray-400',
    primaryDark: 'gray-600',
    primaryBg: 'bg-gray-500',
    primaryText: 'text-gray-500',
    primaryBorder: 'border-gray-500',
    primaryHover: 'hover:bg-gray-600',
  },
};

// Function to get color theme from color value
export function getColorTheme(colorValue: string): ColorTheme {
  // If it's a hex color, convert to closest Tailwind color
  if (colorValue.startsWith('#')) {
    return hexToColorTheme(colorValue);
  }
  
  // If it's a named color, use the mapping
  const colorName = colorValue.toLowerCase().replace(/\s+/g, '');
  return colorMappings[colorName] || colorMappings.green; // Default to green
}

// Convert hex string to RGB
function hexToRgb(hex: string) {
  const cleaned = hex.replace('#', '');
  const bigint = parseInt(cleaned, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b };
}

// Calculate Euclidean distance between two RGB colors
function colorDistance(c1: { r: number; g: number; b: number }, c2: { r: number; g: number; b: number }) {
  return Math.sqrt(
    Math.pow(c1.r - c2.r, 2) +
    Math.pow(c1.g - c2.g, 2) +
    Math.pow(c1.b - c2.b, 2)
  );
}

// Map Tailwind color names to representative hex
const tailwindHexes: Record<string, string> = {
  green: '#10b981',
  blue: '#3b82f6',
  purple: '#8b5cf6',
  red: '#ef4444',
  orange: '#f97316',
  pink: '#ec4899',
  indigo: '#6366f1',
  teal: '#14b8a6',
  yellow: '#eab308',
  gray: '#6b7280',
};

// Robust hex-to-Tailwind mapping
function hexToColorTheme(hex: string): ColorTheme {
  const target = hexToRgb(hex);
  let closestColor = 'green';
  let closestDistance = Infinity;

  for (const [name, hexValue] of Object.entries(tailwindHexes)) {
    const c = hexToRgb(hexValue);
    const distance = colorDistance(target, c);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestColor = name;
    }
  }

  return colorMappings[closestColor];
}

// Utility function to replace green classes with dynamic color classes
export function replaceGreenWithColor(className: string, colorTheme: ColorTheme): string {
  return className
    .replace(/green-500/g, colorTheme.primary)
    .replace(/green-400/g, colorTheme.primaryLight)
    .replace(/green-600/g, colorTheme.primaryDark)
    .replace(/bg-green-500/g, colorTheme.primaryBg)
    .replace(/text-green-500/g, colorTheme.primaryText)
    .replace(/border-green-500/g, colorTheme.primaryBorder)
    .replace(/hover:bg-green-600/g, colorTheme.primaryHover);
}

// Hook to get current color theme
export function useColorTheme(colorValue?: string): ColorTheme {
  const defaultTheme = colorMappings.green;
  
  if (!colorValue) {
    return defaultTheme;
  }
  
  return getColorTheme(colorValue);
}
