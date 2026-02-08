/**
 * Services Barrel Export
 *
 * Central export point for all brand extraction services.
 *
 * ## Main Entry Point
 * - `extractBrand` - Orchestrates full extraction pipeline
 *
 * ## Individual Extractors
 * - `extractColors` - Color palette extraction
 * - `extractFonts` - Typography extraction
 * - `extractLogo` - Logo/favicon extraction
 * - `extractImages` - Hero imagery extraction
 *
 * ## Utilities
 * - `fetchViaProxy` - CORS proxy for external URLs
 * - `isDefaultAsset` - Check if asset uses defaults
 *
 * @module services
 */
export { extractBrand, isDefaultAsset } from './brandExtractor';
export type { ExtractionProgress, ProgressCallback } from './brandExtractor';
export { fetchViaProxy } from './corsProxy';
export { extractColors } from './extractColors';
export { extractFonts } from './extractFonts';
export { extractLogo } from './extractLogo';
export { extractImages } from './extractImages';
