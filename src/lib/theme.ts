import { DarkTheme, DefaultTheme, type Theme } from '@react-navigation/native';

export const THEME = {
  light: {
    background: 'hsl(40 33% 97%)', // parchment #FAF9F6
    foreground: 'hsl(30 8% 10%)', // ink #1C1A18
    card: 'hsl(40 18% 91%)', // linen #EDEAE3
    cardForeground: 'hsl(30 8% 10%)', // ink
    popover: 'hsl(40 33% 97%)', // parchment
    popoverForeground: 'hsl(30 8% 10%)', // ink
    primary: 'hsl(30 8% 10%)', // ink
    primaryForeground: 'hsl(40 33% 97%)', // parchment
    secondary: 'hsl(40 18% 91%)', // linen
    secondaryForeground: 'hsl(30 8% 10%)', // ink
    muted: 'hsl(40 18% 91%)', // linen
    mutedForeground: 'hsl(30 4% 53%)', // ash #8C8680
    accent: 'hsl(40 18% 91%)', // linen
    accentForeground: 'hsl(30 8% 10%)', // ink
    destructive: 'hsl(9 56% 49%)', // red #C4503A
    border: 'hsl(37 10% 81%)', // dust #D4CFC8
    input: 'hsl(37 10% 81%)', // dust
    ring: 'hsl(37 61% 42%)', // amber #B07D2A
    radius: '0.625rem',
    chart1: 'hsl(37 61% 42%)', // amber
    chart2: 'hsl(37 61% 55%)', // amber light
    chart3: 'hsl(30 20% 65%)', // warm grey
    chart4: 'hsl(9 56% 49%)', // red
    chart5: 'hsl(37 30% 72%)', // dust warm
  },
  dark: {
    background: 'hsl(30 8% 10%)', // ink #1C1A18
    foreground: 'hsl(40 33% 97%)', // parchment #FAF9F6
    card: 'hsl(30 8% 13%)', // ink elevated
    cardForeground: 'hsl(40 33% 97%)', // parchment
    popover: 'hsl(30 8% 10%)', // ink
    popoverForeground: 'hsl(40 33% 97%)', // parchment
    primary: 'hsl(40 33% 97%)', // parchment
    primaryForeground: 'hsl(30 8% 10%)', // ink
    secondary: 'hsl(30 8% 17%)', // ink raised
    secondaryForeground: 'hsl(40 33% 97%)', // parchment
    muted: 'hsl(30 8% 17%)', // ink raised
    mutedForeground: 'hsl(30 4% 53%)', // ash
    accent: 'hsl(30 8% 17%)', // ink raised
    accentForeground: 'hsl(40 33% 97%)', // parchment
    destructive: 'hsl(9 60% 55%)', // red brighter on dark
    border: 'hsl(30 8% 20%)', // ink subtle border
    input: 'hsl(30 8% 20%)', // ink subtle border
    ring: 'hsl(37 61% 42%)', // amber
    radius: '0.625rem',
    chart1: 'hsl(37 61% 55%)', // amber bright
    chart2: 'hsl(37 50% 68%)', // amber pale
    chart3: 'hsl(30 15% 60%)', // warm grey
    chart4: 'hsl(9 60% 55%)', // red bright
    chart5: 'hsl(37 25% 45%)', // dust dark
  },
};

export const NAV_THEME: Record<'light' | 'dark', Theme> = {
  light: {
    ...DefaultTheme,
    colors: {
      background: THEME.light.background,
      border: THEME.light.border,
      card: THEME.light.card,
      notification: THEME.light.destructive,
      primary: THEME.light.primary,
      text: THEME.light.foreground,
    },
  },
  dark: {
    ...DarkTheme,
    colors: {
      background: THEME.dark.background,
      border: THEME.dark.border,
      card: THEME.dark.card,
      notification: THEME.dark.destructive,
      primary: THEME.dark.primary,
      text: THEME.dark.foreground,
    },
  },
};

export const COLORS = {
  parchment: '#FAF9F6',
  linen: '#EDEAE3',
  ink: '#1C1A18',
  inkRaised: '#2A2724',
  amber: '#B07D2A',
  ash: '#8C8680',
  dust: '#D4CFC8',
  red: '#C4503A',
} as const;

export function colorWithOpacity(hex: string, opacity: number): string {
  const alpha = Math.round(opacity * 255).toString(16).padStart(2, '0');
  return `${hex}${alpha}`;
}

export const FONTS = {
  display: 'CormorantGaramond-Regular',
  displayLight: 'CormorantGaramond-Light',
  displayItalic: 'CormorantGaramond-Italic',
  displayLightItalic: 'CormorantGaramond-LightItalic',
  displayMedium: 'CormorantGaramond-Medium',
  ui: 'DMSans-Regular',
  uiLight: 'DMSans-Light',
  uiMedium: 'DMSans-Medium',
} as const;

export type FontFamily = (typeof FONTS)[keyof typeof FONTS];

export const TYPE = {
  displayXL:   { fontFamily: FONTS.displayLightItalic, fontSize: 32, lineHeight: 40, letterSpacing: -0.5 },
  displayL:    { fontFamily: FONTS.displayLightItalic, fontSize: 28, lineHeight: 36, letterSpacing: -0.3 },
  displayM:    { fontFamily: FONTS.displayLightItalic, fontSize: 22, lineHeight: 28 },
  screenTitle: { fontFamily: FONTS.displayLightItalic, fontSize: 24, lineHeight: 30 },
  displayS:    { fontFamily: FONTS.displayLightItalic, fontSize: 17, lineHeight: 22 },
  body:        { fontFamily: FONTS.ui, fontSize: 15, lineHeight: 22 },
  bodyS:       { fontFamily: FONTS.ui, fontSize: 13, lineHeight: 20 },
  label:       { fontFamily: FONTS.uiMedium, fontSize: 11, letterSpacing: 0.8, textTransform: 'uppercase' as const },
  caption:     { fontFamily: FONTS.ui, fontSize: 11, lineHeight: 16 },
} as const;
