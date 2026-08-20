import { ScreenFrameSpec } from '../types';

export const SCREEN_FRAME_SPECS: Record<string, ScreenFrameSpec> = {
  'iphone-16-pro': {
    id: 'iphone-16-pro',
    name: 'iPhone 16 Pro',
    width: 393,
    height: 852,
    ratio: '19.5:9',
    os: 'iOS',
    cornerRadius: 48,
    notchType: 'dynamic-island',
    safeAreaTop: 59,
    safeAreaBottom: 34,
    description: 'Current iOS flagship standard. Optimal for high-density editorial UI with Dynamic Island.'
  },
  'iphone-14-15': {
    id: 'iphone-14-15',
    name: 'iPhone 14 / 15',
    width: 390,
    height: 844,
    ratio: '19.5:9',
    os: 'iOS',
    cornerRadius: 44,
    notchType: 'dynamic-island',
    safeAreaTop: 47,
    safeAreaBottom: 34,
    description: 'Industry standard iOS baseline frame used across Figma design libraries.'
  },
  'pixel-8': {
    id: 'pixel-8',
    name: 'Google Pixel 8 / 9',
    width: 412,
    height: 915,
    ratio: '20:9',
    os: 'Android',
    cornerRadius: 28,
    notchType: 'punch-hole',
    safeAreaTop: 48,
    safeAreaBottom: 24,
    description: 'Modern Android flagship frame with tall aspect ratio.'
  },
  'galaxy-s24': {
    id: 'galaxy-s24',
    name: 'Galaxy S24',
    width: 360,
    height: 780,
    ratio: '19.5:9',
    os: 'Android',
    cornerRadius: 24,
    notchType: 'punch-hole',
    safeAreaTop: 40,
    safeAreaBottom: 24,
    description: 'Mainstream compact Android baseline (360dp width).'
  },
  'iphone-se': {
    id: 'iphone-se',
    name: 'iPhone SE / Compact',
    width: 375,
    height: 667,
    ratio: '16:9',
    os: 'iOS',
    cornerRadius: 0,
    notchType: 'none',
    safeAreaTop: 20,
    safeAreaBottom: 0,
    description: 'Compact 16:9 baseline for checking minimum viewport responsiveness.'
  },
  'fluid': {
    id: 'fluid',
    name: 'Desktop / Fluid',
    width: 1200,
    height: 900,
    ratio: 'Fluid',
    os: 'Responsive',
    cornerRadius: 8,
    notchType: 'none',
    safeAreaTop: 0,
    safeAreaBottom: 0,
    description: 'Unconstrained wide desktop view for admin & tablet testing.'
  }
};
