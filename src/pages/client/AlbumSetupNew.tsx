/**
 * Album Setup Modal - Screen B
 * Large white modal with sidebar progress and main content area
 * Steps: Design, Size, Binding, Opening Direction
 */
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { X, ChevronLeft, ChevronRight, ChevronDown, Minus, Plus, BookOpen, Book, FileText, ArrowLeftRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { THEMES, Theme, getThemeById, getThemesByCategory, THEME_CATEGORIES } from '@/lib/themes';
import { ALBUM_SIZES, AlbumSize, MIN_PAGES, MAX_PAGES } from '@/lib/albumSizes';

// Binding types
const BINDING_TYPES = [
{
  id: 'layflat',
  name: { he: 'כריכה שטוחה', en: 'Lay-Flat' },
  description: { he: 'עמודים נפתחים לגמרי 180°', en: 'Pages open completely flat' },
  pages: { he: '20-100 עמודים', en: '20-100 pages' },
  min: 20,
  max: 100
},
{
  id: 'hardcover',
  name: { he: 'כריכה קשה', en: 'Hardcover' },
  description: { he: 'כריכה קשיחה ועמידה', en: 'Durable hardcover binding' },
  pages: { he: '20-80 עמודים', en: '20-80 pages' },
  min: 20,
  max: 80
},
{
  id: 'softcover',
  name: { he: 'כריכה רכה', en: 'Softcover' },
  description: { he: 'כריכה גמישה וקלה', en: 'Flexible softcover binding' },
  pages: { he: '10-60 עמודים', en: '10-60 pages' },
  min: 10,
  max: 60
}];


// Setup data interface
interface SetupState {
  themeId: string | null;
  theme: Theme | null;
  sizeId: string | null;
  size: AlbumSize | null;
  bindingId: string;
  direction: 'rtl' | 'ltr';
  pageCount: number;
  albumName: string;
}

const STEPS = [
{ id: 'design', number: 1, label: { he: 'עיצוב', en: 'Design' } },
{ id: 'size', number: 2, label: { he: 'גודל', en: 'Size' } },
{ id: 'binding', number: 3, label: { he: 'כריכה', en: 'Binding' } },
{ id: 'direction', number: 4, label: { he: 'כיוון פתיחה', en: 'Direction' } }];


export default function AlbumSetupNew() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, isRTL } = useLanguage();
  const { user } = useAuth();

  // Get selected theme from navigation state
  const selectedThemeFromGallery = location.state?.selectedTheme as Theme | null;

  const [currentStep, setCurrentStep] = useState(0);
  const [themeCategory, setThemeCategory] = useState('all');
  const [themeIndex, setThemeIndex] = useState(0);

  const [setupState, setSetupState] = useState<SetupState>({
    themeId: selectedThemeFromGallery?.id || null,
    theme: selectedThemeFromGallery || null,
    sizeId: null,
    size: null,
    bindingId: 'layflat',
    direction: 'rtl',
    pageCount: 24,
    albumName: language === 'he' ? 'האלבום שלי' : 'My Album'
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { returnTo: '/album/new' } });
    }
  }, [user, navigate]);

  // Get current binding limits
  const currentBinding = BINDING_TYPES.find((b) => b.id === setupState.bindingId)!;

  // Get themes for current category
  const categoryThemes = themeCategory === 'all' ?
  THEMES :
  getThemesByCategory(themeCategory);

  // Update page count when binding changes
  useEffect(() => {
    if (setupState.pageCount < currentBinding.min) {
      setSetupState((s) => ({ ...s, pageCount: currentBinding.min }));
    } else if (setupState.pageCount > currentBinding.max) {
      setSetupState((s) => ({ ...s, pageCount: currentBinding.max }));
    }
  }, [setupState.bindingId, currentBinding.min, currentBinding.max, setupState.pageCount]);

  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 0:return true; // Design is optional
      case 1:return !!setupState.sizeId;
      case 2:return !!setupState.bindingId;
      case 3:return !!setupState.direction;
      default:return true;
    }
  }, [currentStep, setupState]);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Proceed to photo import
      navigate('/album/photos', {
        state: {
          setupState
        }
      });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/album/new');
    }
  };

  const handleClose = () => {
    navigate('/album/new');
  };

  const handleSelectTheme = (theme: Theme | null) => {
    setSetupState((s) => ({
      ...s,
      themeId: theme?.id || null,
      theme: theme
    }));
  };

  const handleSelectSize = (size: AlbumSize) => {
    setSetupState((s) => ({
      ...s,
      sizeId: size.id,
      size: size
    }));
  };

  const handleSelectBinding = (bindingId: string) => {
    setSetupState((s) => ({ ...s, bindingId }));
  };

  const handleSelectDirection = (direction: 'rtl' | 'ltr') => {
    setSetupState((s) => ({ ...s, direction }));
  };

  const handlePageCountChange = (delta: number) => {
    const newCount = setupState.pageCount + delta;
    if (newCount >= currentBinding.min && newCount <= currentBinding.max && newCount % 2 === 0) {
      setSetupState((s) => ({ ...s, pageCount: newCount }));
    }
  };

  const cycleTheme = (direction: 'prev' | 'next') => {
    if (categoryThemes.length === 0) return;
    let newIndex = themeIndex + (direction === 'next' ? 1 : -1);
    if (newIndex < 0) newIndex = categoryThemes.length - 1;
    if (newIndex >= categoryThemes.length) newIndex = 0;
    setThemeIndex(newIndex);
    handleSelectTheme(categoryThemes[newIndex]);
  };

  if (!user) {
    return (
      <div data-ev-id="ev_9867da3cd4" className="min-h-screen bg-gray-900/80 flex items-center justify-center">
        <div data-ev-id="ev_a053074fb4" className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full" />
      </div>);

  }

  return (
    <div data-ev-id="ev_c3945ab151" className="fixed inset-0 z-50 bg-gray-900/80 flex items-center justify-center p-4" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Modal */}
      <motion.div data-ev-id="ev_6097731f77"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-t-2xl rounded-b-lg w-full max-w-6xl h-[90vh] max-h-[800px] flex overflow-hidden shadow-2xl">

        {/* Main content area - 78% */}
        <div data-ev-id="ev_54549d0e42" className="flex-1 flex flex-col relative">
          {/* Close button */}
          <button data-ev-id="ev_9e0c4489e0"
          onClick={handleClose}
          className="absolute top-4 left-4 z-10 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">

            <X className="w-5 h-5" />
          </button>

          {/* Step content */}
          <div data-ev-id="ev_a2aed0632a" className="flex-1 overflow-y-auto px-8 py-12">
            <AnimatePresence mode="wait">
              {currentStep === 0 &&
              <motion.div data-ev-id="ev_34c4dbc3f2"
              key="design"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full flex flex-col items-center">

                  {/* Title with hairlines */}
                  <div data-ev-id="ev_f560b866ec" className="flex items-center gap-4 mb-2">
                    <div data-ev-id="ev_fbc38cc9f2" className="w-12 h-px bg-gray-300" />
                    <h2 data-ev-id="ev_a56fa0baa0" className="text-2xl font-semibold text-gray-800">
                      {language === 'he' ? 'בחרו עיצוב' : 'Choose Design'}
                    </h2>
                    <div data-ev-id="ev_01c33a5c42" className="w-12 h-px bg-gray-300" />
                  </div>
                  <p data-ev-id="ev_ee18f84a84" className="text-gray-500 text-sm mb-8">
                    {language === 'he' ? 'בחרו עיצוב בסיס לאלבום' : 'Select a base design for your album'}
                  </p>

                  {/* Category tabs */}
                  <div data-ev-id="ev_d5d886b0a3" className="flex gap-2 mb-8 flex-wrap justify-center">
                    {THEME_CATEGORIES.map((cat) =>
                  <button data-ev-id="ev_74ac6bb904"
                  key={cat.id}
                  onClick={() => {
                    setThemeCategory(cat.id);
                    setThemeIndex(0);
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  themeCategory === cat.id ?
                  'bg-[#00aa9b] text-white' :
                  'bg-gray-100 text-gray-600 hover:bg-gray-200'}`
                  }>

                        {cat.name[language]}
                      </button>
                  )}
                  </div>

                  {/* Theme preview with navigation */}
                  <div data-ev-id="ev_8bdb9d240d" className="flex items-center gap-8">
                    <button data-ev-id="ev_9e8122c769"
                  onClick={() => cycleTheme('prev')}
                  className="w-10 h-10 rounded-full bg-gray-100 text-[#00aa9b] hover:bg-[#00aa9b] hover:text-white flex items-center justify-center transition-colors">

                      {isRTL ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                    </button>

                    {/* Large cover preview */}
                    <div data-ev-id="ev_837b84ca12" className="relative">
                      {categoryThemes.length > 0 ?
                    <div data-ev-id="ev_0d345a0a94"
                    className={`w-64 h-64 rounded-lg shadow-lg overflow-hidden border-4 transition-colors ${
                    setupState.themeId === categoryThemes[themeIndex]?.id ?
                    'border-[#00aa9b]' :
                    'border-transparent'}`
                    }
                    style={{ background: categoryThemes[themeIndex]?.previewGradient }}>

                          <div data-ev-id="ev_7c1c105366" className="w-full h-full flex items-center justify-center p-6">
                            <div data-ev-id="ev_245401b131" className="w-40 h-52 bg-white rounded shadow-lg relative overflow-hidden">
                              <div data-ev-id="ev_4b35a4b11d"
                          className="absolute inset-0 opacity-80"
                          style={{ background: categoryThemes[themeIndex]?.colors.primary }} />

                              <div data-ev-id="ev_41508e1c91" className="absolute inset-0 flex flex-col items-center justify-center p-4">
                                <div data-ev-id="ev_32f22908ba"
                            className="w-20 h-20 rounded-full mb-3 opacity-30"
                            style={{ background: categoryThemes[themeIndex]?.colors.accent }} />

                                <div data-ev-id="ev_efc504640f" className="w-24 h-2.5 rounded bg-white/40 mb-1.5" />
                                <div data-ev-id="ev_c669a6203e" className="w-16 h-2 rounded bg-white/30" />
                              </div>
                            </div>
                          </div>
                        </div> :

                    <div data-ev-id="ev_41ee9237e1" className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span data-ev-id="ev_d4f330fe04" className="text-gray-400">
                            {language === 'he' ? 'אין עיצובים' : 'No designs'}
                          </span>
                        </div>
                    }
                    </div>

                    <button data-ev-id="ev_cd78da9fba"
                  onClick={() => cycleTheme('next')}
                  className="w-10 h-10 rounded-full bg-gray-100 text-[#00aa9b] hover:bg-[#00aa9b] hover:text-white flex items-center justify-center transition-colors">

                      {isRTL ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Theme name/description */}
                  {categoryThemes.length > 0 &&
                <div data-ev-id="ev_4299de86a3" className="text-center mt-6">
                      <h3 data-ev-id="ev_2ecbb28588" className="font-semibold text-gray-800">
                        {categoryThemes[themeIndex]?.name[language]}
                      </h3>
                      <p data-ev-id="ev_f615bbc02e" className="text-sm text-gray-500 mt-1">
                        {categoryThemes[themeIndex]?.description[language]}
                      </p>
                    </div>
                }

                  {/* Skip design option */}
                  <button data-ev-id="ev_b6978ecbb5"
                onClick={() => handleSelectTheme(null)}
                className={`mt-8 px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                setupState.themeId === null ?
                'bg-gray-800 text-white' :
                'bg-gray-100 text-gray-600 hover:bg-gray-200'}`
                }>

                    {language === 'he' ? 'המשך ללא עיצוב' : 'Continue without design'}
                  </button>
                </motion.div>
              }

              {currentStep === 1 &&
              <motion.div data-ev-id="ev_88c9c8a9dc"
              key="size"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full flex flex-col items-center">

                  <div data-ev-id="ev_bb1518e3ec" className="flex items-center gap-4 mb-2">
                    <div data-ev-id="ev_e7a9c75277" className="w-12 h-px bg-gray-300" />
                    <h2 data-ev-id="ev_d1284b24a0" className="text-2xl font-semibold text-gray-800">
                      {language === 'he' ? 'בחרו גודל' : 'Choose Size'}
                    </h2>
                    <div data-ev-id="ev_377ea59c21" className="w-12 h-px bg-gray-300" />
                  </div>
                  <p data-ev-id="ev_fce9d1cc06" className="text-gray-500 text-sm mb-8">
                    {language === 'he' ? 'בחרו את גודל האלבום' : 'Select the album size'}
                  </p>

                  {/* 3x2 size grid */}
                  <div data-ev-id="ev_40d458978e" className="grid grid-cols-3 gap-4 max-w-2xl">
                    {ALBUM_SIZES.slice(0, 6).map((size) =>
                  <button data-ev-id="ev_2c8dec9e47"
                  key={size.id}
                  onClick={() => handleSelectSize(size)}
                  className={`p-6 rounded-xl border-2 transition-all hover:shadow-md ${
                  setupState.sizeId === size.id ?
                  'border-[#00aa9b] bg-[#00aa9b]/5 shadow-md' :
                  'border-gray-200 hover:border-gray-300'}`
                  }>

                        {/* Size preview shape */}
                        <div data-ev-id="ev_c0b2ace1ce" className="flex justify-center mb-4">
                          <div data-ev-id="ev_f4d25b7913"
                      className="bg-gray-200 rounded"
                      style={{
                        width: size.category === 'square' ? 60 : size.category === 'landscape' ? 72 : 48,
                        height: size.category === 'square' ? 60 : size.category === 'landscape' ? 48 : 72
                      }} />

                        </div>
                        {/* Size name */}
                        <div data-ev-id="ev_1430fd9061" className="text-center">
                          <div data-ev-id="ev_c3721913a6" className="font-medium text-gray-800 text-sm">
                            {size.name[language]}
                          </div>
                          <div data-ev-id="ev_507078ade1" className="text-xs text-gray-500 mt-1">
                            {size.widthCm}×{size.heightCm} ס"מ
                          </div>
                        </div>
                        {/* Selected check */}
                        {setupState.sizeId === size.id &&
                    <div data-ev-id="ev_88dd2cfa0a" className="absolute top-2 right-2 w-5 h-5 bg-[#00aa9b] rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                    }
                      </button>
                  )}
                  </div>
                </motion.div>
              }

              {currentStep === 2 &&
              <motion.div data-ev-id="ev_630690b235"
              key="binding"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full flex flex-col items-center">

                  <div data-ev-id="ev_0f9010b6f5" className="flex items-center gap-4 mb-2">
                    <div data-ev-id="ev_78868ec050" className="w-12 h-px bg-gray-300" />
                    <h2 data-ev-id="ev_e45a18c56a" className="text-2xl font-semibold text-gray-800">
                      {language === 'he' ? 'בחרו סוג כריכה' : 'Choose Binding'}
                    </h2>
                    <div data-ev-id="ev_e3b6490f21" className="w-12 h-px bg-gray-300" />
                  </div>
                  <p data-ev-id="ev_06d57cb15c" className="text-gray-500 text-sm mb-8">
                    {language === 'he' ? 'בחרו את סוג הכריכה לאלבום' : 'Select the binding type'}
                  </p>

                  {/* 3 binding cards */}
                  <div data-ev-id="ev_148004f8ec" className="flex gap-6 max-w-4xl">
                    {BINDING_TYPES.map((binding) =>
                  <button data-ev-id="ev_99e0f2fd5f"
                  key={binding.id}
                  onClick={() => handleSelectBinding(binding.id)}
                  className={`flex-1 p-8 rounded-xl border-2 transition-all hover:shadow-md ${
                  setupState.bindingId === binding.id ?
                  'border-[#00aa9b] bg-[#00aa9b]/5 shadow-md' :
                  'border-gray-200 hover:border-gray-300'}`
                  }>

                        {/* Icon */}
                        <div data-ev-id="ev_219fbf390e" className="flex justify-center mb-4">
                          <BookOpen className="w-12 h-12 text-gray-700" strokeWidth={1.5} />
                        </div>
                        {/* Name */}
                        <h3 data-ev-id="ev_59915683c8" className="font-semibold text-gray-800 text-center mb-2">
                          {binding.name[language]}
                        </h3>
                        {/* Description */}
                        <p data-ev-id="ev_5569b75922" className="text-sm text-gray-500 text-center mb-4">
                          {binding.description[language]}
                        </p>
                        {/* Page range */}
                        <p data-ev-id="ev_a7bfca5a06" className="text-xs font-medium text-[#00aa9b] text-center">
                          {binding.pages[language]}
                        </p>
                      </button>
                  )}
                  </div>
                </motion.div>
              }

              {currentStep === 3 &&
              <motion.div data-ev-id="ev_fa67f951c6"
              key="direction"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full flex flex-col items-center">

                  <div data-ev-id="ev_838697a03c" className="flex items-center gap-4 mb-2">
                    <div data-ev-id="ev_6a130fd49c" className="w-12 h-px bg-gray-300" />
                    <h2 data-ev-id="ev_2be0e22faa" className="text-2xl font-semibold text-gray-800">
                      {language === 'he' ? 'בחרו כיוון פתיחה' : 'Choose Opening Direction'}
                    </h2>
                    <div data-ev-id="ev_48db41036a" className="w-12 h-px bg-gray-300" />
                  </div>
                  <p data-ev-id="ev_8fbdac7b85" className="text-gray-500 text-sm mb-8">
                    {language === 'he' ? 'בחרו את כיוון פתיחת האלבום' : 'Select how the album opens'}
                  </p>

                  {/* Direction cards */}
                  <div data-ev-id="ev_d0644b4979" className="flex gap-8 max-w-2xl">
                    <button data-ev-id="ev_5c77dd3052"
                  onClick={() => handleSelectDirection('rtl')}
                  className={`flex-1 p-8 rounded-xl border-2 transition-all hover:shadow-md ${
                  setupState.direction === 'rtl' ?
                  'border-[#00aa9b] bg-[#00aa9b]/5 shadow-md' :
                  'border-gray-200 hover:border-gray-300'}`
                  }>

                      {/* RTL illustration */}
                      <div data-ev-id="ev_078c8338c4" className="flex justify-center mb-4">
                        <div data-ev-id="ev_944ef795e7" className="relative w-20 h-16">
                          <div data-ev-id="ev_0b7daf5736" className="absolute right-0 w-10 h-16 bg-gray-300 rounded-l" />
                          <div data-ev-id="ev_1b5f390a85" className="absolute left-0 w-10 h-16 bg-gray-200 rounded-r" />
                          <div data-ev-id="ev_68fdfb1701" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                            <ChevronLeft className="w-6 h-6 text-[#00aa9b]" />
                          </div>
                        </div>
                      </div>
                      <h3 data-ev-id="ev_eed8f994a5" className="font-semibold text-gray-800 text-center mb-2">
                        {language === 'he' ? 'מימין לשמאל' : 'Right to Left'}
                      </h3>
                      <p data-ev-id="ev_1d5e70c7c4" className="text-sm text-gray-500 text-center">
                        {language === 'he' ? 'מומלץ לעברית ושפות RTL' : 'Recommended for Hebrew'}
                      </p>
                    </button>

                    <button data-ev-id="ev_655c570239"
                  onClick={() => handleSelectDirection('ltr')}
                  className={`flex-1 p-8 rounded-xl border-2 transition-all hover:shadow-md ${
                  setupState.direction === 'ltr' ?
                  'border-[#00aa9b] bg-[#00aa9b]/5 shadow-md' :
                  'border-gray-200 hover:border-gray-300'}`
                  }>

                      {/* LTR illustration */}
                      <div data-ev-id="ev_f2ce268feb" className="flex justify-center mb-4">
                        <div data-ev-id="ev_65c0981bba" className="relative w-20 h-16">
                          <div data-ev-id="ev_6c2097f728" className="absolute left-0 w-10 h-16 bg-gray-300 rounded-r" />
                          <div data-ev-id="ev_d5faab5478" className="absolute right-0 w-10 h-16 bg-gray-200 rounded-l" />
                          <div data-ev-id="ev_3cc8dd4c55" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                            <ChevronRight className="w-6 h-6 text-[#00aa9b]" />
                          </div>
                        </div>
                      </div>
                      <h3 data-ev-id="ev_8be3a876d4" className="font-semibold text-gray-800 text-center mb-2">
                        {language === 'he' ? 'משמאל לימין' : 'Left to Right'}
                      </h3>
                      <p data-ev-id="ev_dfe829ec98" className="text-sm text-gray-500 text-center">
                        {language === 'he' ? 'מומלץ לאנגלית ושפות LTR' : 'Recommended for English'}
                      </p>
                    </button>
                  </div>
                </motion.div>
              }
            </AnimatePresence>
          </div>
        </div>

        {/* Sidebar - 22% */}
        <div data-ev-id="ev_c4189b8d30" className="w-72 bg-gray-50 border-l border-gray-200 flex flex-col">
          {/* Album name input */}
          <div data-ev-id="ev_19228c7573" className="p-6 border-b border-gray-200">
            <label data-ev-id="ev_8dc8f1f8db" className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'he' ? 'שם האלבום' : 'Album Name'}
            </label>
            <input data-ev-id="ev_261d9a3614"
            type="text"
            value={setupState.albumName}
            onChange={(e) => setSetupState((s) => ({ ...s, albumName: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#00aa9b] focus:ring-1 focus:ring-[#00aa9b] outline-none"
            placeholder={language === 'he' ? 'הזינו שם...' : 'Enter name...'} />

          </div>

          {/* Progress steps */}
          <div data-ev-id="ev_7d8fa13e9a" className="flex-1 overflow-y-auto">
            {STEPS.map((step, idx) =>
            <div data-ev-id="ev_3bffc7fa9a" key={step.id}>
                <button data-ev-id="ev_78e6b0984e"
              onClick={() => idx <= currentStep && setCurrentStep(idx)}
              disabled={idx > currentStep}
              className={`w-full text-right px-6 py-4 flex items-center gap-3 transition-colors ${
              idx === currentStep ?
              'bg-[#00aa9b] text-white' :
              idx < currentStep ?
              'bg-white text-gray-700 hover:bg-gray-100' :
              'bg-gray-100 text-gray-400'}`
              }>

                  <span data-ev-id="ev_29d9f7d732" className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                idx === currentStep ?
                'bg-white/20' :
                idx < currentStep ?
                'bg-[#00aa9b] text-white' :
                'bg-gray-200'}`
                }>
                    {idx < currentStep ? <Check className="w-4 h-4" /> : step.number}
                  </span>
                  <span data-ev-id="ev_73cedf3a1c" className="font-medium">{step.label[language]}</span>
                </button>
                {idx < STEPS.length - 1 &&
              <div data-ev-id="ev_af4d86b560" className="flex justify-center py-1">
                    <ChevronDown className="w-4 h-4 text-gray-300" />
                  </div>
              }
              </div>
            )}
          </div>

          {/* Page count control */}
          <div data-ev-id="ev_1a08f56d08" className="p-6 border-t border-gray-200">
            <label data-ev-id="ev_7a6171733d" className="block text-sm font-medium text-gray-700 mb-3">
              {language === 'he' ? 'מספר עמודים' : 'Page Count'}
            </label>
            <div data-ev-id="ev_4e9368c577" className="flex items-center justify-center gap-4">
              <button data-ev-id="ev_e09a416e05"
              onClick={() => handlePageCountChange(-2)}
              disabled={setupState.pageCount <= currentBinding.min}
              className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed">

                <Minus className="w-4 h-4" />
              </button>
              <span data-ev-id="ev_74400b0e74" className="text-2xl font-bold text-gray-800 w-16 text-center">
                {setupState.pageCount}
              </span>
              <button data-ev-id="ev_da8524e99a"
              onClick={() => handlePageCountChange(2)}
              disabled={setupState.pageCount >= currentBinding.max}
              className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed">

                <Plus className="w-4 h-4" />
              </button>
            </div>
            <p data-ev-id="ev_2d4b0cf9fc" className="text-xs text-gray-500 text-center mt-2">
              {currentBinding.pages[language]}
            </p>
          </div>

          {/* Current selections summary */}
          <div data-ev-id="ev_b491f32df4" className="px-6 py-4 border-t border-gray-200 text-xs text-gray-500">
            {setupState.theme &&
            <div data-ev-id="ev_f9f820b589" className="mb-1">עיצוב: {setupState.theme.name[language]}</div>
            }
            {setupState.size &&
            <div data-ev-id="ev_f31b986141" className="mb-1">גודל: {setupState.size.name[language]}</div>
            }
            <div data-ev-id="ev_b0699bab3c">כריכה: {BINDING_TYPES.find((b) => b.id === setupState.bindingId)?.name[language]}</div>
          </div>

          {/* Continue CTA */}
          <div data-ev-id="ev_cfd4225e10" className="p-6 border-t border-gray-200">
            <button data-ev-id="ev_6064d5ab11"
            onClick={handleNext}
            disabled={!canProceed()}
            className="w-full py-4 bg-[#00aa9b] text-white font-semibold rounded-full hover:bg-[#009688] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">

              {currentStep === STEPS.length - 1 ?
              language === 'he' ? 'בואו נתחיל' : "Let's Start" :
              language === 'he' ? 'המשך' : 'Continue'}
            </button>
            {currentStep > 0 &&
            <button data-ev-id="ev_8a7b2605d1"
            onClick={handleBack}
            className="w-full py-2 mt-2 text-gray-600 text-sm hover:text-gray-800">

                {language === 'he' ? 'חזרה' : 'Back'}
              </button>
            }
          </div>
        </div>
      </motion.div>
    </div>);

}