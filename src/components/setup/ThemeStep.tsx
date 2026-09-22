/**
 * Theme Selection Step
 */

import { useState } from 'react';
import { Check, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import type { AlbumSetupData } from '@/types/album';
import { THEMES, THEME_CATEGORIES, getThemeById } from '@/lib/themes';
import type { Language } from '@/lib/i18n';

interface ThemeStepProps {
  setupData: AlbumSetupData;
  onUpdate: (updates: Partial<AlbumSetupData>) => void;
  language: Language;
}

export function ThemeStep({ setupData, onUpdate, language }: ThemeStepProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const handleSelect = (themeId: string) => {
    const theme = getThemeById(themeId);
    onUpdate({ themeId, theme: theme || null });
  };

  const filteredThemes = selectedCategory === 'all' ?
  THEMES :
  THEMES.filter((t) => t.category === selectedCategory);

  return (
    <div data-ev-id="ev_37974fe3b3" className="flex flex-col gap-6">
      <div data-ev-id="ev_012d7db1de" className="text-center">
        <h2 data-ev-id="ev_ed6f54d3a4" className="text-2xl font-bold text-gray-900 mb-2">
          {language === 'he' ? 'בחר ערכת נושא' : 'Choose a Theme'}
        </h2>
        <p data-ev-id="ev_faf647101e" className="text-gray-600">
          {language === 'he' ?
          'הערכה קובעת את הצבעים, הגופנים והפריסות של האלבום' :
          'The theme sets the colors, fonts, and layouts for your album'
          }
        </p>
      </div>

      {/* Category Filter */}
      <div data-ev-id="ev_fff0307c4d" className="flex flex-wrap justify-center gap-2">
        {THEME_CATEGORIES.map((cat) =>
        <button data-ev-id="ev_bb762f8061"
        key={cat.id}
        onClick={() => setSelectedCategory(cat.id)}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
        selectedCategory === cat.id ?
        'bg-primary text-white shadow-md' :
        'bg-white border border-gray-200 text-gray-600 hover:border-primary/50'}`
        }>

            {language === 'he' ? cat.name.he : cat.name.en}
          </button>
        )}
      </div>

      {/* Theme Grid */}
      <div data-ev-id="ev_5baa018421" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredThemes.map((theme) => {
          const isSelected = setupData.themeId === theme.id;

          return (
            <motion.button data-ev-id="ev_a6ef26bae2"
            key={theme.id}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelect(theme.id)}
            className={`relative rounded-xl overflow-hidden border-2 transition-all ${
            isSelected ?
            'border-primary shadow-xl ring-2 ring-primary/30' :
            'border-gray-200 hover:border-gray-300'}`
            }>

              {/* Theme Preview */}
              <div data-ev-id="ev_0673aa2a6b"
              className="aspect-[4/3] p-4 flex flex-col justify-end"
              style={{ background: theme.previewGradient }}>

                {/* Mini album preview */}
                <div data-ev-id="ev_9369f8bc77" className="flex gap-1 justify-center mb-2">
                  <div data-ev-id="ev_6bbfdd5016"
                  className="w-8 h-10 rounded-sm shadow-md"
                  style={{ backgroundColor: theme.colors.surface }} />

                  <div data-ev-id="ev_9a4a5bf890"
                  className="w-8 h-10 rounded-sm shadow-md"
                  style={{ backgroundColor: theme.colors.surface }} />

                </div>
              </div>

              {/* Theme Info */}
              <div data-ev-id="ev_b897eb25a1" className="p-3 bg-white">
                <h3 data-ev-id="ev_bb1b530c16" className={`font-semibold text-sm ${
                isSelected ? 'text-primary' : 'text-gray-900'}`
                }>
                  {language === 'he' ? theme.name.he : theme.name.en}
                </h3>
                <p data-ev-id="ev_27e0aab284" className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                  {language === 'he' ? theme.description.he : theme.description.en}
                </p>
                
                {/* Color dots */}
                <div data-ev-id="ev_458ff35b5c" className="flex gap-1 mt-2">
                  <div data-ev-id="ev_261321ae90" className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.colors.primary }} />
                  <div data-ev-id="ev_93bacaaa39" className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.colors.secondary }} />
                  <div data-ev-id="ev_7decb8926e" className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.colors.accent }} />
                  <div data-ev-id="ev_226b40d21a" className="w-3 h-3 rounded-full border" style={{ backgroundColor: theme.colors.background }} />
                </div>
              </div>

              {/* Selection indicator */}
              {isSelected &&
              <div data-ev-id="ev_3c4352f735" className="absolute top-2 end-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-lg">
                  <Check className="w-4 h-4 text-white" />
                </div>
              }
            </motion.button>);

        })}
      </div>

      {/* Selected Theme Info */}
      {setupData.theme &&
      <div data-ev-id="ev_a2c9734d27" className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-4 flex items-center gap-4">
          <div data-ev-id="ev_4973ef8d7d"
        className="w-16 h-12 rounded-lg shadow-md flex-shrink-0"
        style={{ background: setupData.theme.previewGradient }} />

          <div data-ev-id="ev_096b906b8a" className="flex-1">
            <div data-ev-id="ev_97d4736d5e" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span data-ev-id="ev_1d9cbdc0ff" className="font-semibold text-gray-900">
                {language === 'he' ? 'נבחר:' : 'Selected:'} {language === 'he' ? setupData.theme.name.he : setupData.theme.name.en}
              </span>
            </div>
            <p data-ev-id="ev_1e7e052fea" className="text-sm text-gray-600 mt-1">
              {language === 'he' ? setupData.theme.description.he : setupData.theme.description.en}
            </p>
          </div>
        </div>
      }
    </div>);

}