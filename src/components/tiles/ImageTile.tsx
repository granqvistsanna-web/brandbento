import { useBrandStore } from '../../store/useBrandStore';
import { motion } from 'motion/react';
import { getPlacementTileId, getPlacementTileType } from '@/config/placements';

/**
 * Image Tile Component
 * 
 * A simple tile that displays a single image with optional overlay treatment.
 * 
 * @param {Object} props - Component props
 * @param {string} props.placementId - Unique ID for this tile's placement in the grid
 */
export const ImageTile = ({ placementId }: { placementId: string }) => {
    const placementTileId = getPlacementTileId(placementId);
    const placementTileType = getPlacementTileType(placementId);
    const tile = useBrandStore((s) => {
        if (placementTileId) {
            return s.tiles.find((t) => t.id === placementTileId);
        }
        if (placementTileType) {
            return s.tiles.find((t) => t.type === placementTileType);
        }
        return undefined;
    });
    const imagery = useBrandStore((s) => s.brand?.imagery);

    const content = tile?.content || {};
    const imageUrl = content.image || imagery?.url;
    const overlayText = content.overlayText;

    if (!imageUrl) {
        return (
            <div
                className="w-full h-full flex items-center justify-center"
                style={{
                    background: "var(--canvas-surface)",
                    color: "var(--canvas-text-secondary)",
                }}
            >
                No Image Selected
            </div>
        );
    }

    return (
        <div className="relative w-full h-full overflow-hidden group">
            <motion.img
                src={imageUrl}
                alt={overlayText || "Brand imagery"}
                className="w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
            />

            {overlayText && (
                <div
                    className="absolute inset-0 flex items-center justify-center p-6 transition-fast"
                    style={{
                        background: "color-mix(in srgb, var(--canvas-text) 20%, transparent)",
                    }}
                >
                    <h3
                        className="text-2xl font-bold text-center drop-shadow-lg"
                        style={{ color: "var(--canvas-surface)" }}
                    >
                        {overlayText}
                    </h3>
                </div>
            )}
        </div>
    );
};
