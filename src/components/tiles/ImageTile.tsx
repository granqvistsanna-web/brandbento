import { useBrandStore } from '../../store/useBrandStore';
import { useShallow } from 'zustand/react/shallow';
import { motion } from 'motion/react';
import { usePlacementTile } from '@/hooks/usePlacementTile';
import { useGoogleFonts } from '@/hooks/useGoogleFonts';
import { clampFontSize, getFontCategory, getTypeScale } from '@/utils/typography';
import { getImageFilter } from '@/utils/imagery';
import { useTileToolbar } from '@/hooks/useTileToolbar';
import {
  FloatingToolbar,
  ToolbarActions,
  ToolbarTextInput,
  ToolbarDivider,
  getRandomShuffleImage,
} from './FloatingToolbar';

/**
 * Image Tile Component
 *
 * A simple tile that displays a single image with optional overlay treatment.
 *
 * @param {Object} props - Component props
 * @param {string} props.placementId - Unique ID for this tile's placement in the grid
 */
export const ImageTile = ({ placementId }: { placementId: string }) => {
    const { tileId: placementTileId, tileType: placementTileType } = usePlacementTile(placementId);
    const tile = useBrandStore((s) => {
        if (placementTileId) {
            return s.tiles.find((t) => t.id === placementTileId);
        }
        if (placementTileType) {
            return s.tiles.find((t) => t.type === placementTileType);
        }
        return undefined;
    });
    const { imagery, typography } = useBrandStore(useShallow((s) => ({
        imagery: s.brand?.imagery,
        typography: s.brand?.typography,
    })));
    const imageFilter = getImageFilter(imagery?.style ?? 'default', imagery?.overlay ?? 0);
    const updateTile = useBrandStore((s) => s.updateTile);
    const fontPreview = useBrandStore((state) => state.fontPreview);

    // Apply font preview if active
    const primaryFontChoice = fontPreview?.target === "primary" ? fontPreview.font : (typography?.primary || 'Inter');

    const { fontFamily: headlineFont } = useGoogleFonts(primaryFontChoice, getFontCategory(primaryFontChoice));
    const typeScale = getTypeScale(typography);

    const content = tile?.content || {};
    const imageUrl = content.image || imagery?.url;
    const overlayText = content.overlayText;

    const colors = useBrandStore((s) => s.brand?.colors);

    const { isFocused, containerRef, anchorRect } = useTileToolbar(placementId);

    if (!imageUrl) {
        return (
            <div
                ref={containerRef}
                className="w-full h-full overflow-hidden"
                style={{
                    background: `linear-gradient(135deg, ${colors?.primary || '#333'}ee, ${colors?.accent || colors?.primary || '#555'}aa)`,
                }}
            >
                {isFocused && anchorRect && tile?.id && (
                    <FloatingToolbar anchorRect={anchorRect}>
                        <ToolbarActions
                            onShuffle={() => {
                                updateTile(tile!.id, { image: getRandomShuffleImage(content.image) }, true);
                            }}
                            hasImage
                            imageLocked={!!content.imageLocked}
                            onToggleLock={() => updateTile(tile!.id, { imageLocked: !content.imageLocked }, true)}
                            onImageUpload={(dataUrl) => updateTile(tile!.id, { image: dataUrl }, true)}
                        />
                        <ToolbarDivider />
                        <ToolbarTextInput
                            label="Overlay"
                            value={content.overlayText || ''}
                            onChange={(v) => updateTile(tile!.id, { overlayText: v }, false)}
                            onCommit={(v) => updateTile(tile!.id, { overlayText: v }, true)}
                            placeholder="Text over image"
                        />
                    </FloatingToolbar>
                )}
            </div>
        );
    }

    return (
        <div ref={containerRef} className="relative w-full h-full overflow-hidden group">
            <motion.img
                src={imageUrl}
                alt={overlayText || "Brand imagery"}
                className="w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
                style={{ filter: imageFilter }}
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
                        style={{
                            color: "var(--canvas-surface)",
                            fontFamily: headlineFont,
                            fontSize: `${clampFontSize(typeScale.step2)}px`,
                        }}
                    >
                        {overlayText}
                    </h3>
                </div>
            )}

            {isFocused && anchorRect && tile?.id && (
                <FloatingToolbar anchorRect={anchorRect}>
                    <ToolbarActions
                        onShuffle={() => {
                            if (!content.imageLocked) {
                                updateTile(tile!.id, { image: getRandomShuffleImage(content.image) }, true);
                            }
                        }}
                        hasImage
                        imageLocked={!!content.imageLocked}
                        onToggleLock={() => updateTile(tile!.id, { imageLocked: !content.imageLocked }, true)}
                        onImageUpload={(dataUrl) => updateTile(tile!.id, { image: dataUrl }, true)}
                    />
                    <ToolbarDivider />
                    <ToolbarTextInput
                        label="Overlay"
                        value={content.overlayText || ''}
                        onChange={(v) => updateTile(tile!.id, { overlayText: v }, false)}
                        onCommit={(v) => updateTile(tile!.id, { overlayText: v }, true)}
                        placeholder="Text over image"
                    />
                </FloatingToolbar>
            )}
        </div>
    );
};
