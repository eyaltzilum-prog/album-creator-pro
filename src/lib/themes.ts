/**
 * Album Themes System
 * Provides theme definitions with palettes, typography, backgrounds, and layout presets
 */

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
}

export interface ThemeTypography {
  headingFont: string;
  bodyFont: string;
  headingWeight: 'light' | 'normal' | 'bold';
  bodyWeight: 'light' | 'normal' | 'bold';
}

export interface ThemeFrame {
  x: number; // percentage
  y: number; // percentage
  width: number; // percentage
  height: number; // percentage
  shape: 'rectangle' | 'circle' | 'oval' | 'heart';
}

export interface ThemeLayout {
  id: string;
  name: { he: string; en: string };
  photoCount: number;
  frames: ThemeFrame[];
}

export interface Theme {
  id: string;
  name: { he: string; en: string };
  description: { he: string; en: string };
  category: 'minimal' | 'modern' | 'wedding' | 'baby' | 'family' | 'travel' | 'celebration' | 'school';
  colors: ThemeColors;
  typography: ThemeTypography;
  backgroundPatterns: string[]; // CSS gradients or colors
  layouts: ThemeLayout[];
  previewGradient: string; // For theme card preview
}

// Minimal Theme
const minimalTheme: Theme = {
  id: 'minimal',
  name: { he: 'מינימלי', en: 'Minimal' },
  description: { he: 'עיצוב נקי ופשוט עם הרבה שטח לבן', en: 'Clean and simple design with lots of white space' },
  category: 'minimal',
  colors: {
    primary: '#1a1a1a',
    secondary: '#666666',
    accent: '#000000',
    background: '#ffffff',
    surface: '#f8f8f8',
    text: '#1a1a1a',
    textMuted: '#999999',
  },
  typography: {
    headingFont: 'Inter',
    bodyFont: 'Inter',
    headingWeight: 'light',
    bodyWeight: 'normal',
  },
  backgroundPatterns: [
    '#ffffff',
    '#f8f8f8',
    '#f0f0f0',
    'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
  ],
  layouts: [
    { id: 'min-1', name: { he: 'תמונה מרכזית', en: 'Center Focus' }, photoCount: 1, frames: [{ x: 15, y: 10, width: 70, height: 80, shape: 'rectangle' }] },
    { id: 'min-2', name: { he: 'זוג אופקי', en: 'Horizontal Pair' }, photoCount: 2, frames: [{ x: 5, y: 20, width: 42, height: 60, shape: 'rectangle' }, { x: 53, y: 20, width: 42, height: 60, shape: 'rectangle' }] },
    { id: 'min-3', name: { he: 'שלישייה', en: 'Triple Grid' }, photoCount: 3, frames: [{ x: 5, y: 10, width: 28, height: 80, shape: 'rectangle' }, { x: 36, y: 10, width: 28, height: 80, shape: 'rectangle' }, { x: 67, y: 10, width: 28, height: 80, shape: 'rectangle' }] },
  ],
  previewGradient: 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)',
};

// Modern Theme
const modernTheme: Theme = {
  id: 'modern',
  name: { he: 'מודרני', en: 'Modern' },
  description: { he: 'קווים נקיים עם גוונים כהים אלגנטיים', en: 'Clean lines with elegant dark tones' },
  category: 'modern',
  colors: {
    primary: '#2d3436',
    secondary: '#636e72',
    accent: '#0984e3',
    background: '#1e272e',
    surface: '#2d3436',
    text: '#ffffff',
    textMuted: '#b2bec3',
  },
  typography: {
    headingFont: 'Poppins',
    bodyFont: 'Inter',
    headingWeight: 'bold',
    bodyWeight: 'normal',
  },
  backgroundPatterns: [
    '#1e272e',
    '#2d3436',
    'linear-gradient(135deg, #2d3436 0%, #1e272e 100%)',
    'linear-gradient(135deg, #0984e3 0%, #6c5ce7 100%)',
  ],
  layouts: [
    { id: 'mod-1', name: { he: 'מסגרת רחבה', en: 'Wide Frame' }, photoCount: 1, frames: [{ x: 5, y: 15, width: 90, height: 70, shape: 'rectangle' }] },
    { id: 'mod-2', name: { he: 'אלכסוני', en: 'Diagonal Split' }, photoCount: 2, frames: [{ x: 5, y: 5, width: 55, height: 55, shape: 'rectangle' }, { x: 40, y: 40, width: 55, height: 55, shape: 'rectangle' }] },
    { id: 'mod-4', name: { he: 'רשת', en: 'Grid' }, photoCount: 4, frames: [{ x: 5, y: 5, width: 44, height: 44, shape: 'rectangle' }, { x: 51, y: 5, width: 44, height: 44, shape: 'rectangle' }, { x: 5, y: 51, width: 44, height: 44, shape: 'rectangle' }, { x: 51, y: 51, width: 44, height: 44, shape: 'rectangle' }] },
  ],
  previewGradient: 'linear-gradient(135deg, #2d3436 0%, #0984e3 100%)',
};

