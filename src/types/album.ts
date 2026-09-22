/**
 * Album Types - Shared type definitions for album creation
 */

import type { Theme, ThemeLayout } from '@/lib/themes';
import type { AlbumSize } from '@/lib/albumSizes';

export type ReadingDirection = 'ltr' | 'rtl';
export type PlacementMode = 'manual' | 'automatic';

export interface AlbumSetupData {
  // Step 1: Auth (handled by AuthContext)
  // Step 2: Size
  sizeId: string | null;
  size: AlbumSize | null;
  // Step 3: Page count
  pageCount: number;
  // Step 4: Direction
  direction: ReadingDirection;
  // Step 5: Theme
  themeId: string | null;
  theme: Theme | null;
  // Step 6: Photos
  photos: UploadedPhoto[];
  // Step 7: Placement mode
  placementMode: PlacementMode;
}

export interface UploadedPhoto {
  id: string;
  file: File | null;
  dataUrl: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  name: string;
  size: number;
  uploadProgress: number;
  uploadStatus: 'pending' | 'uploading' | 'complete' | 'error';
  errorMessage?: string;
  usedOnPages: number[]; // track which pages this photo is used on
}

export interface SpreadData {
  id: string;
  index: number;
  type: 'cover' | 'interior';
  leftPageIndex: number | null;
  rightPageIndex: number | null;
  canvasData: {
    objects: CanvasObject[];
    background: string;
  };
}

export interface CanvasObject {
  id: string;
  type: 'frame' | 'text' | 'decoration';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  zIndex: number;
  locked: boolean;
  // Frame-specific
  photoSrc?: string | null;
  photoOffsetX?: number;
  photoOffsetY?: number;
  photoScale?: number;
  photoRotation?: number;
  shape?: 'rectangle' | 'circle' | 'oval' | 'heart';
  borderEnabled?: boolean;
  borderWidth?: number;
  borderColor?: string;
  shadowEnabled?: boolean;
  shadowBlur?: number;
  shadowColor?: string;
  // Text-specific
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  fill?: string;
  textAlign?: string;
  // Adjustments
  adjustments?: PhotoAdjustments;
  filterPreset?: string;
}

export interface PhotoAdjustments {
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
  blur: number;
  sepia: number;
  grayscale: number;
}

export const DEFAULT_ADJUSTMENTS: PhotoAdjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  hue: 0,
  blur: 0,
  sepia: 0,
  grayscale: 0,
};

export const DEFAULT_SETUP_DATA: AlbumSetupData = {
  sizeId: null,
  size: null,
  pageCount: 20,
  direction: 'rtl', // Default for Hebrew
  themeId: null,
  theme: null,
  photos: [],
  placementMode: 'manual',
};
