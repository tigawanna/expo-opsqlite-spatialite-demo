/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Color } from 'expo-router';
import { Platform, type ColorSchemeName, type ColorValue } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    card: '#ffffff',
    cardBorder: '#e2e8f0',
    onPrimary: '#ffffff',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    card: '#141820',
    cardBorder: '#252b36',
    onPrimary: '#151718',
  },
};

const androidDynamic = Color.android.dynamic;

const androidThemeColors = {
  text: androidDynamic.onBackground,
  background: androidDynamic.background,
  tint: androidDynamic.primary,
  icon: androidDynamic.onSurfaceVariant,
  tabIconDefault: androidDynamic.onSurfaceVariant,
  tabIconSelected: androidDynamic.primary,
  card: androidDynamic.surfaceContainerHigh,
  cardBorder: androidDynamic.outlineVariant,
  onPrimary: androidDynamic.onPrimary,
} satisfies Record<keyof typeof Colors.light, ColorValue>;

export function getThemeColor(
  colorName: keyof typeof Colors.light,
  colorScheme?: ColorSchemeName | null,
): ColorValue {
  if (Platform.OS === 'android') {
    return androidThemeColors[colorName];
  }
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  return Colors[theme][colorName];
}

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
