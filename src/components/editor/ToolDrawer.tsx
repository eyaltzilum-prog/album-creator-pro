/**
 * Tool Drawer - Expandable panel for tool content
 * Width: ~230px when expanded
 */
import { useRef, useEffect } from 'react';
import { X, Upload, Plus, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { ToolPanel } from './IconRail';

interface ToolDrawerProps {
  panel: ToolPanel | null;
  position: 'left' | 'right';
  photos: string[];
  onUploadPhotos: () => void;
  onAddPhotoToCanvas: (url: string) => void;
  onClose: () => void;
  children?: React.ReactNode;
}

export function ToolDrawer({
  panel,
  position,
  photos,
  onUploadPhotos,
  onAddPhotoToCanvas,
  onClose,
  children
}: ToolDrawerProps) {
  const { language, isRTL } = useLanguage();
  const drawerRef = useRef<HTMLDivElement>(null);

  const getPanelTitle = () => {
    const titles: Record<ToolPanel, {he: string;en: string;}> = {
      photos: { he: 'תמונות', en: 'Photos' },
      layouts: { he: 'פריסות', en: 'Layouts' },
      backgrounds: { he: 'רקעים', en: 'Backgrounds' },
      stickers: { he: 'מדבקות', en: 'Stickers' },
      frames: { he: 'מסגרות', en: 'Frames' },
      masks: { he: 'מסכות', en: 'Masks' },
      text: { he: 'טקסט', en: 'Text' },
      layers: { he: 'שכבות', en: 'Layers' }
    };
    return panel ? titles[panel][language] : '';
  };

  if (!panel) return null;

  const renderPhotosPanel = () =>
  <div data-ev-id="ev_2c09e7d78f" className="flex flex-col h-full">
      {/* Upload button */}
      <button data-ev-id="ev_35add4415e"
    onClick={onUploadPhotos}
    className="mx-3 mb-3 p-3 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:border-primary hover:text-primary transition-colors flex flex-col items-center gap-1">

        <Upload className="w-5 h-5" />
        <span data-ev-id="ev_f5c84cd1b8" className="text-xs">
          {language === 'he' ? 'העלה תמונות' : 'Upload Photos'}
        </span>
      </button>

      {/* Photo grid */}
      <div data-ev-id="ev_9b4b3158a2" className="flex-1 overflow-y-auto px-3">
        {photos.length === 0 ?
      <div data-ev-id="ev_7c5a203d30" className="text-center text-gray-500 text-sm py-8">
            {language === 'he' ? 'אין תמונות עדיין' : 'No photos yet'}
          </div> :

      <div data-ev-id="ev_fbf32d9ee4" className="grid grid-cols-2 gap-2">
            {photos.map((url, index) =>
        <button data-ev-id="ev_09b08f4acb"
        key={index}
        onClick={() => onAddPhotoToCanvas(url)}
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData('text/plain', url);
        }}
        className="aspect-square rounded overflow-hidden hover:ring-2 hover:ring-primary transition-all cursor-grab active:cursor-grabbing">

                <img data-ev-id="ev_f2b905d9ce"
          src={url}
          alt=""
          className="w-full h-full object-cover" />

              </button>
        )}
          </div>
      }
      </div>
    </div>;


  const renderContent = () => {
    switch (panel) {
      case 'photos':
        return renderPhotosPanel();
      default:
        return children ||
        <div data-ev-id="ev_b3754588c9" className="p-4 text-center text-gray-500 text-sm">
            {language === 'he' ? 'תוכן יוצג כאן' : 'Content coming soon'}
          </div>;

    }
  };

  return (
    <AnimatePresence>
      <motion.div data-ev-id="ev_7c5f0f26b2"
      ref={drawerRef}
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 230, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={`bg-gray-800 border-gray-700 flex flex-col overflow-hidden ${
      position === 'left' ? 'border-r' : 'border-l'}`
      }>

        {/* Header */}
        <div data-ev-id="ev_c9e4701b08" className="h-10 px-3 flex items-center justify-between border-b border-gray-700 flex-shrink-0">
          <span data-ev-id="ev_dfc41d93de" className="text-sm font-medium text-white">
            {getPanelTitle()}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white">

            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div data-ev-id="ev_92f68b3be5" className="flex-1 overflow-hidden">
          {renderContent()}
        </div>
      </motion.div>
    </AnimatePresence>);

}