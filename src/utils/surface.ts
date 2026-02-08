export const resolveSurfaceColor = ({
  placementId,
  tileSurfaceIndex,
  surfaces,
  bg,
  defaultIndex,
}: {
  placementId?: string;
  tileSurfaceIndex?: number;
  surfaces?: string[];
  bg: string;
  defaultIndex: number;
}): string => {
  const surfaceIndex =
    placementId && tileSurfaceIndex !== undefined ? tileSurfaceIndex : defaultIndex;
  return surfaces?.[surfaceIndex ?? defaultIndex] || bg;
};
