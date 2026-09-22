/**
 * Placement Mode Selection Step
 */

import { MousePointer, Wand2, Info, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import type { AlbumSetupData, PlacementMode } from '@/types/album';
import type { Language } from '@/lib/i18n';

interface PlacementStepProps {
  setupData: AlbumSetupData;
  onUpdate: (updates: Partial<AlbumSetupData>) => void;
  language: Language;
}

export function PlacementStep({ setupData, onUpdate, language }: PlacementStepProps) {
  const handleSelect = (mode: PlacementMode) => {
    onUpdate({ placementMode: mode });
  };

  const photoCount = setupData.photos.filter((p) => p.uploadStatus === 'complete').length;
  const pageCount = setupData.pageCount;
  const estimatedPhotosPerSpread = 2;
  const spreadCount = Math.ceil(pageCount / 2);
  const idealPhotoCount = spreadCount * estimatedPhotosPerSpread;

  return (
    <div data-ev-id="ev_f3fccd1b66" className="flex flex-col gap-8">
      <div data-ev-id="ev_962a13b4f7" className="text-center">
        <h2 data-ev-id="ev_44c0b65969" className="text-2xl font-bold text-gray-900 mb-2">
          {language === 'he' ? 'מצב סידור תמונות' : 'Photo Placement Mode'}
        </h2>
        <p data-ev-id="ev_2d7699a73d" className="text-gray-600">
          {language === 'he' ?
          'בחר איך לסדר את התמונות באלבום' :
          'Choose how to arrange your photos in the album'
          }
        </p>
      </div>

      <div data-ev-id="ev_c48e0356e1" className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {/* Manual Mode */}
        <motion.button data-ev-id="ev_1b9b6be486"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => handleSelect('manual')}
        className={`relative p-6 rounded-2xl border-2 transition-all text-start ${
        setupData.placementMode === 'manual' ?
        'border-primary bg-primary/5 shadow-xl' :
        'border-gray-200 hover:border-gray-300 bg-white'}`
        }>

          {/* Selection indicator */}
          {setupData.placementMode === 'manual' &&
          <div data-ev-id="ev_e8fe7b5f89" className="absolute top-4 end-4 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
          }

          {/* Icon */}
          <div data-ev-id="ev_683a48cb44" className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${
          setupData.placementMode === 'manual' ? 'bg-primary/10' : 'bg-gray-100'}`
          }>
            <MousePointer className={`w-7 h-7 ${
            setupData.placementMode === 'manual' ? 'text-primary' : 'text-gray-500'}`
            } />
          </div>

          <h3 data-ev-id="ev_d300215ed2" className={`font-bold text-xl mb-2 ${
          setupData.placementMode === 'manual' ? 'text-primary' : 'text-gray-900'}`
          }>
            {language === 'he' ? 'סידור ידני' : 'Manual Placement'}
          </h3>
          
          <p data-ev-id="ev_e650edfd66" className="text-sm text-gray-600 mb-4">
            {language === 'he' ?
            'התחל עם עמודים ריקים או מסגרות של הערכה וגרור תמונות לתוכם בעצמך.' :
            'Start with empty pages or theme frames and drag photos into them yourself.'
            }
          </p>

          <ul data-ev-id="ev_8ac3d550c5" className="flex flex-col gap-2 text-sm">
            <li data-ev-id="ev_5a0c90445f" className="flex items-center gap-2">
              <div data-ev-id="ev_dcecc9be85" className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span data-ev-id="ev_57acea2e95" className="text-gray-600">
                {language === 'he' ? 'שליטה מלאה על מיקום התמונות' : 'Full control over photo positions'}
              </span>
            </li>
            <li data-ev-id="ev_ad631047bc" className="flex items-center gap-2">
              <div data-ev-id="ev_0e53b8130f" className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span data-ev-id="ev_c100e756b9" className="text-gray-600">
                {language === 'he' ? 'התחל עם פריסות ריקות' : 'Start with blank spreads'}
              </span>
            </li>
            <li data-ev-id="ev_acb63d6ad8" className="flex items-center gap-2">
              <div data-ev-id="ev_84d1c61f06" className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span data-ev-id="ev_53922eafd2" className="text-gray-600">
                {language === 'he' ? 'הוסף מסגרות וטקסט בחופשיות' : 'Add frames and text freely'}
              </span>
            </li>
          </ul>
        </motion.button>

        {/* Automatic Mode */}
        <motion.button data-ev-id="ev_04096e5ff7"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => handleSelect('automatic')}
        className={`relative p-6 rounded-2xl border-2 transition-all text-start ${
        setupData.placementMode === 'automatic' ?
        'border-primary bg-primary/5 shadow-xl' :
        'border-gray-200 hover:border-gray-300 bg-white'}`
        }>

          {/* Selection indicator */}
          {setupData.placementMode === 'automatic' &&
          <div data-ev-id="ev_e5cbc09a2e" className="absolute top-4 end-4 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
          }

          {/* Icon */}
          <div data-ev-id="ev_3c13798b60" className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${
          setupData.placementMode === 'automatic' ? 'bg-primary/10' : 'bg-gray-100'}`
          }>
            <Wand2 className={`w-7 h-7 ${
            setupData.placementMode === 'automatic' ? 'text-primary' : 'text-gray-500'}`
            } />
          </div>

          <h3 data-ev-id="ev_c6885cb1bc" className={`font-bold text-xl mb-2 ${
          setupData.placementMode === 'automatic' ? 'text-primary' : 'text-gray-900'}`
          }>
            {language === 'he' ? 'סידור אוטומטי' : 'Automatic Placement'}
          </h3>
          
          <p data-ev-id="ev_2475df79ad" className="text-sm text-gray-600 mb-4">
            {language === 'he' ?
            'התמונות שהעלית יסודרו אוטומטית על פני הערכה והפריסות שלה.' :
            'Your uploaded photos will be automatically distributed across pages using theme layouts.'
            }
          </p>

          <ul data-ev-id="ev_5a96e48007" className="flex flex-col gap-2 text-sm">
            <li data-ev-id="ev_dc5cf80b19" className="flex items-center gap-2">
              <div data-ev-id="ev_8f0aa765cb" className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span data-ev-id="ev_b18387d380" className="text-gray-600">
                {language === 'he' ? 'מהיר וקל להתחלה' : 'Quick and easy start'}
              </span>
            </li>
            <li data-ev-id="ev_d426199e71" className="flex items-center gap-2">
              <div data-ev-id="ev_2629ba9daf" className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span data-ev-id="ev_c3fa2658fc" className="text-gray-600">
                {language === 'he' ? 'פריסות מעוצבות לפי הערכה' : 'Layouts designed by the theme'}
              </span>
            </li>
            <li data-ev-id="ev_5c87165e00" className="flex items-center gap-2">
              <div data-ev-id="ev_b4bc30035b" className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span data-ev-id="ev_dd431ff5d5" className="text-gray-600">
                {language === 'he' ? 'תוכל לערוך ידנית אחר כך' : 'You can still edit manually after'}
              </span>
            </li>
          </ul>
        </motion.button>
      </div>

      {/* Photo count info */}
      {photoCount > 0 && setupData.placementMode === 'automatic' &&
      <div data-ev-id="ev_30941b0da3" className={`max-w-xl mx-auto rounded-xl p-4 ${
      photoCount < idealPhotoCount * 0.5 ?
      'bg-amber-50 border border-amber-200' :
      photoCount > idealPhotoCount * 1.5 ?
      'bg-blue-50 border border-blue-200' :
      'bg-green-50 border border-green-200'}`
      }>
          <div data-ev-id="ev_5dbbdd42a7" className="flex items-start gap-3">
            <Info className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
          photoCount < idealPhotoCount * 0.5 ?
          'text-amber-600' :
          photoCount > idealPhotoCount * 1.5 ?
          'text-blue-600' :
          'text-green-600'}`
          } />
            <div data-ev-id="ev_70cc9633f8" className="text-sm">
              <p data-ev-id="ev_1e7b050b2c" className={`font-medium ${
            photoCount < idealPhotoCount * 0.5 ?
            'text-amber-800' :
            photoCount > idealPhotoCount * 1.5 ?
            'text-blue-800' :
            'text-green-800'}`
            }>
                {language === 'he' ?
              `יש לך ${photoCount} תמונות ל-${spreadCount} פריסות` :
              `You have ${photoCount} photos for ${spreadCount} spreads`
              }
              </p>
              <p data-ev-id="ev_5b55f49abe" className={`mt-1 ${
            photoCount < idealPhotoCount * 0.5 ?
            'text-amber-700' :
            photoCount > idealPhotoCount * 1.5 ?
            'text-blue-700' :
            'text-green-700'}`
            }>
                {photoCount < idealPhotoCount * 0.5 ?
              language === 'he' ?
              'ייתכן שחלק מהעמודים יישארו ריקים. תוכל להוסיף תמונות.' :
              'Some pages may be empty. Consider adding more photos.' :
              photoCount > idealPhotoCount * 1.5 ?
              language === 'he' ?
              'יש לך הרבה תמונות. חלקן יוצבו עם מספר תמונות בכל פריסה.' :
              'You have many photos. Some pages will have multiple photos.' :
              language === 'he' ?
              'מספר התמונות מתאים למספר העמודים!' :
              'Photo count matches your page count well!'
              }
              </p>
            </div>
          </div>
        </div>
      }

      {/* What happens next */}
      <div data-ev-id="ev_dfc4499cde" className="max-w-xl mx-auto bg-gray-50 rounded-xl p-4">
        <h4 data-ev-id="ev_7a30e8cf3c" className="font-medium text-gray-900 mb-2">
          {language === 'he' ? 'מה קורה אחרי כן:' : 'What happens next:'}
        </h4>
        <p data-ev-id="ev_c5a5b359fc" className="text-sm text-gray-600">
          {setupData.placementMode === 'manual' ?
          language === 'he' ?
          'העורך ייפתח עם פריסות ריקות ותוכל לגרור תמונות למסגרות מהסרגל הצדדי או מהספריה שלך.' :
          'The editor will open with blank spreads. You can drag photos from the sidebar into frames you create.' :
          language === 'he' ?
          'התמונות יסודרו אוטומטית על פני הפריסות בהתאם לערכה. תוכל להזיז, לשנות סדר או להחליף תמונות אחר כך.' :
          'Your photos will be automatically placed across spreads using theme layouts. You can then rearrange, swap, or edit as needed.'
          }
        </p>
      </div>
    </div>);

}