// Wedding Theme
const weddingTheme: Theme = {
  id: 'wedding',
  name: { he: 'חתונה', en: 'Wedding' },
  description: { he: 'רומנטי ואלגנטי עם גוונים רכים', en: 'Romantic and elegant with soft tones' },
  category: 'wedding',
  colors: {
    primary: '#d4a373',
    secondary: '#e9c46a',
    accent: '#bc6c25',
    background: '#fefae0',
    surface: '#faedcd',
    text: '#3d405b',
    textMuted: '#8d8d8d',
  },
  typography: {
    headingFont: 'Playfair Display',
    bodyFont: 'Lato',
    headingWeight: 'normal',
    bodyWeight: 'light',
  },
  backgroundPatterns: [
    '#fefae0',
    '#faedcd',
    'linear-gradient(135deg, #fefae0 0%, #faedcd 100%)',
    'linear-gradient(135deg, #d4a373 0%, #e9c46a 100%)',
  ],
  layouts: [
    { id: 'wed-1', name: { he: 'זוג מרכזי', en: 'Central Couple' }, photoCount: 1, frames: [{ x: 20, y: 10, width: 60, height: 80, shape: 'oval' }] },
    { id: 'wed-2', name: { he: 'לב ותמונה', en: 'Heart & Photo' }, photoCount: 2, frames: [{ x: 5, y: 15, width: 40, height: 70, shape: 'rectangle' }, { x: 55, y: 25, width: 35, height: 50, shape: 'heart' }] },
    { id: 'wed-3', name: { he: 'גלריה רומנטית', en: 'Romantic Gallery' }, photoCount: 3, frames: [{ x: 10, y: 5, width: 80, height: 50, shape: 'rectangle' }, { x: 10, y: 58, width: 38, height: 37, shape: 'rectangle' }, { x: 52, y: 58, width: 38, height: 37, shape: 'rectangle' }] },
  ],
  previewGradient: 'linear-gradient(135deg, #fefae0 0%, #d4a373 100%)',
};

// Baby Theme
const babyTheme: Theme = {
  id: 'baby',
  name: { he: 'תינוק', en: 'Baby' },
  description: { he: 'רך ומתוק עם צבעי פסטל', en: 'Soft and sweet with pastel colors' },
  category: 'baby',
  colors: {
    primary: '#a8dadc',
    secondary: '#f1faee',
    accent: '#e63946',
    background: '#f8f9fa',
    surface: '#e8f4f8',
    text: '#457b9d',
    textMuted: '#90b4ce',
  },
  typography: {
    headingFont: 'Quicksand',
    bodyFont: 'Nunito',
    headingWeight: 'bold',
    bodyWeight: 'normal',
  },
  backgroundPatterns: [
    '#f8f9fa',
    '#e8f4f8',
    'linear-gradient(135deg, #a8dadc 0%, #f1faee 100%)',
    'linear-gradient(135deg, #ffd6e0 0%, #a8dadc 100%)',
  ],
  layouts: [
    { id: 'baby-1', name: { he: 'עיגול מרכזי', en: 'Center Circle' }, photoCount: 1, frames: [{ x: 25, y: 15, width: 50, height: 70, shape: 'circle' }] },
    { id: 'baby-2', name: { he: 'לפני ואחרי', en: 'Before & After' }, photoCount: 2, frames: [{ x: 8, y: 20, width: 38, height: 60, shape: 'circle' }, { x: 54, y: 20, width: 38, height: 60, shape: 'circle' }] },
    { id: 'baby-3', name: { he: 'אבני דרך', en: 'Milestones' }, photoCount: 3, frames: [{ x: 5, y: 25, width: 28, height: 50, shape: 'circle' }, { x: 36, y: 15, width: 28, height: 70, shape: 'circle' }, { x: 67, y: 25, width: 28, height: 50, shape: 'circle' }] },
  ],
  previewGradient: 'linear-gradient(135deg, #a8dadc 0%, #ffd6e0 100%)',
};

