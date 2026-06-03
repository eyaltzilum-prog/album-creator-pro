import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { Stage, Layer, Rect, Image as KonvaImage, Text, Transformer, Group, Shape, Line, Circle, Ellipse } from 'react-konva';
import Konva from 'konva';
import {
  ArrowRight, ArrowLeft, Save, Eye, Send, Undo, Redo,
  ZoomIn, ZoomOut, Image, LayoutTemplate, Palette, Type,
  Layers, Plus, Trash2, Copy, ChevronLeft, ChevronRight, Upload, Magnet, Grid3X3,
  GripVertical, Check, Loader2, BookOpen, Square, Circle as CircleIcon,
  Heart, Star, Lock, Unlock, Frame as FrameIcon, Settings,
  ChevronUp, ChevronDown, FolderOpen, Download, FlipHorizontal, FlipVertical,
  RotateCw, Move, Maximize, Sun, Contrast, Droplets, Thermometer, SunDim, Moon, Focus, Sparkles, RefreshCw,
  AlignLeft, AlignCenter, AlignRight, AlignJustify, Bold, Italic, Underline, LetterText, Baseline, Palette as PaletteIcon, Paintbrush, CircleDot, MousePointer, Scissors, Smile, Search } from
'lucide-react';

import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useGlobalAssets } from '@/hooks/useGlobalAssets';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type FrameShape = 'rectangle' | 'circle' | 'oval' | 'heart';
type FitMode = 'fill' | 'fit' | 'stretch';
type EditMode = 'frame' | 'photo' | 'text';
type FilterPreset = 'none' | 'warm' | 'cool' | 'vintage' | 'bw' | 'sepia' | 'highContrast' | 'soft' | 'vivid';
type TextAlign = 'left' | 'center' | 'right' | 'justify';
type FontWeight = 'light' | 'normal' | 'bold';
type TextBoxMode = 'auto' | 'fixed';

interface PhotoAdjustments {
  brightness: number;
  contrast: number;
  saturation: number;
  temperature: number;
  highlights: number;
  shadows: number;
  sharpness: number;
}

interface TextShadow {
  enabled: boolean;
  offsetX: number;
  offsetY: number;
  blur: number;
  color: string;
  opacity: number;
}

interface TextStroke {
  enabled: boolean;
  width: number;
  color: string;
}

interface TextElement {
  id: string;
  type: 'text';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  zIndex: number;
  // Content
  text: string;
  // Typography
  fontFamily: string;
  fontSize: number;
  fontWeight: FontWeight;
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline';
  textAlign: TextAlign;
  verticalAlign: 'top' | 'middle' | 'bottom';
  lineHeight: number;
  letterSpacing: number;
  // Colors
  fill: string;
  highlightColor: string | null;
  // Effects
  stroke: TextStroke;
  shadow: TextShadow;
  // Transform
  flipH: boolean;
  flipV: boolean;
  // Box mode
  boxMode: TextBoxMode;
  // Meta
  groupId: string | null;
  locked: boolean;
  name: string;
  isPlaceholder: boolean;
  styleLocked: boolean;
}

interface FrameElement {
  id: string;
  type: 'frame';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  zIndex: number;
  shape: FrameShape;
  flipH: boolean;
  flipV: boolean;
  borderEnabled: boolean;
  borderWidth: number;
  borderColor: string;
  borderOpacity: number;
  borderRadius: number;
  shadowEnabled: boolean;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  shadowColor: string;
  shadowOpacity: number;
  photoSrc: string | null;
  photoOffsetX: number;
  photoOffsetY: number;
  photoScale: number;
  photoRotation: number;
  photoFlipH: boolean;
  photoFlipV: boolean;
  fitMode: FitMode;
  adjustments: PhotoAdjustments;
  filterPreset: FilterPreset;
  filterIntensity: number;
  aspectLocked: boolean;
  groupId: string | null;
  locked: boolean;
  name: string;
}

interface TemplateGroupElement {
  id: string;
  type: 'group';
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  zIndex: number;
  frameIds: string[];
  locked: boolean;
  aspectLocked: boolean;
}

interface LegacyImageElement {
  id: string;
  type: 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  zIndex: number;
  src: string;
}

type CanvasElement = FrameElement | TextElement | LegacyImageElement | TemplateGroupElement;

interface Spread {
  id: string;
  spread_index: number;
  spread_type: 'cover' | 'interior';
  canvas_data: {objects: CanvasElement[];background: string;};
}

interface Project {
  id: string;
  name: string;
  status: string;
  page_count: number;
  settings: {width: number;height: number;dpi: number;};
}

interface SnapGuide {
  type: 'vertical' | 'horizontal';
  position: number;
  color: string;
}

interface SavedTemplate {
  id: string;
  name: string;
  frames: TemplateFrame[];
  createdAt: string;
  source: 'local' | 'cloud';
}

interface AlbumSize {
  id: string;
  name: {he: string;en: string;};
  width: number;
  height: number;
}

interface TemplateFrame {
  x: number;
  y: number;
  width: number;
  height: number;
  shape: FrameShape;
}

