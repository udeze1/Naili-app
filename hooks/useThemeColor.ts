import { ColorSchemeName, useColorScheme } from 'react-native';

type ThemeProps = {
  light?: string;
  dark?: string;
};

export function useThemeColor(
  props: ThemeProps = {},
  colorName: string
): string {
  const theme = useColorScheme() as NonNullable<ColorSchemeName>;
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  }

  // Fallback colors, adjust as needed
  const fallbackColors: Record<string, { light: string; dark: string }> = {
    text: { light: '#000', dark: '#fff' },
    background: { light: '#fff', dark: '#000' },
    // Add more color names as needed
  };

  return fallbackColors[colorName]?.[theme] ?? '#000';
}