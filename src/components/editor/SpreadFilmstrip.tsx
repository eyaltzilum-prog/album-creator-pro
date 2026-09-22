/**
 * Spread Filmstrip - Bottom navigation showing spread thumbnails
 * Height: 88-108px, collapsible
 */
import { useState, useRef, useEffect } from 'react';
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  ZoomIn,
  ZoomOut,
  Maximize } from
'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/Button';
import type { ReadingDirection } from '@/types/album';

interface Spread {
  id: string;
  spread_index: number;
  spread_type: 'cover' | 'interior';
  canvas_data: {
    objects: unknown[];
    background: string;
  };
}

interface SpreadFilmstripProps {
  spreads: Spread[];
  currentSpreadIndex: number;
  direction: ReadingDirection;
  zoom: number;
  minZoom?: number;
  maxZoom?: number;
  canAddPages: boolean;
  canRemovePages: boolean;
  isCollapsed: boolean;
  onSelectSpread: (index: number) => void;
  onAddSpread: () => void;
  onRemoveSpread: (index: number) => void;
  onZoomChange: (zoom: number) => void;
  onFitToScreen: () => void;
  onToggleCollapse: () => void;
}

export function SpreadFilmstrip({
  spreads,
  currentSpreadIndex,
  direction,
  zoom,
  minZoom = 0.25,
  maxZoom = 2,
  canAddPages,
  canRemovePages,
  isCollapsed,
  onSelectSpread,
  onAddSpread,
  onRemoveSpread,
  onZoomChange,
  onFitToScreen,
  onToggleCollapse
}: SpreadFilmstripProps) {
  const { language, isRTL } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to current spread when it changes
  useEffect(() => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      const items = container.querySelectorAll('[data-spread-item]');
      const currentItem = items[currentSpreadIndex] as HTMLElement;
      if (currentItem) {
        currentItem.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [currentSpreadIndex]);

  // Order spreads based on reading direction
  const orderedSpreads = direction === 'rtl' ? [...spreads].reverse() : spreads;

  const getSpreadLabel = (spread: Spread, index: number) => {
    if (spread.spread_type === 'cover') {
      return language === 'he' ? 'כריכה' : 'Cover';
    }
    // Calculate page numbers based on direction
    const spreadNum = spread.spread_index;
    if (direction === 'rtl') {
      const leftPage = spreadNum * 2;
      const rightPage = spreadNum * 2 - 1;
      return `${rightPage}-${leftPage}`;
    } else {
      const leftPage = (spreadNum - 1) * 2 + 1;
      const rightPage = spreadNum * 2;
      return `${leftPage}-${rightPage}`;
    }
  };

  const handlePrevSpread = () => {
    if (currentSpreadIndex > 0) {
      onSelectSpread(currentSpreadIndex - 1);
    }
  };

  const handleNextSpread = () => {
    if (currentSpreadIndex < spreads.length - 1) {
      onSelectSpread(currentSpreadIndex + 1);
    }
  };

  if (isCollapsed) {
    return (
      <div data-ev-id="ev_32f3e2ff45"
      className="h-10 bg-gray-800 border-t border-gray-700 px-4 flex items-center justify-between"
      dir={isRTL ? 'rtl' : 'ltr'}>

        <div data-ev-id="ev_011d5cff89" className="flex items-center gap-2">
          {/* Zoom controls */}
          <div data-ev-id="ev_0fc75c6fde" className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onZoomChange(Math.max(minZoom, zoom - 0.1))}
              className="p-1 text-gray-400 hover:text-white">

              <ZoomOut className="w-4 h-4" />
            </Button>
            <span data-ev-id="ev_6f8d49bf23" className="text-xs text-gray-400 w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onZoomChange(Math.min(maxZoom, zoom + 0.1))}
              className="p-1 text-gray-400 hover:text-white">

              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onFitToScreen}
              className="p-1 text-gray-400 hover:text-white"
              title={language === 'he' ? 'התאם למסך' : 'Fit to Screen'}>

              <Maximize className="w-4 h-4" />
            </Button>
          </div>
          
          <div data-ev-id="ev_5b0805c187" className="w-px h-5 bg-gray-700" />
          
          {/* Navigation */}
          <div data-ev-id="ev_60b5358d62" className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={direction === 'rtl' ? handleNextSpread : handlePrevSpread}
              disabled={currentSpreadIndex === 0}
              className="p-1 text-gray-400 hover:text-white disabled:opacity-30">

              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span data-ev-id="ev_c6ee383fd1" className="text-xs text-gray-300 min-w-[60px] text-center">
              {currentSpreadIndex + 1} / {spreads.length}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={direction === 'rtl' ? handlePrevSpread : handleNextSpread}
              disabled={currentSpreadIndex === spreads.length - 1}
              className="p-1 text-gray-400 hover:text-white disabled:opacity-30">

              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="p-1 text-gray-400 hover:text-white">

          <ChevronUp className="w-4 h-4" />
        </Button>
      </div>);

  }

  return (
    <div data-ev-id="ev_f0d7954f1d"
    className="h-24 bg-gray-800 border-t border-gray-700 flex flex-col"
    dir={isRTL ? 'rtl' : 'ltr'}>

      {/* Top row - Zoom & collapse */}
      <div data-ev-id="ev_c8658c0401" className="h-8 px-3 flex items-center justify-between border-b border-gray-700/50">
        <div data-ev-id="ev_39e6087f3b" className="flex items-center gap-2">
          {/* Zoom controls */}
          <div data-ev-id="ev_9c853e7670" className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onZoomChange(Math.max(minZoom, zoom - 0.1))}
              className="p-1 text-gray-400 hover:text-white">

              <ZoomOut className="w-3 h-3" />
            </Button>
            <span data-ev-id="ev_317104b652" className="text-xs text-gray-400 w-10 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onZoomChange(Math.min(maxZoom, zoom + 0.1))}
              className="p-1 text-gray-400 hover:text-white">

              <ZoomIn className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onFitToScreen}
              className="p-1 text-gray-400 hover:text-white ml-1"
              title={language === 'he' ? 'התאם למסך' : 'Fit to Screen'}>

              <Maximize className="w-3 h-3" />
            </Button>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="p-1 text-gray-400 hover:text-white">

          <ChevronDown className="w-4 h-4" />
        </Button>
      </div>

      {/* Spreads row */}
      <div data-ev-id="ev_243f4018df" className="flex-1 flex items-center px-2 gap-2 overflow-hidden">
        {/* Previous button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={direction === 'rtl' ? handleNextSpread : handlePrevSpread}
          disabled={currentSpreadIndex === 0}
          className="p-1 text-gray-400 hover:text-white disabled:opacity-30 flex-shrink-0">

          <ChevronLeft className="w-4 h-4" />
        </Button>

        {/* Spread thumbnails */}
        <div data-ev-id="ev_27484a5f49"
        ref={scrollRef}
        className="flex-1 flex items-center gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent py-1">

          {orderedSpreads.map((spread, displayIndex) => {
            const actualIndex = direction === 'rtl' ? spreads.length - 1 - displayIndex : displayIndex;
            const isActive = actualIndex === currentSpreadIndex;
            const isCover = spread.spread_type === 'cover';

            return (
              <button data-ev-id="ev_8da99ddec3"
              key={spread.id}
              data-spread-item
              onClick={() => onSelectSpread(actualIndex)}
              className={`relative flex-shrink-0 rounded transition-all ${
              isActive ?
              'ring-2 ring-primary scale-105' :
              'hover:ring-1 hover:ring-gray-500'}`
              }>

                {/* Spread preview - two pages side by side */}
                <div data-ev-id="ev_2e44516e5e" className="flex shadow-md rounded overflow-hidden">
                  <div data-ev-id="ev_4fcf4cc559"
                  className={`w-8 h-12 ${isCover ? 'w-16' : ''}`}
                  style={{ backgroundColor: spread.canvas_data?.background || '#ffffff' }}>

                    {/* Mini preview of objects could go here */}
                  </div>
                  {!isCover &&
                  <>
                      <div data-ev-id="ev_f88880a29a" className="w-px bg-gray-300" />
                      <div data-ev-id="ev_bb36c1c78c"
                    className="w-8 h-12"
                    style={{ backgroundColor: spread.canvas_data?.background || '#ffffff' }} />

                    </>
                  }
                </div>
                {/* Label */}
                <div data-ev-id="ev_22b5d49217" className="absolute -bottom-0.5 left-0 right-0 text-center">
                  <span data-ev-id="ev_259c86ac48" className={`text-[9px] px-1 rounded ${
                  isActive ? 'bg-primary text-white' : 'bg-gray-700 text-gray-300'}`
                  }>
                    {getSpreadLabel(spread, actualIndex)}
                  </span>
                </div>
              </button>);

          })}

          {/* Add spread button */}
          {canAddPages &&
          <button data-ev-id="ev_38556ca106"
          onClick={onAddSpread}
          className="w-10 h-12 flex-shrink-0 border-2 border-dashed border-gray-600 rounded flex items-center justify-center text-gray-500 hover:border-primary hover:text-primary transition-colors"
          title={language === 'he' ? 'הוסף פריסה' : 'Add Spread'}>

              <Plus className="w-4 h-4" />
            </button>
          }
        </div>

        {/* Next button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={direction === 'rtl' ? handlePrevSpread : handleNextSpread}
          disabled={currentSpreadIndex === spreads.length - 1}
          className="p-1 text-gray-400 hover:text-white disabled:opacity-30 flex-shrink-0">

          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>);

}