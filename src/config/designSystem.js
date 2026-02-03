/**
 * Design System Configuration
 * Central source of truth for all design tokens, variants, and styling patterns
 */

// Color Palette
export const colors = {
  // Background layers
  bg: {
    base: 'bg-gray-900',
    elevated: 'bg-gray-800',
    surface: 'bg-gray-800/50',
    input: 'bg-gray-700',
    hover: 'bg-gray-700/50'
  },
  
  // Text colors
  text: {
    primary: 'text-white',
    secondary: 'text-gray-300',
    tertiary: 'text-gray-400',
    disabled: 'text-gray-500'
  },
  
  // Border colors
  border: {
    default: 'border-gray-700',
    focus: 'border-blue-500',
    hover: 'border-gray-600',
    success: 'border-green-700',
    error: 'border-red-700',
    warning: 'border-yellow-700',
    info: 'border-blue-700'
  },
  
  // State colors
  state: {
    success: {
      bg: 'bg-green-900/30',
      text: 'text-green-400',
      border: 'border-green-700'
    },
    error: {
      bg: 'bg-red-900/50',
      text: 'text-red-200',
      border: 'border-red-700'
    },
    warning: {
      bg: 'bg-yellow-900/30',
      text: 'text-yellow-400',
      border: 'border-yellow-700'
    },
    info: {
      bg: 'bg-blue-900/30',
      text: 'text-blue-400',
      border: 'border-blue-700'
    },
    neutral: {
      bg: 'bg-gray-800/50',
      text: 'text-gray-300',
      border: 'border-gray-700'
    }
  }
};

// Spacing scale (matching Tailwind)
export const spacing = {
  xs: 'p-2',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
  xl: 'p-12',
  
  // Gaps
  gapXs: 'gap-2',
  gapSm: 'gap-3',
  gapMd: 'gap-4',
  gapLg: 'gap-6',
  gapXl: 'gap-8'
};

// Border radius
export const radius = {
  sm: 'rounded-lg',
  md: 'rounded-xl',
  lg: 'rounded-2xl',
  full: 'rounded-full'
};

// Shadows
export const shadows = {
  sm: 'shadow-sm',
  md: 'shadow-lg',
  lg: 'shadow-2xl',
  colored: 'shadow-lg shadow-blue-900/50'
};

// Typography
export const typography = {
  h1: 'text-5xl font-bold',
  h2: 'text-3xl font-bold',
  h3: 'text-2xl font-bold',
  h4: 'text-xl font-bold',
  h5: 'text-lg font-semibold',
  body: 'text-base',
  small: 'text-sm',
  xs: 'text-xs',
  
  // Font weights
  weight: {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  }
};

// Effects
export const effects = {
  backdrop: 'backdrop-blur-sm',
  backdropXl: 'backdrop-blur-xl',
  transition: 'transition-all',
  transitionColors: 'transition-colors'
};

// Component variants
export const variants = {
  button: {
    primary: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg shadow-blue-900/50',
    secondary: 'bg-gray-700 hover:bg-gray-600 text-white font-medium',
    ghost: 'bg-transparent hover:bg-gray-700 text-gray-300',
    danger: 'bg-red-600 hover:bg-red-700 text-white font-semibold',
    success: 'bg-green-600 hover:bg-green-700 text-white font-semibold',
    outline: 'border-2 border-gray-600 hover:border-gray-500 text-white bg-transparent'
  },
  
  card: {
    default: 'bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700',
    elevated: 'bg-gray-800/95 backdrop-blur-xl rounded-2xl border border-gray-700 shadow-2xl',
    flat: 'bg-gray-800 rounded-2xl border border-gray-700',
    glass: 'bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10'
  },
  
  modal: {
    overlay: 'fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4',
    overlayDark: 'fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4',
    content: 'bg-gray-800/95 backdrop-blur-xl rounded-2xl p-6 border border-gray-700 shadow-2xl max-w-2xl w-full'
  },
  
  input: {
    default: 'w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500',
    error: 'w-full px-4 py-3 bg-gray-700 border border-red-500 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500'
  },
  
  badge: {
    default: 'bg-gray-700 text-gray-300',
    success: 'bg-green-900/50 text-green-400',
    info: 'bg-blue-900/50 text-blue-400',
    warning: 'bg-yellow-900/50 text-yellow-400',
    error: 'bg-red-900/50 text-red-400',
    manual: 'bg-purple-900/50 text-purple-400'
  },
  
  infoBox: {
    success: 'bg-green-900/30 backdrop-blur-sm rounded-xl p-4 border border-green-700',
    info: 'bg-blue-900/30 backdrop-blur-sm rounded-xl p-4 border border-blue-700',
    warning: 'bg-yellow-900/30 backdrop-blur-sm rounded-xl p-4 border border-yellow-700',
    error: 'bg-red-900/50 backdrop-blur-sm rounded-xl p-4 border border-red-700',
    neutral: 'bg-gray-700/50 backdrop-blur-sm rounded-xl p-4 border border-gray-600'
  }
};

// Animation presets
export const animations = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  
  scaleIn: {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.9, opacity: 0 }
  },
  
  slideUp: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 20, opacity: 0 }
  },
  
  slideDown: {
    initial: { y: -20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 }
  }
};

// Gradients
export const gradients = {
  primary: 'bg-gradient-to-r from-blue-600 to-blue-700',
  secondary: 'bg-gradient-to-r from-purple-600 to-blue-600',
  success: 'bg-gradient-to-br from-green-600 to-green-700',
  danger: 'bg-gradient-to-br from-red-600 to-red-700',
  page: 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
};

// Layout utilities
export const layout = {
  container: 'max-w-4xl mx-auto px-4 py-4',
  containerLg: 'max-w-6xl mx-auto px-4 py-4',
  containerSm: 'max-w-2xl mx-auto px-4 py-4',
  
  flexCenter: 'flex items-center justify-center',
  flexBetween: 'flex items-center justify-between',
  flexStart: 'flex items-center justify-start',
  flexEnd: 'flex items-center justify-end',
  
  gridCols2: 'grid grid-cols-1 sm:grid-cols-2',
  gridCols3: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  gridCols4: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
};

// Helper function to combine classes
export const cn = (...classes) => classes.filter(Boolean).join(' ');
