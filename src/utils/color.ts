import { hexToHSL } from './colorMapping';

export const getAdaptiveTextColor = (
  backgroundHex: string,
  lightColor: string,
  darkColor: string,
  threshold = 55
): string => {
  const { l } = hexToHSL(backgroundHex);
  return l > threshold ? lightColor : darkColor;
};
