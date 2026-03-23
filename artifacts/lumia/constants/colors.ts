export const COLORS = {
  bg: '#0a0a0a',
  bgSecondary: '#111111',
  bgCard: 'rgba(255,255,255,0.04)',
  bgCardHover: 'rgba(255,255,255,0.07)',

  silver: '#C0C8D8',
  silverDim: 'rgba(192,200,216,0.6)',
  silverBorder: 'rgba(192,200,216,0.18)',
  silverGlow: 'rgba(220,230,255,0.12)',

  emerald: '#00E07A',
  emeraldDim: 'rgba(0,224,122,0.6)',
  emeraldBorder: 'rgba(0,224,122,0.25)',
  emeraldGlow: 'rgba(0,224,122,0.10)',

  honor: '#FFD700',
  honorGlow: 'rgba(255,215,0,0.25)',
  shame: '#A855F7',
  shameGlow: 'rgba(168,85,247,0.25)',
  vitality: '#00E07A',
  vitalityGlow: 'rgba(0,224,122,0.25)',
  decay: '#EF4444',
  decayGlow: 'rgba(239,68,68,0.25)',

  textPrimary: '#F0F4FF',
  textSecondary: 'rgba(240,244,255,0.6)',
  textMuted: 'rgba(240,244,255,0.35)',

  xpGold: '#FFD700',
  xpPurple: '#A855F7',

  white: '#FFFFFF',
  black: '#000000',
};

export default {
  light: {
    text: COLORS.textPrimary,
    background: COLORS.bg,
    tint: COLORS.emerald,
    tabIconDefault: COLORS.silverDim,
    tabIconSelected: COLORS.emerald,
  },
};