interface PageTemplate {
  id: string;
  name: {he: string;en: string;};
  photoCount: number;
  frames: TemplateFrame[];
  category: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_ADJUSTMENTS: PhotoAdjustments = {
  brightness: 0, contrast: 0, saturation: 0, temperature: 0, highlights: 0, shadows: 0, sharpness: 0
};

const DEFAULT_TEXT_SHADOW: TextShadow = {
  enabled: false, offsetX: 2, offsetY: 2, blur: 4, color: '#000000', opacity: 0.5
};

const DEFAULT_TEXT_STROKE: TextStroke = {
  enabled: false, width: 1, color: '#000000'
};

const FONT_FAMILIES = [
{ value: 'Heebo', label: 'Heebo', type: 'hebrew' },
{ value: 'Assistant', label: 'Assistant', type: 'hebrew' },
{ value: 'Rubik', label: 'Rubik', type: 'hebrew' },
{ value: 'Varela Round', label: 'Varela Round', type: 'hebrew' },
{ value: 'Secular One', label: 'Secular One', type: 'hebrew' },
{ value: 'Suez One', label: 'Suez One', type: 'hebrew' },
{ value: 'Inter', label: 'Inter', type: 'english' },
{ value: 'Roboto', label: 'Roboto', type: 'english' },
{ value: 'Open Sans', label: 'Open Sans', type: 'english' },
{ value: 'Montserrat', label: 'Montserrat', type: 'english' },
{ value: 'Playfair Display', label: 'Playfair Display', type: 'english' },
{ value: 'Lora', label: 'Lora', type: 'english' },
{ value: 'Poppins', label: 'Poppins', type: 'english' },
{ value: 'Dancing Script', label: 'Dancing Script', type: 'decorative' },
{ value: 'Pacifico', label: 'Pacifico', type: 'decorative' }];


const COLOR_PRESETS = [
'#000000', '#ffffff', '#374151', '#6b7280', '#ef4444', '#f97316', '#eab308', '#22c55e',
'#14b8a6', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#0ea5e9', '#84cc16'];


const FILTER_PRESETS: {id: FilterPreset;name: {he: string;en: string;};css: string;}[] = [
{ id: 'none', name: { he: 'ללא', en: 'None' }, css: '' },
{ id: 'warm', name: { he: 'חם', en: 'Warm' }, css: 'sepia(0.2) saturate(1.3) hue-rotate(-10deg)' },
{ id: 'cool', name: { he: 'קר', en: 'Cool' }, css: 'saturate(0.9) hue-rotate(10deg) brightness(1.05)' },
{ id: 'vintage', name: { he: 'וינטאג\'', en: 'Vintage' }, css: 'sepia(0.4) contrast(0.9) brightness(1.1)' },
{ id: 'bw', name: { he: 'שחור לבן', en: 'B&W' }, css: 'grayscale(1)' },
{ id: 'sepia', name: { he: 'ספיה', en: 'Sepia' }, css: 'sepia(0.8)' },
{ id: 'highContrast', name: { he: 'ניגודיות', en: 'High Contrast' }, css: 'contrast(1.4) saturate(1.2)' },
{ id: 'soft', name: { he: 'רך', en: 'Soft' }, css: 'contrast(0.85) brightness(1.1) saturate(0.9)' },
{ id: 'vivid', name: { he: 'חי', en: 'Vivid' }, css: 'saturate(1.5) contrast(1.1)' }];


const ALBUM_SIZES: AlbumSize[] = [
{ id: '20x20', name: { he: '20×20 ס"מ', en: '20×20 cm' }, width: 2362, height: 2362 },
{ id: '25x25', name: { he: '25×25 ס"מ', en: '25×25 cm' }, width: 2953, height: 2953 },
{ id: '30x30', name: { he: '30×30 ס"מ', en: '30×30 cm' }, width: 3543, height: 3543 },
{ id: '20x30', name: { he: '20×30 ס"מ', en: '20×30 cm' }, width: 2362, height: 3543 },
{ id: '30x20', name: { he: '30×20 ס"מ', en: '30×20 cm' }, width: 3543, height: 2362 },
{ id: 'a4', name: { he: 'A4', en: 'A4' }, width: 2480, height: 3508 },
{ id: 'a4-landscape', name: { he: 'A4 לרוחב', en: 'A4 Landscape' }, width: 3508, height: 2480 }];


const PAGE_TEMPLATES: PageTemplate[] = [
{ id: 'single-full', name: { he: 'תמונה מלאה', en: 'Full Photo' }, photoCount: 1, category: 'single', frames: [{ x: 5, y: 5, width: 90, height: 90, shape: 'rectangle' }] },
{ id: 'single-center', name: { he: 'מרכז', en: 'Center' }, photoCount: 1, category: 'single', frames: [{ x: 15, y: 15, width: 70, height: 70, shape: 'rectangle' }] },
{ id: 'single-circle', name: { he: 'עיגול', en: 'Circle' }, photoCount: 1, category: 'single', frames: [{ x: 20, y: 10, width: 60, height: 80, shape: 'circle' }] },
{ id: 'double-horizontal', name: { he: 'שתיים אופקי', en: 'Two Horizontal' }, photoCount: 2, category: 'double', frames: [{ x: 5, y: 10, width: 44, height: 80, shape: 'rectangle' }, { x: 51, y: 10, width: 44, height: 80, shape: 'rectangle' }] },
{ id: 'double-vertical', name: { he: 'שתיים אנכי', en: 'Two Vertical' }, photoCount: 2, category: 'double', frames: [{ x: 10, y: 5, width: 80, height: 44, shape: 'rectangle' }, { x: 10, y: 51, width: 80, height: 44, shape: 'rectangle' }] },
{ id: 'triple-row', name: { he: 'שורה', en: 'Row' }, photoCount: 3, category: 'triple', frames: [{ x: 3, y: 20, width: 30, height: 60, shape: 'rectangle' }, { x: 35, y: 20, width: 30, height: 60, shape: 'rectangle' }, { x: 67, y: 20, width: 30, height: 60, shape: 'rectangle' }] },
{ id: 'grid-2x2', name: { he: 'רשת 2×2', en: '2×2 Grid' }, photoCount: 4, category: 'grid', frames: [{ x: 5, y: 5, width: 44, height: 44, shape: 'rectangle' }, { x: 51, y: 5, width: 44, height: 44, shape: 'rectangle' }, { x: 5, y: 51, width: 44, height: 44, shape: 'rectangle' }, { x: 51, y: 51, width: 44, height: 44, shape: 'rectangle' }] },
{ id: 'grid-2x3', name: { he: 'רשת 2×3', en: '2×3 Grid' }, photoCount: 6, category: 'grid', frames: [{ x: 3, y: 5, width: 30, height: 44, shape: 'rectangle' }, { x: 35, y: 5, width: 30, height: 44, shape: 'rectangle' }, { x: 67, y: 5, width: 30, height: 44, shape: 'rectangle' }, { x: 3, y: 51, width: 30, height: 44, shape: 'rectangle' }, { x: 35, y: 51, width: 30, height: 44, shape: 'rectangle' }, { x: 67, y: 51, width: 30, height: 44, shape: 'rectangle' }] }];


const SNAP_THRESHOLD = 10;
const GRID_SIZE = 50;

// Calculate snap guides for element positioning
const calculateSnapGuides = (
  currentBounds: { x: number; y: number; width: number; height: number },
  otherElements: CanvasElement[],
  canvasWidth: number,
  canvasHeight: number,
  gridEnabled: boolean
): { guides: SnapGuide[]; snapX: number | null; snapY: number | null } => {
  const guides: SnapGuide[] = [];
  let snapX: number | null = null;
  let snapY: number | null = null;

  const { x, y, width, height } = currentBounds;
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  const rightEdge = x + width;
  const bottomEdge = y + height;

  // Snap to grid if enabled
  if (gridEnabled) {
    // Snap left edge to grid
    const nearestGridX = Math.round(x / GRID_SIZE) * GRID_SIZE;
    if (Math.abs(x - nearestGridX) < SNAP_THRESHOLD) {
      snapX = nearestGridX;
      guides.push({ type: 'vertical', position: nearestGridX, color: '#3b82f6' });
    }
    // Snap top edge to grid
    const nearestGridY = Math.round(y / GRID_SIZE) * GRID_SIZE;
    if (Math.abs(y - nearestGridY) < SNAP_THRESHOLD) {
      snapY = nearestGridY;
      guides.push({ type: 'horizontal', position: nearestGridY, color: '#3b82f6' });
    }
  }

  // Snap to canvas center
  const canvasCenterX = canvasWidth / 2;
  const canvasCenterY = canvasHeight / 2;
  
  if (Math.abs(centerX - canvasCenterX) < SNAP_THRESHOLD) {
    snapX = canvasCenterX - width / 2;
    guides.push({ type: 'vertical', position: canvasCenterX, color: '#22c55e' });
  }
  if (Math.abs(centerY - canvasCenterY) < SNAP_THRESHOLD) {
    snapY = canvasCenterY - height / 2;
    guides.push({ type: 'horizontal', position: canvasCenterY, color: '#22c55e' });
  }

  // Snap to other elements
  otherElements.forEach((el) => {
    const elCenterX = el.x + el.width / 2;
    const elCenterY = el.y + el.height / 2;
    const elRightEdge = el.x + el.width;
    const elBottomEdge = el.y + el.height;

    // Snap to element centers
    if (Math.abs(centerX - elCenterX) < SNAP_THRESHOLD) {
      snapX = elCenterX - width / 2;
      guides.push({ type: 'vertical', position: elCenterX, color: '#f97316' });
    }
    if (Math.abs(centerY - elCenterY) < SNAP_THRESHOLD) {
      snapY = elCenterY - height / 2;
      guides.push({ type: 'horizontal', position: elCenterY, color: '#f97316' });
    }

    // Snap to element edges (left to left, right to right, etc.)
    if (Math.abs(x - el.x) < SNAP_THRESHOLD) {
      snapX = el.x;
      guides.push({ type: 'vertical', position: el.x, color: '#f97316' });
    }
    if (Math.abs(rightEdge - elRightEdge) < SNAP_THRESHOLD) {
      snapX = elRightEdge - width;
      guides.push({ type: 'vertical', position: elRightEdge, color: '#f97316' });
    }
    if (Math.abs(y - el.y) < SNAP_THRESHOLD) {
      snapY = el.y;
      guides.push({ type: 'horizontal', position: el.y, color: '#f97316' });
    }
    if (Math.abs(bottomEdge - elBottomEdge) < SNAP_THRESHOLD) {
      snapY = elBottomEdge - height;
      guides.push({ type: 'horizontal', position: elBottomEdge, color: '#f97316' });
    }

    // Snap edges to opposite edges (left to right, etc.)
    if (Math.abs(x - elRightEdge) < SNAP_THRESHOLD) {
      snapX = elRightEdge;
      guides.push({ type: 'vertical', position: elRightEdge, color: '#f97316' });
    }
    if (Math.abs(rightEdge - el.x) < SNAP_THRESHOLD) {
      snapX = el.x - width;
      guides.push({ type: 'vertical', position: el.x, color: '#f97316' });
    }
    if (Math.abs(y - elBottomEdge) < SNAP_THRESHOLD) {
      snapY = elBottomEdge;
      guides.push({ type: 'horizontal', position: elBottomEdge, color: '#f97316' });
    }
    if (Math.abs(bottomEdge - el.y) < SNAP_THRESHOLD) {
      snapY = el.y - height;
      guides.push({ type: 'horizontal', position: el.y, color: '#f97316' });
    }
  });

  return { guides, snapX, snapY };
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Detect if text contains RTL characters (Hebrew, Arabic, etc.)
const isRTLText = (text: string): boolean => {
  const rtlRegex = /[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return rtlRegex.test(text);
};

// Unicode RTL mark to force RTL direction
const RLM = '\u200F';

const getTemplatesByCount = () => {
  const grouped: Record<number, PageTemplate[]> = {};
  PAGE_TEMPLATES.forEach((t) => {if (!grouped[t.photoCount]) grouped[t.photoCount] = [];grouped[t.photoCount].push(t);});
  return grouped;
};

// Filtered Image Component with Konva filters
function FilteredKonvaImage({ 
  image, 
  x, 
  y, 
  width, 
  height, 
  adjustments, 
  filterPreset, 
  filterIntensity 
}: { 
  image: HTMLImageElement;
  x: number;
  y: number;
  width: number;
  height: number;
  adjustments: PhotoAdjustments;
  filterPreset: FilterPreset;
  filterIntensity: number;
}) {
  const imageRef = useRef<any>(null);

  // Apply filters when adjustments or dimensions change
  useEffect(() => {
    const node = imageRef.current;
    if (!node || !image) return;
    
    // Clear existing cache before re-caching with new dimensions
    node.clearCache();
    
    // Build filters array - always include basic filters for adjustments
    const filters: any[] = [];
    
    // Always add adjustment filters
    filters.push(Konva.Filters.Brighten);
    filters.push(Konva.Filters.Contrast);
    filters.push(Konva.Filters.HSL);
    
    // Add preset filters
    if (filterPreset === 'bw') {
      filters.push(Konva.Filters.Grayscale);
    } else if (filterPreset === 'sepia') {
      filters.push(Konva.Filters.Sepia);
    }
    
    // Set filter values
    try {
      node.filters(filters);
      
      // Calculate combined brightness from brightness + highlights + shadows
      const highlightEffect = (adjustments.highlights || 0) / 200;
      const shadowEffect = (adjustments.shadows || 0) / 200;
      const combinedBrightness = (adjustments.brightness / 100) + highlightEffect + shadowEffect;
      
      // Brightness: Konva uses -1 to 1 range
      node.brightness(Math.max(-1, Math.min(1, combinedBrightness)));
      
      // Contrast: Konva uses -100 to 100 range
      const sharpnessEffect = (adjustments.sharpness || 0) / 5;
      node.contrast(adjustments.contrast + sharpnessEffect);
      
      // Temperature affects hue
      const temperatureHue = (adjustments.temperature || 0) / 5;
      
      // Saturation via HSL
      node.saturation(adjustments.saturation / 50);
      node.hue(temperatureHue);
      
      // Apply filter presets
      if (filterPreset === 'warm') {
        node.hue(15 * (filterIntensity / 100));
        node.saturation((adjustments.saturation / 50) + 0.2);
      } else if (filterPreset === 'cool') {
        node.hue(-15 * (filterIntensity / 100));
      } else if (filterPreset === 'vintage') {
        node.saturation((adjustments.saturation / 50) - 0.3);
        node.brightness(combinedBrightness + 0.1);
      } else if (filterPreset === 'highContrast') {
        node.contrast(adjustments.contrast + sharpnessEffect + 30);
      } else if (filterPreset === 'soft') {
        node.contrast(adjustments.contrast + sharpnessEffect - 20);
        node.brightness(combinedBrightness + 0.1);
      } else if (filterPreset === 'vivid') {
        node.saturation((adjustments.saturation / 50) + 0.5);
        node.contrast(adjustments.contrast + sharpnessEffect + 20);
      }
      
      // Cache at new dimensions for filters to work
      node.cache({ pixelRatio: 1 });
    } catch (e) {
      console.error('Filter error:', e);
    }
  }, [adjustments, filterPreset, filterIntensity, image, width, height]);

  return (
    <KonvaImage
      ref={imageRef}
      image={image}
      x={x}
      y={y}
      width={width}
      height={height}
    />
  );
}

// ============================================================================
// FRAME COMPONENT WITH DUAL EDITING - CLEAN SINGLE MASK ARCHITECTURE
// ============================================================================

function FrameElementComponent({
  element,
  image,
  isSelected,
  isDropTarget,
  editMode,
  onSelect,
  onDoubleClick,
  onChange,
  onPhotoChange,
  language,
  snappingEnabled,
  otherElements,
  canvasWidth,
  canvasHeight,
  gridEnabled,
  onSnapGuidesChange
}: {element: FrameElement;image: HTMLImageElement | null;isSelected: boolean;isDropTarget: boolean;editMode: EditMode;onSelect: () => void;onDoubleClick: () => void;onChange: (attrs: Partial<FrameElement>) => void;onPhotoChange: (attrs: Partial<FrameElement>) => void;language: 'he' | 'en';snappingEnabled: boolean;otherElements: CanvasElement[];canvasWidth: number;canvasHeight: number;gridEnabled: boolean;onSnapGuidesChange: (guides: SnapGuide[]) => void;}) {
  const groupRef = useRef<any>(null);
  const trRef = useRef<any>(null);
  const shadowGroupRef = useRef<any>(null);

  // Attach transformer when selected in frame mode
  useEffect(() => {
    if (isSelected && trRef.current && groupRef.current && editMode === 'frame') {
      trRef.current.nodes([groupRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected, editMode]);

  // Apply blur filter to shadow when enabled
  useEffect(() => {
    if (shadowGroupRef.current && element.shadowEnabled) {
      const blur = element.shadowBlur || 10;
      shadowGroupRef.current.cache({ pixelRatio: 1 });
      shadowGroupRef.current.filters([Konva.Filters.Blur]);
      shadowGroupRef.current.blurRadius(blur);
    } else if (shadowGroupRef.current) {
      shadowGroupRef.current.clearCache();
    }
  }, [element.shadowEnabled, element.shadowBlur, element.width, element.height, element.shape]);

  // Calculate image dimensions for cover mode
  const getImageProps = () => {
    if (!image || !element.photoSrc) return null;

    const imgW = image.naturalWidth || image.width;
    const imgH = image.naturalHeight || image.height;

    if (!imgW || !imgH) return null;

    // Calculate scale to COVER the frame (image fills frame completely)
    const scaleW = element.width / imgW;
    const scaleH = element.height / imgH;
    const baseScale = element.fitMode === 'fit' ?
    Math.min(scaleW, scaleH) :
    Math.max(scaleW, scaleH);

    // Apply user zoom
    const finalScale = baseScale * element.photoScale;

    // Final display dimensions
    const displayW = imgW * finalScale;
    const displayH = imgH * finalScale;

    // Position to center the image in the frame, plus user offset
    const x = (element.width - displayW) / 2 + element.photoOffsetX;
    const y = (element.height - displayH) / 2 + element.photoOffsetY;

    return { x, y, width: displayW, height: displayH };
  };

  const imageProps = getImageProps();
  const isPhotoMode = isSelected && editMode === 'photo';
  const canDragFrame = !element.locked && editMode === 'frame';
  const hasPhoto = image && element.photoSrc && imageProps;

  // Calculate flip transforms for the entire frame
  const frameScaleX = element.flipH ? -1 : 1;
  const frameScaleY = element.flipV ? -1 : 1;
  const frameOffsetX = element.flipH ? element.width : 0;
  const frameOffsetY = element.flipV ? element.height : 0;

  // Calculate flip transforms for the photo inside
  const photoScaleX = element.photoFlipH ? -1 : 1;
  const photoScaleY = element.photoFlipV ? -1 : 1;

  // Event handlers
  const handleSelect = (e: any) => {
    e.cancelBubble = true;
    onSelect();
  };

  const handleDblClick = (e: any) => {
    e.cancelBubble = true;
    if (element.photoSrc) onDoubleClick();
  };

  const handleDragMove = (e: any) => {
    if (!snappingEnabled) return;
    const node = e.target;
    const { guides, snapX, snapY } = calculateSnapGuides(
      { x: node.x(), y: node.y(), width: element.width, height: element.height },
      otherElements.filter((el) => el.id !== element.id),
      canvasWidth, canvasHeight, gridEnabled
    );
    onSnapGuidesChange(guides);
    if (snapX !== null) node.x(snapX);
    if (snapY !== null) node.y(snapY);
  };

  const handleDragEnd = (e: any) => {
    onSnapGuidesChange([]);
    onChange({ x: e.target.x(), y: e.target.y() });
  };

  const handleTransformEnd = () => {
    const node = groupRef.current;
    if (!node) return;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(frameScaleX);
    node.scaleY(frameScaleY);
    onChange({
      x: node.x(),
      y: node.y(),
      width: Math.max(50, element.width * Math.abs(scaleX)),
      height: Math.max(50, element.height * Math.abs(scaleY)),
      rotation: node.rotation()
    });
  };

  // Build clip function based on shape
  const getClipFunc = (ctx: any) => {
    const w = element.width;
    const h = element.height;
    if (element.shape === 'circle') {
      ctx.arc(w / 2, h / 2, Math.min(w, h) / 2, 0, Math.PI * 2);
    } else if (element.shape === 'oval') {
      ctx.ellipse(w / 2, h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
    } else if (element.shape === 'heart') {
      ctx.moveTo(w / 2, h * 0.3);
      ctx.bezierCurveTo(w * 0.1, 0, 0, h * 0.5, w / 2, h);
      ctx.bezierCurveTo(w, h * 0.5, w * 0.9, 0, w / 2, h * 0.3);
    } else {
      ctx.rect(0, 0, w, h);
    }
  };

  // Render border shape based on frame shape
  const renderBorder = () => {
    if (!element.borderEnabled) return null;
    const strokeColor = element.borderColor || '#000000';
    const strokeWidth = element.borderWidth || 2;
    const strokeOpacity = element.borderOpacity ?? 1;
    
    if (element.shape === 'circle') {
      const radius = Math.min(element.width, element.height) / 2;
      return (
        <Shape
          x={element.width / 2}
          y={element.height / 2}
          sceneFunc={(ctx, shape) => {
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fillStrokeShape(shape);
          }}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          opacity={strokeOpacity}
          listening={false}
        />
      );
    } else if (element.shape === 'oval') {
      return (
        <Shape
          sceneFunc={(ctx, shape) => {
            ctx.beginPath();
            ctx.ellipse(element.width / 2, element.height / 2, element.width / 2, element.height / 2, 0, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fillStrokeShape(shape);
          }}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          opacity={strokeOpacity}
          listening={false}
        />
      );
    } else if (element.shape === 'heart') {
      return (
        <Shape
          sceneFunc={(ctx, shape) => {
            const w = element.width;
            const h = element.height;
            ctx.beginPath();
            ctx.moveTo(w / 2, h * 0.3);
            ctx.bezierCurveTo(w * 0.1, 0, 0, h * 0.5, w / 2, h);
            ctx.bezierCurveTo(w, h * 0.5, w * 0.9, 0, w / 2, h * 0.3);
            ctx.closePath();
            ctx.fillStrokeShape(shape);
          }}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          opacity={strokeOpacity}
          listening={false}
        />
      );
    } else {
      return (
        <Rect
          width={element.width}
          height={element.height}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          opacity={strokeOpacity}
          listening={false}
        />
      );
    }
  };

  // Calculate photo offset for flip
  const getPhotoFlipOffset = () => {
    if (!imageProps) return { offsetX: 0, offsetY: 0 };
    return {
      offsetX: element.photoFlipH ? imageProps.width : 0,
      offsetY: element.photoFlipV ? imageProps.height : 0
    };
  };

  const photoFlipOffset = getPhotoFlipOffset();

  // Render shadow shape based on frame shape - uses Blur filter for soft shadow
  const renderShadow = () => {
    if (!element.shadowEnabled) return null;
    
    const fillColor = element.shadowColor || '#000000';

    // Common group props for positioning the shadow
    const groupProps = {
      ref: shadowGroupRef,
      x: element.x + (element.shadowOffsetX || 0),
      y: element.y + (element.shadowOffsetY || 4),
      rotation: element.rotation,
      scaleX: frameScaleX,
      scaleY: frameScaleY,
      offsetX: frameOffsetX,
      offsetY: frameOffsetY,
      opacity: element.shadowOpacity || 0.3,
      listening: false
    };

    if (element.shape === 'circle') {
      const radius = Math.min(element.width, element.height) / 2;
      return (
        <Group {...groupProps}>
          <Circle
            x={element.width / 2}
            y={element.height / 2}
            radius={radius}
            fill={fillColor}
          />
        </Group>
      );
    } else if (element.shape === 'oval') {
      return (
        <Group {...groupProps}>
          <Ellipse
            x={element.width / 2}
            y={element.height / 2}
            radiusX={element.width / 2}
            radiusY={element.height / 2}
            fill={fillColor}
          />
        </Group>
      );
    } else if (element.shape === 'heart') {
      return (
        <Group {...groupProps}>
          <Shape
            sceneFunc={(ctx, shape) => {
              const w = element.width;
              const h = element.height;
              ctx.beginPath();
              ctx.moveTo(w / 2, h * 0.3);
              ctx.bezierCurveTo(w * 0.1, 0, 0, h * 0.5, w / 2, h);
              ctx.bezierCurveTo(w, h * 0.5, w * 0.9, 0, w / 2, h * 0.3);
              ctx.closePath();
              ctx.fillStrokeShape(shape);
            }}
            fill={fillColor}
          />
        </Group>
      );
    } else {
      // Rectangle
      return (
        <Group {...groupProps}>
          <Rect
            width={element.width}
            height={element.height}
            fill={fillColor}
            cornerRadius={element.borderRadius || 0}
          />
        </Group>
      );
    }
  };

  return (
    <>
      {/* Shadow layer - rendered behind the main frame */}
      {renderShadow()}

      {/* Main frame group */}
      <Group
        ref={groupRef}
        x={element.x}
        y={element.y}
        rotation={element.rotation}
        scaleX={frameScaleX}
        scaleY={frameScaleY}
        offsetX={frameOffsetX}
        offsetY={frameOffsetY}
        opacity={element.opacity}
        draggable={canDragFrame}
        onClick={handleSelect}
        onTap={handleSelect}
        onDblClick={handleDblClick}
        onDblTap={handleDblClick}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
      >
        {/* Clipped content group */}
        <Group clipFunc={getClipFunc}>
          {/* Background/placeholder */}
          {!hasPhoto && (
            <Rect
              width={element.width}
              height={element.height}
              fill={isDropTarget ? '#dbeafe' : '#f3f4f6'}
              stroke={isDropTarget ? '#3b82f6' : '#d1d5db'}
              strokeWidth={isDropTarget ? 2 : 1}
              dash={[6, 3]}
            />
          )}
          
          {/* Photo if present */}
          {hasPhoto && (
            <Group
              x={imageProps.x + photoFlipOffset.offsetX}
              y={imageProps.y + photoFlipOffset.offsetY}
              scaleX={photoScaleX}
              scaleY={photoScaleY}
              rotation={element.photoRotation}
              offsetX={element.photoRotation ? imageProps.width / 2 : 0}
              offsetY={element.photoRotation ? imageProps.height / 2 : 0}
            >
              <FilteredKonvaImage
                image={image!}
                x={element.photoRotation ? imageProps.width / 2 : 0}
                y={element.photoRotation ? imageProps.height / 2 : 0}
                width={imageProps.width}
                height={imageProps.height}
                adjustments={element.adjustments}
                filterPreset={element.filterPreset}
                filterIntensity={element.filterIntensity}
              />
            </Group>
          )}
        </Group>

        {/* Border - rendered on top of content */}
        {renderBorder()}
      </Group>

      {/* Photo mode border indicator */}
      {isPhotoMode && (
        <Rect
          x={element.x - 2}
          y={element.y - 2}
          width={element.width + 4}
          height={element.height + 4}
          stroke="#f97316"
          strokeWidth={2}
          dash={[6, 4]}
          listening={false}
        />
      )}

      {/* Transformer for frame mode */}
      {isSelected && !element.locked && editMode === 'frame' && (
        <Transformer
          ref={trRef}
          rotateEnabled={true}
          keepRatio={element.aspectLocked}
          anchorFill="#22c55e"
          anchorStroke="#16a34a"
          anchorSize={10}
          anchorCornerRadius={2}
          borderStroke="#22c55e"
          borderStrokeWidth={2}
          boundBoxFunc={(oldBox, newBox) =>
            newBox.width < 50 || newBox.height < 50 ? oldBox : newBox
          }
        />
      )}
    </>
  );
}

// ============================================================================
// TEXT COMPONENT WITH FULL EDITING
// ============================================================================

function TextElementComponent({ element, isSelected, isEditing, onSelect, onDoubleClick, onChange, onStartEdit, onEndEdit, language, snappingEnabled, otherElements, canvasWidth, canvasHeight, gridEnabled, onSnapGuidesChange, stageRef




}: {element: TextElement;isSelected: boolean;isEditing: boolean;onSelect: () => void;onDoubleClick: () => void;onChange: (attrs: Partial<TextElement>) => void;onStartEdit: () => void;onEndEdit: () => void;language: 'he' | 'en';snappingEnabled: boolean;otherElements: CanvasElement[];canvasWidth: number;canvasHeight: number;gridEnabled: boolean;onSnapGuidesChange: (guides: SnapGuide[]) => void;stageRef: any;}) {
  const textRef = useRef<any>(null);
  const trRef = useRef<any>(null);
  const lastTapRef = useRef<number>(0);

  useEffect(() => {
    if (isSelected && !isEditing && trRef.current && textRef.current) {
      trRef.current.nodes([textRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected, isEditing]);

  const handleClick = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      onDoubleClick();
    } else {
      onSelect();
    }
    lastTapRef.current = now;
  };

  const handleDragMove = (e: any) => {
    if (!snappingEnabled || isEditing) return;
    const node = e.target;
    const { guides, snapX, snapY } = calculateSnapGuides(
      { x: node.x(), y: node.y(), width: element.width, height: element.height },
      otherElements.filter((el) => el.id !== element.id),
      canvasWidth, canvasHeight, gridEnabled
    );
    onSnapGuidesChange(guides);
    if (snapX !== null) node.x(snapX);
    if (snapY !== null) node.y(snapY);
  };

  // Calculate font weight value
  const getFontWeight = () => {
    switch (element.fontWeight) {
      case 'light':return 300;
      case 'bold':return 700;
      default:return 400;
    }
  };

  // Build text shadow string for CSS
  const getTextShadow = () => {
    if (!element.shadow.enabled) return undefined;
    return `${element.shadow.offsetX}px ${element.shadow.offsetY}px ${element.shadow.blur}px ${element.shadow.color}`;
  };

  const scaleX = element.flipH ? -1 : 1;
  const scaleY = element.flipV ? -1 : 1;

  return (
    <>
      {/* Highlight background */}
      {element.highlightColor &&
      <Rect
        x={element.x - 4}
        y={element.y - 2}
        width={element.width + 8}
        height={element.height + 4}
        fill={element.highlightColor}
        rotation={element.rotation}
        opacity={element.opacity}
        cornerRadius={4}
        listening={false} />

      }
      
      <Text
        ref={textRef}
        text={element.text}
        x={element.x}
        y={element.y}
        width={element.boxMode === 'fixed' ? element.width : undefined}
        fontSize={element.fontSize}
        fontFamily={element.fontFamily}
        fontStyle={`${element.fontWeight === 'bold' ? 'bold' : element.fontWeight === 'light' ? '300' : 'normal'} ${element.fontStyle}`}
        textDecoration={element.textDecoration}
        fill={element.fill}
        align={element.textAlign}
        direction={isRTLText(element.text) ? 'rtl' : 'ltr'}
        verticalAlign={element.verticalAlign}
        lineHeight={element.lineHeight}
        letterSpacing={element.letterSpacing}
        rotation={element.rotation}
        scaleX={scaleX}
        scaleY={scaleY}
        offsetX={element.flipH ? element.width / 2 : 0}
        offsetY={element.flipV ? element.height / 2 : 0}
        opacity={element.opacity}
        stroke={element.stroke.enabled ? element.stroke.color : undefined}
        strokeWidth={element.stroke.enabled ? element.stroke.width : 0}
        shadowColor={element.shadow.enabled ? element.shadow.color : undefined}
        shadowBlur={element.shadow.enabled ? element.shadow.blur : 0}
        shadowOffsetX={element.shadow.enabled ? element.shadow.offsetX : 0}
        shadowOffsetY={element.shadow.enabled ? element.shadow.offsetY : 0}
        shadowOpacity={element.shadow.enabled ? element.shadow.opacity : 0}
        draggable={!element.locked && !isEditing}
        onClick={handleClick}
        onTap={handleClick}
        onDragMove={handleDragMove}
        onDragEnd={(e) => {
          onSnapGuidesChange([]);
          onChange({ x: e.target.x(), y: e.target.y() });
        }}
        onTransformEnd={(e) => {
          const node = textRef.current;
          const scaleX = Math.abs(node.scaleX());
          const scaleY = Math.abs(node.scaleY());
          node.scaleX(element.flipH ? -1 : 1);
          node.scaleY(element.flipV ? -1 : 1);
          onChange({
            x: node.x(),
            y: node.y(),
            width: Math.max(50, node.width() * scaleX),
            height: Math.max(20, node.height() * scaleY),
            rotation: node.rotation(),
            fontSize: Math.max(8, element.fontSize * scaleX)
          });
        }} />

      
      {/* Selection border */}
      {isSelected && !isEditing &&
      <Rect
        x={element.x - 4}
        y={element.y - 4}
        width={(textRef.current?.width() || element.width) + 8}
        height={(textRef.current?.height() || element.height) + 8}
        stroke="#22c55e"
        strokeWidth={2}
        cornerRadius={4}
        listening={false} />

      }
      
      {/* Editing mode border */}
      {isEditing &&
      <>
          <Rect
          x={element.x - 4}
          y={element.y - 4}
          width={(textRef.current?.width() || element.width) + 8}
          height={(textRef.current?.height() || element.height) + 8}
          stroke="#f97316"
          strokeWidth={2}
          dash={[6, 4]}
          cornerRadius={4}
          listening={false} />

          <Rect
          x={element.x + (textRef.current?.width() || element.width) / 2 - 35}
          y={element.y - 30}
          width={70}
          height={22}
          fill="#f97316"
          cornerRadius={4}
          listening={false} />

          <Text
          x={element.x + (textRef.current?.width() || element.width) / 2 - 35}
          y={element.y - 28}
          width={70}
          height={22}
          text={language === 'he' ? 'עריכה' : 'Editing'}
          fontSize={10}
          fontFamily="Arial"
          fill="white"
          align="center"
          verticalAlign="middle"
          listening={false} />

        </>
      }
      
      {/* Lock indicator */}
      {element.locked &&
      <Rect
        x={element.x - 4}
        y={element.y - 4}
        width={(textRef.current?.width() || element.width) + 8}
        height={(textRef.current?.height() || element.height) + 8}
        fill="transparent"
        stroke="#f59e0b"
        strokeWidth={2}
        dash={[5, 5]}
        listening={false} />

      }
      
      {/* Transformer for select mode */}
      {isSelected && !element.locked && !isEditing &&
      <Transformer
        ref={trRef}
        keepRatio={false}
        rotateEnabled={true}
        borderStroke="transparent"
        borderStrokeWidth={0}
        anchorFill="#3b82f6"
        anchorStroke="#1d4ed8"
        anchorSize={8}
        anchorCornerRadius={2}
        enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right', 'middle-left', 'middle-right']}
        boundBoxFunc={(oldBox, newBox) => newBox.width < 30 || newBox.height < 15 ? oldBox : newBox} />

      }
    </>);

}

// ============================================================================
// TEXT EDITOR TEXTAREA OVERLAY
// ============================================================================

function TextEditorOverlay({ element, zoom, stageRef, onChange, onClose, language


}: {element: TextElement;zoom: number;stageRef: any;onChange: (attrs: Partial<TextElement>) => void;onClose: () => void;language: 'he' | 'en';}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState(element.text);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (textareaRef.current && !textareaRef.current.contains(e.target as Node)) {
        handleSave();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleSave();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [text]);

  const handleSave = () => {
    onChange({ text });
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    // Live update
    onChange({ text: e.target.value });
  };

  // Calculate position based on element and stage
  const stage = stageRef.current;
  if (!stage) return null;

  const stageBox = stage.container().getBoundingClientRect();
  const x = stageBox.left + element.x * zoom;
  const y = stageBox.top + element.y * zoom;

  return (
    <textarea data-ev-id="ev_47b526757a"
    ref={textareaRef}
    value={text}
    onChange={handleChange}
    onBlur={handleSave}
    dir={isRTLText(text) ? 'rtl' : 'ltr'}
    style={{
      position: 'fixed',
      left: x,
      top: y,
      width: Math.max(200, (element.width || 200) * zoom),
      minHeight: Math.max(40, (element.height || 40) * zoom),
      fontSize: element.fontSize * zoom,
      fontFamily: element.fontFamily,
      fontWeight: element.fontWeight === 'bold' ? 700 : element.fontWeight === 'light' ? 300 : 400,
      fontStyle: element.fontStyle,
      textAlign: element.textAlign,
      lineHeight: element.lineHeight,
      letterSpacing: element.letterSpacing * zoom,
      color: element.fill,
      background: element.highlightColor || 'white',
      border: '2px solid #f97316',
      borderRadius: '4px',
      padding: '8px',
      outline: 'none',
      resize: 'both',
      overflow: 'auto',
      zIndex: 1000,
      transformOrigin: 'top left',
      transform: `rotate(${element.rotation}deg)`
    }} />);


}

// ============================================================================
// ADJUSTMENT SLIDER COMPONENT
// ============================================================================

function AdjustmentSlider({ label, value, onChange, min = -100, max = 100, icon: Icon }: {label: string;value: number;onChange: (v: number) => void;min?: number;max?: number;icon: any;}) {
  return (
    <div data-ev-id="ev_980b92d44a" className="flex flex-col gap-1">
      <div data-ev-id="ev_47a949c195" className="flex items-center justify-between">
        <div data-ev-id="ev_b4d55cef83" className="flex items-center gap-2">
          <Icon className="w-3 h-3 text-gray-300" />
          <span data-ev-id="ev_2dc445d8b6" className="text-xs text-white">{label}</span>
        </div>
        <span data-ev-id="ev_1ef843db7d" className="text-xs text-gray-300">{value}</span>
      </div>
      <input data-ev-id="ev_809c4bbee8" type="range" min={min} max={max} value={value} onChange={(e) => onChange(parseInt(e.target.value))} className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
    </div>
  );
}

// ============================================================================
// SHAPE ICONS
// ============================================================================

const shapeIcons: {shape: FrameShape;icon: React.ReactNode;label: {he: string;en: string;};}[] = [
{ shape: 'rectangle', icon: <Square className="w-5 h-5" />, label: { he: 'מלבן', en: 'Rectangle' } },
{ shape: 'circle', icon: <CircleIcon className="w-5 h-5" />, label: { he: 'עיגול', en: 'Circle' } },
{ shape: 'oval', icon: <div data-ev-id="ev_947dde46b5" className="w-5 h-4 border-2 border-current rounded-full" />, label: { he: 'אליפסה', en: 'Oval' } },
{ shape: 'heart', icon: <Heart className="w-5 h-5" />, label: { he: 'לב', en: 'Heart' } },
{ shape: 'star', icon: <Star className="w-5 h-5" />, label: { he: 'כוכב', en: 'Star' } }];


// ============================================================================
// MAIN EDITOR COMPONENT
// ============================================================================

export default function ClientEditor() {
  const { projectId } = useParams<{projectId: string;}>();
  const navigate = useNavigate();
  const { t, language, isRTL } = useLanguage();
  const { user } = useAuth();

  // Global assets from admin
  const {
    backgrounds,
    frames: globalFrames,
    clipart,
    stickers,
    decorations,
    backgroundsByCategory,
    framesByCategory,
    loading: assetsLoading,
    isColorBackground,
    getBackgroundValue,
    getFrameConfig
  } = useGlobalAssets();

  // Background panel state
  const [bgSearchQuery, setBgSearchQuery] = useState('');
  const [selectedBgCategory, setSelectedBgCategory] = useState<string>('all');

  // Asset panel search states
  const [clipartSearchQuery, setClipartSearchQuery] = useState('');
  const [stickerSearchQuery, setStickerSearchQuery] = useState('');
  const [frameSearchQuery, setFrameSearchQuery] = useState('');

  // Core state
  const [project, setProject] = useState<Project | null>(null);
  const [spreads, setSpreads] = useState<Spread[]>([]);
  const [currentSpreadIndex, setCurrentSpreadIndex] = useState(0);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<EditMode>('frame');
  const [isEditingText, setIsEditingText] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // UI state
  const [activePanel, setActivePanel] = useState<string>('photos');
  const [activePropertiesTab, setActivePropertiesTab] = useState<'frame' | 'photo' | 'adjustments' | 'typography' | 'effects' | 'transform'>('frame');
  const [zoom, setZoom] = useState(0.6);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showAlbumSizeModal, setShowAlbumSizeModal] = useState(false);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [showFontPicker, setShowFontPicker] = useState(false);

  // Photos & drag state
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);
  const [isOverDropZone, setIsOverDropZone] = useState(false);
  const [draggedPhotoUrl, setDraggedPhotoUrl] = useState<string | null>(null);
  const [hoverFrameId, setHoverFrameId] = useState<string | null>(null);
  const [loadedImages, setLoadedImages] = useState<Map<string, HTMLImageElement>>(new Map());

  // Snapping & grid
  const [snappingEnabled, setSnappingEnabled] = useState(true);
  const [gridEnabled, setGridEnabled] = useState(false);
  const [snapGuides, setSnapGuides] = useState<SnapGuide[]>([]);

  // Templates
  const [selectedTemplateCategory, setSelectedTemplateCategory] = useState<number>(1);
  const [selectedAlbumSize, setSelectedAlbumSize] = useState<string>('30x30');
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>([]);

  // History for Undo/Redo
  const [history, setHistory] = useState<{objects: CanvasElement[];background: string;}[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isUndoRedo, setIsUndoRedo] = useState(false);

  // Preview mode
  const [showPreview, setShowPreview] = useState(false);

  // Refs
  const stageRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const stageContainerRef = useRef<HTMLDivElement>(null);

  // Canvas dimensions
  const getCanvasDimensions = () => {
    const size = ALBUM_SIZES.find((s) => s.id === selectedAlbumSize) || ALBUM_SIZES[2];
    const scale = Math.min(2100 / (size.width * 2), 1500 / size.height);
    return { width: Math.round(size.width * 2 * scale), height: Math.round(size.height * scale) };
  };
  const { width: CANVAS_WIDTH, height: CANVAS_HEIGHT } = getCanvasDimensions();
  const FOLD_LINE_X = CANVAS_WIDTH / 2;

  // Current spread data
  const currentSpread = spreads[currentSpreadIndex];
  const elements = currentSpread?.canvas_data?.objects || [];
  const canEdit = !project || project?.status === 'draft' || project?.status === 'changes_requested';
  const selectedElement = selectedElementId ? elements.find((el) => el.id === selectedElementId) : null;
  const selectedFrame = selectedElement?.type === 'frame' ? selectedElement as FrameElement : null;
  const selectedText = selectedElement?.type === 'text' ? selectedElement as TextElement : null;

  // Load saved templates
  useEffect(() => {const local = localStorage.getItem('savedTemplates');if (local) setSavedTemplates(JSON.parse(local));}, []);

  // Keyboard shortcuts (ESC to close preview/font picker, Ctrl+Z to undo, Ctrl+Y to redo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showPreview) setShowPreview(false);
        if (showFontPicker) setShowFontPicker(false);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'z' && e.shiftKey)) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showPreview, showFontPicker, historyIndex, history]);

  // Load images
  useEffect(() => {
    const currentElements = currentSpread?.canvas_data?.objects || [];
    currentElements.forEach((element) => {
      const src = element.type === 'frame' ? (element as FrameElement).photoSrc : null;
      if (src && !loadedImages.has(src)) {
        const img = new window.Image();
        if (!src.startsWith('data:')) img.crossOrigin = 'anonymous';
        img.onload = () => setLoadedImages((prev) => new Map(prev).set(src, img));
        img.src = src;
      }
    });
  }, [spreads, currentSpreadIndex]);

  // Fetch project
  useEffect(() => {if (projectId) fetchProject();}, [projectId]);

  const fetchProject = async () => {
    if (!supabase || !projectId) return;
    try {
      const { data: projectData } = await supabase.from('projects').select('*').eq('id', projectId).single();
      if (projectData) setProject(projectData as Project);
      const { data: spreadsData } = await supabase.from('spreads').select('*').eq('project_id', projectId).order('spread_index', { ascending: true });
      if (spreadsData?.length) {
        const migrated = spreadsData.map((s: any) => ({ ...s, canvas_data: { ...s.canvas_data, objects: migrateElements(s.canvas_data?.objects || []) } }));
        setSpreads(migrated as Spread[]);
      } else {
        const initial = await createInitialSpreads(projectId, projectData?.page_count || 10);
        setSpreads(initial);
      }
      const { data: photos } = await supabase.from('client_photos').select('file_url').eq('project_id', projectId);
      if (photos) setUploadedPhotos(photos.map((p) => p.file_url));
    } catch (error) {console.error('Error fetching project:', error);} finally
    {setLoading(false);}
  };

  const migrateElements = (els: any[]): CanvasElement[] => els.map((el) => {
    if (el.type === 'image') return createDefaultFrame(el.x, el.y, el.width, el.height, el.src);
    if (el.type === 'frame') {
      return { ...createDefaultFrame(el.x, el.y, el.width, el.height, el.photoSrc || null), ...el, adjustments: el.adjustments || DEFAULT_ADJUSTMENTS, filterPreset: el.filterPreset || 'none', filterIntensity: el.filterIntensity ?? 100, flipH: el.flipH || false, flipV: el.flipV || false, photoRotation: el.photoRotation || 0, photoFlipH: el.photoFlipH || false, photoFlipV: el.photoFlipV || false, shadowOffsetX: el.shadowOffsetX || 0, shadowOffsetY: el.shadowOffsetY || 4, shadowOpacity: el.shadowOpacity || 0.3, borderOpacity: el.borderOpacity || 1 };
    }
    if (el.type === 'text') {
      return { ...createDefaultText(el.x, el.y, el.text), ...el, fontWeight: el.fontWeight || 'normal', fontStyle: el.fontStyle || 'normal', textDecoration: el.textDecoration || 'none', textAlign: el.textAlign || 'center', verticalAlign: el.verticalAlign || 'top', lineHeight: el.lineHeight || 1.2, letterSpacing: el.letterSpacing || 0, highlightColor: el.highlightColor || null, stroke: el.stroke || DEFAULT_TEXT_STROKE, shadow: el.shadow || DEFAULT_TEXT_SHADOW, flipH: el.flipH || false, flipV: el.flipV || false, boxMode: el.boxMode || 'auto', isPlaceholder: el.isPlaceholder || false, styleLocked: el.styleLocked || false };
    }
    return el;
  });

  const createDefaultFrame = (x: number, y: number, width: number, height: number, photoSrc: string | null = null): FrameElement => ({
    id: `frame-${generateId()}`, type: 'frame', x, y, width, height, rotation: 0, opacity: 1, zIndex: elements.length, shape: 'rectangle', flipH: false, flipV: false, borderEnabled: false, borderWidth: 4, borderColor: '#000000', borderOpacity: 1, borderRadius: 0, shadowEnabled: false, shadowBlur: 10, shadowOffsetX: 0, shadowOffsetY: 4, shadowColor: '#000000', shadowOpacity: 0.3, photoSrc, photoOffsetX: 0, photoOffsetY: 0, photoScale: 1, photoRotation: 0, photoFlipH: false, photoFlipV: false, fitMode: 'fill', adjustments: { ...DEFAULT_ADJUSTMENTS }, filterPreset: 'none', filterIntensity: 100, aspectLocked: true, groupId: null, locked: false, name: ''
  });

  const createDefaultText = (x: number, y: number, text: string = ''): TextElement => ({
    id: `text-${generateId()}`, type: 'text', x, y, width: 200, height: 50, rotation: 0, opacity: 1, zIndex: elements.length,
    text: text || (language === 'he' ? 'הקלד טקסט כאן' : 'Type text here'),
    fontFamily: language === 'he' ? 'Heebo' : 'Inter', fontSize: 36, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none',
    textAlign: 'center', verticalAlign: 'top', lineHeight: 1.2, letterSpacing: 0,
    fill: '#000000', highlightColor: null,
    stroke: { ...DEFAULT_TEXT_STROKE }, shadow: { ...DEFAULT_TEXT_SHADOW },
    flipH: false, flipV: false, boxMode: 'auto',
    groupId: null, locked: false, name: '', isPlaceholder: false, styleLocked: false
  });

  const createInitialSpreads = async (pid: string, pageCount: number) => {
    if (!supabase) return [];
    const toCreate = [{ project_id: pid, spread_index: 0, spread_type: 'cover', canvas_data: { objects: [], background: '#ffffff' } }];
    for (let i = 1; i <= Math.ceil(pageCount / 2); i++) toCreate.push({ project_id: pid, spread_index: i, spread_type: 'interior', canvas_data: { objects: [], background: '#ffffff' } });
    const { data } = await supabase.from('spreads').insert(toCreate).select();
    return data as Spread[] || [];
  };

  // Element operations
  const updateElement = useCallback((id: string, attrs: Partial<CanvasElement>) => {
    if (!canEdit) return;
    const newElements = elements.map((el) => el.id === id ? { ...el, ...attrs } : el);
    updateCurrentSpread({ objects: newElements, background: currentSpread?.canvas_data?.background || '#ffffff' });
  }, [elements, currentSpread, canEdit]);

  const updateCurrentSpread = (canvasData: {objects: CanvasElement[];background: string;}) => {
    // Save to history if not performing undo/redo
    if (!isUndoRedo && currentSpread?.canvas_data) {
      const currentState = {
        objects: JSON.parse(JSON.stringify(currentSpread.canvas_data.objects || [])),
        background: currentSpread.canvas_data.background || '#ffffff'
      };
      setHistory((prev) => {
        const newHistory = prev.slice(0, historyIndex + 1);
        newHistory.push(currentState);
        // Limit history to 50 states
        if (newHistory.length > 50) newHistory.shift();
        return newHistory;
      });
      setHistoryIndex((prev) => Math.min(prev + 1, 49));
    }
    setIsUndoRedo(false);

    const newSpreads = [...spreads];
    newSpreads[currentSpreadIndex] = { ...newSpreads[currentSpreadIndex], canvas_data: canvasData };
    setSpreads(newSpreads);
  };

  const undo = () => {
    if (historyIndex < 0 || !history[historyIndex]) return;
    setIsUndoRedo(true);
    const prevState = history[historyIndex];
    const newSpreads = [...spreads];
    newSpreads[currentSpreadIndex] = {
      ...newSpreads[currentSpreadIndex],
      canvas_data: { objects: JSON.parse(JSON.stringify(prevState.objects)), background: prevState.background }
    };
    setSpreads(newSpreads);
    setHistoryIndex((prev) => prev - 1);
  };

  const redo = () => {
    if (historyIndex >= history.length - 1) return;
    setIsUndoRedo(true);
    const nextState = history[historyIndex + 2];
    if (!nextState) {
      // Redo to current state
      const currentState = history[historyIndex + 1];
      if (currentState) {
        const newSpreads = [...spreads];
        newSpreads[currentSpreadIndex] = {
          ...newSpreads[currentSpreadIndex],
          canvas_data: { objects: JSON.parse(JSON.stringify(currentState.objects)), background: currentState.background }
        };
        setSpreads(newSpreads);
      }
    } else {
      const newSpreads = [...spreads];
      newSpreads[currentSpreadIndex] = {
        ...newSpreads[currentSpreadIndex],
        canvas_data: { objects: JSON.parse(JSON.stringify(nextState.objects)), background: nextState.background }
      };
      setSpreads(newSpreads);
    }
    setHistoryIndex((prev) => prev + 1);
  };

  const canUndo = historyIndex >= 0;
  const canRedo = historyIndex < history.length - 1;

  const addFrame = (photoSrc: string | null, x: number, y: number, width = 400, height = 300): string => {
    const newFrame = createDefaultFrame(x, y, width, height, photoSrc);
    updateCurrentSpread({ objects: [...elements, newFrame], background: currentSpread?.canvas_data?.background || '#ffffff' });
    setSelectedElementId(newFrame.id);
    setEditMode('frame');
    return newFrame.id;
  };

  const addTextElement = () => {
    if (!canEdit) return;
    const newText = createDefaultText(FOLD_LINE_X - 100, CANVAS_HEIGHT / 2 - 25);
    updateCurrentSpread({ objects: [...elements, newText], background: currentSpread?.canvas_data?.background || '#ffffff' });
    setSelectedElementId(newText.id);
    setEditMode('text');
    setActivePropertiesTab('typography');
  };

  const applyTemplate = (template: PageTemplate) => {
    if (!canEdit) return;
    const newFrames = template.frames.map((tf, i) => ({ ...createDefaultFrame(tf.x / 100 * CANVAS_WIDTH, tf.y / 100 * CANVAS_HEIGHT, tf.width / 100 * CANVAS_WIDTH, tf.height / 100 * CANVAS_HEIGHT, null), id: `frame-${generateId()}-${i}`, shape: tf.shape, zIndex: elements.length + i }));
    updateCurrentSpread({ objects: [...elements, ...newFrames], background: currentSpread?.canvas_data?.background || '#ffffff' });
  };

  const deleteSelectedElement = () => {if (!canEdit || !selectedElementId) return;updateCurrentSpread({ objects: elements.filter((el) => el.id !== selectedElementId), background: currentSpread?.canvas_data?.background || '#ffffff' });setSelectedElementId(null);setIsEditingText(false);};
  const duplicateSelected = () => {if (!canEdit || !selectedElement) return;const dup = { ...selectedElement, id: `${selectedElement.type}-${generateId()}`, x: selectedElement.x + 30, y: selectedElement.y + 30, zIndex: elements.length };updateCurrentSpread({ objects: [...elements, dup], background: currentSpread?.canvas_data?.background || '#ffffff' });setSelectedElementId(dup.id);};
  const bringForward = () => {if (!selectedElementId) return;const idx = elements.findIndex((el) => el.id === selectedElementId);if (idx < elements.length - 1) {const newElements = [...elements];[newElements[idx], newElements[idx + 1]] = [newElements[idx + 1], newElements[idx]];newElements.forEach((el, i) => el.zIndex = i);updateCurrentSpread({ objects: newElements, background: currentSpread?.canvas_data?.background || '#ffffff' });}};
  const sendBackward = () => {if (!selectedElementId) return;const idx = elements.findIndex((el) => el.id === selectedElementId);if (idx > 0) {const newElements = [...elements];[newElements[idx], newElements[idx - 1]] = [newElements[idx - 1], newElements[idx]];newElements.forEach((el, i) => el.zIndex = i);updateCurrentSpread({ objects: newElements, background: currentSpread?.canvas_data?.background || '#ffffff' });}};
  const toggleLock = () => {if (!selectedElementId || !selectedElement) return;updateElement(selectedElementId, { locked: !('locked' in selectedElement && selectedElement.locked) });};

  // Reset photo to fill the frame properly (cover mode, centered)
  const autoFitPhoto = () => {
    if (!selectedFrame) return;
    updateElement(selectedFrame.id, {
      photoOffsetX: 0,
      photoOffsetY: 0,
      photoScale: 1,
      photoRotation: 0,
      photoFlipH: false,
      photoFlipV: false,
      fitMode: 'fill'
    });
  };

  const resetAdjustments = () => {if (!selectedFrame) return;updateElement(selectedFrame.id, { adjustments: { ...DEFAULT_ADJUSTMENTS }, filterPreset: 'none', filterIntensity: 100 });};
  const resetTextStyle = () => {if (!selectedText) return;updateElement(selectedText.id, { stroke: { ...DEFAULT_TEXT_STROKE }, shadow: { ...DEFAULT_TEXT_SHADOW }, highlightColor: null });};

  // Helper to get image dimensions and calculate appropriate frame size
  const getFrameDimensionsForPhoto = (photoUrl: string): Promise<{width: number;height: number;}> => {
    return new Promise((resolve) => {
      // Check if image is already loaded
      const cached = loadedImages.get(photoUrl);
      if (cached) {
        const imgW = cached.naturalWidth || cached.width;
        const imgH = cached.naturalHeight || cached.height;
        const aspectRatio = imgW / imgH;

        // Base size for frames
        const BASE_SIZE = 350;
        const MAX_SIZE = 500;
        const MIN_SIZE = 200;

        let frameW: number, frameH: number;

        if (aspectRatio > 1.1) {
          // Landscape photo - horizontal frame
          frameW = Math.min(MAX_SIZE, BASE_SIZE * aspectRatio);
          frameH = frameW / aspectRatio;
        } else if (aspectRatio < 0.9) {
          // Portrait photo - vertical frame
          frameH = Math.min(MAX_SIZE, BASE_SIZE / aspectRatio);
          frameW = frameH * aspectRatio;
        } else {
          // Square-ish photo
          frameW = BASE_SIZE;
          frameH = BASE_SIZE;
        }

        // Ensure minimum size
        frameW = Math.max(MIN_SIZE, frameW);
        frameH = Math.max(MIN_SIZE, frameH);

        resolve({ width: Math.round(frameW), height: Math.round(frameH) });
        return;
      }

      // Load image to get dimensions
      const img = new window.Image();
      if (!photoUrl.startsWith('data:')) img.crossOrigin = 'anonymous';
      img.onload = () => {
        // Cache it
        setLoadedImages((prev) => new Map(prev).set(photoUrl, img));

        const imgW = img.naturalWidth || img.width;
        const imgH = img.naturalHeight || img.height;
        const aspectRatio = imgW / imgH;

        const BASE_SIZE = 350;
        const MAX_SIZE = 500;
        const MIN_SIZE = 200;

        let frameW: number, frameH: number;

        if (aspectRatio > 1.1) {
          // Landscape
          frameW = Math.min(MAX_SIZE, BASE_SIZE * aspectRatio);
          frameH = frameW / aspectRatio;
        } else if (aspectRatio < 0.9) {
          // Portrait
          frameH = Math.min(MAX_SIZE, BASE_SIZE / aspectRatio);
          frameW = frameH * aspectRatio;
        } else {
          // Square
          frameW = BASE_SIZE;
          frameH = BASE_SIZE;
        }

        frameW = Math.max(MIN_SIZE, frameW);
        frameH = Math.max(MIN_SIZE, frameH);

        resolve({ width: Math.round(frameW), height: Math.round(frameH) });
      };
      img.onerror = () => {
        // Fallback to default landscape
        resolve({ width: 400, height: 300 });
      };
      img.src = photoUrl;
    });
  };

  // Photo handlers
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {const files = e.target.files;if (!files) return;Array.from(files).forEach((file) => {const reader = new FileReader();reader.onload = (ev) => setUploadedPhotos((prev) => [...prev, ev.target?.result as string]);reader.readAsDataURL(file);});};

  // Add photo to canvas - either to an existing empty frame or create a new frame
  const addPhotoToCanvas = async (photoUrl: string) => {
    // Get the correct frame dimensions based on photo orientation
    const { width: frameW, height: frameH } = await getFrameDimensionsForPhoto(photoUrl);

    const emptyFrame = elements.find((el) => el.type === 'frame' && !(el as FrameElement).photoSrc) as FrameElement;
    if (emptyFrame) {
      // Insert into existing empty frame and resize to match photo orientation
      const centerX = emptyFrame.x + emptyFrame.width / 2;
      const centerY = emptyFrame.y + emptyFrame.height / 2;
      const newX = Math.max(0, Math.min(centerX - frameW / 2, CANVAS_WIDTH - frameW));
      const newY = Math.max(0, Math.min(centerY - frameH / 2, CANVAS_HEIGHT - frameH));

      updateElement(emptyFrame.id, {
        photoSrc: photoUrl,
        x: newX,
        y: newY,
        width: frameW,
        height: frameH,
        photoOffsetX: 0,
        photoOffsetY: 0,
        photoScale: 1,
        photoRotation: 0,
        photoFlipH: false,
        photoFlipV: false,
        fitMode: 'fill'
      });
      return;
    }

    // Otherwise create a new frame at drop position with correct dimensions
    const rect = stageContainerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(0, Math.min((e.clientX - rect.left) / zoom - frameW / 2, CANVAS_WIDTH - frameW));
    const y = Math.max(0, Math.min((e.clientY - rect.top) / zoom - frameH / 2, CANVAS_HEIGHT - frameH));
    addFrame(photoUrl, x, y, frameW, frameH);
  };

  const handlePhotoDragStart = (e: React.DragEvent, photoUrl: string) => {e.dataTransfer.setData('text/plain', photoUrl);setIsDraggingPhoto(true);setDraggedPhotoUrl(photoUrl);};
  const handlePhotoDragEnd = () => {setIsDraggingPhoto(false);setDraggedPhotoUrl(null);setIsOverDropZone(false);setHoverFrameId(null);setHistoryIndex((prev) => prev + 1);setHistory((prev) => [...prev, { objects: [...elements], background: currentSpread?.canvas_data?.background || '#ffffff' }]);};

  const handleCanvasDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOverDropZone(true);
    const rect = stageContainerRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Check if hovering over an existing frame
    const mouseX = (e.clientX - rect.left) / zoom;
    const mouseY = (e.clientY - rect.top) / zoom;

    const frameUnderMouse = elements.find((el) => {
      if (el.type !== 'frame') return false;
      const frame = el as FrameElement;
      return mouseX >= frame.x && mouseX <= frame.x + frame.width &&
      mouseY >= frame.y && mouseY <= frame.y + frame.height;
    });

    if (frameUnderMouse) {
      setHoverFrameId(frameUnderMouse.id);
    } else {
      setHoverFrameId(null);
    }
  };

  const handleCanvasDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOverDropZone(false);
    setIsDraggingPhoto(false);
    const photoUrl = e.dataTransfer.getData('text/plain');
    if (!photoUrl || !canEdit) return;

    // Get the correct frame dimensions based on photo orientation
    const { width: frameW, height: frameH } = await getFrameDimensionsForPhoto(photoUrl);

    // If dropping on an existing frame, insert photo and resize frame to match
    if (hoverFrameId) {
      const existingFrame = elements.find((el) => el.id === hoverFrameId) as FrameElement;
      if (existingFrame) {
        // Keep the frame centered at its current position
        const centerX = existingFrame.x + existingFrame.width / 2;
        const centerY = existingFrame.y + existingFrame.height / 2;
        const newX = Math.max(0, Math.min(centerX - frameW / 2, CANVAS_WIDTH - frameW));
        const newY = Math.max(0, Math.min(centerY - frameH / 2, CANVAS_HEIGHT - frameH));

        updateElement(hoverFrameId, {
          photoSrc: photoUrl,
          x: newX,
          y: newY,
          width: frameW,
          height: frameH,
          photoOffsetX: 0,
          photoOffsetY: 0,
          photoScale: 1,
          photoRotation: 0,
          photoFlipH: false,
          photoFlipV: false,
          fitMode: 'fill'
        });
      }
      setHoverFrameId(null);
      return;
    }

    // Otherwise create a new frame at drop position with correct dimensions
    const rect = stageContainerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(0, Math.min((e.clientX - rect.left) / zoom - frameW / 2, CANVAS_WIDTH - frameW));
    const y = Math.max(0, Math.min((e.clientY - rect.top) / zoom - frameH / 2, CANVAS_HEIGHT - frameH));
    addFrame(photoUrl, x, y, frameW, frameH);
    setHoverFrameId(null);
  };

  // Save & submit
  const saveProject = async () => {if (!supabase || !projectId) return;setSaving(true);try {for (const spread of spreads) await supabase.from('spreads').update({ canvas_data: spread.canvas_data }).eq('id', spread.id);} catch (error) {console.error('Error saving:', error);} finally {setSaving(false);}};
  const submitForReview = async () => {if (!supabase || !projectId) return;setSaving(true);try {await saveProject();await supabase.from('projects').update({ status: 'submitted', submitted_at: new Date().toISOString() }).eq('id', projectId);setShowSubmitModal(false);navigate('/projects');} catch (error) {console.error('Error submitting:', error);} finally {setSaving(false);}};
  const saveCurrentAsTemplate = (name: string, toCloud: boolean) => {const frames = elements.filter((el) => el.type === 'frame') as FrameElement[];if (!frames.length) return;const templateFrames = frames.map((f) => ({ x: f.x / CANVAS_WIDTH * 100, y: f.y / CANVAS_HEIGHT * 100, width: f.width / CANVAS_WIDTH * 100, height: f.height / CANVAS_HEIGHT * 100, shape: f.shape }));const newTemplate: SavedTemplate = { id: `custom-${generateId()}`, name, frames: templateFrames, createdAt: new Date().toISOString(), source: toCloud ? 'cloud' : 'local' };const updated = [...savedTemplates, newTemplate];setSavedTemplates(updated);localStorage.setItem('savedTemplates', JSON.stringify(updated));setShowSaveTemplateModal(false);setTemplateName('');};

  // Asset handlers - add clipart/stickers/decorations to canvas as frames with images
  const addDecorationToCanvas = (asset: typeof clipart[0]) => {
    if (!canEdit) return;
    const imageUrl = asset.file_url || asset.data_url || '';
    const width = asset.width || 150;
    const height = asset.height || 150;
    // Place in center of visible canvas area
    const x = CANVAS_WIDTH / 2 - width / 2;
    const y = CANVAS_HEIGHT / 2 - height / 2;

    const newFrame: FrameElement = {
      id: generateId(),
      type: 'frame',
      name: asset.name || 'Decoration',
      x,
      y,
      width,
      height,
      rotation: 0,
      zIndex: elements.length,
      shape: asset.shape as FrameShape || 'rectangle',
      borderWidth: asset.borderWidth || 2,
      borderColor: asset.borderColor || '#000000',
      borderOpacity: asset.borderOpacity || 1,
      borderRadius: asset.borderRadius || 0,
      shadow: asset.shadow || false,
      shadowBlur: 10,
      shadowColor: '#00000050',
      shadowOffsetX: 0,
      shadowOffsetY: 4,
      photoSrc: imageUrl,
      photoOffsetX: 0,
      photoOffsetY: 0,
      photoScale: 1,
      photoRotation: 0,
      photoFlipH: false,
      photoFlipV: false,
      fitMode: 'fill',
      adjustments: { brightness: 0, contrast: 0, saturation: 0, temperature: 0, exposure: 0, vignette: 0 },
      filterPreset: 'none',
      filterIntensity: 100,
      locked: false
    };

    updateCurrentSpread({
      objects: [...elements, newFrame],
      background: currentSpread?.canvas_data?.background || '#ffffff'
    });
    setSelectedElementId(newFrame.id);
  };

  // Add frame shape from admin frames library
  const addAdminFrameToCanvas = (asset: typeof globalFrames[0]) => {
    if (!canEdit) return;
    const config = getFrameConfig(asset);
    const width = asset.width || 200;
    const height = asset.height || 200;
    const x = CANVAS_WIDTH / 2 - width / 2;
    const y = CANVAS_HEIGHT / 2 - height / 2;

    const newFrame: FrameElement = {
      id: generateId(),
      type: 'frame',
      name: asset.name || 'Frame',
      x,
      y,
      width,
      height,
      rotation: 0,
      zIndex: elements.length,
      shape: config.shape as FrameShape || 'rectangle',
      borderWidth: config.borderWidth || 2,
      borderColor: config.borderColor || '#000000',
      borderOpacity: config.borderOpacity || 1,
      borderRadius: config.borderRadius || 0,
      shadow: config.shadow || false,
      shadowBlur: 10,
      shadowColor: '#00000050',
      shadowOffsetX: 0,
      shadowOffsetY: 4,
      photoSrc: null,
      photoOffsetX: 0,
      photoOffsetY: 0,
      photoScale: 1,
      photoRotation: 0,
      photoFlipH: false,
      photoFlipV: false,
      fitMode: 'fill',
      adjustments: { brightness: 0, contrast: 0, saturation: 0, temperature: 0, exposure: 0, vignette: 0 },
      filterPreset: 'none',
      filterIntensity: 100,
      locked: false
    };

    updateCurrentSpread({
      objects: [...elements, newFrame],
      background: currentSpread?.canvas_data?.background || '#ffffff'
    });
    setSelectedElementId(newFrame.id);
  };

  // Set background from admin backgrounds library
  const setBackgroundFromAsset = (asset: typeof backgrounds[0]) => {
    if (!canEdit) return;
    const bgValue = getBackgroundValue(asset);
    updateCurrentSpread({
      objects: elements,
      background: bgValue
    });
  };

  // Sidebar panels
  const sidebarPanels = [
  { id: 'photos', icon: Image, label: language === 'he' ? 'תמונות' : 'Photos' },
  { id: 'templates', icon: LayoutTemplate, label: language === 'he' ? 'תבניות' : 'Templates' },
  { id: 'backgrounds', icon: Palette, label: language === 'he' ? 'רקעים' : 'BG' },
  { id: 'frames', icon: FrameIcon, label: language === 'he' ? 'מסגרות' : 'Frames' },
  { id: 'clipart', icon: Scissors, label: language === 'he' ? 'קליפארט' : 'Clipart' },
  { id: 'stickers', icon: Smile, label: language === 'he' ? 'מדבקות' : 'Stickers' },
  { id: 'text', icon: Type, label: language === 'he' ? 'טקסט' : 'Text' },
  { id: 'layers', icon: Layers, label: language === 'he' ? 'שכבות' : 'Layers' }];



  const templatesByCount = getTemplatesByCount();
  const templateCounts = Object.keys(templatesByCount).map(Number).sort((a, b) => a - b);

  if (loading) return <div data-ev-id="ev_d99ba1c85c" className="h-screen flex items-center justify-center bg-gray-900"><Loader2 className="w-8 h-8 animate-spin text-white" /></div>;

  const PrevArrow = isRTL ? ChevronRight : ChevronLeft;
  const NextArrow = isRTL ? ChevronLeft : ChevronRight;

  return (
    <div data-ev-id="ev_429acfd919" className="h-screen flex flex-col bg-gray-900 overflow-hidden">
      {/* Top Toolbar */}
      <header data-ev-id="ev_ba397c437d" className="h-14 bg-gray-800 border-b border-gray-700 px-4 flex items-center justify-between flex-shrink-0">
        <div data-ev-id="ev_476e159c84" className="flex items-center gap-3">
          <button data-ev-id="ev_c2d9dcdd88" onClick={() => navigate('/projects')} className="flex items-center gap-2 text-gray-300 hover:text-white">
            {isRTL ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
            <span data-ev-id="ev_bb7222526a">{t('back')}</span>
          </button>
          <span data-ev-id="ev_82fa8dc3be" className="text-gray-600">|</span>
          <span data-ev-id="ev_5c62f73c64" className="text-white font-medium truncate max-w-[200px]">{project?.name}</span>
        </div>
        <div data-ev-id="ev_3bc3d4df22" className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setSnappingEnabled(!snappingEnabled)} className="text-gray-400"><Magnet className="w-4 h-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => setGridEnabled(!gridEnabled)} className="text-gray-400"><Grid3X3 className="w-4 h-4" /></Button>
          <span data-ev-id="ev_div1" className="w-px h-6 bg-gray-700" />
          <Button variant="ghost" size="sm" onClick={() => setShowPreview(true)} className="text-gray-400"><Eye className="w-4 h-4" /></Button>
          <Button variant="secondary" size="sm" onClick={saveProject} disabled={saving || !canEdit}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}</Button>
          {canEdit && <Button size="sm" onClick={() => setShowSubmitModal(true)}><Send className="w-4 h-4 mr-1" />{language === 'he' ? 'שלח' : 'Submit'}</Button>}
        </div>
      </header>

      <div data-ev-id="ev_main_area" className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside data-ev-id="ev_left_sidebar" className={`w-80 bg-gray-800 border-${isRTL ? 'l' : 'r'} border-gray-700 flex flex-col ${isRTL ? 'order-last' : ''}`}>
          <div data-ev-id="ev_476e159c84" className="grid grid-cols-4 border-b border-gray-700">
            {sidebarPanels.map((panel) =>
            <button data-ev-id="ev_6055402a3e" key={panel.id} onClick={() => setActivePanel(panel.id)} className={`py-3 text-[10px] ${activePanel === panel.id ? 'bg-gray-700 text-white' : 'bg-gray-750 text-gray-400'}`}>
                <panel.icon className="w-4 h-4 mx-auto mb-1" />{panel.label}
              </button>
            )}
          </div>
          <div data-ev-id="ev_sidebar_content" className="flex-1 overflow-y-auto p-4">
            {activePanel === 'photos' &&
            <div data-ev-id="ev_photos_panel" className="flex flex-col gap-4">
                <input data-ev-id="ev_34ba1bf4a1" ref={fileInputRef} type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                <Button onClick={() => fileInputRef.current?.click()} className="w-full"><Upload className="w-4 h-4 mr-2" />{language === 'he' ? 'העלה תמונות' : 'Upload Photos'}</Button>
                <div data-ev-id="ev_photos_grid" className="grid grid-cols-2 gap-2">
                  {uploadedPhotos.map((photo, i) =>
                <motion.button key={i} draggable onDragStart={(e) => handlePhotoDragStart(e as any, photo)} onDragEnd={handlePhotoDragEnd} whileHover={{ scale: 1.03 }} onClick={() => addPhotoToCanvas(photo)} className={`aspect-square rounded-lg overflow-hidden border-2 cursor-grab ${draggedPhotoUrl === photo ? 'border-primary opacity-50' : 'border-transparent hover:border-primary'}`}>
                      <img data-ev-id="ev_c7a7495f6e" src={photo} alt="" className="w-full h-full object-cover" />
                    </motion.button>
                )}
                </div>
              </div>
            }
            {activePanel === 'templates' &&
            <div data-ev-id="ev_templates_panel" className="flex flex-col gap-4">
                <div data-ev-id="ev_template_tabs" className="flex gap-1 flex-wrap">
                  {templateCounts.map((count) =>
                <button data-ev-id="ev_42cb4e6cd1" key={count} onClick={() => setSelectedTemplateCategory(count)} className={`px-3 py-1 rounded text-xs ${selectedTemplateCategory === count ? 'bg-primary text-white' : 'bg-gray-700 text-gray-400'}`}>{count}</button>
                )}
                </div>
                <div data-ev-id="ev_template_grid" className="grid grid-cols-2 gap-2">
                  {(templatesByCount[selectedTemplateCategory] || []).map((template, i) =>
                <button data-ev-id="ev_c430d42e1f" key={i} onClick={() => applyTemplate(template)} className="aspect-video bg-gray-700 rounded-lg p-2 hover:bg-gray-600 relative">
                      {template.frames.map((frame, fi) =>
                  <div data-ev-id="ev_073508ecdc" key={fi} className="absolute bg-gray-500 border border-gray-400" style={{ left: `${frame.x}%`, top: `${frame.y}%`, width: `${frame.width}%`, height: `${frame.height}%` }} />
                  )}
                    </button>
                )}
                </div>
              </div>
            }
            {/* Backgrounds Panel */}
            {activePanel === 'backgrounds' &&
            <div data-ev-id="ev_2c0c2026c2" className="flex flex-col gap-4">
                {/* Search */}
                <div data-ev-id="ev_c3ea6db099" className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input data-ev-id="ev_1927bc4d83"
                type="text"
                value={bgSearchQuery}
                onChange={(e) => setBgSearchQuery(e.target.value)}
                placeholder={language === 'he' ? 'חיפוש רקעים...' : 'Search backgrounds...'}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-400" />

                </div>
                {/* Category tabs */}
                <div data-ev-id="ev_8f8eef1ee1" className="flex gap-1 flex-wrap">
                  <button data-ev-id="ev_da5d4055d3" onClick={() => setSelectedBgCategory('all')} className={`px-3 py-1 rounded text-xs ${selectedBgCategory === 'all' ? 'bg-primary text-white' : 'bg-gray-700 text-gray-400'}`}>{language === 'he' ? 'הכל' : 'All'}</button>
                  {Object.keys(backgroundsByCategory).map((cat) =>
                <button data-ev-id="ev_b0f38e4723" key={cat} onClick={() => setSelectedBgCategory(cat)} className={`px-3 py-1 rounded text-xs ${selectedBgCategory === cat ? 'bg-primary text-white' : 'bg-gray-700 text-gray-400'}`}>{cat}</button>
                )}
                </div>
                {/* Backgrounds grid */}
                <div data-ev-id="ev_b3467d482d" className="grid grid-cols-2 gap-2">
                  {(backgrounds ?? []).
                filter((bg) => selectedBgCategory === 'all' || bg.category === selectedBgCategory).
                filter((bg) => !bgSearchQuery || bg.name.toLowerCase().includes(bgSearchQuery.toLowerCase()) || (bg.tags ?? []).some((t) => t.toLowerCase().includes(bgSearchQuery.toLowerCase()))).
                map((bg) =>
                <motion.button
                  key={bg.id}
                  whileHover={{ scale: 1.03 }}
                  onClick={() => setBackgroundFromAsset(bg)}
                  className="aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-primary"
                  title={bg.name}>

                      {isColorBackground(bg) ?
                  <div data-ev-id="ev_d950d454ca" className="w-full h-full" style={{ background: getBackgroundValue(bg) }} /> :

                  <img data-ev-id="ev_67d1fd59f6" src={bg.thumbnail_url || bg.file_url} alt={bg.name} className="w-full h-full object-cover" />
                  }
                    </motion.button>
                )}
                </div>
                {assetsLoading && <div data-ev-id="ev_a8dd1182fc" className="flex justify-center py-4"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>}
                {!assetsLoading && backgrounds.length === 0 && <p data-ev-id="ev_8afbbd556b" className="text-center text-gray-500 text-sm">{language === 'he' ? 'אין רקעים זמינים' : 'No backgrounds available'}</p>}
              </div>
            }
            {/* Frames Panel */}
            {activePanel === 'frames' &&
            <div data-ev-id="ev_85e32e088c" className="flex flex-col gap-4">
                {/* Search */}
                <div data-ev-id="ev_cd7dcd5c4d" className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input data-ev-id="ev_2f0a2a2f96"
                type="text"
                value={frameSearchQuery}
                onChange={(e) => setFrameSearchQuery(e.target.value)}
                placeholder={language === 'he' ? 'חיפוש מסגרות...' : 'Search frames...'}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-400" />

                </div>
                {/* Quick add frame shapes */}
                <div data-ev-id="ev_0915ec2963" className="flex flex-wrap gap-2">
                  <button data-ev-id="ev_c2ad018886" onClick={() => addFrame(null, CANVAS_WIDTH / 2 - 100, CANVAS_HEIGHT / 2 - 75, 200, 150)} className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg" title={language === 'he' ? 'מלבן' : 'Rectangle'}>
                    <Square className="w-5 h-5 text-white" />
                  </button>
                  <button data-ev-id="ev_00dc7c301c" onClick={() => {const frameId = addFrame(null, CANVAS_WIDTH / 2 - 75, CANVAS_HEIGHT / 2 - 75, 150, 150);if (frameId) updateElement(frameId, { shape: 'circle' });}} className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg" title={language === 'he' ? 'עיגול' : 'Circle'}>
                    <CircleIcon className="w-5 h-5 text-white" />
                  </button>
                  <button data-ev-id="ev_eace3ed4a7" onClick={() => {const frameId = addFrame(null, CANVAS_WIDTH / 2 - 75, CANVAS_HEIGHT / 2 - 75, 150, 150);if (frameId) updateElement(frameId, { shape: 'heart' });}} className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg" title={language === 'he' ? 'לב' : 'Heart'}>
                    <Heart className="w-5 h-5 text-white" />
                  </button>
                </div>
                {/* Admin frames grid */}
                <div data-ev-id="ev_f2f3593a8c" className="grid grid-cols-2 gap-2">
                  {(globalFrames ?? []).
                filter((frame) => !frameSearchQuery || frame.name.toLowerCase().includes(frameSearchQuery.toLowerCase()) || (frame.tags ?? []).some((t) => t.toLowerCase().includes(frameSearchQuery.toLowerCase()))).
                map((frame) =>
                <motion.button
                  key={frame.id}
                  whileHover={{ scale: 1.03 }}
                  onClick={() => addAdminFrameToCanvas(frame)}
                  className="aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-primary bg-gray-700 p-2"
                  title={frame.name}>

                      {frame.thumbnail_url || frame.file_url ?
                  <img data-ev-id="ev_96a048727b" src={frame.thumbnail_url || frame.file_url} alt={frame.name} className="w-full h-full object-contain" /> :

                  <div data-ev-id="ev_525abccbb3" className="w-full h-full flex items-center justify-center">
                          <FrameIcon className="w-8 h-8 text-gray-500" />
                        </div>
                  }
                    </motion.button>
                )}
                </div>
                {assetsLoading && <div data-ev-id="ev_e64c3c0765" className="flex justify-center py-4"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>}
                {!assetsLoading && globalFrames.length === 0 && <p data-ev-id="ev_c17aba11d6" className="text-center text-gray-500 text-sm">{language === 'he' ? 'אין מסגרות זמינות' : 'No frames available'}</p>}
              </div>
            }
            {activePanel === 'text' &&
            <div data-ev-id="ev_76cbb5202f" className="flex flex-col gap-4">
                <Button onClick={addTextElement} className="w-full"><Type className="w-4 h-4 mr-2" />{language === 'he' ? 'הוסף טקסט' : 'Add Text'}</Button>
              </div>
            }
            {activePanel === 'layers' &&
            <div data-ev-id="ev_77d0e08806" className="flex-1 overflow-y-auto p-4">
                {[...elements].sort((a, b) => b.zIndex - a.zIndex).map((element) =>
              <div data-ev-id="ev_77d0e08806" key={element.id} onClick={() => setSelectedElementId(element.id)} className={`group flex items-center gap-2 p-2 rounded cursor-pointer ${selectedElementId === element.id ? 'bg-primary/20 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                    {element.type === 'frame' ? <FrameIcon className="w-4 h-4" /> : <Type className="w-4 h-4" />}
                    <span data-ev-id="ev_3ea27307ea" className="flex-1 truncate text-sm">{element.name || `${element.type}-${element.id.slice(-4)}`}</span>
                    <button data-ev-id="ev_4797f33edf" onClick={(e) => {e.stopPropagation();updateCurrentSpread({ objects: elements.filter((el) => el.id !== element.id), background: currentSpread?.canvas_data?.background || '#ffffff' });if (selectedElementId === element.id) setSelectedElementId(null);}} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded">
                      <Trash2 className="w-3 h-3 text-red-400" />
                    </button>
                  </div>
              )}

              </div>
            }
          </div>
        </aside>

        {/* Main Canvas */}
        <main data-ev-id="ev_a755909775" className="flex-1 flex flex-col overflow-hidden">
          <div data-ev-id="ev_0c8caac4e0" ref={canvasContainerRef} onDragOver={handleCanvasDragOver} onDragLeave={() => {setIsOverDropZone(false);setHoverFrameId(null);}} onDrop={handleCanvasDrop} className={`flex-1 overflow-auto bg-gray-950 flex items-center justify-center p-4 relative ${isOverDropZone ? 'ring-2 ring-primary ring-inset' : ''}`}>
            {/* Grid & Snap Toggle Buttons */}
            <div data-ev-id="ev_b6ed4460b1" className="absolute top-4 right-4 z-20 flex gap-2">
              <button data-ev-id="ev_e3e288e831" onClick={() => setGridEnabled(!gridEnabled)} className={`p-2 rounded-lg ${gridEnabled ? 'bg-primary text-white' : 'bg-gray-700 text-gray-400'} hover:bg-gray-600 transition-colors`} title={language === 'he' ? 'רשת' : 'Grid'}>
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button data-ev-id="ev_7916e23056" onClick={() => setSnappingEnabled(!snappingEnabled)} className={`p-2 rounded-lg ${snappingEnabled ? 'bg-primary text-white' : 'bg-gray-700 text-gray-400'} hover:bg-gray-600 transition-colors`} title={language === 'he' ? 'הצמד לרשת' : 'Snap to Grid'}>
                <Magnet className="w-5 h-5" />
              </button>
            </div>
            {isDraggingPhoto && <div data-ev-id="ev_9f36247ad5" className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center"><div data-ev-id="ev_af642a8a5f" className={`px-4 py-2 rounded-lg ${hoverFrameId ? 'bg-green-500' : 'bg-primary'} text-white`}>{hoverFrameId ? language === 'he' ? 'שחרר' : 'Drop' : language === 'he' ? 'הוסף' : 'Add'}</div></div>}
            <div data-ev-id="ev_28261697dc" ref={stageContainerRef} className="relative" style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}>
                <Stage ref={stageRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} onClick={(e) => {if (e.target === e.target.getStage()) {setSelectedElementId(null);setEditMode('frame');setIsEditingText(false);}}} className="shadow-2xl">
                  <Layer>
                    <Rect x={0} y={0} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill={currentSpread?.canvas_data?.background || '#ffffff'} />
                    {gridEnabled && Array.from({ length: Math.floor(CANVAS_WIDTH / GRID_SIZE) }).map((_, i) => <Line key={`v${i}`} points={[(i + 1) * GRID_SIZE, 0, (i + 1) * GRID_SIZE, CANVAS_HEIGHT]} stroke="#94a3b8" strokeWidth={1} opacity={0.6} />)}
                    {gridEnabled && Array.from({ length: Math.floor(CANVAS_HEIGHT / GRID_SIZE) }).map((_, i) => <Line key={`h${i}`} points={[0, (i + 1) * GRID_SIZE, CANVAS_WIDTH, (i + 1) * GRID_SIZE]} stroke="#94a3b8" strokeWidth={1} opacity={0.6} />)}
                    <Rect x={FOLD_LINE_X - 1} y={0} width={2} height={CANVAS_HEIGHT} fill="#cbd5e1" />
                    {snapGuides.map((guide, i) => guide.type === 'vertical' ? <Line key={i} points={[guide.position, 0, guide.position, CANVAS_HEIGHT]} stroke={guide.color} strokeWidth={2} dash={[5, 5]} /> : <Line key={i} points={[0, guide.position, CANVAS_WIDTH, guide.position]} stroke={guide.color} strokeWidth={2} dash={[5, 5]} />)}
                    {elements.filter((el) => el.type !== 'group').sort((a, b) => a.zIndex - b.zIndex).map((element) => {
                    if (element.type === 'frame') {
                      const frame = element as FrameElement;
                      return <FrameElementComponent key={frame.id} element={frame} image={loadedImages.get(frame.photoSrc || '') || null} isSelected={selectedElementId === frame.id} isDropTarget={hoverFrameId === frame.id} editMode={selectedElementId === frame.id ? editMode : 'frame'} onSelect={() => {setSelectedElementId(frame.id);setEditMode('frame');setIsEditingText(false);}} onDoubleClick={() => {setSelectedElementId(frame.id);setEditMode('photo');}} onChange={(attrs) => updateElement(frame.id, attrs)} onPhotoChange={(attrs) => updateElement(frame.id, attrs)} language={language} snappingEnabled={snappingEnabled} otherElements={elements} canvasWidth={CANVAS_WIDTH} canvasHeight={CANVAS_HEIGHT} gridEnabled={gridEnabled} onSnapGuidesChange={setSnapGuides} />;
                    }
                    if (element.type === 'text') {
                      const text = element as TextElement;
                      return <TextElementComponent key={text.id} element={text} isSelected={selectedElementId === text.id} isEditing={selectedElementId === text.id && isEditingText} onSelect={() => {setSelectedElementId(text.id);setEditMode('text');setActivePropertiesTab('typography');}} onDoubleClick={() => {setSelectedElementId(text.id);setIsEditingText(true);}} onChange={(attrs) => updateElement(text.id, attrs)} onStartEdit={() => setIsEditingText(true)} onEndEdit={() => setIsEditingText(false)} language={language} snappingEnabled={snappingEnabled} otherElements={elements} canvasWidth={CANVAS_WIDTH} canvasHeight={CANVAS_HEIGHT} gridEnabled={gridEnabled} onSnapGuidesChange={setSnapGuides} stageRef={stageRef} />;
                    }
                    return null;
                  })}

                  </Layer>
                </Stage>
            </div>
            {isEditingText && selectedText && <TextEditorOverlay element={selectedText} zoom={zoom} stageRef={stageRef} onChange={(attrs) => updateElement(selectedText.id, attrs)} onClose={() => setIsEditingText(false)} language={language} />}
          </div>
          {/* Spread Navigator */}
          <div data-ev-id="ev_f487dfbf65" className="h-20 bg-gray-800 border-t border-gray-700 px-4 flex items-center gap-4">
            <div data-ev-id="ev_00ad0014f4" className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={() => setZoom(Math.max(0.2, zoom - 0.1))} className="text-gray-400 p-1"><ZoomOut className="w-4 h-4" /></Button>
              <span data-ev-id="ev_9d5cc52b9d" className="text-xs text-gray-400 w-10 text-center">{Math.round(zoom * 100)}%</span>
              <Button variant="ghost" size="sm" onClick={() => setZoom(Math.min(2, zoom + 0.1))} className="text-gray-400 p-1"><ZoomIn className="w-4 h-4" /></Button>
            </div>
            <div data-ev-id="ev_03777ef3c3" className="h-8 w-px bg-gray-700" />
            <div data-ev-id="ev_e91301dd5a" className="flex-1 flex items-center gap-2 overflow-x-auto">
              <Button variant="ghost" size="sm" onClick={() => setZoom(Math.max(0.2, zoom - 0.1))} className="text-gray-400 p-1"><ZoomOut className="w-4 h-4" /></Button>
              <span data-ev-id="ev_9d5cc52b9d" className="text-xs text-gray-400 w-10 text-center">{Math.round(zoom * 100)}%</span>
              <Button variant="ghost" size="sm" onClick={() => setZoom(Math.min(2, zoom + 0.1))} className="text-gray-400 p-1"><ZoomIn className="w-4 h-4" /></Button>
            </div>
          </div>
        </main>

        {/* Right Sidebar - Properties */}
        <aside data-ev-id="ev_36aa83ca44" className={`w-80 bg-gray-800 border-${isRTL ? 'r' : 'l'} border-gray-700 flex flex-col ${isRTL ? 'order-first' : ''}`}>
          {/* TEXT PROPERTIES PANEL */}
          {selectedText ?
          <>
              {/* Text Mode Tabs */}
              <div data-ev-id="ev_cce60934d3" className="flex border-b border-gray-700">
                <button data-ev-id="ev_ed09e59e6e" onClick={() => setActivePropertiesTab('typography')} className={`flex-1 py-3 text-xs font-medium ${activePropertiesTab === 'typography' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
                  <Type className="w-4 h-4 mx-auto mb-1" />{language === 'he' ? 'טיפוגרפיה' : 'Typography'}
                </button>
                <button data-ev-id="ev_dfb965a698" onClick={() => setActivePropertiesTab('effects')} className={`flex-1 py-3 text-xs font-medium ${activePropertiesTab === 'effects' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
                  <Sparkles className="w-4 h-4 mx-auto mb-1" />{language === 'he' ? 'אפקטים' : 'Effects'}
                </button>
                <button data-ev-id="ev_a98b721b1f" onClick={() => setActivePropertiesTab('transform')} className={`flex-1 py-3 text-xs font-medium ${activePropertiesTab === 'transform' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
                  <Move className="w-4 h-4 mx-auto mb-1" />{language === 'he' ? 'טרנספורם' : 'Transform'}
                </button>
              </div>

              <div data-ev-id="ev_3df98d9da4" className="flex-1 overflow-y-auto p-4">
                {/* TYPOGRAPHY TAB */}
                {activePropertiesTab === 'typography' &&
              <div data-ev-id="ev_da47e324b9" className="flex flex-col gap-4">
                    {/* Font Family */}
                    <div data-ev-id="ev_bf0af6d56d">
                      <label data-ev-id="ev_e8a36be169" className="text-xs text-gray-400 mb-2 block">{language === 'he' ? 'גופן' : 'Font'}</label>
                      <select data-ev-id="ev_6c4fcf3b5a" value={selectedText.fontFamily} onChange={(e) => updateElement(selectedText.id, { fontFamily: e.target.value })} className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm">
                        <option data-ev-id="ev_416da7aea2" value="Heebo">Heebo</option>
                        <option data-ev-id="ev_54b16a93c5" value="Inter">Inter</option>
                        <option data-ev-id="ev_7ce399d47d" value="Arial">Arial</option>
                        <option data-ev-id="ev_1cf8d3e201" value="David">David</option>
                        <option data-ev-id="ev_f51efcfb1d" value="Rubik">Rubik</option>
                        <option data-ev-id="ev_340a025ae5" value="Assistant">Assistant</option>
                      </select>
                    </div>

                    {/* Font Size */}
                    <div data-ev-id="ev_7b624cd406">
                      <label data-ev-id="ev_c19bdbba2f" className="text-xs text-gray-400 mb-2 block">{language === 'he' ? 'גודל' : 'Size'}</label>
                      <div data-ev-id="ev_13f43b583f" className="flex items-center gap-3">
                        <span data-ev-id="ev_a6f15638f4" className="text-white text-sm w-8">{selectedText.fontSize}</span>
                        <input data-ev-id="ev_738f65daab" type="range" min="12" max="120" value={selectedText.fontSize} onChange={(e) => updateElement(selectedText.id, { fontSize: parseInt(e.target.value) })} className="flex-1 h-1 bg-gray-700 rounded" />
                      </div>
                    </div>

                    {/* Font Style */}
                    <div data-ev-id="ev_9ed733f3f4">
                      <label data-ev-id="ev_43f5f742ab" className="text-xs text-gray-400 mb-2 block">{language === 'he' ? 'סגנון' : 'Style'}</label>
                      <div data-ev-id="ev_bfb7d7d20f" className="flex gap-2">
                        <button data-ev-id="ev_fa12a2a972" onClick={() => updateElement(selectedText.id, { fontWeight: selectedText.fontWeight === 'bold' ? 'normal' : 'bold' })} className={`flex-1 py-2.5 rounded flex items-center justify-center gap-1 ${selectedText.fontWeight === 'bold' ? 'bg-primary text-white' : 'bg-gray-700 text-gray-400'}`}>
                          <Bold className="w-4 h-4" /> {language === 'he' ? 'רגיל' : 'Bold'}
                        </button>
                        <button data-ev-id="ev_44fb1403ce" onClick={() => updateElement(selectedText.id, { fontStyle: selectedText.fontStyle === 'italic' ? 'normal' : 'italic' })} className={`flex-1 py-2.5 rounded flex items-center justify-center gap-1 ${selectedText.fontStyle === 'italic' ? 'bg-primary text-white' : 'bg-gray-700 text-gray-400'}`}>
                          <Italic className="w-4 h-4" /> {language === 'he' ? 'נטוי' : 'Italic'}
                        </button>
                      </div>
                    </div>

                    {/* Text Decoration */}
                    <div data-ev-id="ev_1dde0050c3">
                      <label data-ev-id="ev_4ebee7e040" className="text-xs text-gray-400 mb-2 block">{language === 'he' ? 'קו תחתון' : 'Underline'}</label>
                      <div data-ev-id="ev_1b6d9e5330" className="flex gap-2">
                        <button data-ev-id="ev_67f453d0e5" onClick={() => updateElement(selectedText.id, { textDecoration: 'none' })} className={`flex-1 py-2.5 rounded flex items-center justify-center gap-1 ${selectedText.textDecoration === 'none' ? 'bg-primary text-white' : 'bg-gray-700 text-gray-400'}`}>
                          <Type className="w-4 h-4 mr-1" /> {language === 'he' ? 'ללא' : 'None'}
                        </button>
                        <button data-ev-id="ev_235833c08d" onClick={() => updateElement(selectedText.id, { textDecoration: 'underline' })} className={`flex-1 py-2.5 rounded flex items-center justify-center gap-1 ${selectedText.textDecoration === 'underline' ? 'bg-primary text-white' : 'bg-gray-700 text-gray-400'}`}>
                          <Underline className="w-4 h-4 mr-1" /> {language === 'he' ? 'קו תחתון' : 'Underline'}
                        </button>
                      </div>
                    </div>

                    {/* Text Alignment */}
                    <div data-ev-id="ev_53a5fb1cc0">
                      <label data-ev-id="ev_fe3be7e010" className="text-xs text-gray-400 mb-2 block">{language === 'he' ? 'יישור טקסט' : 'Alignment'}</label>
                      <div data-ev-id="ev_b434cfd9c4" className="flex gap-1">
                        <button data-ev-id="ev_274a589a47" onClick={() => updateElement(selectedText.id, { textAlign: 'right' })} className={`flex-1 py-2.5 rounded flex items-center justify-center gap-1 ${selectedText.textAlign === 'right' ? 'bg-primary text-white' : 'bg-gray-700 text-gray-400'}`}><AlignRight className="w-4 h-4" /></button>
                        <button data-ev-id="ev_5eec5b04bd" onClick={() => updateElement(selectedText.id, { textAlign: 'center' })} className={`flex-1 py-2.5 rounded flex items-center justify-center gap-1 ${selectedText.textAlign === 'center' ? 'bg-primary text-white' : 'bg-gray-700 text-gray-400'}`}><AlignCenter className="w-4 h-4" /></button>
                        <button data-ev-id="ev_81e41aaaf6" onClick={() => updateElement(selectedText.id, { textAlign: 'left' })} className={`flex-1 py-2.5 rounded flex items-center justify-center gap-1 ${selectedText.textAlign === 'left' ? 'bg-primary text-white' : 'bg-gray-700 text-gray-400'}`}><AlignLeft className="w-4 h-4" /></button>
                        <button data-ev-id="ev_2f7fa7e32d" onClick={() => updateElement(selectedText.id, { textAlign: 'justify' })} className={`flex-1 py-2.5 rounded flex items-center justify-center gap-1 ${selectedText.textAlign === 'justify' ? 'bg-primary text-white' : 'bg-gray-700 text-gray-400'}`}><AlignJustify className="w-4 h-4" /></button>
                      </div>
                    </div>

                    {/* Line Height */}
                    <div data-ev-id="ev_70dc84d09a">
                      <label data-ev-id="ev_61701bb7b2" className="text-xs text-gray-400 mb-2 block">{language === 'he' ? 'גובה שורה' : 'Line Height'}</label>
                      <div data-ev-id="ev_a1d4437686" className="flex items-center gap-3">
                        <span data-ev-id="ev_ef1bf87c7e" className="text-white text-sm w-8">{selectedText.lineHeight.toFixed(1)}</span>
                        <input data-ev-id="ev_42494986fd" type="range" min="80" max="200" value={selectedText.lineHeight * 100} onChange={(e) => updateElement(selectedText.id, { lineHeight: parseInt(e.target.value) / 100 })} className="flex-1 h-1 bg-gray-700 rounded" />
                      </div>
                    </div>

                    {/* Letter Spacing */}
                    <div data-ev-id="ev_273499f317">
                      <label data-ev-id="ev_452ef459c4" className="text-xs text-gray-400 mb-2 block">{language === 'he' ? 'מרווח אותיות' : 'Letter Spacing'}</label>
                      <div data-ev-id="ev_26610e8a50" className="flex items-center gap-3">
                        <span data-ev-id="ev_12281e8170" className="text-white text-sm w-8">{selectedText.letterSpacing}</span>
                        <input data-ev-id="ev_a3258a4626" type="range" min="-5" max="20" value={selectedText.letterSpacing} onChange={(e) => updateElement(selectedText.id, { letterSpacing: parseInt(e.target.value) })} className="flex-1 h-1 bg-gray-700 rounded" />
                      </div>
                    </div>

                    {/* Text Color */}
                    <div data-ev-id="ev_ecb4c97697">
                      <label data-ev-id="ev_402e3485f1" className="text-xs text-gray-400 mb-2 block">{language === 'he' ? 'צבע טקסט' : 'Text Color'}</label>
                      <input data-ev-id="ev_ab972e7a2e" type="color" value={selectedText.fill} onChange={(e) => updateElement(selectedText.id, { fill: e.target.value })} className="w-full h-10 rounded cursor-pointer" />
                    </div>
                  </div>
              }

                {/* EFFECTS TAB */}
                {activePropertiesTab === 'effects' && selectedFrame.photoSrc &&
              <div data-ev-id="ev_fc01b6482b" className="flex flex-col gap-4">
                    {/* Text Shadow */}
                    <div data-ev-id="ev_0283557c20" className="border-b border-gray-700 pb-4">
                      <div data-ev-id="ev_6421e6a614" className="flex items-center justify-between mb-2">
                        <label data-ev-id="ev_7dbaa2be48" className="text-xs text-gray-400">{language === 'he' ? 'צל' : 'Shadow'}</label>
                        <button data-ev-id="ev_ecebf38269" onClick={() => updateElement(selectedText.id, { shadow: { ...selectedText.shadow, enabled: !selectedText.shadow.enabled } })} className={`w-10 h-5 rounded-full transition-colors flex items-center px-0.5 ${selectedText.shadow.enabled ? 'bg-purple-600 justify-end' : 'bg-gray-600 justify-start'}`}>
                          <div data-ev-id="ev_5481f9b8c6" className="w-4 h-4 rounded-full bg-white shadow-sm pointer-events-none" />
                        </button>
                      </div>
                      {selectedText.shadow.enabled &&
                  <div data-ev-id="ev_f32352f56b" className="flex flex-col gap-2 mt-2">
                          <div data-ev-id="ev_424a8c526c" className="flex items-center gap-2">
                            <span data-ev-id="ev_6a7a391306" className="text-xs text-gray-500 w-16">{language === 'he' ? 'טשטוש' : 'Blur'}</span>
                            <input data-ev-id="ev_f0a66debf9" type="range" min="0" max="20" value={selectedText.shadow.blur} onChange={(e) => updateElement(selectedText.id, { shadow: { ...selectedText.shadow, blur: parseInt(e.target.value) } })} className="flex-1 h-1 bg-gray-700 rounded" />
                          </div>
                          <div data-ev-id="ev_e02bbe4297" className="flex items-center gap-2">
                            <span data-ev-id="ev_efd115ca44" className="text-xs text-gray-500 w-16">X</span>
                            <input data-ev-id="ev_236aab115e" type="range" min="-20" max="20" value={selectedText.shadow.offsetX} onChange={(e) => updateElement(selectedText.id, { shadow: { ...selectedText.shadow, offsetX: parseInt(e.target.value) } })} className="flex-1 h-1 bg-gray-700 rounded" />
                          </div>
                          <div data-ev-id="ev_4e68670c29" className="flex items-center gap-2">
                            <span data-ev-id="ev_97978b2017" className="text-xs text-gray-500 w-16">Y</span>
                            <input data-ev-id="ev_e0e92d532b" type="range" min="-20" max="20" value={selectedText.shadow.offsetY} onChange={(e) => updateElement(selectedText.id, { shadow: { ...selectedText.shadow, offsetY: parseInt(e.target.value) } })} className="flex-1 h-1 bg-gray-700 rounded" />
                          </div>
                          <div data-ev-id="ev_65c08568ee" className="flex items-center gap-2">
                            <span data-ev-id="ev_876f57a85f" className="text-xs text-gray-500 w-16">{language === 'he' ? 'צבע' : 'Color'}</span>
                            <input data-ev-id="ev_f6ef5f86d8" type="color" value={selectedText.shadow.color} onChange={(e) => updateElement(selectedText.id, { shadow: { ...selectedText.shadow, color: e.target.value } })} className="w-8 h-6 rounded cursor-pointer" />
                          </div>
                        </div>
                  }
                    </div>

                    {/* Text Stroke */}
                    <div data-ev-id="ev_b421641fa5" className="border-b border-gray-700 pt-4">
                      <div data-ev-id="ev_fad793c43c" className="flex items-center justify-between mb-2">
                        <label data-ev-id="ev_52f0825c1a" className="text-xs text-gray-400">{language === 'he' ? 'קו מתאר' : 'Stroke'}</label>
                        <button data-ev-id="ev_a0a88e8a6e" onClick={() => updateElement(selectedText.id, { stroke: { ...selectedText.stroke, enabled: !selectedText.stroke.enabled } })} className={`w-10 h-5 rounded-full transition-colors flex items-center px-0.5 ${selectedText.stroke.enabled ? 'bg-purple-600 justify-end' : 'bg-gray-600 justify-start'}`}>
                          <div data-ev-id="ev_24896d584e" className="w-4 h-4 rounded-full bg-white shadow-sm pointer-events-none" />
                        </button>
                      </div>
                      {selectedText.stroke.enabled &&
                  <div data-ev-id="ev_9ab10631b9" className="flex flex-col gap-2 mt-2">
                          <div data-ev-id="ev_3199694f5e" className="flex items-center gap-2">
                            <span data-ev-id="ev_66588b2710" className="text-xs text-gray-500 w-16">{language === 'he' ? 'עובי' : 'Width'}</span>
                            <input data-ev-id="ev_868cadb6b3" type="range" min="1" max="10" value={selectedText.stroke.width} onChange={(e) => updateElement(selectedText.id, { stroke: { ...selectedText.stroke, width: parseInt(e.target.value) } })} className="flex-1 h-1 bg-gray-700 rounded" />
                          </div>
                          <div data-ev-id="ev_718494990b" className="flex items-center gap-2">
                            <span data-ev-id="ev_9ece8731a6" className="text-xs text-gray-500 w-16">{language === 'he' ? 'צבע' : 'Color'}</span>
                            <input data-ev-id="ev_5f534951c8" type="color" value={selectedText.stroke.color} onChange={(e) => updateElement(selectedText.id, { stroke: { ...selectedText.stroke, color: e.target.value } })} className="w-8 h-6 rounded cursor-pointer" />
                          </div>
                        </div>
                  }
                    </div>

                    {/* Highlight Color */}
                    <div data-ev-id="ev_f208101aa2">
                      <label data-ev-id="ev_cb4f1e5fb4" className="text-xs text-gray-400 mb-2 block">{language === 'he' ? 'צבע הדגשה' : 'Highlight'}</label>
                      <div data-ev-id="ev_214ccc7614" className="flex items-center gap-2">
                        <input data-ev-id="ev_f18112905d" type="color" value={selectedText.highlightColor || '#ffff00'} onChange={(e) => updateElement(selectedText.id, { highlightColor: e.target.value })} className="w-10 h-8 rounded cursor-pointer" />
                        <button data-ev-id="ev_4797f33edf" onClick={() => updateElement(selectedText.id, { highlightColor: selectedText.highlightColor ? null : '#ffff00' })} className={`flex-1 py-2 rounded text-xs ${selectedText.highlightColor ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
                          {selectedText.highlightColor ? language === 'he' ? 'הסר' : 'Remove' : language === 'he' ? 'הוסף' : 'Add'}
                        </button>
                      </div>
                    </div>

                    {/* Reset Effects */}
                    <button data-ev-id="ev_b641367971" onClick={resetTextStyle} className="w-full py-2 rounded bg-gray-700 text-gray-300 text-xs flex items-center justify-center gap-2 hover:bg-gray-600">
                      <RefreshCw className="w-4 h-4" />{language === 'he' ? 'איפוס אפקטים' : 'Reset Effects'}
                    </button>
                  </div>
              }
              </div>
            </> :

          selectedFrame ?
          <>
              {/* Frame/Photo Mode Tabs */}
              <div data-ev-id="ev_297fac7f6a" className="flex border-b border-gray-700">
                <button data-ev-id="ev_910eb3321c" onClick={() => {setEditMode('frame');setActivePropertiesTab('frame');}} className={`flex-1 py-3 text-xs font-medium ${editMode === 'frame' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
                  <FrameIcon className="w-4 h-4 mx-auto mb-1" />{language === 'he' ? 'מסגרת' : 'Frame'}
                </button>
                {selectedFrame.photoSrc &&
              <>
                    <button data-ev-id="ev_268b83512c" onClick={() => {setEditMode('photo');setActivePropertiesTab('photo');}} className={`flex-1 py-3 text-xs font-medium ${editMode === 'photo' && activePropertiesTab === 'photo' ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
                      <Image className="w-4 h-4 mx-auto mb-1" />{language === 'he' ? 'תמונה' : 'Photo'}
                    </button>
                    <button data-ev-id="ev_982d50759a" onClick={() => {setEditMode('photo');setActivePropertiesTab('adjustments');}} className={`flex-1 py-3 text-xs font-medium ${activePropertiesTab === 'adjustments' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
                      <Sun className="w-4 h-4 mx-auto mb-1" />{language === 'he' ? 'התאמות' : 'Adjust'}
                    </button>
                  </>
              }
              </div>

              <div data-ev-id="ev_6d3c807f49" className="flex-1 overflow-y-auto p-4">
                {/* FRAME MODE CONTROLS */}
                {editMode === 'frame' &&
              <div data-ev-id="ev_7d27d09fef" className="flex flex-col gap-4">
                    {/* Shape Selector */}
                    <div data-ev-id="ev_6e4f889828">
                      <label data-ev-id="ev_5142d47bd8" className="text-xs text-gray-400 mb-2 block">{language === 'he' ? 'צורה' : 'Shape'}</label>
                      <div data-ev-id="ev_b1ebab8290" className="grid grid-cols-5 gap-1">
                        {shapeIcons.map(({ shape, icon, label }) =>
                    <button data-ev-id="ev_2851499303" key={shape} onClick={() => updateElement(selectedFrame.id, { shape })} title={label[language]} className={`p-2 rounded flex items-center justify-center ${selectedFrame.shape === shape ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
                            {icon}
                          </button>
                    )}
                      </div>
                    </div>

                    {/* Flip Controls */}
                    <div data-ev-id="ev_a135962921">
                      <label data-ev-id="ev_af86720db6" className="text-xs text-gray-400 mb-2 block">{language === 'he' ? 'היפוך' : 'Flip'}</label>
                      <div data-ev-id="ev_f95fa055b8" className="flex gap-2">
                        <button type="button" data-ev-id="ev_00cc6f8d28" onClick={() => updateElement(selectedFrame.id, { flipH: !selectedFrame.flipH })} className={`flex-1 py-2 rounded text-xs flex items-center justify-center gap-1 cursor-pointer ${selectedFrame.flipH ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}>
                          <FlipHorizontal className="w-4 h-4 pointer-events-none" /><span data-ev-id="ev_5ce8d2ce30" className="pointer-events-none">{language === 'he' ? 'אופקי' : 'H'}</span>
                        </button>
                        <button type="button" data-ev-id="ev_5c6c94d22c" onClick={() => updateElement(selectedFrame.id, { flipV: !selectedFrame.flipV })} className={`flex-1 py-2 rounded text-xs flex items-center justify-center gap-1 cursor-pointer ${selectedFrame.flipV ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}>
                          <FlipVertical className="w-4 h-4 pointer-events-none" /><span data-ev-id="ev_0ef6a0d2b3" className="pointer-events-none">{language === 'he' ? 'אנכי' : 'V'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Border Controls */}
                    <div data-ev-id="ev_ddc9926071" className="border-t border-gray-700 pt-4">
                      <div data-ev-id="ev_c3e1d612de" className="flex items-center justify-between mb-2">
                        <label data-ev-id="ev_d29a347861" className="text-xs text-gray-400">{language === 'he' ? 'מסגרת' : 'Border'}</label>
                        <button data-ev-id="ev_3bd2be4aa8" onClick={() => updateElement(selectedFrame.id, { borderEnabled: !selectedFrame.borderEnabled })} className={`w-10 h-5 rounded-full transition-colors flex items-center px-0.5 ${selectedFrame.borderEnabled ? 'bg-green-600 justify-end' : 'bg-gray-600 justify-start'}`}>
                          <div data-ev-id="ev_99454d861c" className="w-4 h-4 rounded-full bg-white shadow-sm pointer-events-none" />
                        </button>
                      </div>
                      {selectedFrame.borderEnabled &&
                  <div data-ev-id="ev_aeb372976d" className="flex flex-col gap-2 mt-2">
                          <div data-ev-id="ev_14dd16743f" className="flex items-center gap-2">
                            <span data-ev-id="ev_83e342658f" className="text-xs text-gray-500 w-12">{language === 'he' ? 'עובי' : 'Width'}</span>
                            <input data-ev-id="ev_4baf5f8b6a" type="range" min="1" max="20" value={selectedFrame.borderWidth} onChange={(e) => updateElement(selectedFrame.id, { borderWidth: parseInt(e.target.value) })} className="flex-1 h-1 bg-gray-700 rounded" />
                            <span data-ev-id="ev_38b7a28425" className="text-xs text-gray-500 w-6">{selectedFrame.borderWidth}</span>
                          </div>
                          <div data-ev-id="ev_9eb0b4666c" className="flex items-center gap-2">
                            <span data-ev-id="ev_10307b5fec" className="text-xs text-gray-500 w-12">{language === 'he' ? 'צבע' : 'Color'}</span>
                            <input data-ev-id="ev_b98620d632" type="color" value={selectedFrame.borderColor} onChange={(e) => updateElement(selectedFrame.id, { borderColor: e.target.value })} className="w-8 h-6 rounded cursor-pointer" />
                            <input data-ev-id="ev_2fe0bdce7a" type="range" min="0" max="100" value={selectedFrame.borderOpacity * 100} onChange={(e) => updateElement(selectedFrame.id, { borderOpacity: parseInt(e.target.value) / 100 })} className="flex-1 h-1 bg-gray-700 rounded" />
                          </div>
                        </div>
                  }
                    </div>

                    {/* Shadow Controls */}
                    <div data-ev-id="ev_46b62782b8" className="border-t border-gray-700 pt-4">
                      <div data-ev-id="ev_21fece5cf7" className="flex items-center justify-between mb-2">
                        <label data-ev-id="ev_140683f38a" className="text-xs text-gray-400">{language === 'he' ? 'צל' : 'Shadow'}</label>
                        <button data-ev-id="ev_97ede25c77" onClick={() => updateElement(selectedFrame.id, { shadowEnabled: !selectedFrame.shadowEnabled })} className={`w-10 h-5 rounded-full transition-colors flex items-center px-0.5 ${selectedFrame.shadowEnabled ? 'bg-green-600 justify-end' : 'bg-gray-600 justify-start'}`}>
                          <div data-ev-id="ev_2b1387ee18" className="w-4 h-4 rounded-full bg-white shadow-sm pointer-events-none" />
                        </button>
                      </div>
                      {selectedFrame.shadowEnabled &&
                  <div data-ev-id="ev_74a6970b24" className="flex flex-col gap-2 mt-2">
                          <div data-ev-id="ev_6613c8336b" className="flex items-center gap-2">
                            <span data-ev-id="ev_ac95f57407" className="text-xs text-gray-500 w-12">{language === 'he' ? 'טשטוש' : 'Blur'}</span>
                            <input data-ev-id="ev_f2cfb5a667" type="range" min="0" max="50" value={selectedFrame.shadowBlur} onChange={(e) => updateElement(selectedFrame.id, { shadowBlur: parseInt(e.target.value) })} className="flex-1 h-1 bg-gray-700 rounded" />
                          </div>
                          <div data-ev-id="ev_1bedbb559f" className="flex items-center gap-2">
                            <span data-ev-id="ev_b87c63dd70" className="text-xs text-gray-500 w-12">X</span>
                            <input data-ev-id="ev_2c54388e95" type="range" min="-50" max="50" value={selectedFrame.shadowOffsetX} onChange={(e) => updateElement(selectedFrame.id, { shadowOffsetX: parseInt(e.target.value) })} className="flex-1 h-1 bg-gray-700 rounded" />
                          </div>
                          <div data-ev-id="ev_c02d665522" className="flex items-center gap-2">
                            <span data-ev-id="ev_b80ec72d7c" className="text-xs text-gray-500 w-12">Y</span>
                            <input data-ev-id="ev_240fe030fa" type="range" min="-50" max="50" value={selectedFrame.shadowOffsetY} onChange={(e) => updateElement(selectedFrame.id, { shadowOffsetY: parseInt(e.target.value) })} className="flex-1 h-1 bg-gray-700 rounded" />
                          </div>
                          <div data-ev-id="ev_784f663d05" className="flex items-center gap-2">
                            <span data-ev-id="ev_ce5111b613" className="text-xs text-gray-500 w-12">{language === 'he' ? 'צבע' : 'Color'}</span>
                            <input data-ev-id="ev_8112581dda" type="color" value={selectedFrame.shadowColor} onChange={(e) => updateElement(selectedFrame.id, { shadowColor: e.target.value })} className="w-8 h-6 rounded cursor-pointer" />
                          </div>
                        </div>
                  }
                    </div>

                    {/* Layer Controls */}
                    <div data-ev-id="ev_b14a62e348" className="border-t border-gray-700 pt-4">
                      <label data-ev-id="ev_ee4e2c8fa4" className="text-xs text-gray-400 mb-2 block">{language === 'he' ? 'שכבות' : 'Layer'}</label>
                      <div data-ev-id="ev_fffe42dbad" className="grid grid-cols-4 gap-1">
                        <button data-ev-id="ev_e10ea44f50" onClick={deleteSelectedElement} className="p-2 rounded bg-red-600/20 text-red-400 hover:bg-red-600/40"><Trash2 className="w-4 h-4 mx-auto" /></button>
                        <button data-ev-id="ev_8925db4dda" onClick={toggleLock} className={`p-2 rounded ${selectedFrame.locked ? 'bg-yellow-600 text-white' : 'bg-gray-700 text-gray-400'}`}>{selectedFrame.locked ? <Lock className="w-4 h-4 mx-auto" /> : <Unlock className="w-4 h-4 mx-auto" />}</button>
                        <button data-ev-id="ev_f9ec65b0fe" onClick={sendBackward} className="p-2 rounded bg-gray-700 text-gray-400 hover:bg-gray-600"><ChevronDown className="w-4 h-4 mx-auto" /></button>
                        <button data-ev-id="ev_f257f4cfee" onClick={bringForward} className="p-2 rounded bg-gray-700 text-gray-400 hover:bg-gray-600"><ChevronUp className="w-4 h-4 mx-auto" /></button>
                      </div>


                    </div>
                  </div>
              }

                {/* PHOTO MODE CONTROLS */}
                {editMode === 'photo' && activePropertiesTab === 'photo' && selectedFrame.photoSrc &&
              <div data-ev-id="ev_10563a6a9c" className="flex flex-col gap-4">
                    {/* Quick Actions */}
                    <div data-ev-id="ev_7311df26aa" className="flex gap-2">
                      <button data-ev-id="ev_1597139987" onClick={autoFitPhoto} className="flex-1 py-2 px-3 rounded bg-orange-600 text-white text-xs flex items-center justify-center gap-1">
                        <Maximize className="w-4 h-4" />{language === 'he' ? 'התאמה' : 'Auto Fit'}
                      </button>
                      <button data-ev-id="ev_e77ddebcc5" onClick={() => updateElement(selectedFrame.id, { fitMode: selectedFrame.fitMode === 'fill' ? 'fit' : 'fill' })} className="flex-1 py-2 px-3 rounded bg-gray-700 text-gray-300 text-xs">
                        {selectedFrame.fitMode === 'fill' ? 'Fill' : 'Fit'}
                      </button>
                    </div>

                    {/* Zoom Slider */}
                    <div data-ev-id="ev_5be42a38df">
                      <label data-ev-id="ev_7ed088928d" className="text-xs text-gray-400 mb-2 block">{language === 'he' ? 'זום' : 'Zoom'} ({Math.round(selectedFrame.photoScale * 100)}%)</label>
                      <input data-ev-id="ev_3852dd9965" type="range" min="50" max="200" value={selectedFrame.photoScale * 100} onChange={(e) => updateElement(selectedFrame.id, { photoScale: parseInt(e.target.value) / 100 })} className="w-full h-1 bg-gray-700 rounded" />
                    </div>

                    {/* Position X Slider */}
                    <div data-ev-id="ev_position_x">
                      <label data-ev-id="ev_position_x_label" className="text-xs text-gray-400 mb-2 block">{language === 'he' ? 'מיקום X' : 'Position X'} ({selectedFrame.photoOffsetX}px)</label>
                      <input data-ev-id="ev_position_x_slider" type="range" min={-Math.round(selectedFrame.width / 2)} max={Math.round(selectedFrame.width / 2)} value={selectedFrame.photoOffsetX} onChange={(e) => updateElement(selectedFrame.id, { photoOffsetX: parseInt(e.target.value) })} className="w-full h-1 bg-gray-700 rounded" />
                    </div>

                    {/* Position Y Slider */}
                    <div data-ev-id="ev_position_y">
                      <label data-ev-id="ev_position_y_label" className="text-xs text-gray-400 mb-2 block">{language === 'he' ? 'מיקום Y' : 'Position Y'} ({selectedFrame.photoOffsetY}px)</label>
                      <input data-ev-id="ev_position_y_slider" type="range" min={-Math.round(selectedFrame.height / 2)} max={Math.round(selectedFrame.height / 2)} value={selectedFrame.photoOffsetY} onChange={(e) => updateElement(selectedFrame.id, { photoOffsetY: parseInt(e.target.value) })} className="w-full h-1 bg-gray-700 rounded" />
                    </div>

                    {/* Rotation Slider */}
                    <div data-ev-id="ev_6771463482">
                      <label data-ev-id="ev_beb2f494bf" className="text-xs text-gray-400 mb-2 block">{language === 'he' ? 'סיבוב' : 'Rotation'} ({selectedFrame.photoRotation}°)</label>
                      <input data-ev-id="ev_4c8a6ebab6" type="range" min="-180" max="180" value={selectedFrame.photoRotation} onChange={(e) => updateElement(selectedFrame.id, { photoRotation: parseInt(e.target.value) })} className="w-full h-1 bg-gray-700 rounded" />
                    </div>

                    {/* Photo Flip */}
                    <div data-ev-id="ev_dbd9c944f2">
                      <label data-ev-id="ev_f86c1868da" className="text-xs text-gray-400 mb-2 block">{language === 'he' ? 'היפוך תמונה' : 'Flip Photo'}</label>
                      <div data-ev-id="ev_9799c8827a" className="flex gap-2">
                        <button data-ev-id="ev_c5b9934f98" onClick={() => updateElement(selectedFrame.id, { photoFlipH: !selectedFrame.photoFlipH })} className={`flex-1 py-2 rounded text-xs flex items-center justify-center gap-1 ${selectedFrame.photoFlipH ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
                          <FlipHorizontal className="w-4 h-4" />{language === 'he' ? 'אופקי' : 'H'}
                        </button>
                        <button data-ev-id="ev_31f0d0a9e2" onClick={() => updateElement(selectedFrame.id, { photoFlipV: !selectedFrame.photoFlipV })} className={`flex-1 py-2 rounded text-xs flex items-center justify-center gap-1 ${selectedFrame.photoFlipV ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
                          <FlipVertical className="w-4 h-4" />{language === 'he' ? 'אנכי' : 'V'}
                        </button>
                      </div>
                    </div>

                    {/* Reset Photo */}
                    <button data-ev-id="ev_4cded430d0" onClick={autoFitPhoto} className="w-full py-2 rounded bg-gray-700 text-gray-300 text-xs flex items-center justify-center gap-2 hover:bg-gray-600">
                      <RefreshCw className="w-4 h-4" />{language === 'he' ? 'איפוס מיקום' : 'Reset Position'}
                    </button>

                    {/* Filter Presets */}
                    <div data-ev-id="ev_41f1ddc9b1" className="border-t border-gray-700 pt-4">
                      <label data-ev-id="ev_04c436955b" className="text-xs text-gray-400 mb-2 block">{language === 'he' ? 'פילטרים' : 'Filters'}</label>
                      <div data-ev-id="ev_67a3851d15" className="grid grid-cols-3 gap-2">
                        {FILTER_PRESETS.map((filter) =>
                    <button data-ev-id="ev_fe88bfd0fd" key={filter.id} onClick={() => updateElement(selectedFrame.id, { filterPreset: filter.id })} className={`p-2 rounded text-xs ${selectedFrame.filterPreset === filter.id ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
                            {filter.name[language]}
                          </button>
                    )}
                      </div>
                      {selectedFrame.filterPreset !== 'none' &&
                  <div data-ev-id="ev_db655436e0" className="mt-2">
                          <label data-ev-id="ev_632bde586e" className="text-xs text-gray-500">{language === 'he' ? 'עוצמה' : 'Intensity'}</label>
                          <input data-ev-id="ev_64eebd6a8e" type="range" min="0" max="100" value={selectedFrame.filterIntensity} onChange={(e) => updateElement(selectedFrame.id, { filterIntensity: parseInt(e.target.value) })} className="w-full h-1 bg-gray-700 rounded mt-1" />
                        </div>
                  }
                    </div>
                  </div>
              }

                {/* ADJUSTMENTS TAB */}
                {activePropertiesTab === 'adjustments' && selectedFrame.photoSrc &&
              <div data-ev-id="ev_f4f7e03d0b" className="flex flex-col gap-3">
                    <AdjustmentSlider label={language === 'he' ? 'בהירות' : 'Brightness'} value={selectedFrame.adjustments.brightness} onChange={(v) => updateElement(selectedFrame.id, { adjustments: { ...selectedFrame.adjustments, brightness: v } })} icon={Sun} />
                    <AdjustmentSlider label={language === 'he' ? 'ניגודיות' : 'Contrast'} value={selectedFrame.adjustments.contrast} onChange={(v) => updateElement(selectedFrame.id, { adjustments: { ...selectedFrame.adjustments, contrast: v } })} icon={Contrast} />
                    <AdjustmentSlider label={language === 'he' ? 'רוויה' : 'Saturation'} value={selectedFrame.adjustments.saturation} onChange={(v) => updateElement(selectedFrame.id, { adjustments: { ...selectedFrame.adjustments, saturation: v } })} icon={Droplets} />
                    <AdjustmentSlider label={language === 'he' ? 'טמפרטורה' : 'Temperature'} value={selectedFrame.adjustments.temperature} onChange={(v) => updateElement(selectedFrame.id, { adjustments: { ...selectedFrame.adjustments, temperature: v } })} icon={Thermometer} />
                    <AdjustmentSlider label={language === 'he' ? 'הבהרות' : 'Highlights'} value={selectedFrame.adjustments.highlights} onChange={(v) => updateElement(selectedFrame.id, { adjustments: { ...selectedFrame.adjustments, highlights: v } })} icon={SunDim} />
                    <AdjustmentSlider label={language === 'he' ? 'צלים' : 'Shadows'} value={selectedFrame.adjustments.shadows} onChange={(v) => updateElement(selectedFrame.id, { adjustments: { ...selectedFrame.adjustments, shadows: v } })} icon={Moon} />
                    <AdjustmentSlider label={language === 'he' ? 'חדות' : 'Sharpness'} value={selectedFrame.adjustments.sharpness} onChange={(v) => updateElement(selectedFrame.id, { adjustments: { ...selectedFrame.adjustments, sharpness: v } })} min={0} icon={Focus} />
                    
                    <button data-ev-id="ev_2f7e9a2157" onClick={resetAdjustments} className="w-full py-2 rounded bg-gray-700 text-gray-300 text-xs flex items-center justify-center gap-2 hover:bg-gray-600 mt-2">
                      <RefreshCw className="w-4 h-4" />{language === 'he' ? 'איפוס התאמות' : 'Reset Adjustments'}
                    </button>
                  </div>
              }
              </div>
            </> :

          <div data-ev-id="ev_63f7beeb0b" className="flex-1 flex items-center justify-center text-gray-500 p-4 text-center">
              <div data-ev-id="ev_d85171e3cd">
                <MousePointer className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p data-ev-id="ev_5b35fe220c" className="text-sm">{language === 'he' ? 'בחר אלמנט לעריכה' : 'Select an element to edit'}</p>
              </div>
            </div>
          }
        </aside>

      </div>

      {/* Submit Modal */}
      <Modal isOpen={showSubmitModal} onClose={() => setShowSubmitModal(false)} title={language === 'he' ? 'שלח לבדיקה' : 'Submit for Review'}>
        <p data-ev-id="ev_0e337688c0" className="text-gray-600 mb-4">{language === 'he' ? 'האם אתה בטוח שברצונך לשלוח את הפרויקט לבדיקה?' : 'Are you sure you want to submit this project for review?'}</p>
        <div data-ev-id="ev_eb2aee7e4c" className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={() => setShowSubmitModal(false)}>{language === 'he' ? 'ביטול' : 'Cancel'}</Button>
          <Button onClick={submitForReview} disabled={saving}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : language === 'he' ? 'שלח' : 'Submit'}</Button>
        </div>
      </Modal>

      {/* Preview Modal */}
      {showPreview &&
      <div data-ev-id="ev_e666ed1f11" className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          <button data-ev-id="ev_321273b3f7" onClick={() => setShowPreview(false)} className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20">
            <svg data-ev-id="ev_d2fa3dd765" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path data-ev-id="ev_a5f67a36b3" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <div data-ev-id="ev_a72d7b07bd" style={{ transform: `scale(${Math.min(0.85, (window.innerWidth - 100) / CANVAS_WIDTH, (window.innerHeight - 100) / CANVAS_HEIGHT)})` }}>
            <Stage width={CANVAS_WIDTH} height={CANVAS_HEIGHT}>
              <Layer>
                <Rect x={0} y={0} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill={currentSpread?.canvas_data?.background || '#ffffff'} />
                {elements.filter((el) => el.type !== 'group').sort((a, b) => a.zIndex - b.zIndex).map((element) => {
                if (element.type === 'frame') {
                  const frame = element as FrameElement;
                  return <FrameElementComponent key={frame.id} element={frame} image={loadedImages.get(frame.photoSrc || '') || null} isSelected={false} isDropTarget={false} editMode="frame" onSelect={() => {}} onDoubleClick={() => {}} onChange={() => {}} onPhotoChange={() => {}} language={language} snappingEnabled={false} otherElements={[]} canvasWidth={CANVAS_WIDTH} canvasHeight={CANVAS_HEIGHT} gridEnabled={false} onSnapGuidesChange={() => {}} />;
                }
                if (element.type === 'text') {
                  const text = element as TextElement;
                  return <TextElementComponent key={text.id} element={text} isSelected={false} isEditing={false} onSelect={() => {}} onDoubleClick={() => {}} onChange={() => {}} onStartEdit={() => {}} onEndEdit={() => {}} language={language} snappingEnabled={false} otherElements={[]} canvasWidth={CANVAS_WIDTH} canvasHeight={CANVAS_HEIGHT} gridEnabled={false} onSnapGuidesChange={() => {}} stageRef={stageRef} />;
                }
                return null;
              })}
              </Layer>
            </Stage>
          </div>
          <p data-ev-id="ev_1431e22b38" className="absolute bottom-4 text-gray-400 text-sm">{language === 'he' ? 'לחץ ESC לסגירה' : 'Press ESC to close'}</p>
        </div>
      }
    </div>);

}