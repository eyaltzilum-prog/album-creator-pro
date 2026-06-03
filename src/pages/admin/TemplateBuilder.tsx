import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Stage, Layer, Rect, Image as KonvaImage, Text, Transformer, Group, Shape, Line } from 'react-konva';
import {
  ArrowLeft, Save, Eye, Undo, Redo, ZoomIn, ZoomOut, Image, Type, Layers, Plus, Trash2,
  Copy, Square, Circle as CircleIcon, Heart, Star, Lock, Unlock, Frame as FrameIcon, Settings,
  ChevronUp, ChevronDown, FlipHorizontal, FlipVertical, RotateCw, Move, Maximize,
  AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline, Palette as PaletteIcon,
  GripVertical, EyeOff, MoreHorizontal, ChevronLeft, ChevronRight, FileText, Upload,
  Sparkles, Grid3X3, Magnet, Check, X, Search, Filter, Tag, FolderOpen, Download, Loader2,
  PanelLeftClose, PanelLeft, Paintbrush, ImagePlus, BookOpen, Layout, LayoutGrid,
  SplitSquareHorizontal, Square as SquareIcon, TypeIcon, Highlighter, PaintBucket } from
'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type FrameShape = 'rectangle' | 'circle' | 'oval' | 'heart' | 'star' | 'polygon';
type TextAlign = 'left' | 'center' | 'right' | 'justify';
type FontWeight = 'light' | 'normal' | 'bold';
type TemplateMode = 'strict' | 'flexible' | 'free';
type ElementPermission = 'full' | 'move_only' | 'resize_only' | 'move_resize' | 'content_only' | 'locked';
type BackgroundType = 'solid' | 'gradient' | 'image' | 'pattern';
type PageMode = 'single' | 'spread';
type BackgroundFit = 'cover' | 'contain' | 'tile';

interface CustomFont {
  id: string;
  name: string;
  family: string;
  url: string;
  type: 'hebrew' | 'english' | 'decorative';
}

interface ElementPermissions {
  canMove: boolean;
  canResize: boolean;
  canRotate: boolean;
  canDelete: boolean;
  canEditContent: boolean;
  canChangeStyle: boolean;
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

interface BaseElement {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  zIndex: number;
  locked: boolean;
  hidden: boolean;
  permission: ElementPermission;
  groupId: string | null;
}

interface FrameElement extends BaseElement {
  type: 'frame';
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
  placeholderText: string;
  isRequired: boolean;
  aspectLocked: boolean;
}

interface TextElement extends BaseElement {
  type: 'text';
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: FontWeight;
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline';
  textAlign: TextAlign;
  lineHeight: number;
  letterSpacing: number;
  fill: string;
  highlightColor: string | null;
  stroke: TextStroke;
  shadow: TextShadow;
  flipH: boolean;
  flipV: boolean;
  isPlaceholder: boolean;
  placeholderHint: string;
}

interface DecorationElement extends BaseElement {
  type: 'decoration';
  src: string;
  category: string;
  flipH: boolean;
  flipV: boolean;
}

interface BackgroundConfig {
  type: BackgroundType;
  color: string;
  gradientStart: string;
  gradientEnd: string;
  gradientAngle: number;
  imageSrc: string | null;
  imageOpacity: number;
  imageFit: BackgroundFit;
  imageBlur: number;
  patternSrc: string | null;
  patternScale: number;
}

type CanvasElement = FrameElement | TextElement | DecorationElement;

interface TemplatePage {
  id: string;
  name: string;
  pageIndex: number;
  background: BackgroundConfig;
  elements: CanvasElement[];
  isMasterPage: boolean;
}

interface HistoryState {
  pages: TemplatePage[];
  selectedPageIndex: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_BACKGROUND: BackgroundConfig = {
  type: 'solid',
  color: '#ffffff',
  gradientStart: '#ffffff',
  gradientEnd: '#f0f0f0',
  gradientAngle: 180,
  imageSrc: null,
  imageOpacity: 1,
  imageFit: 'cover',
  imageBlur: 0,
  patternSrc: null,
  patternScale: 1
};

const DEFAULT_TEXT_SHADOW: TextShadow = {
  enabled: false, offsetX: 2, offsetY: 2, blur: 4, color: '#000000', opacity: 0.5
};

const DEFAULT_TEXT_STROKE: TextStroke = {
  enabled: false, width: 1, color: '#000000'
};

const PERMISSION_PRESETS: {id: ElementPermission;name: {he: string;en: string;};permissions: ElementPermissions;}[] = [
{ id: 'full', name: { he: ' מלא', en: 'Full Access' }, permissions: { canMove: true, canResize: true, canRotate: true, canDelete: true, canEditContent: true, canChangeStyle: true } },
{ id: 'move_only', name: { he: 'הזזה בלבד', en: 'Move Only' }, permissions: { canMove: true, canResize: false, canRotate: false, canDelete: false, canEditContent: false, canChangeStyle: false } },
{ id: 'resize_only', name: { he: 'שינוי גודל בלבד', en: 'Resize Only' }, permissions: { canMove: false, canResize: true, canRotate: false, canDelete: false, canEditContent: false, canChangeStyle: false } },
{ id: 'move_resize', name: { he: 'הזזה + גודל', en: 'Move & Resize' }, permissions: { canMove: true, canResize: true, canRotate: false, canDelete: false, canEditContent: false, canChangeStyle: false } },
{ id: 'content_only', name: { he: 'תוכן בלבד', en: 'Content Only' }, permissions: { canMove: false, canResize: false, canRotate: false, canDelete: false, canEditContent: true, canChangeStyle: false } },
{ id: 'locked', name: { he: 'נעול', en: 'Locked' }, permissions: { canMove: false, canResize: false, canRotate: false, canDelete: false, canEditContent: false, canChangeStyle: false } }];


const SYSTEM_FONTS = [
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
{ value: 'Dancing Script', label: 'Dancing Script', type: 'decorative' },
{ value: 'Pacifico', label: 'Pacifico', type: 'decorative' }];


const COLOR_PRESETS = [
'#000000', '#ffffff', '#374151', '#6b7280', '#ef4444', '#f97316', '#eab308', '#22c55e',
'#14b8a6', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#0ea5e9', '#84cc16'];


const TEMPLATE_CATEGORIES = [
{ id: 'wedding', name: { he: 'חתונה', en: 'Wedding' } },
{ id: 'baby', name: { he: 'תינוק', en: 'Baby' } },
{ id: 'birthday', name: { he: 'יום הולדת', en: 'Birthday' } },
{ id: 'travel', name: { he: 'טיול', en: 'Travel' } },
{ id: 'family', name: { he: 'משפחה', en: 'Family' } },
{ id: 'school', name: { he: 'בית ספר', en: 'School' } },
{ id: 'general', name: { he: 'כללי', en: 'General' } }];


const SINGLE_PAGE_WIDTH = 800;
const SINGLE_PAGE_HEIGHT = 800;
const SPREAD_PAGE_WIDTH = 1600;
const SPREAD_PAGE_HEIGHT = 800;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const getClipFunc = (shape: FrameShape, width: number, height: number) => {
  return (ctx: any) => {
    switch (shape) {
      case 'circle':{
          const radius = Math.min(width, height) / 2;
          ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
          break;
        }
      case 'oval':
        ctx.ellipse(width / 2, height / 2, width / 2, height / 2, 0, 0, Math.PI * 2);
        break;
      case 'heart':{
          ctx.moveTo(width / 2, height * 0.3);
          ctx.bezierCurveTo(width * 0.1, 0, 0, height * 0.5, width / 2, height);
          ctx.bezierCurveTo(width, height * 0.5, width * 0.9, 0, width / 2, height * 0.3);
          break;
        }
      case 'star':{
          const cx = width / 2,cy = height / 2;
          const outerR = Math.min(width, height) / 2,innerR = outerR * 0.4;
          let rot = Math.PI / 2 * 3;
          ctx.moveTo(cx, cy - outerR);
          for (let i = 0; i < 5; i++) {
            ctx.lineTo(cx + Math.cos(rot) * outerR, cy + Math.sin(rot) * outerR);
            rot += Math.PI / 5;
            ctx.lineTo(cx + Math.cos(rot) * innerR, cy + Math.sin(rot) * innerR);
            rot += Math.PI / 5;
          }
          ctx.closePath();
          break;
        }
      default:
        ctx.rect(0, 0, width, height);
    }
  };
};

const createDefaultPage = (index: number, isMaster: boolean = false): TemplatePage => ({
  id: generateId(),
  name: isMaster ? 'Master Page' : `Page ${index + 1}`,
  pageIndex: index,
  background: { ...DEFAULT_BACKGROUND },
  elements: [],
  isMasterPage: isMaster
});

const createDefaultFrame = (x: number, y: number): FrameElement => ({
  id: generateId(),
  type: 'frame',
  name: 'Photo Frame',
  x, y,
  width: 200,
  height: 200,
  rotation: 0,
  opacity: 1,
  zIndex: 0,
  locked: false,
  hidden: false,
  permission: 'full',
  groupId: null,
  shape: 'rectangle',
  flipH: false,
  flipV: false,
  borderEnabled: false,
  borderWidth: 2,
  borderColor: '#000000',
  borderOpacity: 1,
  borderRadius: 0,
  shadowEnabled: false,
  shadowBlur: 10,
  shadowOffsetX: 5,
  shadowOffsetY: 5,
  shadowColor: '#000000',
  shadowOpacity: 0.3,
  placeholderText: 'Drop photo here',
  isRequired: true,
  aspectLocked: false
});

const createDefaultText = (x: number, y: number): TextElement => ({
  id: generateId(),
  type: 'text',
  name: 'Text',
  x, y,
  width: 200,
  height: 50,
  rotation: 0,
  opacity: 1,
  zIndex: 0,
  locked: false,
  hidden: false,
  permission: 'full',
  groupId: null,
  text: 'Enter text here',
  fontFamily: 'Heebo',
  fontSize: 24,
  fontWeight: 'normal',
  fontStyle: 'normal',
  textDecoration: 'none',
  textAlign: 'center',
  lineHeight: 1.2,
  letterSpacing: 0,
  fill: '#000000',
  highlightColor: null,
  stroke: { ...DEFAULT_TEXT_STROKE },
  shadow: { ...DEFAULT_TEXT_SHADOW },
  flipH: false,
  flipV: false,
  isPlaceholder: true,
  placeholderHint: 'Enter your text'
});

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });
};