// Family Theme
const familyTheme: Theme = {
  id: 'family',
  name: { he: 'משפחה', en: 'Family' },
  description: { he: 'חם ומזמין עם גוונים טבעיים', en: 'Warm and inviting with natural tones' },
  category: 'family',
  colors: {
    primary: '#6b705c',
    secondary: '#a5a58d',
    accent: '#cb997e',
    background: '#ffe8d6',
    surface: '#ddbea9',
    text: '#3d405b',
    textMuted: '#7d7d7d',
  },
  typography: {
    headingFont: 'Merriweather',
    bodyFont: 'Open Sans',
    headingWeight: 'bold',
    bodyWeight: 'normal',
  },
  backgroundPatterns: [
    '#ffe8d6',
    '#f5ebe0',
    'linear-gradient(135deg, #ffe8d6 0%, #ddbea9 100%)',
    'linear-gradient(135deg, #6b705c 0%, #a5a58d 100%)',
  ],
  layouts: [
    { id: 'fam-1', name: { he: 'משפחתית', en: 'Family Portrait' }, photoCount: 1, frames: [{ x: 10, y: 8, width: 80, height: 84, shape: 'rectangle' }] },
    { id: 'fam-3', name: { he: 'סיפור', en: 'Story' }, photoCount: 3, frames: [{ x: 5, y: 5, width: 45, height: 90, shape: 'rectangle' }, { x: 52, y: 5, width: 43, height: 44, shape: 'rectangle' }, { x: 52, y: 51, width: 43, height: 44, shape: 'rectangle' }] },
    { id: 'fam-5', name: { he: 'קולאז\'', en: 'Collage' }, photoCount: 5, frames: [{ x: 5, y: 5, width: 44, height: 60, shape: 'rectangle' }, { x: 51, y: 5, width: 44, height: 28, shape: 'rectangle' }, { x: 51, y: 35, width: 44, height: 30, shape: 'rectangle' }, { x: 5, y: 67, width: 29, height: 28, shape: 'rectangle' }, { x: 36, y: 67, width: 59, height: 28, shape: 'rectangle' }] },
  ],
  previewGradient: 'linear-gradient(135deg, #ffe8d6 0%, #cb997e 100%)',
};

// Travel Theme
const travelTheme: Theme = {
  id: 'travel',
  name: { he: 'טיול', en: 'Travel' },
  description: { he: 'הרפתקני וצבעוני כמו חופשה', en: 'Adventurous and colorful like a vacation' },
  category: 'travel',
  colors: {
    primary: '#118ab2',
    secondary: '#06d6a0',
    accent: '#ffd166',
    background: '#073b4c',
    surface: '#0a5068',
    text: '#ffffff',
    textMuted: '#90caf9',
  },
  typography: {
    headingFont: 'Montserrat',
    bodyFont: 'Roboto',
    headingWeight: 'bold',
    bodyWeight: 'normal',
  },
  backgroundPatterns: [
    '#073b4c',
    '#0a5068',
    'linear-gradient(135deg, #118ab2 0%, #06d6a0 100%)',
    'linear-gradient(135deg, #ffd166 0%, #ef476f 100%)',
  ],
  layouts: [
    { id: 'trav-1', name: { he: 'פנורמה', en: 'Panorama' }, photoCount: 1, frames: [{ x: 3, y: 20, width: 94, height: 60, shape: 'rectangle' }] },
    { id: 'trav-2', name: { he: 'יעד כפול', en: 'Dual Destination' }, photoCount: 2, frames: [{ x: 5, y: 5, width: 60, height: 90, shape: 'rectangle' }, { x: 68, y: 15, width: 27, height: 70, shape: 'rectangle' }] },
    { id: 'trav-4', name: { he: 'יומן מסע', en: 'Travel Journal' }, photoCount: 4, frames: [{ x: 5, y: 5, width: 55, height: 55, shape: 'rectangle' }, { x: 62, y: 5, width: 33, height: 27, shape: 'rectangle' }, { x: 62, y: 34, width: 33, height: 26, shape: 'rectangle' }, { x: 5, y: 62, width: 90, height: 33, shape: 'rectangle' }] },
  ],
  previewGradient: 'linear-gradient(135deg, #118ab2 0%, #ffd166 100%)',
};

