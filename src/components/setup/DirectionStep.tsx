/**
 * Reading Direction Selection Step
 */

import { ArrowLeft, ArrowRight, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import type { AlbumSetupData, ReadingDirection } from '@/types/album';
import type { Language } from '@/lib/i18n';

interface DirectionStepProps {
  setupData: AlbumSetupData;
  onUpdate: (updates: Partial<AlbumSetupData>) => void;
  language: Language;
}

export function DirectionStep({ setupData, onUpdate, language }: DirectionStepProps) {
  const handleSelect = (direction: ReadingDirection) => {
    onUpdate({ direction });
  };

  return (
    <div data-ev-id="ev_74ed33cd64" className="flex flex-col gap-8">
      <div data-ev-id="ev_59a140bd55" className="text-center">
        <h2 data-ev-id="ev_695530da48" className="text-2xl font-bold text-gray-900 mb-2">
          {language === 'he' ? 'כיוון קריאה' : 'Reading Direction'}
        </h2>
        <p data-ev-id="ev_1c2eb8980c" className="text-gray-600">
          {language === 'he' ?
          'בחר את כיוון פתיחת האלבום וסדר העמודים' :
          'Choose how your album opens and the page order'
          }
        </p>
      </div>

      <div data-ev-id="ev_06f25a81f8" className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {/* RTL Option */}
        <motion.button data-ev-id="ev_86885bc546"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => handleSelect('rtl')}
        className={`relative p-6 rounded-2xl border-2 transition-all text-center ${
        setupData.direction === 'rtl' ?
        'border-primary bg-primary/5 shadow-xl' :
        'border-gray-200 hover:border-gray-300 bg-white'}`
        }>

          {/* Selection indicator */}
          {setupData.direction === 'rtl' &&
          <div data-ev-id="ev_493e307c0d" className="absolute top-4 end-4 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
              <div data-ev-id="ev_ad85f2da78" className="w-2 h-2 bg-white rounded-full" />
            </div>
          }

          {/* Visual Preview */}
          <div data-ev-id="ev_4ddbf0e882" className="flex justify-center mb-6">
            <div data-ev-id="ev_96e812aed0" className="relative">
              {/* Book representation */}
              <div data-ev-id="ev_b8c77c0f7a" className="flex">
                <div data-ev-id="ev_a0a0646fca" className={`w-20 h-28 rounded-s-lg border-2 flex items-center justify-center ${
                setupData.direction === 'rtl' ? 'border-primary bg-primary/10' : 'border-gray-300 bg-gray-50'}`
                }>
                  <span data-ev-id="ev_cd6b038ecc" className="text-2xl font-bold text-gray-400">2</span>
                </div>
                <div data-ev-id="ev_8481d027f6" className={`w-20 h-28 rounded-e-lg border-2 border-s-0 flex items-center justify-center ${
                setupData.direction === 'rtl' ? 'border-primary bg-primary/10' : 'border-gray-300 bg-gray-50'}`
                }>
                  <span data-ev-id="ev_0f9b5742b4" className="text-2xl font-bold text-gray-400">1</span>
                </div>
              </div>
              
              {/* Arrow */}
              <div data-ev-id="ev_726d3c493d" className="absolute -bottom-4 left-1/2 -translate-x-1/2">
                <ArrowLeft className={`w-8 h-8 ${
                setupData.direction === 'rtl' ? 'text-primary' : 'text-gray-400'}`
                } />
              </div>
            </div>
          </div>

          <h3 data-ev-id="ev_1b1b5d3788" className={`font-bold text-xl mb-2 ${
          setupData.direction === 'rtl' ? 'text-primary' : 'text-gray-900'}`
          }>
            {language === 'he' ? 'מימין לשמאל' : 'Right to Left'}
          </h3>
          
          <p data-ev-id="ev_794dd1d4b0" className="text-sm text-gray-600 mb-3">
            {language === 'he' ?
            'כמו ספרים בעברית' :
            'Like Hebrew/Arabic books'
            }
          </p>

          <div data-ev-id="ev_a80c12cd62" className="text-xs text-gray-500 bg-gray-100 rounded-lg px-3 py-2">
            {language === 'he' ?
            'כריכה קדמית מימין, כריכה אחורית שמאל' :
            'Front cover on right, back cover on left'
            }
          </div>
        </motion.button>

        {/* LTR Option */}
        <motion.button data-ev-id="ev_7d91c0b6a1"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => handleSelect('ltr')}
        className={`relative p-6 rounded-2xl border-2 transition-all text-center ${
        setupData.direction === 'ltr' ?
        'border-primary bg-primary/5 shadow-xl' :
        'border-gray-200 hover:border-gray-300 bg-white'}`
        }>

          {/* Selection indicator */}
          {setupData.direction === 'ltr' &&
          <div data-ev-id="ev_870bff0fab" className="absolute top-4 end-4 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
              <div data-ev-id="ev_00f77cd7f8" className="w-2 h-2 bg-white rounded-full" />
            </div>
          }

          {/* Visual Preview */}
          <div data-ev-id="ev_44d8c79c88" className="flex justify-center mb-6">
            <div data-ev-id="ev_3444a6821f" className="relative">
              {/* Book representation */}
              <div data-ev-id="ev_6bfeec4c36" className="flex">
                <div data-ev-id="ev_2102d58c95" className={`w-20 h-28 rounded-s-lg border-2 flex items-center justify-center ${
                setupData.direction === 'ltr' ? 'border-primary bg-primary/10' : 'border-gray-300 bg-gray-50'}`
                }>
                  <span data-ev-id="ev_8aac55e4d0" className="text-2xl font-bold text-gray-400">1</span>
                </div>
                <div data-ev-id="ev_064e29dfb6" className={`w-20 h-28 rounded-e-lg border-2 border-s-0 flex items-center justify-center ${
                setupData.direction === 'ltr' ? 'border-primary bg-primary/10' : 'border-gray-300 bg-gray-50'}`
                }>
                  <span data-ev-id="ev_6daf5cf549" className="text-2xl font-bold text-gray-400">2</span>
                </div>
              </div>
              
              {/* Arrow */}
              <div data-ev-id="ev_5cbf35d617" className="absolute -bottom-4 left-1/2 -translate-x-1/2">
                <ArrowRight className={`w-8 h-8 ${
                setupData.direction === 'ltr' ? 'text-primary' : 'text-gray-400'}`
                } />
              </div>
            </div>
          </div>

          <h3 data-ev-id="ev_64560ad096" className={`font-bold text-xl mb-2 ${
          setupData.direction === 'ltr' ? 'text-primary' : 'text-gray-900'}`
          }>
            {language === 'he' ? 'משמאל לימין' : 'Left to Right'}
          </h3>
          
          <p data-ev-id="ev_a4a294f5c0" className="text-sm text-gray-600 mb-3">
            {language === 'he' ?
            'כמו ספרים באנגלית' :
            'Like English books'
            }
          </p>

          <div data-ev-id="ev_0c6d47ace6" className="text-xs text-gray-500 bg-gray-100 rounded-lg px-3 py-2">
            {language === 'he' ?
            'כריכה קדמית שמאל, כריכה אחורית ימין' :
            'Front cover on left, back cover on right'
            }
          </div>
        </motion.button>
      </div>

      {/* Info Box */}
      <div data-ev-id="ev_b1f4a71553" className="max-w-2xl mx-auto bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div data-ev-id="ev_c085ced595" className="flex items-start gap-3">
          <BookOpen className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div data-ev-id="ev_3a9048ae4b" className="text-sm text-blue-800">
            <p data-ev-id="ev_a352c11a45" className="font-medium mb-1">
              {language === 'he' ? 'טיפ - התאמה לשפה:' : 'Tip - Match your language:'}
            </p>
            <p data-ev-id="ev_4b1bbbc2be">
              {language === 'he' ?
              'אם האלבום מכיל טקסט בעברית, בחר בכיוון מימין לשמאל. לאלבומים עם טקסט באנגלית או אלבומי תמונות בלבד, בחר משמאל לימין.' :
              'For albums with Hebrew/Arabic text, choose Right to Left. For English text or photo-only albums, Left to Right is common.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>);

}