/**
 * Album Size Definitions
 * Standard album dimensions with DPI settings
 */

export interface AlbumSize {
  id: string;
  name: { he: string; en: string };
  width: number; // pixels at 300 DPI
  height: number; // pixels at 300 DPI
  widthCm: number;
  heightCm: number;
  spreadWidth: number; // double-page spread width
  spreadHeight: number;
  dpi: number;
  category: 'square' | 'landscape' | 'portrait';
  popular?: boolean;
}

// Standard album sizes at 300 DPI
export const ALBUM_SIZES: AlbumSize[] = [
  {
    id: '20x20',
    name: { he: '20×20 ס"מ', en: '20×20 cm' },
    width: 2362,
    height: 2362,
    widthCm: 20,
    heightCm: 20,
    spreadWidth: 4724,
    spreadHeight: 2362,
    dpi: 300,
    category: 'square',
    popular: true,
  },
  {
    id: '25x25',
    name: { he: '25×25 ס"מ', en: '25×25 cm' },
    width: 2953,
    height: 2953,
    widthCm: 25,
    heightCm: 25,
    spreadWidth: 5906,
    spreadHeight: 2953,
    dpi: 300,
    category: 'square',
  },
  {
    id: '30x30',
    name: { he: '30×30 ס"מ', en: '30×30 cm' },
    width: 3543,
    height: 3543,
    widthCm: 30,
    heightCm: 30,
    spreadWidth: 7086,
    spreadHeight: 3543,
    dpi: 300,
    category: 'square',
    popular: true,
  },
  {
    id: '20x30',
    name: { he: '20×30 ס"מ', en: '20×30 cm' },
    width: 2362,
    height: 3543,
    widthCm: 20,
    heightCm: 30,
    spreadWidth: 4724,
    spreadHeight: 3543,
    dpi: 300,
    category: 'portrait',
  },
  {
    id: '30x20',
    name: { he: '30×20 ס"מ (אלבום)', en: '30×20 cm (Album)' },
    width: 3543,
    height: 2362,
    widthCm: 30,
    heightCm: 20,
    spreadWidth: 7086,
    spreadHeight: 2362,
    dpi: 300,
    category: 'landscape',
    popular: true,
  },
  {
    id: '30x40',
    name: { he: '30×40 ס"מ', en: '30×40 cm' },
    width: 3543,
    height: 4724,
    widthCm: 30,
    heightCm: 40,
    spreadWidth: 7086,
    spreadHeight: 4724,
    dpi: 300,
    category: 'portrait',
  },
  {
    id: '40x30',
    name: { he: '40×30 ס"מ (גדול)', en: '40×30 cm (Large)' },
    width: 4724,
    height: 3543,
    widthCm: 40,
    heightCm: 30,
    spreadWidth: 9448,
    spreadHeight: 3543,
    dpi: 300,
    category: 'landscape',
  },
];

// Valid page counts (interior pages, not including covers)
// Must be even numbers for spreads
export const VALID_PAGE_COUNTS = [
  { value: 10, label: { he: '10 עמודים', en: '10 pages' } },
  { value: 20, label: { he: '20 עמודים', en: '20 pages' } },
  { value: 30, label: { he: '30 עמודים', en: '30 pages' } },
  { value: 40, label: { he: '40 עמודים', en: '40 pages' } },
  { value: 50, label: { he: '50 עמודים', en: '50 pages' } },
  { value: 60, label: { he: '60 עמודים', en: '60 pages' } },
  { value: 80, label: { he: '80 עמודים', en: '80 pages' } },
  { value: 100, label: { he: '100 עמודים', en: '100 pages' } },
];

export const MIN_PAGES = 10;
export const MAX_PAGES = 100;

export function getAlbumSizeById(id: string): AlbumSize | undefined {
  return ALBUM_SIZES.find(s => s.id === id);
}

export function getSpreadCount(pageCount: number): number {
  // Interior pages are paired into spreads
  // Plus 1 for the cover spread
  return Math.ceil(pageCount / 2) + 1;
}

export function isValidPageCount(count: number): boolean {
  return count >= MIN_PAGES && count <= MAX_PAGES && count % 2 === 0;
}
