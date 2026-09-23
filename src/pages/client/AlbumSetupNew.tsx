/**
 * Album Setup Modal - Screen B
 * Large white modal with sidebar on RIGHT, main content on LEFT
 * Steps: Design, Size, Binding, Opening Direction
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { X, ChevronLeft, ChevronRight, ChevronDown, Minus, Plus, BookOpen, Search, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { THEMES, Theme, getThemeById, getThemesByCategory, THEME_CATEGORIES } from '@/lib/themes';
import { ALBUM_SIZES, AlbumSize } from '@/lib/albumSizes';

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


// Cover preview component for setup modal
function CoverPreview({ theme, size = 'large' }: {theme: Theme | null;size?: 'small' | 'large';}) {
  const dimensions = size === 'large' ? { w: 180, h: 220 } : { w: 120, h: 150 };

  if (!theme) {
    return (
      <div data-ev-id="ev_6d0832baf3"
      className="bg-gray-100 rounded-lg flex items-center justify-center"
      style={{ width: dimensions.w, height: dimensions.h }}>

        <span data-ev-id="ev_fba4a252ed" className="text-gray-400 text-sm">ללא עיצוב</span>
      </div>);

  }

  return (
    <div data-ev-id="ev_a575a6e619" className="relative" style={{ width: dimensions.w + 20, height: dimensions.h + 30 }}>
      {/* Floor shadow */}
      <div data-ev-id="ev_412cf5bfed"
      className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-black/10 rounded-full blur-md"
      style={{ width: dimensions.w * 0.8, height: 12 }} />

      {/* Book with spine */}
      <div data-ev-id="ev_a3053af841" className="relative" style={{ width: dimensions.w, height: dimensions.h }}>
        {/* Spine */}
        <div data-ev-id="ev_dddfd308f6"
        className="absolute top-0 h-full w-3 rounded-l"
        style={{
          left: 0,
          background: `linear-gradient(90deg, ${theme.colors.primary}dd 0%, ${theme.colors.primary} 100%)`,
          boxShadow: 'inset -1px 0 2px rgba(0,0,0,0.2)'
        }} />

        {/* Cover */}
        <div data-ev-id="ev_3748c6adda"
        className="absolute top-0 right-0 rounded-r overflow-hidden shadow-lg"
        style={{
          left: 10,
          height: dimensions.h,
          background: theme.previewGradient,
          border: `1px solid ${theme.colors.primary}33`
        }}>

          {/* Photo area simulation */}
          <div data-ev-id="ev_ffffbeaa15" className="absolute inset-4 rounded bg-white/20 flex items-center justify-center">
            <div data-ev-id="ev_2b80b6cbee"
            className="w-3/4 h-2/3 rounded opacity-60"
            style={{ background: theme.colors.accent }} />

          </div>
          {/* Title area */}
          <div data-ev-id="ev_76015976be" className="absolute bottom-4 left-0 right-0 flex flex-col items-center gap-1">
            <div data-ev-id="ev_b545a39b2d" className="h-2 rounded bg-white/50" style={{ width: '50%' }} />
            <div data-ev-id="ev_7c3aa5da56" className="h-1.5 rounded bg-white/30" style={{ width: '35%' }} />
          </div>
        </div>
        {/* Edge highlight */}
        <div data-ev-id="ev_d8cea8eae1"
        className="absolute top-0 right-0 w-1 h-full bg-white/20 rounded-r" />

      </div>
    </div>);

}

