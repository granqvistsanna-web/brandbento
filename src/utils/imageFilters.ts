import type { ImageTreatment } from '@/types/brand';

export interface TreatmentInfo {
  name: ImageTreatment;
  label: string;
  filter: string;  // CSS filter string (empty for component-based)
  usesComponent: boolean;  // true for duotone, grain
}

export const TREATMENTS: TreatmentInfo[] = [
  {
    name: 'original',
    label: 'Original',
    filter: 'none',
    usesComponent: false,
  },
  {
    name: 'duotone',
    label: 'Duotone',
    filter: 'grayscale(100%)',  // Base filter, component adds color
    usesComponent: true,
  },
  {
    name: 'bw',
    label: 'B&W',
    filter: 'grayscale(100%)',
    usesComponent: false,
  },
  {
    name: 'hi-contrast',
    label: 'Hi-Contrast',
    filter: 'contrast(1.3) saturate(1.2) brightness(1.05)',
    usesComponent: false,
  },
  {
    name: 'soft',
    label: 'Soft',
    filter: 'contrast(0.85) saturate(0.9) brightness(1.1)',
    usesComponent: false,
  },
  {
    name: 'grain',
    label: 'Grain',
    filter: 'none',  // Applied via SVG filter
    usesComponent: true,
  },
];

export function getTreatmentFilter(treatment: ImageTreatment): string {
  const info = TREATMENTS.find(t => t.name === treatment);
  return info?.filter || 'none';
}

export function treatmentUsesComponent(treatment: ImageTreatment): boolean {
  const info = TREATMENTS.find(t => t.name === treatment);
  return info?.usesComponent || false;
}
