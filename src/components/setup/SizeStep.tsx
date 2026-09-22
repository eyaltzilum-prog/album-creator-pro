/**
 * Size Selection Step
 */

import { Check } from 'lucide-react';
import { motion } from 'framer-motion';
import type { AlbumSetupData } from '@/types/album';
import { ALBUM_SIZES, getAlbumSizeById } from '@/lib/albumSizes';
import type { Language } from '@/lib/i18n';

interface SizeStepProps {
  setupData: AlbumSetupData;
  onUpdate: (updates: Partial<AlbumSetupData>) => void;
  language: Language;
}

export function SizeStep({ setupData, onUpdate, language }: SizeStepProps) {
  const handleSelect = (sizeId: string) => {
    const size = getAlbumSizeById(sizeId);
    onUpdate({ sizeId, size: size || null });
  };

  return (
    <div data-ev-id="ev_2486bb8302" className="flex flex-col gap-6">
      <div data-ev-id="ev_21cd3205c8" className="text-center">
        <h2 data-ev-id="ev_d450b18932" className="text-2xl font-bold text-gray-900 mb-2">
          {language === 'he' ? 'בחר גודל אלבום' : 'Choose Album Size'}
        </h2>
        <p data-ev-id="ev_47f776c2dd" className="text-gray-600">
          {language === 'he' ?
          'בחר את המימדים המתאימים לאלבום שלך' :
          'Select the dimensions that best fit your album'
          }
        </p>
      </div>

      <div data-ev-id="ev_2dcc67bd10" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ALBUM_SIZES.map((size) => {
          const isSelected = setupData.sizeId === size.id;
          const aspectRatio = size.width / size.height;

          return (
            <motion.button data-ev-id="ev_4f47316533"
            key={size.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelect(size.id)}
            className={`relative p-4 rounded-xl border-2 transition-all text-start ${
            isSelected ?
            'border-primary bg-primary/5 shadow-lg' :
            'border-gray-200 hover:border-gray-300 bg-white'}`
            }>

              {/* Popular Badge */}
              {size.popular &&
              <div data-ev-id="ev_88b479114c" className="absolute -top-2 -end-2 px-2 py-0.5 bg-primary text-white text-xs rounded-full">
                  {language === 'he' ? 'פופולרי' : 'Popular'}
                </div>
              }

              {/* Selection Check */}
              {isSelected &&
              <div data-ev-id="ev_1f02efcc24" className="absolute top-3 end-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              }

              {/* Size Preview */}
              <div data-ev-id="ev_ffba29ad62" className="flex items-center justify-center mb-4 h-24">
                <div data-ev-id="ev_85c4dbe4bf"
                className={`border-2 rounded transition-colors ${
                isSelected ? 'border-primary bg-primary/10' : 'border-gray-300 bg-gray-50'}`
                }
                style={{
                  width: aspectRatio > 1 ? '100px' : `${100 * aspectRatio}px`,
                  height: aspectRatio > 1 ? `${100 / aspectRatio}px` : '100px'
                }}>

                  {/* Spread preview line */}
                  <div data-ev-id="ev_76cc8635f6" className="w-full h-full flex">
                    <div data-ev-id="ev_72e01a1a40" className="flex-1 border-e border-dashed border-gray-300" />
                    <div data-ev-id="ev_e63bc3425b" className="flex-1" />
                  </div>
                </div>
              </div>

              {/* Size Info */}
              <div data-ev-id="ev_f799888c0f">
                <h3 data-ev-id="ev_b637957043" className={`font-semibold text-lg ${
                isSelected ? 'text-primary' : 'text-gray-900'}`
                }>
                  {language === 'he' ? size.name.he : size.name.en}
                </h3>
                <p data-ev-id="ev_cfd10a4ce0" className="text-sm text-gray-500 mt-1">
                  {size.widthCm} × {size.heightCm} {language === 'he' ? 'ס"מ' : 'cm'}
                </p>
                <p data-ev-id="ev_ac7cb63b48" className="text-xs text-gray-400 mt-0.5">
                  {language === 'he' ?
                  `פריסה כפולה: ${size.widthCm * 2} × ${size.heightCm} ס"מ` :
                  `Spread: ${size.widthCm * 2} × ${size.heightCm} cm`
                  }
                </p>
              </div>
            </motion.button>);

        })}
      </div>

      {setupData.size &&
      <div data-ev-id="ev_2b18b3821d" className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p data-ev-id="ev_7c5de8693b" className="text-blue-800 text-sm">
            {language === 'he' ?
          `בחרת: ${setupData.size.name.he} - פריסה כפולה ברוחב ${setupData.size.widthCm * 2}×${setupData.size.heightCm} ס"מ` :
          `Selected: ${setupData.size.name.en} - Double spread ${setupData.size.widthCm * 2}×${setupData.size.heightCm} cm`
          }
          </p>
        </div>
      }
    </div>);

}