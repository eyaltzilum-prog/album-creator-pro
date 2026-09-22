/**
 * Auto-Placement Logic for Album Creator Pro
 * Distributes photos across spreads using theme layouts
 */

import type { Theme, ThemeLayout, ThemeFrame } from '@/lib/themes';
import type { UploadedPhoto } from '@/types/album';

export interface PlacementFrame {
  id: string;
  type: 'frame';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  zIndex: number;
  locked: boolean;
  shape: 'rectangle' | 'circle' | 'oval' | 'heart';
  photoSrc: string | null;
  photoOffsetX: number;
  photoOffsetY: number;
  photoScale: number;
  photoRotation: number;
  photoFlipH: boolean;
  photoFlipV: boolean;
  fitMode: 'fill' | 'fit' | 'stretch';
  borderEnabled: boolean;
  borderWidth: number;
  borderColor: string;
  borderOpacity: number;
  shadowEnabled: boolean;
  shadowBlur: number;
  shadowColor: string;
  shadowOffsetX: number;
  shadowOffsetY: number;
  shadowOpacity: number;
  adjustments: {
    brightness: number;
    contrast: number;
    saturation: number;
    hue: number;
    blur: number;
    sepia: number;
    grayscale: number;
  };
  filterPreset: string;
  filterIntensity: number;
  flipH: boolean;
  flipV: boolean;
}

export interface PlacementResult {
  spreads: Array<{
    spreadIndex: number;
    objects: PlacementFrame[];
    background: string;
  }>;
  usedPhotoCount: number;
  unusedPhotos: string[];
  photosPerSpread: number[];
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const DEFAULT_ADJUSTMENTS = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  hue: 0,
  blur: 0,
  sepia: 0,
  grayscale: 0,
};

/**
 * Creates a frame element with the given properties
 */
function createFrame(
  x: number,
  y: number,
  width: number,
  height: number,
  photoSrc: string | null,
  shape: 'rectangle' | 'circle' | 'oval' | 'heart' = 'rectangle',
  zIndex: number = 1
): PlacementFrame {
  return {
    id: generateId(),
    type: 'frame',
    x,
    y,
    width,
    height,
    rotation: 0,
    opacity: 1,
    zIndex,
    locked: false,
    shape,
    photoSrc,
    photoOffsetX: 0,
    photoOffsetY: 0,
    photoScale: 1,
    photoRotation: 0,
    photoFlipH: false,
    photoFlipV: false,
    fitMode: 'fill',
    borderEnabled: false,
    borderWidth: 2,
    borderColor: '#000000',
    borderOpacity: 1,
    shadowEnabled: false,
    shadowBlur: 10,
    shadowColor: '#000000',
    shadowOffsetX: 0,
    shadowOffsetY: 4,
    shadowOpacity: 0.3,
    adjustments: { ...DEFAULT_ADJUSTMENTS },
    filterPreset: 'none',
    filterIntensity: 100,
    flipH: false,
    flipV: false,
  };
}

/**
 * Converts theme frame percentages to actual pixel values
 */
function themeFrameToPixels(
  frame: ThemeFrame,
  canvasWidth: number,
  canvasHeight: number
): { x: number; y: number; width: number; height: number } {
  return {
    x: (frame.x / 100) * canvasWidth,
    y: (frame.y / 100) * canvasHeight,
    width: (frame.width / 100) * canvasWidth,
    height: (frame.height / 100) * canvasHeight,
  };
}

/**
 * Selects the best layout for a given number of photos
 */
function selectLayoutForPhotoCount(
  layouts: ThemeLayout[],
  photoCount: number
): ThemeLayout {
  // Try to find exact match first
  const exact = layouts.find((l) => l.photoCount === photoCount);
  if (exact) return exact;

  // Find closest layout that can fit the photos (prefer layouts with capacity >= photoCount)
  const suitable = layouts.filter((l) => l.photoCount >= photoCount);
  if (suitable.length > 0) {
    // Return the one with smallest capacity that fits
    return suitable.sort((a, b) => a.photoCount - b.photoCount)[0];
  }

  // If no layout can fit all photos, use the one with highest capacity
  return layouts.sort((a, b) => b.photoCount - a.photoCount)[0];
}

/**
 * Default layouts when theme has none or for fallback
 */
const DEFAULT_LAYOUTS: ThemeLayout[] = [
  {
    id: 'default-1',
    name: { he: 'תמונה יחידה', en: 'Single Photo' },
    photoCount: 1,
    frames: [{ x: 10, y: 10, width: 80, height: 80, shape: 'rectangle' }],
  },
  {
    id: 'default-2',
    name: { he: 'שתי תמונות', en: 'Two Photos' },
    photoCount: 2,
    frames: [
      { x: 5, y: 10, width: 42, height: 80, shape: 'rectangle' },
      { x: 53, y: 10, width: 42, height: 80, shape: 'rectangle' },
    ],
  },
  {
    id: 'default-3',
    name: { he: 'שלוש תמונות', en: 'Three Photos' },
    photoCount: 3,
    frames: [
      { x: 5, y: 5, width: 55, height: 90, shape: 'rectangle' },
      { x: 65, y: 5, width: 30, height: 43, shape: 'rectangle' },
      { x: 65, y: 52, width: 30, height: 43, shape: 'rectangle' },
    ],
  },
  {
    id: 'default-4',
    name: { he: 'ארבע תמונות', en: 'Four Photos' },
    photoCount: 4,
    frames: [
      { x: 5, y: 5, width: 43, height: 43, shape: 'rectangle' },
      { x: 52, y: 5, width: 43, height: 43, shape: 'rectangle' },
      { x: 5, y: 52, width: 43, height: 43, shape: 'rectangle' },
      { x: 52, y: 52, width: 43, height: 43, shape: 'rectangle' },
    ],
  },
];