// ============================================================================
// LAYER ITEM COMPONENT
// ============================================================================

function LayerItem({ element, isSelected, onSelect, onToggleVisibility, onToggleLock, onUpdateName, onMoveUp, onMoveDown, onDelete, language











}: {element: CanvasElement;isSelected: boolean;onSelect: () => void;onToggleVisibility: () => void;onToggleLock: () => void;onUpdateName: (name: string) => void;onMoveUp: () => void;onMoveDown: () => void;onDelete: () => void;language: 'he' | 'en';}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(element.name);

  const getIcon = () => {
    switch (element.type) {
      case 'frame':return <FrameIcon className="w-4 h-4" />;
      case 'text':return <Type className="w-4 h-4" />;
      case 'decoration':return <Sparkles className="w-4 h-4" />;
    }
  };

  const handleSaveName = () => {
    onUpdateName(editName);
    setIsEditing(false);
  };

  return (
    <div data-ev-id="ev_bde848bd16"
    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
    isSelected ? 'bg-primary/20 border border-primary' : 'bg-gray-800/50 hover:bg-gray-700/50'} ${
    element.hidden ? 'opacity-50' : ''}`}
    onClick={onSelect}>

      <GripVertical className="w-4 h-4 text-gray-500 cursor-grab" />
      <div data-ev-id="ev_1fd0816e3d" className="text-gray-400">{getIcon()}</div>
      {isEditing ?
      <input data-ev-id="ev_1a7a90d981"
      type="text"
      value={editName}
      onChange={(e) => setEditName(e.target.value)}
      onBlur={handleSaveName}
      onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
      className="flex-1 bg-gray-700 text-white text-sm px-2 py-1 rounded"
      autoFocus
      onClick={(e) => e.stopPropagation()} /> :

      <span data-ev-id="ev_c97de128d0"
      className="flex-1 text-sm text-white truncate"
      onDoubleClick={(e) => {e.stopPropagation();setIsEditing(true);}}>

          {element.name}
        </span>
      }
      <div data-ev-id="ev_8f609ac17b" className="flex items-center gap-1">
        <button data-ev-id="ev_082ce41024" onClick={(e) => {e.stopPropagation();onToggleVisibility();}} className={`p-1 rounded hover:bg-gray-600 ${element.hidden ? 'text-gray-500' : 'text-gray-400'}`}>
          {element.hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </button>
        <button data-ev-id="ev_3088c12f71" onClick={(e) => {e.stopPropagation();onToggleLock();}} className={`p-1 rounded hover:bg-gray-600 ${element.locked ? 'text-amber-400' : 'text-gray-400'}`}>
          {element.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
        </button>
        <button data-ev-id="ev_681bc56ad5" onClick={(e) => {e.stopPropagation();onMoveUp();}} className="p-1 rounded hover:bg-gray-600 text-gray-400">
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
        <button data-ev-id="ev_d1f7701899" onClick={(e) => {e.stopPropagation();onMoveDown();}} className="p-1 rounded hover:bg-gray-600 text-gray-400">
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
        <button data-ev-id="ev_1bf64a1ad0" onClick={(e) => {e.stopPropagation();onDelete();}} className="p-1 rounded hover:bg-red-500/30 text-red-400">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>);

}

// ============================================================================
// FRAME ELEMENT COMPONENT
// ============================================================================

function FrameElementRenderer({ element, isSelected, onSelect, onChange, stageScale }: {
  element: FrameElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (attrs: Partial<FrameElement>) => void;
  stageScale: number;
}) {
  const groupRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  useEffect(() => {
    if (isSelected && trRef.current && groupRef.current) {
      trRef.current.nodes([groupRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  if (element.hidden) return null;

  const frameScaleX = element.flipH ? -1 : 1;
  const frameScaleY = element.flipV ? -1 : 1;

  return (
    <>
      <Group
        ref={groupRef}
        x={element.x}
        y={element.y}
        width={element.width}
        height={element.height}
        rotation={element.rotation}
        scaleX={frameScaleX}
        scaleY={frameScaleY}
        offsetX={element.flipH ? element.width : 0}
        offsetY={element.flipV ? element.height : 0}
        opacity={element.opacity}
        draggable={!element.locked}
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(e) => onChange({ x: e.target.x(), y: e.target.y() })}
        onTransformEnd={(e) => {
          const node = groupRef.current;
          const scaleX = Math.abs(node.scaleX());
          const scaleY = Math.abs(node.scaleY());
          node.scaleX(element.flipH ? -1 : 1);
          node.scaleY(element.flipV ? -1 : 1);
          onChange({
            x: node.x(), y: node.y(),
            width: Math.max(50, element.width * scaleX),
            height: element.aspectLocked ? Math.max(50, element.width * scaleX) * (element.height / element.width) : Math.max(50, element.height * scaleY),
            rotation: node.rotation()
          });
        }}
        clipFunc={getClipFunc(element.shape, element.width, element.height)}>

        <Rect width={element.width} height={element.height} fill="#f3f4f6" stroke={isSelected ? '#22c55e' : '#d1d5db'} strokeWidth={isSelected ? 2 : 1} dash={[8, 4]} />
        <Text x={0} y={element.height / 2 - 20} width={element.width} height={40} text="+" fontSize={36} fontFamily="Arial" fill="#9ca3af" align="center" verticalAlign="middle" />
        <Text x={0} y={element.height / 2 + 15} width={element.width} text={element.placeholderText} fontSize={12} fontFamily="Arial" fill="#9ca3af" align="center" />
      </Group>
      {element.locked && <Rect x={element.x} y={element.y} width={element.width} height={element.height} fill="transparent" stroke="#f59e0b" strokeWidth={2} dash={[5, 5]} listening={false} />}
      {isSelected && !element.locked && <Transformer ref={trRef} keepRatio={element.aspectLocked} rotateEnabled={true} boundBoxFunc={(oldBox, newBox) => newBox.width < 50 || newBox.height < 50 ? oldBox : newBox} />}
    </>);

}

// ============================================================================
// TEXT ELEMENT COMPONENT
// ============================================================================

function TextElementRenderer({ element, isSelected, onSelect, onChange, stageScale





}: {element: TextElement;isSelected: boolean;onSelect: () => void;onChange: (attrs: Partial<TextElement>) => void;stageScale: number;}) {
  const textRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  useEffect(() => {
    if (isSelected && trRef.current && textRef.current) {
      trRef.current.nodes([textRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  if (element.hidden) return null;

  const scaleX = element.flipH ? -1 : 1;
  const scaleY = element.flipV ? -1 : 1;

  return (
    <>
      {element.highlightColor &&
      <Rect x={element.x - 4} y={element.y - 2} width={element.width + 8} height={element.height + 4} fill={element.highlightColor} rotation={element.rotation} opacity={element.opacity} cornerRadius={4} listening={false} />
      }
      <Text
        ref={textRef}
        text={element.text}
        x={element.x}
        y={element.y}
        width={element.width}
        fontSize={element.fontSize}
        fontFamily={element.fontFamily}
        fontStyle={`${element.fontWeight === 'bold' ? 'bold' : element.fontWeight === 'light' ? '300' : 'normal'} ${element.fontStyle}`}
        textDecoration={element.textDecoration}
        fill={element.fill}
        align={element.textAlign}
        lineHeight={element.lineHeight}
        letterSpacing={element.letterSpacing}
        rotation={element.rotation}
        scaleX={scaleX}
        scaleY={scaleY}
        offsetX={element.flipH ? element.width : 0}
        offsetY={element.flipV ? element.height : 0}
        opacity={element.opacity}
        draggable={!element.locked}
        onClick={onSelect}
        onTap={onSelect}
        stroke={element.stroke.enabled ? element.stroke.color : undefined}
        strokeWidth={element.stroke.enabled ? element.stroke.width : undefined}
        shadowColor={element.shadow.enabled ? element.shadow.color : undefined}
        shadowBlur={element.shadow.enabled ? element.shadow.blur : undefined}
        shadowOffsetX={element.shadow.enabled ? element.shadow.offsetX : undefined}
        shadowOffsetY={element.shadow.enabled ? element.shadow.offsetY : undefined}
        shadowOpacity={element.shadow.enabled ? element.shadow.opacity : undefined}
        onDragEnd={(e) => onChange({ x: e.target.x(), y: e.target.y() })}
        onTransformEnd={(e) => {
          const node = textRef.current;
          const scaleXAbs = Math.abs(node.scaleX());
          const scaleYAbs = Math.abs(node.scaleY());
          node.scaleX(element.flipH ? -1 : 1);
          node.scaleY(element.flipV ? -1 : 1);
          onChange({ x: node.x(), y: node.y(), width: Math.max(50, element.width * scaleXAbs), fontSize: Math.max(8, element.fontSize * scaleYAbs), rotation: node.rotation() });
        }} />

      {element.locked && <Rect x={element.x} y={element.y} width={element.width} height={element.height} fill="transparent" stroke="#f59e0b" strokeWidth={2} dash={[5, 5]} listening={false} />}
      {isSelected && !element.locked && <Transformer ref={trRef} rotateEnabled={true} enabledAnchors={['middle-left', 'middle-right']} boundBoxFunc={(oldBox, newBox) => newBox.width < 50 ? oldBox : newBox} />}
    </>);

}

// ============================================================================
// MAIN TEMPLATE BUILDER COMPONENT
// ============================================================================

export default function TemplateBuilder() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { templateId } = useParams();
  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);
  const fontInputRef = useRef<HTMLInputElement>(null);

  // Template state
  const [templateName, setTemplateName] = useState('');
  const [templateNameHe, setTemplateNameHe] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionHe, setDescriptionHe] = useState('');
  const [category, setCategory] = useState('general');
  const [tags, setTags] = useState<string[]>([]);
  const [albumSizes, setAlbumSizes] = useState<string[]>(['30x30']);
  const [templateMode, setTemplateMode] = useState<TemplateMode>('flexible');
  const [isMultiPage, setIsMultiPage] = useState(false);

  // Page mode state
  const [pageMode, setPageMode] = useState<PageMode>('single');
  const canvasWidth = pageMode === 'spread' ? SPREAD_PAGE_WIDTH : SINGLE_PAGE_WIDTH;
  const canvasHeight = pageMode === 'spread' ? SPREAD_PAGE_HEIGHT : SINGLE_PAGE_HEIGHT;

  // Custom fonts state
  const [customFonts, setCustomFonts] = useState<CustomFont[]>([]);
  const [loadingFont, setLoadingFont] = useState(false);

  // Background image state
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);

  // Pages state
  const [pages, setPages] = useState<TemplatePage[]>([createDefaultPage(0)]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const currentPage = pages[currentPageIndex];

  // Selection state
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const selectedElement = currentPage?.elements.find((el) => el.id === selectedElementId) || null;

  // UI state
  const [zoom, setZoom] = useState(0.7);
  const [showGrid, setShowGrid] = useState(false);
  const [snappingEnabled, setSnappingEnabled] = useState(true);
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [activeLeftTab, setActiveLeftTab] = useState<'pages' | 'layers' | 'elements' | 'fonts'>('elements');
  const [activeRightTab, setActiveRightTab] = useState<'properties' | 'permissions' | 'background'>('properties');

  // History state
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isSaving, setIsSaving] = useState(false);

  // Modals
  const [showSaveModal, setShowSaveModal] = useState(false);

  const t = (he: string, en: string) => language === 'he' ? he : en;

  // Combined fonts list
  const allFonts = [...SYSTEM_FONTS, ...customFonts.map((f) => ({ value: f.family, label: f.name, type: f.type }))];

  // ============================================================================
  // BACKGROUND IMAGE LOADING
  // ============================================================================

  useEffect(() => {
    if (currentPage?.background.imageSrc && currentPage.background.type === 'image') {
      const img = new window.Image();
      img.src = currentPage.background.imageSrc;
      img.onload = () => setBgImage(img);
    } else {
      setBgImage(null);
    }
  }, [currentPage?.background.imageSrc, currentPage?.background.type]);

  // ============================================================================
  // FONT UPLOAD HANDLER
  // ============================================================================

  const handleFontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoadingFont(true);
    try {
      const base64 = await fileToBase64(file);
      const fontName = file.name.replace(/\.[^/.]+$/, '');
      const fontFamily = `custom-${generateId()}`;

      // Create and load the font
      const fontFace = new FontFace(fontFamily, `url(${base64})`);
      await fontFace.load();
      document.fonts.add(fontFace);

      const newFont: CustomFont = {
        id: generateId(),
        name: fontName,
        family: fontFamily,
        url: base64,
        type: 'decorative'
      };

      setCustomFonts((prev) => [...prev, newFont]);
    } catch (error) {
      console.error('Error loading font:', error);
    } finally {
      setLoadingFont(false);
      if (fontInputRef.current) fontInputRef.current.value = '';
    }
  };

  const deleteCustomFont = (fontId: string) => {
    setCustomFonts((prev) => prev.filter((f) => f.id !== fontId));
  };

  // ============================================================================
  // BACKGROUND IMAGE UPLOAD
  // ============================================================================

  const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await fileToBase64(file);
      updateBackground({ type: 'image', imageSrc: base64 });
    } catch (error) {
      console.error('Error uploading background:', error);
    }
    if (bgInputRef.current) bgInputRef.current.value = '';
  };

  // ============================================================================
  // HISTORY MANAGEMENT
  // ============================================================================

  const saveToHistory = useCallback(() => {
    const newState: HistoryState = { pages: JSON.parse(JSON.stringify(pages)), selectedPageIndex: currentPageIndex };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    if (newHistory.length > 50) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [pages, currentPageIndex, history, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setPages(JSON.parse(JSON.stringify(prevState.pages)));
      setCurrentPageIndex(prevState.selectedPageIndex);
      setHistoryIndex(historyIndex - 1);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setPages(JSON.parse(JSON.stringify(nextState.pages)));
      setCurrentPageIndex(nextState.selectedPageIndex);
      setHistoryIndex(historyIndex + 1);
    }
  }, [history, historyIndex]);

  // ============================================================================
  // ELEMENT OPERATIONS
  // ============================================================================

  const updateElement = useCallback((elementId: string, updates: Partial<CanvasElement>) => {
    setPages((prev) => prev.map((page, idx) => idx === currentPageIndex ? { ...page, elements: page.elements.map((el) => el.id === elementId ? { ...el, ...updates } as CanvasElement : el) } : page));
  }, [currentPageIndex]);

  const addElement = useCallback((type: 'frame' | 'text') => {
    const centerX = canvasWidth / 2 - 100;
    const centerY = canvasHeight / 2 - 100;
    const newElement = type === 'frame' ? createDefaultFrame(centerX, centerY) : createDefaultText(centerX, centerY);
    setPages((prev) => prev.map((page, idx) => idx === currentPageIndex ? { ...page, elements: [...page.elements, newElement] } : page));
    setSelectedElementId(newElement.id);
    saveToHistory();
  }, [currentPageIndex, canvasWidth, canvasHeight, saveToHistory]);

  const deleteElement = useCallback((elementId: string) => {
    setPages((prev) => prev.map((page, idx) => idx === currentPageIndex ? { ...page, elements: page.elements.filter((el) => el.id !== elementId) } : page));
    if (selectedElementId === elementId) setSelectedElementId(null);
    saveToHistory();
  }, [currentPageIndex, selectedElementId, saveToHistory]);

  const duplicateElement = useCallback((elementId: string) => {
    const element = currentPage?.elements.find((el) => el.id === elementId);
    if (!element) return;
    const newElement = { ...JSON.parse(JSON.stringify(element)), id: generateId(), x: element.x + 20, y: element.y + 20, name: `${element.name} (copy)` };
    setPages((prev) => prev.map((page, idx) => idx === currentPageIndex ? { ...page, elements: [...page.elements, newElement] } : page));
    setSelectedElementId(newElement.id);
    saveToHistory();
  }, [currentPage, currentPageIndex, saveToHistory]);

  const moveElementLayer = useCallback((elementId: string, direction: 'up' | 'down') => {
    setPages((prev) => prev.map((page, idx) => {
      if (idx !== currentPageIndex) return page;
      const elements = [...page.elements];
      const index = elements.findIndex((el) => el.id === elementId);
      if (index === -1) return page;
      const newIndex = direction === 'up' ? index + 1 : index - 1;
      if (newIndex < 0 || newIndex >= elements.length) return page;
      [elements[index], elements[newIndex]] = [elements[newIndex], elements[index]];
      return { ...page, elements };
    }));
  }, [currentPageIndex]);

  // ============================================================================
  // PAGE OPERATIONS
  // ============================================================================

  const addPage = useCallback(() => {
    const newPage = createDefaultPage(pages.length);
    setPages((prev) => [...prev, newPage]);
    setCurrentPageIndex(pages.length);
    setSelectedElementId(null);
    saveToHistory();
  }, [pages.length, saveToHistory]);

  const deletePage = useCallback((pageIndex: number) => {
    if (pages.length <= 1) return;
    setPages((prev) => prev.filter((_, idx) => idx !== pageIndex));
    if (currentPageIndex >= pages.length - 1) setCurrentPageIndex(Math.max(0, pages.length - 2));
    setSelectedElementId(null);
    saveToHistory();
  }, [pages.length, currentPageIndex, saveToHistory]);

  const duplicatePage = useCallback((pageIndex: number) => {
    const pageToCopy = pages[pageIndex];
    const newPage: TemplatePage = { ...JSON.parse(JSON.stringify(pageToCopy)), id: generateId(), name: `${pageToCopy.name} (copy)`, pageIndex: pages.length };
    newPage.elements = newPage.elements.map((el: CanvasElement) => ({ ...el, id: generateId() }));
    setPages((prev) => [...prev, newPage]);
    setCurrentPageIndex(pages.length);
    saveToHistory();
  }, [pages, saveToHistory]);

  // ============================================================================
  // BACKGROUND OPERATIONS
  // ============================================================================

  const updateBackground = useCallback((updates: Partial<BackgroundConfig>) => {
    setPages((prev) => prev.map((page, idx) => idx === currentPageIndex ? { ...page, background: { ...page.background, ...updates } } : page));
  }, [currentPageIndex]);

  // ============================================================================
  // SAVE / LOAD
  // ============================================================================

  const saveTemplate = async (publish: boolean = false) => {
    if (!supabase || !user) return;
    setIsSaving(true);
    try {
      const templateData = {
        name: templateName || 'Untitled Template',
        name_he: templateNameHe || templateName || 'תבנית ללא שם',
        description,
        description_he: descriptionHe || description,
        category,
        tags,
        album_sizes: albumSizes,
        template_mode: templateMode,
        is_multi_page: isMultiPage,
        page_count: pages.length,
        pages_data: { pages, customFonts, pageMode },
        is_active: true,
        is_published: publish,
        created_by: user.id
      };
      if (templateId && templateId !== 'new') {
        await supabase.from('admin_templates').update(templateData).eq('id', templateId);
      } else {
        await supabase.from('admin_templates').insert(templateData);
      }
      setShowSaveModal(false);
    } catch (error) {
      console.error('Error saving template:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // ============================================================================
  // KEYBOARD SHORTCUTS
  // ============================================================================

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedElementId) deleteElement(selectedElementId);
      }
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') {e.preventDefault();if (e.shiftKey) redo();else undo();}
        if (e.key === 'y') {e.preventDefault();redo();}
        if (e.key === 'd') {e.preventDefault();if (selectedElementId) duplicateElement(selectedElementId);}
        if (e.key === 's') {e.preventDefault();setShowSaveModal(true);}
      }
      if (e.key === 'Escape') setSelectedElementId(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementId, deleteElement, duplicateElement, undo, redo]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div data-ev-id="ev_0c7e80c39e" className="h-screen flex flex-col bg-gray-950 text-white overflow-hidden" dir={language === 'he' ? 'rtl' : 'ltr'}>
      {/* Hidden file inputs */}
      <input data-ev-id="ev_1c8fa7c046" ref={bgInputRef} type="file" accept="image/*" onChange={handleBackgroundUpload} className="hidden" />
      <input data-ev-id="ev_4dc7abb3c2" ref={fontInputRef} type="file" accept=".ttf,.otf,.woff,.woff2" onChange={handleFontUpload} className="hidden" />

      {/* Top Toolbar */}
      <header data-ev-id="ev_8e8644aa79" className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 flex-shrink-0">
        <div data-ev-id="ev_6de867ebff" className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin')} className="text-gray-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div data-ev-id="ev_950c3bb142" className="h-6 w-px bg-gray-700" />
          <input data-ev-id="ev_4d83113a62"
          type="text"
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          placeholder={t('שם התבנית', 'Template Name')}
          className="bg-transparent text-white text-lg font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 rounded px-2 py-1" />

        </div>

        <div data-ev-id="ev_5da03dd5db" className="flex items-center gap-1">
          {/* Page Mode Toggle */}
          <div data-ev-id="ev_3b26fde755" className="flex items-center bg-gray-800 rounded-lg p-1 mr-2">
            <button data-ev-id="ev_7324f91157"
            onClick={() => setPageMode('single')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${pageMode === 'single' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}>

              <SquareIcon className="w-4 h-4" />
              {t('עמוד בודד', 'Single')}
            </button>
            <button data-ev-id="ev_0408d73988"
            onClick={() => setPageMode('spread')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${pageMode === 'spread' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}>

              <SplitSquareHorizontal className="w-4 h-4" />
              {t('פריסה כפולה', 'Spread')}
            </button>
          </div>

          <div data-ev-id="ev_25f9e9b1a0" className="h-6 w-px bg-gray-700 mx-1" />

          {/* History */}
          <Button variant="ghost" size="sm" onClick={undo} disabled={historyIndex <= 0} className="text-gray-400 hover:text-white disabled:opacity-30">
            <Undo className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={redo} disabled={historyIndex >= history.length - 1} className="text-gray-400 hover:text-white disabled:opacity-30">
            <Redo className="w-4 h-4" />
          </Button>

          <div data-ev-id="ev_f13c9586a7" className="h-6 w-px bg-gray-700 mx-1" />

          {/* Zoom */}
          <Button variant="ghost" size="sm" onClick={() => setZoom((z) => Math.max(0.25, z - 0.1))} className="text-gray-400 hover:text-white">
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span data-ev-id="ev_39b8615968" className="text-sm text-gray-400 w-12 text-center">{Math.round(zoom * 100)}%</span>
          <Button variant="ghost" size="sm" onClick={() => setZoom((z) => Math.min(2, z + 0.1))} className="text-gray-400 hover:text-white">
            <ZoomIn className="w-4 h-4" />
          </Button>

          <div data-ev-id="ev_3cc5019eee" className="h-6 w-px bg-gray-700 mx-1" />

          {/* Grid & Snap */}
          <Button variant={showGrid ? 'secondary' : 'ghost'} size="sm" onClick={() => setShowGrid(!showGrid)} className="text-gray-400 hover:text-white">
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button variant={snappingEnabled ? 'secondary' : 'ghost'} size="sm" onClick={() => setSnappingEnabled(!snappingEnabled)} className="text-gray-400 hover:text-white">
            <Magnet className="w-4 h-4" />
          </Button>

          <div data-ev-id="ev_554579ab3b" className="h-6 w-px bg-gray-700 mx-1" />

          {/* Preview & Save */}
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <Eye className="w-4 h-4" />
          </Button>
          <Button variant="primary" size="sm" onClick={() => setShowSaveModal(true)} className="gap-2">
            <Save className="w-4 h-4" />
            {t('שמור', 'Save')}
          </Button>
        </div>
      </header>

      <div data-ev-id="ev_cb1a65620b" className="flex-1 flex overflow-hidden">
        {/* Left Panel */}
        <AnimatePresence>
          {leftPanelOpen &&
          <motion.aside initial={{ width: 0, opacity: 0 }} animate={{ width: 280, opacity: 1 }} exit={{ width: 0, opacity: 0 }} className="bg-gray-900 border-r border-gray-800 flex flex-col overflow-hidden">
              {/* Tabs */}
              <div data-ev-id="ev_7779a9709f" className="flex border-b border-gray-800">
                {(['elements', 'layers', 'pages', 'fonts'] as const).map((tab) =>
              <button data-ev-id="ev_011dc7fbd5"
              key={tab}
              onClick={() => setActiveLeftTab(tab)}
              className={`flex-1 py-3 text-xs font-medium transition-colors ${activeLeftTab === tab ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-white'}`}>

                    {tab === 'elements' ? t('אלמנטים', 'Elements') : tab === 'layers' ? t('שכבות', 'Layers') : tab === 'pages' ? t('עמודים', 'Pages') : t('גופנים', 'Fonts')}
                  </button>
                )
                }
              </div>

              <div data-ev-id="ev_7e9b040cc8" className="flex-1 overflow-y-auto p-4">
                {/* Elements Tab */}
                {activeLeftTab === 'elements' &&
              <div data-ev-id="ev_75dac3bda1" className="flex flex-col gap-3">
                    <p data-ev-id="ev_52cc4d8c00" className="text-xs text-gray-500 uppercase tracking-wider">{t('הוסף לקנבס', 'Add to Canvas')}</p>
                    <button data-ev-id="ev_06dc6315e9" onClick={() => addElement('frame')} className="flex items-center gap-3 p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-colors text-left">
                      <div data-ev-id="ev_e0c493d22b" className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                        <FrameIcon className="w-5 h-5 text-primary" />
                      </div>
                      <div data-ev-id="ev_204e3ac83b">
                        <p data-ev-id="ev_b1dd092923" className="font-medium">{t('מסגרת תמונה', 'Photo Frame')}</p>
                        <p data-ev-id="ev_24822897dc" className="text-xs text-gray-500">{t('מיכל לתמונה', 'Photo container')}</p>
                      </div>
                    </button>
                    <button data-ev-id="ev_d0878663ab" onClick={() => addElement('text')} className="flex items-center gap-3 p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-colors text-left">
                      <div data-ev-id="ev_d432088cc7" className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <Type className="w-5 h-5 text-blue-400" />
                      </div>
                      <div data-ev-id="ev_e203062761">
                        <p data-ev-id="ev_aa6e04b71f" className="font-medium">{t('טקסט', 'Text')}</p>
                        <p data-ev-id="ev_0ae56e4c1e" className="text-xs text-gray-500">{t('כותרת או פסקה', 'Heading or paragraph')}</p>
                      </div>
                    </button>
                    <div data-ev-id="ev_eedf901949" className="h-px bg-gray-800 my-2" />
                    <p data-ev-id="ev_bc206f4b3b" className="text-xs text-gray-500 uppercase tracking-wider">{t('צורות', 'Shapes')}</p>
                    <div data-ev-id="ev_5c823cef5e" className="grid grid-cols-4 gap-2">
                      {([{ shape: 'rectangle', icon: Square }, { shape: 'circle', icon: CircleIcon }, { shape: 'heart', icon: Heart }, { shape: 'star', icon: Star }] as {shape: FrameShape;icon: any;}[]).map(({ shape, icon: Icon }) =>
                  <button data-ev-id="ev_95c23d62f5"
                  key={shape}
                  onClick={() => {
                    const frame = createDefaultFrame(canvasWidth / 2 - 100, canvasHeight / 2 - 100);
                    frame.shape = shape;
                    setPages((prev) => prev.map((page, idx) => idx === currentPageIndex ? { ...page, elements: [...page.elements, frame] } : page));
                    setSelectedElementId(frame.id);
                    saveToHistory();
                  }}
                  className="aspect-square bg-gray-800/50 hover:bg-gray-700/50 rounded-lg flex items-center justify-center transition-colors">

                          <Icon className="w-6 h-6 text-gray-400" />
                        </button>
                  )}
                    </div>
                  </div>
              }

                {/* Layers Tab */}
                {activeLeftTab === 'layers' &&
              <div data-ev-id="ev_ea7bdf16af" className="flex flex-col gap-2">
                    {currentPage?.elements.length === 0 ?
                <p data-ev-id="ev_94de061a88" className="text-gray-500 text-sm text-center py-8">{t('אין אלמנטים', 'No elements')}</p> :

                [...(currentPage?.elements || [])].reverse().map((element) =>
                <LayerItem
                  key={element.id}
                  element={element}
                  isSelected={selectedElementId === element.id}
                  onSelect={() => setSelectedElementId(element.id)}
                  onToggleVisibility={() => updateElement(element.id, { hidden: !element.hidden })}
                  onToggleLock={() => updateElement(element.id, { locked: !element.locked })}
                  onUpdateName={(name) => updateElement(element.id, { name })}
                  onMoveUp={() => moveElementLayer(element.id, 'up')}
                  onMoveDown={() => moveElementLayer(element.id, 'down')}
                  onDelete={() => deleteElement(element.id)}
                  language={language} />

                )
                }
                  </div>
              }

                {/* Pages Tab */}
                {activeLeftTab === 'pages' &&
              <div data-ev-id="ev_9b63f0edb7" className="flex flex-col gap-3">
                    <Button variant="outline" size="sm" onClick={addPage} className="w-full gap-2">
                      <Plus className="w-4 h-4" />
                      {t('הוסף עמוד', 'Add Page')}
                    </Button>
                    <div data-ev-id="ev_b10fbd9d61" className="flex flex-col gap-2">
                      {pages.map((page, idx) =>
                  <div data-ev-id="ev_ba46cc2363"
                  key={page.id}
                  onClick={() => {setCurrentPageIndex(idx);setSelectedElementId(null);}}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${currentPageIndex === idx ? 'bg-primary/20 border border-primary' : 'bg-gray-800/50 hover:bg-gray-700/50 border border-transparent'}`}>

                          <div data-ev-id="ev_5daa0c8dfe" className="flex items-center justify-between">
                            <div data-ev-id="ev_e1699e331c" className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-gray-400" />
                              <span data-ev-id="ev_4eb58885bb" className="text-sm font-medium">{page.name}</span>
                            </div>
                            <div data-ev-id="ev_6e77ca2c4a" className="flex items-center gap-1">
                              <button data-ev-id="ev_9242485dee" onClick={(e) => {e.stopPropagation();duplicatePage(idx);}} className="p-1 rounded hover:bg-gray-600 text-gray-400">
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              {pages.length > 1 &&
                        <button data-ev-id="ev_c4433e1780" onClick={(e) => {e.stopPropagation();deletePage(idx);}} className="p-1 rounded hover:bg-red-500/30 text-red-400">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                        }
                            </div>
                          </div>
                          <p data-ev-id="ev_8b62fa8d89" className="text-xs text-gray-500 mt-1">{page.elements.length} {t('אלמנטים', 'elements')}</p>
                        </div>
                  )}
                    </div>
                  </div>
              }

                {/* Fonts Tab */}
                {activeLeftTab === 'fonts' &&
              <div data-ev-id="ev_bf49be55b8" className="flex flex-col gap-3">
                    <Button variant="outline" size="sm" onClick={() => fontInputRef.current?.click()} disabled={loadingFont} className="w-full gap-2">
                      {loadingFont ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      {t('העל גופן', 'Upload Font')}
                    </Button>
                    <p data-ev-id="ev_be995030d3" className="text-xs text-gray-500">{t('תומך ב: TTF, OTF, WOFF, WOFF2', 'Supports: TTF, OTF, WOFF, WOFF2')}</p>
                    
                    {customFonts.length > 0 &&
                <>
                        <div data-ev-id="ev_dde3ac8f69" className="h-px bg-gray-800 my-2" />
                        <p data-ev-id="ev_713926b3d1" className="text-xs text-gray-500 uppercase tracking-wider">{t('גופנים מותאמים', 'Custom Fonts')}</p>
                        <div data-ev-id="ev_4197d44588" className="flex flex-col gap-2">
                          {customFonts.map((font) =>
                    <div data-ev-id="ev_ef27a84405" key={font.id} className="flex items-center justify-between p-2 bg-gray-800/50 rounded-lg">
                              <span data-ev-id="ev_7806bd1475" className="text-sm" style={{ fontFamily: font.family }}>{font.name}</span>
                              <button data-ev-id="ev_09f01bc5e2" onClick={() => deleteCustomFont(font.id)} className="p-1 rounded hover:bg-red-500/30 text-red-400">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                    )}
                        </div>
                      </>
                }

                    <div data-ev-id="ev_804bc1207d" className="h-px bg-gray-800 my-2" />
                    <p data-ev-id="ev_3aa975c9a3" className="text-xs text-gray-500 uppercase tracking-wider">{t('גופני מערכת', 'System Fonts')}</p>
                    <div data-ev-id="ev_6926b23015" className="flex flex-col gap-1 max-h-60 overflow-y-auto">
                      {SYSTEM_FONTS.map((font) =>
                  <div data-ev-id="ev_1251415b90" key={font.value} className="text-sm p-2 rounded hover:bg-gray-800/50" style={{ fontFamily: font.value }}>
                          {font.label}
                        </div>
                  )}
                    </div>
                  </div>
              }
              </div>
            </motion.aside>
          }
        </AnimatePresence>

        {/* Toggle Left Panel */}
        <button data-ev-id="ev_4c67953e9b"
        onClick={() => setLeftPanelOpen(!leftPanelOpen)}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gray-800 hover:bg-gray-700 p-1.5 rounded-r-lg transition-colors"
        style={{ left: leftPanelOpen ? 280 : 0 }}>

          {leftPanelOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
        </button>

        {/* Canvas Area */}
        <main data-ev-id="ev_9f541e97b0" ref={containerRef} className="flex-1 overflow-auto bg-gray-950 flex items-center justify-center p-8">
          <div data-ev-id="ev_61c6ef7456" className="relative bg-white shadow-2xl" style={{ width: canvasWidth * zoom, height: canvasHeight * zoom }}>
            <Stage ref={stageRef} width={canvasWidth * zoom} height={canvasHeight * zoom} scaleX={zoom} scaleY={zoom} onClick={(e) => {if (e.target === e.target.getStage()) setSelectedElementId(null);}}>
              <Layer>
                {/* Background */}
                {currentPage?.background.type === 'solid' &&
                <Rect x={0} y={0} width={canvasWidth} height={canvasHeight} fill={currentPage.background.color} />
                }
                {currentPage?.background.type === 'gradient' &&
                <Rect x={0} y={0} width={canvasWidth} height={canvasHeight} fillLinearGradientStartPoint={{ x: 0, y: 0 }} fillLinearGradientEndPoint={{ x: canvasWidth * Math.cos(currentPage.background.gradientAngle * Math.PI / 180), y: canvasHeight * Math.sin(currentPage.background.gradientAngle * Math.PI / 180) }} fillLinearGradientColorStops={[0, currentPage.background.gradientStart, 1, currentPage.background.gradientEnd]} />
                }
                {currentPage?.background.type === 'image' && bgImage &&
                <KonvaImage image={bgImage} x={0} y={0} width={canvasWidth} height={canvasHeight} opacity={currentPage.background.imageOpacity} />
                }

                {/* Spread center line */}
                {pageMode === 'spread' &&
                <>
                    <Line points={[canvasWidth / 2, 0, canvasWidth / 2, canvasHeight]} stroke="#d1d5db" strokeWidth={2} dash={[10, 5]} listening={false} />
                    <Rect x={canvasWidth / 2 - 30} y={10} width={60} height={20} fill="#374151" cornerRadius={4} listening={false} />
                    <Text x={canvasWidth / 2 - 30} y={12} width={60} text={t('קו קיפול', 'Fold')} fontSize={10} fontFamily="Arial" fill="#9ca3af" align="center" listening={false} />
                  </>
                }

                {/* Grid */}
                {showGrid &&
                <>
                    {Array.from({ length: Math.ceil(canvasWidth / 50) + 1 }).map((_, i) =>
                  <Line key={`v-${i}`} points={[i * 50, 0, i * 50, canvasHeight]} stroke="#e5e7eb" strokeWidth={0.5} listening={false} />
                  )}
                    {Array.from({ length: Math.ceil(canvasHeight / 50) + 1 }).map((_, i) =>
                  <Line key={`h-${i}`} points={[0, i * 50, canvasWidth, i * 50]} stroke="#e5e7eb" strokeWidth={0.5} listening={false} />
                  )}
                  </>
                }

                {/* Elements */}
                {currentPage?.elements.sort((a, b) => a.zIndex - b.zIndex).map((element) => {
                  if (element.type === 'frame') {
                    return <FrameElementRenderer key={element.id} element={element} isSelected={selectedElementId === element.id} onSelect={() => setSelectedElementId(element.id)} onChange={(attrs) => updateElement(element.id, attrs)} stageScale={zoom} />;
                  }
                  if (element.type === 'text') {
                    return <TextElementRenderer key={element.id} element={element} isSelected={selectedElementId === element.id} onSelect={() => setSelectedElementId(element.id)} onChange={(attrs) => updateElement(element.id, attrs)} stageScale={zoom} />;
                  }
                  return null;
                })}
              </Layer>
            </Stage>
          </div>
        </main>

        {/* Right Panel */}
        <AnimatePresence>
          {rightPanelOpen &&
          <motion.aside initial={{ width: 0, opacity: 0 }} animate={{ width: 320, opacity: 1 }} exit={{ width: 0, opacity: 0 }} className="bg-gray-900 border-l border-gray-800 flex flex-col overflow-hidden">
              {/* Tabs */}
              <div data-ev-id="ev_1d335801ec" className="flex border-b border-gray-800">
                {(['properties', 'permissions', 'background'] as const).map((tab) =>
              <button data-ev-id="ev_06676c57f6"
              key={tab}
              onClick={() => setActiveRightTab(tab)}
              className={`flex-1 py-3 text-xs font-medium transition-colors ${activeRightTab === tab ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-white'}`}>

                    {tab === 'properties' ? t('מאפיינים', 'Properties') : tab === 'permissions' ? t('הרשאות', 'Permissions') : t('רקע', 'Background')}
                  </button>
              )}
              </div>

              <div data-ev-id="ev_539205a710" className="flex-1 overflow-y-auto p-4">
                {/* Properties Tab */}
                {activeRightTab === 'properties' &&
              <div data-ev-id="ev_1b85de35f4" className="flex flex-col gap-4">
                    {!selectedElement ?
                <p data-ev-id="ev_94cc33c5d1" className="text-gray-500 text-sm text-center py-8">{t('בחר אלמנט', 'Select an element')}</p> :
                selectedElement.type === 'frame' ? (
                /* Frame Properties */
                <>
                        <div data-ev-id="ev_8af5602385">
                          <label data-ev-id="ev_b23216d67c" className="text-xs text-gray-500 uppercase tracking-wider">{t('שם', 'Name')}</label>
                          <Input value={selectedElement.name} onChange={(e) => updateElement(selectedElement.id, { name: e.target.value })} className="mt-1" />
                        </div>
                        <div data-ev-id="ev_e2a0d94e03">
                          <label data-ev-id="ev_1bc02cb0ce" className="text-xs text-gray-500 uppercase tracking-wider">{t('צורה', 'Shape')}</label>
                          <div data-ev-id="ev_1cfef951d2" className="grid grid-cols-4 gap-2 mt-2">
                            {([{ shape: 'rectangle', icon: Square }, { shape: 'circle', icon: CircleIcon }, { shape: 'heart', icon: Heart }, { shape: 'star', icon: Star }] as {shape: FrameShape;icon: any;}[]).map(({ shape, icon: Icon }) =>
                      <button data-ev-id="ev_5e5a3e37c8" key={shape} onClick={() => updateElement(selectedElement.id, { shape })} className={`aspect-square rounded-lg flex items-center justify-center transition-colors ${(selectedElement as FrameElement).shape === shape ? 'bg-primary text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-400'}`}>
                                <Icon className="w-5 h-5" />
                              </button>
                      )}
                          </div>
                        </div>
                        <div data-ev-id="ev_425d2cd335" className="grid grid-cols-2 gap-3">
                          <div data-ev-id="ev_70b793945b"><label data-ev-id="ev_9b784f5fe1" className="text-xs text-gray-500">{t('רוחב', 'Width')}</label><Input type="number" value={Math.round(selectedElement.width)} onChange={(e) => updateElement(selectedElement.id, { width: Number(e.target.value) })} className="mt-1" /></div>
                          <div data-ev-id="ev_10a9d10d48"><label data-ev-id="ev_51296d6a79" className="text-xs text-gray-500">{t('גובה', 'Height')}</label><Input type="number" value={Math.round(selectedElement.height)} onChange={(e) => updateElement(selectedElement.id, { height: Number(e.target.value) })} className="mt-1" /></div>
                        </div>
                        <div data-ev-id="ev_a4a625c5af" className="grid grid-cols-2 gap-3">
                          <div data-ev-id="ev_6eeb5c5061"><label data-ev-id="ev_c8bfe9c9a4" className="text-xs text-gray-500">X</label><Input type="number" value={Math.round(selectedElement.x)} onChange={(e) => updateElement(selectedElement.id, { x: Number(e.target.value) })} className="mt-1" /></div>
                          <div data-ev-id="ev_926b9adc37"><label data-ev-id="ev_6afb10f9d1" className="text-xs text-gray-500">Y</label><Input type="number" value={Math.round(selectedElement.y)} onChange={(e) => updateElement(selectedElement.id, { y: Number(e.target.value) })} className="mt-1" /></div>
                        </div>
                        <div data-ev-id="ev_867fcc087c"><label data-ev-id="ev_b6e6f5a76d" className="text-xs text-gray-500">{t('סיבוב', 'Rotation')}</label><Input type="number" value={Math.round(selectedElement.rotation)} onChange={(e) => updateElement(selectedElement.id, { rotation: Number(e.target.value) })} className="mt-1" /></div>
                        <div data-ev-id="ev_7235df1765"><label data-ev-id="ev_3b6fc4ea5b" className="text-xs text-gray-500">{t('שקיפות', 'Opacity')}</label><input data-ev-id="ev_a56a1d3e2f" type="range" min="0" max="1" step="0.1" value={selectedElement.opacity} onChange={(e) => updateElement(selectedElement.id, { opacity: Number(e.target.value) })} className="w-full mt-2" /></div>
                        <div data-ev-id="ev_348f0f23a9" className="flex items-center gap-2">
                          <button data-ev-id="ev_5797aad300" onClick={() => updateElement(selectedElement.id, { flipH: !(selectedElement as FrameElement).flipH })} className={`flex-1 p-2 rounded-lg flex items-center justify-center gap-2 transition-colors ${(selectedElement as FrameElement).flipH ? 'bg-primary text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-400'}`}>
                            <FlipHorizontal className="w-4 h-4" />
                          </button>
                          <button data-ev-id="ev_680bbcd18a" onClick={() => updateElement(selectedElement.id, { flipV: !(selectedElement as FrameElement).flipV })} className={`flex-1 p-2 rounded-lg flex items-center justify-center gap-2 transition-colors ${(selectedElement as FrameElement).flipV ? 'bg-primary text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-400'}`}>
                            <FlipVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </>) :
                selectedElement.type === 'text' ? (
                /* Text Properties */
                <>
                        <div data-ev-id="ev_31c20665db">
                          <label data-ev-id="ev_12c4b289e8" className="text-xs text-gray-500 uppercase tracking-wider">{t('טקסט', 'Text')}</label>
                          <textarea data-ev-id="ev_f673d4c895" value={(selectedElement as TextElement).text} onChange={(e) => updateElement(selectedElement.id, { text: e.target.value })} className="w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg p-2 text-white resize-none" rows={3} />
                        </div>
                        <div data-ev-id="ev_48da477470">
                          <label data-ev-id="ev_00aa30cd33" className="text-xs text-gray-500 uppercase tracking-wider">{t('גופן', 'Font')}</label>
                          <select data-ev-id="ev_83ba1f6770" value={(selectedElement as TextElement).fontFamily} onChange={(e) => updateElement(selectedElement.id, { fontFamily: e.target.value })} className="w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg p-2 text-white">
                            <optgroup data-ev-id="ev_794c6c30c8" label={t('גופנים מותאמים', 'Custom Fonts')}>
                              {customFonts.map((font) => <option data-ev-id="ev_d74f69297b" key={font.id} value={font.family} style={{ fontFamily: font.family }}>{font.name}</option>)}
                            </optgroup>
                            <optgroup data-ev-id="ev_572cffc505" label={t('עברית', 'Hebrew')}>
                              {SYSTEM_FONTS.filter((f) => f.type === 'hebrew').map((font) => <option data-ev-id="ev_fdc7fe1218" key={font.value} value={font.value} style={{ fontFamily: font.value }}>{font.label}</option>)}
                            </optgroup>
                            <optgroup data-ev-id="ev_11c7346edb" label={t('אנגלית', 'English')}>
                              {SYSTEM_FONTS.filter((f) => f.type === 'english').map((font) => <option data-ev-id="ev_bd3453167b" key={font.value} value={font.value} style={{ fontFamily: font.value }}>{font.label}</option>)}
                            </optgroup>
                            <optgroup data-ev-id="ev_c9c0aa8bfd" label={t('דקורטיבי', 'Decorative')}>
                              {SYSTEM_FONTS.filter((f) => f.type === 'decorative').map((font) => <option data-ev-id="ev_dcc8155af0" key={font.value} value={font.value} style={{ fontFamily: font.value }}>{font.label}</option>)}
                            </optgroup>
                          </select>
                        </div>
                        <div data-ev-id="ev_d8ab0bd02c" className="grid grid-cols-2 gap-3">
                          <div data-ev-id="ev_b0e3bc74b2"><label data-ev-id="ev_a148c74d95" className="text-xs text-gray-500">{t('גודל', 'Size')}</label><Input type="number" value={(selectedElement as TextElement).fontSize} onChange={(e) => updateElement(selectedElement.id, { fontSize: Number(e.target.value) })} className="mt-1" min={8} max={200} /></div>
                          <div data-ev-id="ev_35f037ffd0"><label data-ev-id="ev_be589fcb9e" className="text-xs text-gray-500">{t('צבע', 'Color')}</label><input data-ev-id="ev_50cbd2125e" type="color" value={(selectedElement as TextElement).fill} onChange={(e) => updateElement(selectedElement.id, { fill: e.target.value })} className="w-full h-10 mt-1 rounded cursor-pointer" /></div>
                        </div>
                        <div data-ev-id="ev_96ac526a84">
                          <label data-ev-id="ev_3e502ea8d7" className="text-xs text-gray-500 uppercase tracking-wider">{t('סגנון', 'Style')}</label>
                          <div data-ev-id="ev_61f3bd70ea" className="flex gap-2 mt-2">
                            <button data-ev-id="ev_400f80687a" onClick={() => updateElement(selectedElement.id, { fontWeight: (selectedElement as TextElement).fontWeight === 'bold' ? 'normal' : 'bold' })} className={`flex-1 p-2 rounded-lg flex items-center justify-center gap-2 transition-colors ${(selectedElement as TextElement).fontWeight === 'bold' ? 'bg-primary text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-400'}`}>
                              <Bold className="w-4 h-4" />
                            </button>
                            <button data-ev-id="ev_04f92e5ed9" onClick={() => updateElement(selectedElement.id, { fontStyle: (selectedElement as TextElement).fontStyle === 'italic' ? 'normal' : 'italic' })} className={`flex-1 p-2 rounded-lg flex items-center justify-center gap-2 transition-colors ${(selectedElement as TextElement).fontStyle === 'italic' ? 'bg-primary text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-400'}`}>
                              <Italic className="w-4 h-4" />
                            </button>
                            <button data-ev-id="ev_5fd8799aeb" onClick={() => updateElement(selectedElement.id, { textDecoration: (selectedElement as TextElement).textDecoration === 'underline' ? 'none' : 'underline' })} className={`flex-1 p-2 rounded-lg flex items-center justify-center gap-2 transition-colors ${(selectedElement as TextElement).textDecoration === 'underline' ? 'bg-primary text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-400'}`}>
                              <Underline className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div data-ev-id="ev_75318d02aa">
                          <label data-ev-id="ev_1eba1f99b6" className="text-xs text-gray-500 uppercase tracking-wider">{t('יישור', 'Alignment')}</label>
                          <div data-ev-id="ev_eb890ae68a" className="flex gap-2 mt-2">
                            {([{ align: 'left', icon: AlignLeft }, { align: 'center', icon: AlignCenter }, { align: 'right', icon: AlignRight }] as {align: TextAlign;icon: any;}[]).map(({ align, icon: Icon }) =>
                      <button data-ev-id="ev_7d7043ae97" key={align} onClick={() => updateElement(selectedElement.id, { textAlign: align })} className={`flex-1 p-2 rounded-lg flex items-center justify-center ${(selectedElement as TextElement).textAlign === align ? 'bg-primary text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-400'}`}>
                                <Icon className="w-4 h-4" />
                              </button>
                      )}
                          </div>
                        </div>

                        {/* Line Height */}
                        <div data-ev-id="ev_ba1accc2db">
                          <div data-ev-id="ev_9255025fad" className="flex items-center justify-between">
                            <label data-ev-id="ev_b1bd324168" className="text-xs text-gray-500">{t('גובה שורה', 'Line Height')}</label>
                            <span data-ev-id="ev_d733d33039" className="text-xs text-gray-400">{(selectedElement as TextElement).lineHeight.toFixed(1)}</span>
                          </div>
                          <input data-ev-id="ev_5355a39404" type="range" min="0.8" max="3" step="0.1" value={(selectedElement as TextElement).lineHeight} onChange={(e) => updateElement(selectedElement.id, { lineHeight: parseFloat(e.target.value) })} className="w-full mt-2" />
                        </div>

                        {/* Letter Spacing */}
                        <div data-ev-id="ev_0a02694769">
                          <div data-ev-id="ev_51e62859d7" className="flex items-center justify-between">
                            <label data-ev-id="ev_8e735fb517" className="text-xs text-gray-500">{t('מרווח אותיות', 'Letter Spacing')}</label>
                            <span data-ev-id="ev_8ed1629f5b" className="text-xs text-gray-400">{(selectedElement as TextElement).letterSpacing}px</span>
                          </div>
                          <input data-ev-id="ev_14b056eb87" type="range" min="-10" max="20" value={(selectedElement as TextElement).letterSpacing} onChange={(e) => updateElement(selectedElement.id, { letterSpacing: parseInt(e.target.value) })} className="w-full mt-2" />
                        </div>

                        <div data-ev-id="ev_7ec282d3d1" className="h-px bg-gray-800" />

                        {/* Highlight */}
                        <div data-ev-id="ev_c7dac5c644">
                          <div data-ev-id="ev_c842287313" className="flex items-center justify-between">
                            <label data-ev-id="ev_11a284191a" className="text-xs text-gray-500 uppercase tracking-wider">{t('הדגשה', 'Highlight')}</label>
                            <button data-ev-id="ev_183a45ca51" onClick={() => updateElement(selectedElement.id, { highlightColor: (selectedElement as TextElement).highlightColor ? null : '#ffff00' })} className={`w-9 h-5 rounded-full flex items-center px-1 ${(selectedElement as TextElement).highlightColor ? 'bg-primary justify-end' : 'bg-gray-600 justify-start'}`}>
                              <div data-ev-id="ev_3abafe4396" className="w-3 h-3 bg-white rounded-full shadow-sm pointer-events-none" />
                            </button>
                          </div>
                          {(selectedElement as TextElement).highlightColor &&
                    <input data-ev-id="ev_7d35bac96d" type="color" value={(selectedElement as TextElement).highlightColor || '#ffff00'} onChange={(e) => updateElement(selectedElement.id, { highlightColor: e.target.value })} className="w-full h-8 mt-2 rounded cursor-pointer" />
                    }
                        </div>

                        {/* Stroke */}
                        <div data-ev-id="ev_a7ed44a43a">
                          <div data-ev-id="ev_a1a57f90f0" className="flex items-center justify-between">
                            <label data-ev-id="ev_512c212b8b" className="text-xs text-gray-500 uppercase tracking-wider">{t('קו מתאר', 'Stroke')}</label>
                            <button data-ev-id="ev_ea75a0685a" onClick={() => updateElement(selectedElement.id, { stroke: { ...(selectedElement as TextElement).stroke, enabled: !(selectedElement as TextElement).stroke.enabled } })} className={`w-9 h-5 rounded-full flex items-center px-1 ${(selectedElement as TextElement).stroke.enabled ? 'bg-primary justify-end' : 'bg-gray-600 justify-start'}`}>
                              <div data-ev-id="ev_5f2a9025e2" className="w-3 h-3 bg-white rounded-full shadow-sm pointer-events-none" />
                            </button>
                          </div>
                          {(selectedElement as TextElement).stroke.enabled &&
                    <div data-ev-id="ev_4a69d776b5" className="flex flex-col gap-2 mt-2">
                              <div data-ev-id="ev_58f0e8d5d6" className="flex items-center gap-2">
                                <span data-ev-id="ev_1e5b07cd47" className="text-[10px] text-gray-500 w-10">{t('עובי', 'Width')}</span>
                                <input data-ev-id="ev_9cbc2fa53c" type="range" min="1" max="10" value={(selectedElement as TextElement).stroke.width} onChange={(e) => updateElement(selectedElement.id, { stroke: { ...(selectedElement as TextElement).stroke, width: parseInt(e.target.value) } })} className="flex-1 h-1" />
                                <span data-ev-id="ev_dc36715593" className="text-[10px] text-gray-400 w-6">{(selectedElement as TextElement).stroke.width}</span>
                              </div>
                              <div data-ev-id="ev_040c96c373" className="flex items-center gap-2">
                                <span data-ev-id="ev_73e8a77462" className="text-[10px] text-gray-500 w-10">{t('צבע', 'Color')}</span>
                                <input data-ev-id="ev_1ba3f6bb02" type="color" value={(selectedElement as TextElement).stroke.color} onChange={(e) => updateElement(selectedElement.id, { stroke: { ...(selectedElement as TextElement).stroke, color: e.target.value } })} className="w-8 h-6 rounded" />
                              </div>
                            </div>
                    }
                        </div>

                        {/* Shadow */}
                        <div data-ev-id="ev_98ab047077">
                          <div data-ev-id="ev_6cafee2187" className="flex items-center justify-between">
                            <label data-ev-id="ev_4cca5fc09e" className="text-xs text-gray-500 uppercase tracking-wider">{t('צל', 'Shadow')}</label>
                            <button data-ev-id="ev_d87969bec5" onClick={() => updateElement(selectedElement.id, { shadow: { ...(selectedElement as TextElement).shadow, enabled: !(selectedElement as TextElement).shadow.enabled } })} className={`w-9 h-5 rounded-full flex items-center px-1 ${(selectedElement as TextElement).shadow.enabled ? 'bg-primary justify-end' : 'bg-gray-600 justify-start'}`}>
                              <div data-ev-id="ev_2ff12bc8bd" className="w-3 h-3 bg-white rounded-full shadow-sm pointer-events-none" />
                            </button>
                          </div>
                          {(selectedElement as TextElement).shadow.enabled &&
                    <div data-ev-id="ev_e55d89cba2" className="flex flex-col gap-2 mt-2">
                              <div data-ev-id="ev_26e13c2de4" className="flex items-center gap-2">
                                <span data-ev-id="ev_29b4f961af" className="text-[10px] text-gray-500 w-10">X</span>
                                <input data-ev-id="ev_2ab9ed8abb" type="range" min="-20" max="20" value={(selectedElement as TextElement).shadow.offsetX} onChange={(e) => updateElement(selectedElement.id, { shadow: { ...(selectedElement as TextElement).shadow, offsetX: parseInt(e.target.value) } })} className="flex-1 h-1" />
                                <span data-ev-id="ev_944114eaad" className="text-[10px] text-gray-400 w-6">{(selectedElement as TextElement).shadow.offsetX}</span>
                              </div>
                              <div data-ev-id="ev_7f8bed47b4" className="flex items-center gap-2">
                                <span data-ev-id="ev_5d1f23b90f" className="text-[10px] text-gray-500 w-10">Y</span>
                                <input data-ev-id="ev_d56892942f" type="range" min="-20" max="20" value={(selectedElement as TextElement).shadow.offsetY} onChange={(e) => updateElement(selectedElement.id, { shadow: { ...(selectedElement as TextElement).shadow, offsetY: parseInt(e.target.value) } })} className="flex-1 h-1" />
                                <span data-ev-id="ev_07ae26aae8" className="text-[10px] text-gray-400 w-6">{(selectedElement as TextElement).shadow.offsetY}</span>
                              </div>
                              <div data-ev-id="ev_f290ac4d14" className="flex items-center gap-2">
                                <span data-ev-id="ev_876a8776c5" className="text-[10px] text-gray-500 w-10">{t('טשטוש', 'Blur')}</span>
                                <input data-ev-id="ev_a2736a7077" type="range" min="0" max="30" value={(selectedElement as TextElement).shadow.blur} onChange={(e) => updateElement(selectedElement.id, { shadow: { ...(selectedElement as TextElement).shadow, blur: parseInt(e.target.value) } })} className="flex-1 h-1" />
                                <span data-ev-id="ev_197bf2e7b2" className="text-[10px] text-gray-400 w-6">{(selectedElement as TextElement).shadow.blur}</span>
                              </div>
                              <div data-ev-id="ev_c0e62ba742" className="flex items-center gap-2">
                                <span data-ev-id="ev_6da5248812" className="text-[10px] text-gray-500 w-10">{t('צבע', 'Color')}</span>
                                <input data-ev-id="ev_b0b8645a37" type="color" value={(selectedElement as TextElement).shadow.color} onChange={(e) => updateElement(selectedElement.id, { shadow: { ...(selectedElement as TextElement).shadow, color: e.target.value } })} className="w-8 h-6 rounded" />
                              </div>
                            </div>
                    }
                        </div>

                        <div data-ev-id="ev_5cbc279b1d" className="h-px bg-gray-800" />

                        {/* Flip */}
                        <div data-ev-id="ev_e68ee60509" className="flex items-center gap-2">
                          <button data-ev-id="ev_99b10a9b62" onClick={() => updateElement(selectedElement.id, { flipH: !(selectedElement as TextElement).flipH })} className={`flex-1 p-2 rounded-lg flex items-center justify-center gap-2 transition-colors ${(selectedElement as TextElement).flipH ? 'bg-primary text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-400'}`}>
                            <FlipHorizontal className="w-4 h-4" />
                          </button>
                          <button data-ev-id="ev_e3dd4aa339" onClick={() => updateElement(selectedElement.id, { flipV: !(selectedElement as TextElement).flipV })} className={`flex-1 p-2 rounded-lg flex items-center justify-center gap-2 transition-colors ${(selectedElement as TextElement).flipV ? 'bg-primary text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-400'}`}>
                            <FlipVertical className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Opacity */}
                        <div data-ev-id="ev_fdd0c467cc">
                          <label data-ev-id="ev_e93a0289ae" className="text-xs text-gray-500">{t('שקיפות', 'Opacity')}</label>
                          <input data-ev-id="ev_dcd1bcd79f" type="range" min="0" max="1" step="0.1" value={selectedElement.opacity} onChange={(e) => updateElement(selectedElement.id, { opacity: Number(e.target.value) })} className="w-full mt-2" />
                        </div>
                      </>) :
                null}
                  </div>
              }

                {/* Permissions Tab */}
                {activeRightTab === 'permissions' &&
              <div data-ev-id="ev_eb6b916080" className="flex flex-col gap-4">
                    {!selectedElement ?
                <p data-ev-id="ev_6e67679054" className="text-gray-500 text-sm text-center py-8">{t('בחר אלמנט', 'Select an element')}</p> :

                <>
                        <p data-ev-id="ev_32a2a9beb0" className="text-xs text-gray-500">{t('קבע מה הלקוח יכול לעשות עם אלמנט זה', 'Define what the client can do with this element')}</p>
                        <div data-ev-id="ev_a5bedb49a7" className="flex flex-col gap-2">
                          {PERMISSION_PRESETS.map((preset) =>
                    <button data-ev-id="ev_50e9860792" key={preset.id} onClick={() => updateElement(selectedElement.id, { permission: preset.id })} className={`p-3 rounded-lg text-left transition-colors ${selectedElement.permission === preset.id ? 'bg-primary/20 border border-primary' : 'bg-gray-800/50 hover:bg-gray-700/50 border border-transparent'}`}>
                              <div data-ev-id="ev_bf63f375e0" className="flex items-center justify-between">
                                <span data-ev-id="ev_697edd44ee" className="font-medium">{preset.name[language]}</span>
                                {selectedElement.permission === preset.id && <Check className="w-4 h-4 text-primary" />}
                              </div>
                              <div data-ev-id="ev_4c6d903427" className="flex flex-wrap gap-1 mt-2">
                                {preset.permissions.canMove && <span data-ev-id="ev_2143e3a597" className="text-xs bg-gray-700 px-2 py-0.5 rounded">{t('הזזה', 'Move')}</span>}
                                {preset.permissions.canResize && <span data-ev-id="ev_d4909b89a5" className="text-xs bg-gray-700 px-2 py-0.5 rounded">{t('גודל', 'Resize')}</span>}
                                {preset.permissions.canRotate && <span data-ev-id="ev_573386b976" className="text-xs bg-gray-700 px-2 py-0.5 rounded">{t('סיבוב', 'Rotate')}</span>}
                                {preset.permissions.canEditContent && <span data-ev-id="ev_8825287baa" className="text-xs bg-gray-700 px-2 py-0.5 rounded">{t('תוכן', 'Content')}</span>}
                                {preset.permissions.canChangeStyle && <span data-ev-id="ev_cbb6d89857" className="text-xs bg-gray-700 px-2 py-0.5 rounded">{t('עיצוב', 'Style')}</span>}
                                {preset.permissions.canDelete && <span data-ev-id="ev_1b1432c1ad" className="text-xs bg-gray-700 px-2 py-0.5 rounded">{t('מחיקה', 'Delete')}</span>}
                              </div>
                            </button>
                    )}
                        </div>
                      </>
                }
                  </div>
              }

                {/* Background Tab */}
                {activeRightTab === 'background' &&
              <div data-ev-id="ev_458c256444" className="flex flex-col gap-4">
                    <div data-ev-id="ev_920258f998">
                      <label data-ev-id="ev_06c26f4031" className="text-xs text-gray-500 uppercase tracking-wider">{t('סוג רקע', 'Background Type')}</label>
                      <div data-ev-id="ev_a3e74caba5" className="grid grid-cols-3 gap-2 mt-2">
                        {([{ type: 'solid', label: t('צבע', 'Solid') }, { type: 'gradient', label: t('גרדיאנט', 'Gradient') }, { type: 'image', label: t('תמונה', 'Image') }] as {type: BackgroundType;label: string;}[]).map(({ type, label }) =>
                    <button data-ev-id="ev_8f6abaf0c9" key={type} onClick={() => updateBackground({ type })} className={`p-2 rounded-lg text-sm transition-colors ${currentPage?.background.type === type ? 'bg-primary text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-400'}`}>
                            {label}
                          </button>
                    )}
                      </div>
                    </div>

                    {currentPage?.background.type === 'solid' &&
                <div data-ev-id="ev_6ee341add1">
                        <label data-ev-id="ev_7b36548504" className="text-xs text-gray-500 uppercase tracking-wider">{t('צבע', 'Color')}</label>
                        <div data-ev-id="ev_865dc2c4d2" className="grid grid-cols-8 gap-1 mt-2">
                          {COLOR_PRESETS.map((color) =>
                    <button data-ev-id="ev_f0ef774eee" key={color} onClick={() => updateBackground({ color })} className={`aspect-square rounded-md border-2 transition-all ${currentPage?.background.color === color ? 'border-primary scale-110' : 'border-transparent hover:scale-105'}`} style={{ backgroundColor: color }} />
                    )}
                        </div>
                        <input data-ev-id="ev_3d70f6738e" type="color" value={currentPage?.background.color} onChange={(e) => updateBackground({ color: e.target.value })} className="w-full h-10 mt-3 rounded cursor-pointer" />
                      </div>
                }

                    {currentPage?.background.type === 'gradient' &&
                <>
                        <div data-ev-id="ev_662e4c0d3f" className="flex gap-3">
                          <div data-ev-id="ev_196872192a" className="flex-1">
                            <label data-ev-id="ev_7bedbd7099" className="text-xs text-gray-500">{t('시작', 'Start')}</label>
                            <input data-ev-id="ev_025eefbea0" type="color" value={currentPage?.background.gradientStart} onChange={(e) => updateBackground({ gradientStart: e.target.value })} className="w-full h-10 mt-1 rounded cursor-pointer" />
                          </div>
                          <div data-ev-id="ev_9d96a1a6eb" className="flex-1">
                            <label data-ev-id="ev_740160ff5e" className="text-xs text-gray-500">{t('종료', 'End')}</label>
                            <input data-ev-id="ev_d9f128459c" type="color" value={currentPage?.background.gradientEnd} onChange={(e) => updateBackground({ gradientEnd: e.target.value })} className="w-full h-10 mt-1 rounded cursor-pointer" />
                          </div>
                        </div>
                        <div data-ev-id="ev_d8a89a6cfe">
                          <div data-ev-id="ev_c3ab8151c9" className="flex items-center justify-between">
                            <label data-ev-id="ev_8d397d2dc8" className="text-xs text-gray-500">{t('각도', 'Angle')}</label>
                            <span data-ev-id="ev_2e94f1e894" className="text-xs text-gray-400">{currentPage?.background.gradientAngle}°</span>
                          </div>
                          <input data-ev-id="ev_4c24f3202c" type="range" min="0" max="360" value={currentPage?.background.gradientAngle} onChange={(e) => updateBackground({ gradientAngle: Number(e.target.value) })} className="w-full mt-2" />
                        </div>
                      </>
                }

                    {currentPage?.background.type === 'image' &&
                <>
                        <Button variant="outline" size="sm" onClick={() => bgInputRef.current?.click()} className="w-full gap-2">
                          <Upload className="w-4 h-4" />
                          {currentPage?.background.imageSrc ? t('이미지 변경', 'Change Image') : t('이미지 업로드', 'Upload Image')}
                        </Button>
                        {currentPage?.background.imageSrc &&
                  <>
                            <div data-ev-id="ev_d08840cdfd" className="relative aspect-video rounded-lg overflow-hidden bg-gray-800">
                              <img data-ev-id="ev_1b7aa48566" src={currentPage.background.imageSrc} alt="Background" className="w-full h-full object-cover" />
                              <button data-ev-id="ev_31ba4a6e00" onClick={() => updateBackground({ imageSrc: null, type: 'solid' })} className="absolute top-2 right-2 p-1.5 bg-red-500 rounded-full text-white hover:bg-red-600">
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                            <div data-ev-id="ev_17e3b386de">
                              <div data-ev-id="ev_e3488877ed" className="flex items-center justify-between">
                                <label data-ev-id="ev_9f1b27e715" className="text-xs text-gray-500">{t('불투명도', 'Opacity')}</label>
                                <span data-ev-id="ev_48ad01d251" className="text-xs text-gray-400">{Math.round(currentPage.background.imageOpacity * 100)}%</span>
                              </div>
                              <input data-ev-id="ev_6129fc7eef" type="range" min="0" max="1" step="0.1" value={currentPage.background.imageOpacity} onChange={(e) => updateBackground({ imageOpacity: Number(e.target.value) })} className="w-full mt-2" />
                            </div>
                            <div data-ev-id="ev_d8a89a6cfe">
                              <div data-ev-id="ev_c3ab8151c9" className="flex items-center justify-between">
                                <label data-ev-id="ev_8d397d2dc8" className="text-xs text-gray-500">{t('ぼかし', 'Blur')}</label>
                                <span data-ev-id="ev_2e94f1e894" className="text-xs text-gray-400">{currentPage.background.imageBlur}px</span>
                              </div>
                              <input data-ev-id="ev_4c24f3202c" type="range" min="0" max="20" value={currentPage.background.imageBlur} onChange={(e) => updateBackground({ imageBlur: Number(e.target.value) })} className="w-full mt-2" />
                            </div>
                          </>
                  }
                      </>
                }
                  </div>
              }
              </div>
            </motion.aside>
          }
        </AnimatePresence>
      </div>

      {/* Save Modal */}
      {showSaveModal &&
      <Modal isOpen={showSaveModal} onClose={() => setShowSaveModal(false)} title={t('저장 템플릿', 'Save Template')}>
          <div data-ev-id="ev_76bd346230" className="flex flex-col gap-4 p-4">
            <div data-ev-id="ev_1419ef4c95">
              <label data-ev-id="ev_028ce41d39" className="text-sm font-medium">{t('이름 (영어)', 'Name (English)')}</label>
              <Input value={templateName} onChange={(e) => setTemplateName(e.target.value)} className="mt-1" />
            </div>
            <div data-ev-id="ev_c6a471ec11">
              <label data-ev-id="ev_2075bd5d4d" className="text-sm font-medium">{t('이름 (עברית)', 'Name (Hebrew)')}</label>
              <Input value={templateNameHe} onChange={(e) => setTemplateNameHe(e.target.value)} className="mt-1" dir="rtl" />
            </div>
            <div data-ev-id="ev_a81d35ae91">
              <label data-ev-id="ev_6cf02db506" className="text-sm font-medium">{t('범주', 'Category')}</label>
              <select data-ev-id="ev_efa45a3fa9" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg p-2 text-white">
                {TEMPLATE_CATEGORIES.map((cat) => <option data-ev-id="ev_252a5cce59" key={cat.id} value={cat.id}>{cat.name[language]}</option>)}
              </select>
            </div>
            <div data-ev-id="ev_64e6bc478d">
              <label data-ev-id="ev_5f34726712" className="text-sm font-medium">{t('템플릿 모드', 'Template Mode')}</label>
              <select data-ev-id="ev_65439b9ac0" value={templateMode} onChange={(e) => setTemplateMode(e.target.value as TemplateMode)} className="w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg p-2 text-white">
                <option data-ev-id="ev_eb29edcb74" value="strict">{t('엄격 - 고객이 변경할 수 없음', 'Strict - Client cannot change')}</option>
                <option data-ev-id="ev_eeee1f622d" value="flexible">{t('유연 - 고객이 한계 내에서 변경 가능', 'Flexible - Client can modify within limits')}</option>
                <option data-ev-id="ev_f20cf78467" value="free">{t('무료 - 고객이 모든 작업 가능', 'Free - Client can do anything')}</option>
              </select>
            </div>
            <div data-ev-id="ev_f4069c202f" className="flex gap-3 mt-4">
              <Button variant="outline" onClick={() => setShowSaveModal(false)} className="flex-1">{t('취소', 'Cancel')}</Button>
              <Button variant="secondary" onClick={() => saveTemplate(false)} disabled={isSaving} className="flex-1">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : t('임시저장', 'Save Draft')}
              </Button>
              <Button variant="primary" onClick={() => saveTemplate(true)} disabled={isSaving} className="flex-1">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : t('발행', 'Publish')}
              </Button>
            </div>
          </div>
        </Modal>
      }
    </div>);

}