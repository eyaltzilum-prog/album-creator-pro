/**
 * Page Count Selection Step
 */

import { Minus, Plus, BookOpen, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import type { AlbumSetupData } from '@/types/album';
import { VALID_PAGE_COUNTS, MIN_PAGES, MAX_PAGES, getSpreadCount } from '@/lib/albumSizes';
import type { Language } from '@/lib/i18n';
import { Button } from '@/components/ui/Button';

interface PagesStepProps {
  setupData: AlbumSetupData;
  onUpdate: (updates: Partial<AlbumSetupData>) => void;
  language: Language;
}

export function PagesStep({ setupData, onUpdate, language }: PagesStepProps) {
  const handlePageChange = (count: number) => {
    // Ensure even number and within bounds
    const validCount = Math.max(MIN_PAGES, Math.min(MAX_PAGES, Math.round(count / 2) * 2));
    onUpdate({ pageCount: validCount });
  };

  const spreadCount = getSpreadCount(setupData.pageCount);
  const interiorSpreads = spreadCount - 1; // Subtract cover spread

  return (
    <div data-ev-id="ev_70599fcc06" className="flex flex-col gap-8">
      <div data-ev-id="ev_b97a2ae4ed" className="text-center">
        <h2 data-ev-id="ev_53b3fba4f6" className="text-2xl font-bold text-gray-900 mb-2">
          {language === 'he' ? 'מספר עמודים' : 'Number of Pages'}
        </h2>
        <p data-ev-id="ev_e2aa15dd1f" className="text-gray-600">
          {language === 'he' ?
          'בחר כמה עמודים פנימיים יהיו באלבום (ללא הכריכות)' :
          'Choose how many interior pages your album will have (excluding covers)'
          }
        </p>
      </div>

      {/* Quick Select Buttons */}
      <div data-ev-id="ev_685fa5ccdb" className="flex flex-wrap justify-center gap-3">
        {VALID_PAGE_COUNTS.map(({ value, label }) =>
        <motion.button data-ev-id="ev_f98f49121a"
        key={value}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => handlePageChange(value)}
        className={`px-6 py-3 rounded-xl font-medium transition-all ${
        setupData.pageCount === value ?
        'bg-primary text-white shadow-lg' :
        'bg-white border-2 border-gray-200 text-gray-700 hover:border-primary/50'}`
        }>

            {language === 'he' ? label.he : label.en}
          </motion.button>
        )}
      </div>

      {/* Custom Page Count */}
      <div data-ev-id="ev_2e0afdeddc" className="bg-white rounded-xl border border-gray-200 p-6">
        <p data-ev-id="ev_0a80df6f40" className="text-sm text-gray-600 mb-4 text-center">
          {language === 'he' ? 'או התאם אישית:' : 'Or customize:'}
        </p>
        
        <div data-ev-id="ev_d9a94b06f5" className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(setupData.pageCount - 10)}
            disabled={setupData.pageCount <= MIN_PAGES}
            className="w-12 h-12 rounded-full p-0">

            <Minus className="w-5 h-5" />
          </Button>

          <div data-ev-id="ev_a7002cf0fb" className="text-center min-w-32">
            <div data-ev-id="ev_7d829cbdc0" className="text-5xl font-bold text-primary">
              {setupData.pageCount}
            </div>
            <div data-ev-id="ev_e399283f44" className="text-sm text-gray-500 mt-1">
              {language === 'he' ? 'עמודים פנימיים' : 'interior pages'}
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(setupData.pageCount + 10)}
            disabled={setupData.pageCount >= MAX_PAGES}
            className="w-12 h-12 rounded-full p-0">

            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Page Breakdown */}
      <div data-ev-id="ev_efa5d4a2a3" className="bg-gray-50 rounded-xl p-6">
        <h3 data-ev-id="ev_d8da483a05" className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          {language === 'he' ? 'פירוט האלבום' : 'Album Breakdown'}
        </h3>
        
        <div data-ev-id="ev_ec62c8ed17" className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div data-ev-id="ev_3d18507629" className="bg-white rounded-lg p-4 text-center">
            <div data-ev-id="ev_b4a1c738df" className="text-2xl font-bold text-gray-900">2</div>
            <div data-ev-id="ev_218714ec96" className="text-xs text-gray-500">
              {language === 'he' ? 'כריכות' : 'Covers'}
            </div>
          </div>
          
          <div data-ev-id="ev_49cb9e1c8b" className="bg-white rounded-lg p-4 text-center">
            <div data-ev-id="ev_afd258c11b" className="text-2xl font-bold text-primary">{setupData.pageCount}</div>
            <div data-ev-id="ev_de42ac81ce" className="text-xs text-gray-500">
              {language === 'he' ? 'עמודים פנימיים' : 'Interior Pages'}
            </div>
          </div>
          
          <div data-ev-id="ev_9d6e5e3547" className="bg-white rounded-lg p-4 text-center">
            <div data-ev-id="ev_3c926bb01e" className="text-2xl font-bold text-gray-900">{interiorSpreads}</div>
            <div data-ev-id="ev_63bc324e9d" className="text-xs text-gray-500">
              {language === 'he' ? 'פריסות כפולות' : 'Double Spreads'}
            </div>
          </div>
          
          <div data-ev-id="ev_32ef72733d" className="bg-white rounded-lg p-4 text-center">
            <div data-ev-id="ev_f77247244d" className="text-2xl font-bold text-gray-900">{setupData.pageCount + 2}</div>
            <div data-ev-id="ev_51b4183cf1" className="text-xs text-gray-500">
              {language === 'he' ? 'סה"כ עמודים' : 'Total Pages'}
            </div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div data-ev-id="ev_7044ea0166" className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg p-4">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div data-ev-id="ev_6f4b445c8b" className="text-sm text-amber-800">
          {language === 'he' ?
          'הערה: מספר העמודים חייב להיות זוגי כדי ליצור פריסות כפולות שלמות. תוכל להוסיף או להסיר עמודים מאוחר יותר בעורך.' :
          'Note: Page count must be even to create complete double spreads. You can add or remove pages later in the editor.'
          }
        </div>
      </div>
    </div>);

}