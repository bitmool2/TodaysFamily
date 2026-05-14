export const Colors = {
  // Primary palette
  primary: '#4A7C59',
  primaryLight: '#6A9E78',
  primaryPale: '#E8F2EC',

  // Background
  background: '#FAF6F0',
  backgroundCard: '#FFFFFF',
  backgroundMuted: '#F4EFE8',

  // Text
  textPrimary: '#2C2C2C',
  textSecondary: '#6B6B6B',
  textMuted: '#A0A0A0',
  textInverse: '#FFFFFF',

  // Accent
  accent: '#E8956D',
  accentLight: '#FBE8DC',

  // Semantic
  success: '#4A7C59',
  error: '#D94F3D',
  warning: '#E8A04A',
  info: '#4A7CA0',

  // Borders
  border: '#E8E0D4',
  borderLight: '#F0EBE3',

  // Tab bar
  tabActive: '#4A7C59',
  tabInactive: '#B0A898',

  // Badges
  kidsnoteBadge: '#5B9BD5',
  cameraBadge: '#E8956D',
  galleryBadge: '#A07CB5',

  // Overlay
  overlay: 'rgba(0,0,0,0.5)',
  overlayLight: 'rgba(0,0,0,0.2)',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  section: 40,
} as const;

export const Radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
} as const;

export const FontSize = {
  xs: 11,
  sm: 12,
  md: 14,
  base: 15,
  lg: 16,
  xl: 18,
  xxl: 20,
  xxxl: 24,
  display: 28,
} as const;

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const Shadow = {
  sm: {
    shadowColor: '#8A7B6A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#8A7B6A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#8A7B6A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;
