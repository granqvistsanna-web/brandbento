declare module 'color-contrast-checker' {
    export default class ColorContrastChecker {
        isLevelAA(color1: string, color2: string, fontSize?: number): boolean;
        isLevelAAA(color1: string, color2: string, fontSize?: number): boolean;
        checkPair(color1: string, color2: string, fontSize?: number): {
            WCAG_AA: boolean;
            WCAG_AAA: boolean;
        };
    }
}