export default function AlbumSetupNew() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, isRTL } = useLanguage();
  const { user } = useAuth();

  const selectedThemeFromGallery = location.state?.selectedTheme as Theme | null;

  const [currentStep, setCurrentStep] = useState(0);
  const [themeCategory, setThemeCategory] = useState('all');

  const [setupState, setSetupState] = useState<SetupState>(() => ({
    themeId: selectedThemeFromGallery?.id || null,
    theme: selectedThemeFromGallery || null,
    sizeId: null,
    size: null,
    bindingId: 'layflat',
    direction: 'rtl',
    pageCount: 24,
    albumName: language === 'he' ? 'האלבום שלי' : 'My Album'
  }));

  // Sync theme index with selected theme
  const categoryThemes = useMemo(() =>
  themeCategory === 'all' ? THEMES : getThemesByCategory(themeCategory),
  [themeCategory]
  );

  const [themeIndex, setThemeIndex] = useState(() => {
    if (selectedThemeFromGallery) {
      const idx = categoryThemes.findIndex((t) => t.id === selectedThemeFromGallery.id);
      return idx >= 0 ? idx : 0;
    }
    return 0;
  });

  // When category changes, find selected theme in new category or reset
  useEffect(() => {
    if (setupState.theme) {
      const idx = categoryThemes.findIndex((t) => t.id === setupState.theme?.id);
      if (idx >= 0) {
        setThemeIndex(idx);
      } else {
        // Theme not in this category, show first theme but don't change selection
        setThemeIndex(0);
      }
    } else {
      setThemeIndex(0);
    }
  }, [themeCategory, categoryThemes, setupState.theme]);

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { returnTo: '/album/new' } });
    }
  }, [user, navigate]);

  const currentBinding = BINDING_TYPES.find((b) => b.id === setupState.bindingId)!;

  useEffect(() => {
    if (setupState.pageCount < currentBinding.min) {
      setSetupState((s) => ({ ...s, pageCount: currentBinding.min }));
    } else if (setupState.pageCount > currentBinding.max) {
      setSetupState((s) => ({ ...s, pageCount: currentBinding.max }));
    }
  }, [setupState.bindingId, currentBinding.min, currentBinding.max, setupState.pageCount]);

  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 0:return true;
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
      navigate('/album/photos', { state: { setupState } });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/album/new', { state: { returnTheme: setupState.theme } });
    }
  };

  const handleClose = () => {
    navigate('/album/new');
  };

  const handleSelectTheme = (theme: Theme | null) => {
    setSetupState((s) => ({ ...s, themeId: theme?.id || null, theme }));
  };

  const handleSelectSize = (size: AlbumSize) => {
    setSetupState((s) => ({ ...s, sizeId: size.id, size }));
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

  // Display theme for step 1 - always show selected theme if exists
  const displayTheme = setupState.theme || categoryThemes[themeIndex] || null;

  if (!user) {
    return (
      <div data-ev-id="ev_abf1f988fe" className="min-h-screen bg-gray-900/80 flex items-center justify-center">
        <div data-ev-id="ev_43b69f818c" className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full" />
      </div>);

  }

  return (
    <div data-ev-id="ev_59b07d2ee0" className="fixed inset-0 z-50 bg-gray-800/90 flex items-center justify-center p-2 sm:p-4">
      {/* Modal - explicit LTR flex so sidebar stays RIGHT regardless of text direction */}
      <motion.div data-ev-id="ev_205a4880dd"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl w-full max-w-[1400px] h-[95vh] flex flex-row overflow-hidden shadow-2xl"
      style={{ direction: 'ltr' }} // Force LTR layout for modal structure
      >
        {/* Main content area - LEFT side, 78% */}
        <div data-ev-id="ev_25ffe6979a" className="flex-[78] flex flex-col relative min-w-0" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
          {/* Close button - visual top-left of main content */}
          <button data-ev-id="ev_126ea1caac"
          onClick={handleClose}
          className="absolute top-4 left-4 z-10 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">

            <X className="w-5 h-5" />
          </button>

          {/* Step content */}
          <div data-ev-id="ev_fdca8a1e5b" className="flex-1 overflow-y-auto px-6 sm:px-12 py-10">
            <AnimatePresence mode="wait">
              {currentStep === 0 &&
              <motion.div data-ev-id="ev_4aa6a18aec"
              key="design"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full flex flex-col items-center">

                  <div data-ev-id="ev_bd88ae6368" className="flex items-center gap-4 mb-2">
                    <div data-ev-id="ev_2a8701d564" className="w-16 h-px bg-gray-300" />
                    <h2 data-ev-id="ev_4d7b96a602" className="text-2xl font-semibold text-gray-800">
                      {language === 'he' ? 'בחרו עיצוב' : 'Choose Design'}
                    </h2>
                    <div data-ev-id="ev_7ecef0906c" className="w-16 h-px bg-gray-300" />
                  </div>
                  <p data-ev-id="ev_0fe2705b6f" className="text-gray-500 text-sm mb-8">
                    {language === 'he' ? 'בחרו עיצוב בסיס לאלבום' : 'Select a base design for your album'}
                  </p>

                  {/* Category tabs */}
                  <div data-ev-id="ev_4b39e13e2f" className="flex gap-2 mb-10 flex-wrap justify-center">
                    {THEME_CATEGORIES.map((cat) =>
                  <button data-ev-id="ev_8809a91ced"
                  key={cat.id}
                  onClick={() => setThemeCategory(cat.id)}
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
                  <div data-ev-id="ev_4959bcb451" className="flex items-center gap-12">
                    <button data-ev-id="ev_0601899393"
                  onClick={() => cycleTheme('prev')}
                  className="w-12 h-12 rounded-full bg-gray-100 text-[#00aa9b] hover:bg-[#00aa9b] hover:text-white flex items-center justify-center transition-colors">

                      {isRTL ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
                    </button>

                    {/* Large cover preview */}
                    <div data-ev-id="ev_f8cc1b2d00"
                  className={`cursor-pointer transition-all ${
                  setupState.theme?.id === displayTheme?.id ? 'ring-4 ring-[#00aa9b] ring-offset-4' : ''} rounded-xl`
                  }
                  onClick={() => displayTheme && handleSelectTheme(displayTheme)}>

                      <CoverPreview theme={displayTheme} size="large" />
                    </div>

                    <button data-ev-id="ev_143e9cbbe7"
                  onClick={() => cycleTheme('next')}
                  className="w-12 h-12 rounded-full bg-gray-100 text-[#00aa9b] hover:bg-[#00aa9b] hover:text-white flex items-center justify-center transition-colors">

                      {isRTL ? <ChevronLeft className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
                    </button>
                  </div>

                  {/* Theme name/description - shows SELECTED theme */}
                  {displayTheme &&
                <div data-ev-id="ev_c84501cfa6" className="text-center mt-8">
                      <h3 data-ev-id="ev_852b32d321" className="text-lg font-semibold text-gray-800">
                        {displayTheme.name[language]}
                      </h3>
                      <p data-ev-id="ev_a1c4846483" className="text-sm text-gray-500 mt-1">
                        {displayTheme.description[language]}
                      </p>
                    </div>
                }

                  {/* Skip design option */}
                  <button data-ev-id="ev_deb1103759"
                onClick={() => handleSelectTheme(null)}
                className={`mt-10 px-8 py-3 rounded-full text-sm font-medium transition-colors ${
                setupState.themeId === null ?
                'bg-gray-800 text-white' :
                'bg-gray-100 text-gray-600 hover:bg-gray-200'}`
                }>

                    {language === 'he' ? 'המשך ללא עיצוב' : 'Continue without design'}
                  </button>
                </motion.div>
              }

              {currentStep === 1 &&
              <motion.div data-ev-id="ev_9f8c56f4c0"
              key="size"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full flex flex-col items-center">

                  <div data-ev-id="ev_96176998fd" className="flex items-center gap-4 mb-2">
                    <div data-ev-id="ev_8874a8f16c" className="w-16 h-px bg-gray-300" />
                    <h2 data-ev-id="ev_6180f327a9" className="text-2xl font-semibold text-gray-800">
                      {language === 'he' ? 'בחרו גודל' : 'Choose Size'}
                    </h2>
                    <div data-ev-id="ev_5bd4b6e1d8" className="w-16 h-px bg-gray-300" />
                  </div>
                  <p data-ev-id="ev_2bc7032515" className="text-gray-500 text-sm mb-10">
                    {language === 'he' ? 'בחרו את גודל האלבום' : 'Select the album size'}
                  </p>

                  {/* 3x2 size grid - matching reference */}
                  <div data-ev-id="ev_7470839ef8" className="grid grid-cols-3 gap-6 max-w-3xl">
                    {ALBUM_SIZES.slice(0, 6).map((size) => {
                    const isSelected = setupState.sizeId === size.id;
                    // Calculate proportional preview
                    const maxDim = 80;
                    const ratio = size.widthCm / size.heightCm;
                    const previewW = ratio >= 1 ? maxDim : maxDim * ratio;
                    const previewH = ratio >= 1 ? maxDim / ratio : maxDim;

                    return (
                      <button data-ev-id="ev_b7569ec4a4"
                      key={size.id}
                      onClick={() => handleSelectSize(size)}
                      className={`relative p-6 rounded-2xl border-2 transition-all hover:shadow-lg bg-white ${
                      isSelected ?
                      'border-[#00aa9b] shadow-lg' :
                      'border-gray-200 hover:border-gray-300'}`
                      }
                      style={{ minHeight: 180 }}>

                          {/* Proportional album preview shape */}
                          <div data-ev-id="ev_671f179475" className="flex justify-center items-center mb-6" style={{ height: 90 }}>
                            <div data-ev-id="ev_30c912f01f"
                          className="rounded-sm shadow-md relative"
                          style={{
                            width: previewW,
                            height: previewH,
                            background: setupState.theme?.previewGradient || 'linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)'
                          }}>

                              {/* Inner photo area hint */}
                              <div data-ev-id="ev_ca0da738cf" className="absolute inset-2 rounded-sm bg-white/30" />
                            </div>
                          </div>
                          
                          {/* Size caption - below tile */}
                          <div data-ev-id="ev_96880ce72b" className="text-center">
                            <div data-ev-id="ev_1b81024560" className="font-semibold text-gray-800">
                              {size.widthCm}×{size.heightCm} {language === 'he' ? 'ס"מ' : 'cm'}
                            </div>
                            <div data-ev-id="ev_5b0ea0c1d6" className="text-xs text-gray-500 mt-1">
                              {size.name[language]}
                            </div>
                          </div>
                          
                          {/* Magnifier in corner */}
                          <div data-ev-id="ev_b73a7c3088" className="absolute bottom-3 left-3 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                            <Search className="w-3.5 h-3.5 text-gray-400" />
                          </div>
                          
                          {/* Selected indicator */}
                          {isSelected &&
                        <div data-ev-id="ev_56fd9a3e50" className="absolute top-3 right-3 w-6 h-6 bg-[#00aa9b] rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                        }
                        </button>);

                  })}
                  </div>
                </motion.div>
              }

              {currentStep === 2 &&
              <motion.div data-ev-id="ev_513ef20ede"
              key="binding"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full flex flex-col items-center">

                  <div data-ev-id="ev_9e75fabb10" className="flex items-center gap-4 mb-2">
                    <div data-ev-id="ev_5932f265cd" className="w-16 h-px bg-gray-300" />
                    <h2 data-ev-id="ev_78097df5f7" className="text-2xl font-semibold text-gray-800">
                      {language === 'he' ? 'בחרו סוג כריכה' : 'Choose Binding'}
                    </h2>
                    <div data-ev-id="ev_121f8eaa55" className="w-16 h-px bg-gray-300" />
                  </div>
                  <p data-ev-id="ev_6e57f84f1a" className="text-gray-500 text-sm mb-10">
                    {language === 'he' ? 'בחרו את סוג הכריכה לאלבום' : 'Select the binding type'}
                  </p>

                  {/* 3 binding cards */}
                  <div data-ev-id="ev_01188f3580" className="flex gap-6 max-w-4xl w-full">
                    {BINDING_TYPES.map((binding) => {
                    const isSelected = setupState.bindingId === binding.id;
                    return (
                      <button data-ev-id="ev_3791254535"
                      key={binding.id}
                      onClick={() => handleSelectBinding(binding.id)}
                      className={`flex-1 p-8 rounded-2xl border-2 transition-all hover:shadow-lg ${
                      isSelected ?
                      'border-[#00aa9b] bg-[#00aa9b]/5 shadow-lg' :
                      'border-gray-200 hover:border-gray-300'}`
                      }>

                          {/* Icon */}
                          <div data-ev-id="ev_397472272b" className="flex justify-center mb-5">
                            <div data-ev-id="ev_eab2f504be" className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center">
                              <BookOpen className="w-8 h-8 text-gray-600" strokeWidth={1.5} />
                            </div>
                          </div>
                          <h3 data-ev-id="ev_48e29ecc0c" className="font-semibold text-gray-800 text-center text-lg mb-2">
                            {binding.name[language]}
                          </h3>
                          <p data-ev-id="ev_0e5ea12450" className="text-sm text-gray-500 text-center mb-4">
                            {binding.description[language]}
                          </p>
                          <p data-ev-id="ev_dd4b37f097" className="text-sm font-semibold text-[#00aa9b] text-center">
                            {binding.pages[language]}
                          </p>
                        </button>);

                  })}
                  </div>
                </motion.div>
              }

              {currentStep === 3 &&
              <motion.div data-ev-id="ev_48dcec46b2"
              key="direction"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full flex flex-col items-center">

                  <div data-ev-id="ev_427831ce67" className="flex items-center gap-4 mb-2">
                    <div data-ev-id="ev_ca758a5e09" className="w-16 h-px bg-gray-300" />
                    <h2 data-ev-id="ev_34ad883b0c" className="text-2xl font-semibold text-gray-800">
                      {language === 'he' ? 'בחרו כיוון פתיחה' : 'Choose Opening Direction'}
                    </h2>
                    <div data-ev-id="ev_1a66883ef2" className="w-16 h-px bg-gray-300" />
                  </div>
                  <p data-ev-id="ev_bc0fc1f069" className="text-gray-500 text-sm mb-10">
                    {language === 'he' ? 'בחרו את כיוון פתיחת האלבום' : 'Select how the album opens'}
                  </p>

                  {/* Direction cards */}
                  <div data-ev-id="ev_c74be925f7" className="flex gap-8 max-w-2xl w-full">
                    <button data-ev-id="ev_56c59e237b"
                  onClick={() => handleSelectDirection('rtl')}
                  className={`flex-1 p-10 rounded-2xl border-2 transition-all hover:shadow-lg ${
                  setupState.direction === 'rtl' ?
                  'border-[#00aa9b] bg-[#00aa9b]/5 shadow-lg' :
                  'border-gray-200 hover:border-gray-300'}`
                  }>

                      <div data-ev-id="ev_b7628a2e45" className="flex justify-center mb-6">
                        <div data-ev-id="ev_b637dde945" className="relative w-24 h-20">
                          <div data-ev-id="ev_7da77c05c4" className="absolute right-0 w-12 h-20 bg-gray-300 rounded-l shadow" />
                          <div data-ev-id="ev_902018931d" className="absolute left-0 w-12 h-20 bg-gray-200 rounded-r" />
                          <div data-ev-id="ev_5cf49a262e" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#00aa9b] flex items-center justify-center">
                            <ChevronLeft className="w-5 h-5 text-white" />
                          </div>
                        </div>
                      </div>
                      <h3 data-ev-id="ev_24505892c2" className="font-semibold text-gray-800 text-center text-lg mb-2">
                        {language === 'he' ? 'מימין לשמאל' : 'Right to Left'}
                      </h3>
                      <p data-ev-id="ev_5d5c247a7f" className="text-sm text-gray-500 text-center">
                        {language === 'he' ? 'מומלץ לעברית ושפות RTL' : 'Recommended for Hebrew'}
                      </p>
                    </button>

                    <button data-ev-id="ev_a12e9cad98"
                  onClick={() => handleSelectDirection('ltr')}
                  className={`flex-1 p-10 rounded-2xl border-2 transition-all hover:shadow-lg ${
                  setupState.direction === 'ltr' ?
                  'border-[#00aa9b] bg-[#00aa9b]/5 shadow-lg' :
                  'border-gray-200 hover:border-gray-300'}`
                  }>

                      <div data-ev-id="ev_c9aa33aeda" className="flex justify-center mb-6">
                        <div data-ev-id="ev_aadfcf2dc1" className="relative w-24 h-20">
                          <div data-ev-id="ev_9d0c6cade3" className="absolute left-0 w-12 h-20 bg-gray-300 rounded-r shadow" />
                          <div data-ev-id="ev_5e3e31b289" className="absolute right-0 w-12 h-20 bg-gray-200 rounded-l" />
                          <div data-ev-id="ev_3f250e7da6" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#00aa9b] flex items-center justify-center">
                            <ChevronRight className="w-5 h-5 text-white" />
                          </div>
                        </div>
                      </div>
                      <h3 data-ev-id="ev_32a6683ddb" className="font-semibold text-gray-800 text-center text-lg mb-2">
                        {language === 'he' ? 'משמאל לימין' : 'Left to Right'}
                      </h3>
                      <p data-ev-id="ev_2131d8d3f8" className="text-sm text-gray-500 text-center">
                        {language === 'he' ? 'מומלץ לאנגלית ושפות LTR' : 'Recommended for English'}
                      </p>
                    </button>
                  </div>
                </motion.div>
              }
            </AnimatePresence>
          </div>
        </div>

        {/* Sidebar - RIGHT side, 22% - always visually on right */}
        <div data-ev-id="ev_4c123ce31b"
        className="w-72 lg:w-80 bg-gray-50 border-l border-gray-200 flex flex-col flex-shrink-0"
        style={{ direction: isRTL ? 'rtl' : 'ltr' }}>

          {/* Album name input */}
          <div data-ev-id="ev_46efb2fcc4" className="p-5 border-b border-gray-200">
            <label data-ev-id="ev_a10704423f" className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'he' ? 'שם האלבום' : 'Album Name'}
            </label>
            <input data-ev-id="ev_a91c9badc5"
            type="text"
            value={setupState.albumName}
            onChange={(e) => setSetupState((s) => ({ ...s, albumName: e.target.value }))}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:border-[#00aa9b] focus:ring-1 focus:ring-[#00aa9b] outline-none"
            placeholder={language === 'he' ? 'הזינו שם...' : 'Enter name...'} />

          </div>

          {/* Progress steps - compact, no scroll needed */}
          <div data-ev-id="ev_7196276c21" className="flex-1">
            {STEPS.map((step, idx) =>
            <div data-ev-id="ev_f31b986141" key={step.id}>
                <button data-ev-id="ev_3b39d912d1"
              onClick={() => idx <= currentStep && setCurrentStep(idx)}
              disabled={idx > currentStep}
              className={`w-full px-5 py-3.5 flex items-center gap-3 transition-colors ${
              idx === currentStep ?
              'bg-[#00aa9b] text-white' :
              idx < currentStep ?
              'bg-white text-gray-700 hover:bg-gray-100' :
              'bg-gray-100/50 text-gray-400'}`
              }>

                  <span data-ev-id="ev_2bf4f54d10"
                className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                idx === currentStep ?
                'bg-white/20' :
                idx < currentStep ?
                'bg-[#00aa9b] text-white' :
                'bg-gray-200'}`
                }>

                    {idx < currentStep ? <Check className="w-4 h-4" /> : step.number}
                  </span>
                  <span data-ev-id="ev_5f769b4bd6" className="font-medium text-sm">{step.label[language]}</span>
                </button>
                {idx < STEPS.length - 1 &&
              <div data-ev-id="ev_dcea1cada1" className="flex justify-center py-0.5">
                    <ChevronDown className="w-4 h-4 text-gray-300" />
                  </div>
              }
              </div>
            )}
          </div>

          {/* Page count control - compact */}
          <div data-ev-id="ev_55fd4e0094" className="p-5 border-t border-gray-200">
            <label data-ev-id="ev_1cea188867" className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'he' ? 'מספר עמודים' : 'Page Count'}
            </label>
            <div data-ev-id="ev_87787ae72a" className="flex items-center justify-center gap-3">
              <button data-ev-id="ev_e0866b2bf4"
              onClick={() => handlePageCountChange(-2)}
              disabled={setupState.pageCount <= currentBinding.min}
              className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed">

                <Minus className="w-4 h-4" />
              </button>
              <span data-ev-id="ev_44f0f45cdc" className="text-xl font-bold text-gray-800 w-12 text-center">
                {setupState.pageCount}
              </span>
              <button data-ev-id="ev_a30e414014"
              onClick={() => handlePageCountChange(2)}
              disabled={setupState.pageCount >= currentBinding.max}
              className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed">

                <Plus className="w-4 h-4" />
              </button>
            </div>
            <p data-ev-id="ev_97b62f0a4a" className="text-xs text-gray-500 text-center mt-1">
              {currentBinding.pages[language]}
            </p>
          </div>

          {/* Current selections summary - compact */}
          <div data-ev-id="ev_3052cc9e1a" className="px-5 py-3 border-t border-gray-200 text-xs text-gray-500 space-y-0.5">
            {setupState.theme &&
            <div data-ev-id="ev_a64ca052b1">{language === 'he' ? 'עיצוב' : 'Design'}: {setupState.theme.name[language]}</div>
            }
            {setupState.size &&
            <div data-ev-id="ev_15abe740a3">{language === 'he' ? 'גודל' : 'Size'}: {setupState.size.widthCm}×{setupState.size.heightCm}</div>
            }
            <div data-ev-id="ev_2662e17c7c">{language === 'he' ? 'כריכה' : 'Binding'}: {BINDING_TYPES.find((b) => b.id === setupState.bindingId)?.name[language]}</div>
          </div>

          {/* Continue CTA */}
          <div data-ev-id="ev_6396346fc8" className="p-5 border-t border-gray-200">
            <button data-ev-id="ev_52c98192c0"
            onClick={handleNext}
            disabled={!canProceed()}
            className="w-full py-3.5 bg-[#00aa9b] text-white font-semibold rounded-full hover:bg-[#009688] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">

              {currentStep === STEPS.length - 1 ?
              language === 'he' ? 'בואו נתחיל' : "Let's Start" :
              language === 'he' ? 'המשך' : 'Continue'}
            </button>
            {currentStep > 0 &&
            <button data-ev-id="ev_e1e6b558fe"
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