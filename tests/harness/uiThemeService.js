/**
 * LoLTheory UI Theme and WCAG Color Contrast Verification Service
 */

const THEME_TOKENS = {
  bgBase: '#090A0C',
  bgSurface1: '#0F1015',
  bgSurface2: '#151821',
  bgSurfaceHover: '#1B1F2C',
  borderSubtle: '#262B3D',
  borderActive: '#3A4259',
  goldPrimary: '#D4A017',
  goldBright: '#F3B72C',
  goldAmber: '#EAB308',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B'
};

const DIFFICULTY_BADGES = {
  EASY: {
    text: '#10B981',
    bg: '#062E22',
    border: '#059669',
    label: 'FÁCIL'
  },
  MEDIUM: {
    text: '#F59E0B',
    bg: '#2E1E05',
    border: '#D97706',
    label: 'MÉDIO'
  },
  HARD: {
    text: '#FB923C',
    bg: '#381308',
    border: '#EA580C',
    label: 'DIFÍCIL'
  },
  EXTREME: {
    text: '#EF4444',
    bg: '#2F0909',
    border: '#DC2626',
    label: 'MUITO DIFÍCIL'
  }
};

const CONNECTION_STATUS = {
  DISCONNECTED: {
    color: '#64748B',
    label: 'Desconectado',
    mode: 'MANUAL'
  },
  LOBBY: {
    color: '#38BDF8',
    label: 'No Lobby',
    mode: 'LCU_AUTO'
  },
  CHAMP_SELECT: {
    color: '#F59E0B',
    label: 'Picks & Bans',
    mode: 'LCU_AUTO'
  },
  IN_GAME: {
    color: '#10B981',
    label: 'Em Partida',
    mode: 'LIVE_CLIENT'
  },
  POST_GAME: {
    color: '#A78BFA',
    label: 'Pós-Jogo',
    mode: 'LCU_AUTO'
  }
};

/**
 * Converts Hex color to sRGB relative luminance
 */
function getRelativeLuminance(hex) {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;

  const toLinear = (c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const R = toLinear(r);
  const G = toLinear(g);
  const B = toLinear(b);

  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

/**
 * Calculates WCAG contrast ratio between two hex colors
 */
function getContrastRatio(hex1, hex2) {
  const lum1 = getRelativeLuminance(hex1);
  const lum2 = getRelativeLuminance(hex2);
  const brighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (brighter + 0.05) / (darker + 0.05);
}

module.exports = {
  THEME_TOKENS,
  DIFFICULTY_BADGES,
  CONNECTION_STATUS,
  getRelativeLuminance,
  getContrastRatio
};