// Celebration Theme
const celebrationTheme: Theme = {
  id: 'celebration',
  name: { he: 'חגיגה', en: 'Celebration' },
  description: { he: 'שמח וחגיגי לאירועים מיוחדים', en: 'Joyful and festive for special occasions' },
  category: 'celebration',
  colors: {
    primary: '#9b5de5',
    secondary: '#f15bb5',
    accent: '#fee440',
    background: '#240046',
    surface: '#3c096c',
    text: '#ffffff',
    textMuted: '#c8b6ff',
  },
  typography: {
    headingFont: 'Pacifico',
    bodyFont: 'Poppins',
    headingWeight: 'normal',
    bodyWeight: 'normal',
  },
  backgroundPatterns: [
    '#240046',
    '#3c096c',
    'linear-gradient(135deg, #9b5de5 0%, #f15bb5 100%)',
    'linear-gradient(135deg, #fee440 0%, #00bbf9 100%)',
  ],
  layouts: [
    { id: 'cel-1', name: { he: 'כוכב', en: 'Star Moment' }, photoCount: 1, frames: [{ x: 15, y: 10, width: 70, height: 80, shape: 'rectangle' }] },
    { id: 'cel-2', name: { he: 'לפני ואחרי', en: 'Before & After' }, photoCount: 2, frames: [{ x: 5, y: 15, width: 43, height: 70, shape: 'rectangle' }, { x: 52, y: 15, width: 43, height: 70, shape: 'rectangle' }] },
    { id: 'cel-3', name: { he: 'חגיגה משולשת', en: 'Triple Party' }, photoCount: 3, frames: [{ x: 5, y: 5, width: 62, height: 55, shape: 'rectangle' }, { x: 69, y: 5, width: 26, height: 55, shape: 'rectangle' }, { x: 5, y: 62, width: 90, height: 33, shape: 'rectangle' }] },
  ],
  previewGradient: 'linear-gradient(135deg, #9b5de5 0%, #f15bb5 100%)',
};

// School Theme
const schoolTheme: Theme = {
  id: 'school',
  name: { he: 'בית ספר', en: 'School' },
  description: { he: 'צבעוני וכיפי לשנת הלימודים', en: 'Colorful and fun for the school year' },
  category: 'school',
  colors: {
    primary: '#e63946',
    secondary: '#2a9d8f',
    accent: '#e9c46a',
    background: '#264653',
    surface: '#2a4a5a',
    text: '#f1faee',
    textMuted: '#a8dadc',
  },
  typography: {
    headingFont: 'Fredoka One',
    bodyFont: 'Nunito',
    headingWeight: 'normal',
    bodyWeight: 'normal',
  },
  backgroundPatterns: [
    '#264653',
    '#2a4a5a',
    'linear-gradient(135deg, #2a9d8f 0%, #e9c46a 100%)',
    'linear-gradient(135deg, #e63946 0%, #f1faee 100%)',
  ],
  layouts: [
    { id: 'sch-1', name: { he: 'תמונת כיתה', en: 'Class Photo' }, photoCount: 1, frames: [{ x: 8, y: 12, width: 84, height: 76, shape: 'rectangle' }] },
    { id: 'sch-2', name: { he: 'חברים', en: 'Friends' }, photoCount: 2, frames: [{ x: 5, y: 10, width: 44, height: 80, shape: 'rectangle' }, { x: 51, y: 10, width: 44, height: 80, shape: 'rectangle' }] },
    { id: 'sch-4', name: { he: 'זיכרונות', en: 'Memories' }, photoCount: 4, frames: [{ x: 5, y: 5, width: 44, height: 44, shape: 'rectangle' }, { x: 51, y: 5, width: 44, height: 44, shape: 'rectangle' }, { x: 5, y: 51, width: 44, height: 44, shape: 'rectangle' }, { x: 51, y: 51, width: 44, height: 44, shape: 'rectangle' }] },
  ],
  previewGradient: 'linear-gradient(135deg, #264653 0%, #2a9d8f 100%)',
};

// Export all themes
export const THEMES: Theme[] = [
  minimalTheme,
  modernTheme,
  weddingTheme,
  babyTheme,
  familyTheme,
  travelTheme,
  celebrationTheme,
  schoolTheme,
];

export const THEME_CATEGORIES = [
  { id: 'all', name: { he: 'הכל', en: 'All' } },
  { id: 'minimal', name: { he: 'מינימלי', en: 'Minimal' } },
  { id: 'modern', name: { he: 'מודרני', en: 'Modern' } },
  { id: 'wedding', name: { he: 'חתונה', en: 'Wedding' } },
  { id: 'baby', name: { he: 'תינוק', en: 'Baby' } },
  { id: 'family', name: { he: 'משפחה', en: 'Family' } },
  { id: 'travel', name: { he: 'טיול', en: 'Travel' } },
  { id: 'celebration', name: { he: 'חגיגה', en: 'Celebration' } },
  { id: 'school', name: { he: 'בית ספר', en: 'School' } },
];

export function getThemeById(id: string): Theme | undefined {
  return THEMES.find(t => t.id === id);
}

export function getThemesByCategory(category: string): Theme[] {
  if (category === 'all') return THEMES;
  return THEMES.filter(t => t.category === category);
}