/**
 * Main auto-placement function
 * Distributes photos across spreads using theme layouts
 */
export function autoPlacePhotos(
  photos: UploadedPhoto[] | string[],
  spreadCount: number,
  theme: Theme | null,
  canvasWidth: number,
  canvasHeight: number,
  skipCover: boolean = true
): PlacementResult {
  // Normalize photos to URLs
  const photoUrls: string[] = photos.map((p) =>
    typeof p === 'string' ? p : p.dataUrl || p.thumbnailUrl
  ).filter(Boolean);

  const layouts = theme?.layouts?.length ? theme.layouts : DEFAULT_LAYOUTS;
  const backgrounds = theme?.backgroundPatterns || ['#ffffff'];

  // Calculate how many interior spreads we have (excluding cover if skipped)
  const interiorSpreadCount = skipCover ? spreadCount - 1 : spreadCount;
  const startIndex = skipCover ? 1 : 0;

  // Calculate photos per spread for even distribution
  const photosPerSpread = Math.ceil(photoUrls.length / Math.max(interiorSpreadCount, 1));

  const result: PlacementResult = {
    spreads: [],
    usedPhotoCount: 0,
    unusedPhotos: [],
    photosPerSpread: [],
  };

  // If skipCover, add empty cover spread
  if (skipCover) {
    result.spreads.push({
      spreadIndex: 0,
      objects: [],
      background: backgrounds[0] || '#ffffff',
    });
    result.photosPerSpread.push(0);
  }

  let photoIndex = 0;

  // Process each interior spread
  for (let i = 0; i < interiorSpreadCount; i++) {
    const spreadIndex = startIndex + i;
    const remainingPhotos = photoUrls.length - photoIndex;
    const remainingSpreads = interiorSpreadCount - i;

    // Calculate how many photos for this spread (distribute evenly)
    const photosForThisSpread = Math.ceil(remainingPhotos / remainingSpreads);
    const actualPhotoCount = Math.min(photosForThisSpread, remainingPhotos);

    // Select appropriate layout
    const layout = selectLayoutForPhotoCount(layouts, actualPhotoCount);

    // Create frames with photos
    const objects: PlacementFrame[] = [];
    const framesToUse = layout.frames.slice(0, actualPhotoCount);

    framesToUse.forEach((themeFrame, frameIdx) => {
      const photoUrl = photoUrls[photoIndex + frameIdx] || null;
      const { x, y, width, height } = themeFrameToPixels(
        themeFrame,
        canvasWidth,
        canvasHeight
      );

      objects.push(
        createFrame(x, y, width, height, photoUrl, themeFrame.shape, frameIdx + 1)
      );
    });

    // Use theme background (cycle through available backgrounds)
    const background = backgrounds[i % backgrounds.length] || '#ffffff';

    result.spreads.push({
      spreadIndex,
      objects,
      background,
    });

    result.photosPerSpread.push(actualPhotoCount);
    photoIndex += actualPhotoCount;
  }

  result.usedPhotoCount = photoIndex;
  result.unusedPhotos = photoUrls.slice(photoIndex);

  return result;
}

/**
 * Applies auto-placement result to existing spreads
 * Only updates interior spreads, preserving cover if it has content
 */
export function applyPlacementToSpreads(
  existingSpreads: Array<{
    id: string;
    spread_index: number;
    spread_type: string;
    canvas_data: { objects: PlacementFrame[]; background: string };
  }>,
  placementResult: PlacementResult,
  preserveCoverIfHasContent: boolean = true
): Array<{
  id: string;
  spread_index: number;
  spread_type: string;
  canvas_data: { objects: PlacementFrame[]; background: string };
}> {
  return existingSpreads.map((spread) => {
    const placement = placementResult.spreads.find(
      (p) => p.spreadIndex === spread.spread_index
    );

    if (!placement) {
      return spread;
    }

    // Preserve cover if it has content and flag is set
    if (
      preserveCoverIfHasContent &&
      spread.spread_type === 'cover' &&
      spread.canvas_data?.objects?.length > 0
    ) {
      return spread;
    }

    return {
      ...spread,
      canvas_data: {
        objects: placement.objects,
        background: placement.background,
      },
    };
  });
}

/**
 * Calculates placement statistics for user feedback
 */
export function getPlacementStats(
  photoCount: number,
  spreadCount: number,
  skipCover: boolean = true
): {
  photosPerSpread: number;
  totalCapacity: number;
  willHaveUnused: boolean;
  unusedCount: number;
  spreadsThatGetPhotos: number;
} {
  const interiorSpreadCount = skipCover ? spreadCount - 1 : spreadCount;
  const photosPerSpread = Math.ceil(photoCount / Math.max(interiorSpreadCount, 1));
  const totalCapacity = interiorSpreadCount * 4; // Assuming max 4 photos per spread

  return {
    photosPerSpread,
    totalCapacity,
    willHaveUnused: photoCount > totalCapacity,
    unusedCount: Math.max(0, photoCount - totalCapacity),
    spreadsThatGetPhotos: Math.min(
      interiorSpreadCount,
      Math.ceil(photoCount / photosPerSpread)
    ),
  };
}
