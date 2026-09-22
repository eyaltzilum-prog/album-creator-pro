/**
 * Icon Rail - Compact vertical toolbar for tool selection
 * Width: 48-64px as per design spec
 */
import React from 'react';
import {
  Image,
  LayoutGrid,
  Paintbrush,
  Smile,
  Square,
  Layers,
  Type,
  Shapes } from
'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export type ToolPanel = 'photos' | 'layouts' | 'backgrounds' | 'stickers' | 'frames' | 'masks' | 'text' | 'layers';

interface IconRailProps {
  activePanel: ToolPanel | null;
  onPanelChange: (panel: ToolPanel | null) => void;
  position: 'left' | 'right';
}

const TOOLS: {id: ToolPanel;icon: React.ComponentType<{className?: string}>;labelKey: string;}[] = [
{ id: 'photos', icon: Image, labelKey: 'photos' },
{ id: 'layouts', icon: LayoutGrid, labelKey: 'layouts' },
{ id: 'backgrounds', icon: Paintbrush, labelKey: 'backgrounds' },
{ id: 'stickers', icon: Smile, labelKey: 'stickers' },
{ id: 'frames', icon: Square, labelKey: 'frames' },
{ id: 'masks', icon: Shapes, labelKey: 'masks' },
{ id: 'text', icon: Type, labelKey: 'text' },
{ id: 'layers', icon: Layers, labelKey: 'layers' }];


export function IconRail({ activePanel, onPanelChange, position }: IconRailProps) {
  const { language, isRTL } = useLanguage();

  const getLabel = (key: string) => {
    const labels: Record<string, {he: string;en: string;}> = {
      photos: { he: 'תמונות', en: 'Photos' },
      layouts: { he: 'פריסות', en: 'Layouts' },
      backgrounds: { he: 'רקעים', en: 'Backgrounds' },
      stickers: { he: 'מדבקות', en: 'Stickers' },
      frames: { he: 'מסגרות', en: 'Frames' },
      masks: { he: 'מסכות', en: 'Masks' },
      text: { he: 'טקסט', en: 'Text' },
      layers: { he: 'שכבות', en: 'Layers' }
    };
    return labels[key]?.[language] || key;
  };

  return (
    <div data-ev-id="ev_2937d31c59"
    className={`w-14 bg-gray-800 border-gray-700 flex flex-col py-2 ${
    position === 'left' ? 'border-r' : 'border-l'}`
    }>

      {TOOLS.map((tool) => {
        const Icon = tool.icon;
        const isActive = activePanel === tool.id;

        return (
          <button data-ev-id="ev_1390a51127"
          key={tool.id}
          onClick={() => onPanelChange(isActive ? null : tool.id)}
          className={`w-full py-3 flex flex-col items-center gap-1 transition-colors ${
          isActive ?
          'bg-primary/20 text-primary border-l-2 border-primary' :
          'text-gray-400 hover:text-white hover:bg-gray-700/50'}`
          }
          title={getLabel(tool.labelKey)}>

            <Icon className="w-5 h-5" />
            <span data-ev-id="ev_e5a7ef6937" className="text-[9px] leading-tight">{getLabel(tool.labelKey)}</span>
          </button>);

      })}
    </div>);

}