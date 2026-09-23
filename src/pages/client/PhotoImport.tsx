/**
 * Photo Import Page - Screen C
 * White page with source icons and placement options
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Upload, Smartphone, Image as ImageIcon, Cloud, X, Check, Loader2, ArrowRight, ArrowLeft, Wand2, Hand, SortAsc, Calendar, FileText, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { THEMES, Theme } from '@/lib/themes';
import { AlbumSize, ALBUM_SIZES } from '@/lib/albumSizes';

// Photo source options
const PHOTO_SOURCES = [
{
  id: 'computer',
  name: { he: 'מהמחשב', en: 'From Computer' },
  icon: Upload,
  available: true
},
{
  id: 'phone',
  name: { he: 'מהטלפון', en: 'From Phone' },
  description: { he: 'שלח קישור ב-SMS', en: 'Send link via SMS' },
  icon: Smartphone,
  available: false
},
{
  id: 'google',
  name: { he: 'Google Photos', en: 'Google Photos' },
  icon: Cloud,
  available: false
},
{
  id: 'dropbox',
  name: { he: 'Dropbox', en: 'Dropbox' },
  icon: Cloud,
  available: false
}];


// Sort options for auto-placement
const SORT_OPTIONS = [
{ id: 'input', name: { he: 'לפי סדר העלאה', en: 'Upload order' }, icon: ArrowRight },
{ id: 'filename', name: { he: 'שם קובץ', en: 'Filename' }, icon: FileText },
{ id: 'date', name: { he: 'תאריך צילום', en: 'Date taken' }, icon: Calendar }];


interface UploadedPhoto {
  id: string;
  file: File;
  url: string;
  status: 'uploading' | 'done' | 'error';
  progress: number;
  width?: number;
  height?: number;
}

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

export default function PhotoImport() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, isRTL } = useLanguage();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get setup state from previous page
  const setupState = location.state?.setupState as SetupState | undefined;

  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showPlacementModal, setShowPlacementModal] = useState(false);
  const [sortOption, setSortOption] = useState('input');
  const [photosPerPage, setPhotosPerPage] = useState(4);
  const [placementMode, setPlacementMode] = useState<'manual' | 'automatic' | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if no setup state or not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { returnTo: '/album/new' } });
    } else if (!setupState) {
      navigate('/album/new');
    }
  }, [user, setupState, navigate]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    setError(null);

    // Process files
    const newPhotos: UploadedPhoto[] = files.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      url: URL.createObjectURL(file),
      status: 'uploading' as const,
      progress: 0
    }));

    setPhotos((prev) => [...prev, ...newPhotos]);

    // Get dimensions for each photo
    for (const photo of newPhotos) {
      const img = new window.Image();
      img.onload = () => {
        setPhotos((prev) =>
        prev.map((p) =>
        p.id === photo.id ?
        { ...p, width: img.naturalWidth, height: img.naturalHeight, status: 'done', progress: 100 } :
        p
        )
        );
      };
      img.onerror = () => {
        setPhotos((prev) =>
        prev.map((p) => p.id === photo.id ? { ...p, status: 'error' } : p)
        );
      };
      img.src = photo.url;
    }

    setIsUploading(false);
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleRemovePhoto = (id: string) => {
    setPhotos((prev) => {
      const photo = prev.find((p) => p.id === id);
      if (photo) {
        URL.revokeObjectURL(photo.url);
      }
      return prev.filter((p) => p.id !== id);
    });
  };

  const handleChoosePlacement = (mode: 'manual' | 'automatic') => {
    setPlacementMode(mode);
    if (mode === 'automatic') {
      setShowPlacementModal(true);
    } else {
      handleCreateAlbum('manual');
    }
  };

  const handleCreateAlbum = async (mode: 'manual' | 'automatic') => {
    if (!supabase || !user || !setupState?.size) {
      setError(language === 'he' ? 'חסרים נתונים נדרשים' : 'Missing required data');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const size = setupState.size || ALBUM_SIZES[0];
      const theme = setupState.theme || THEMES[0];

      // Create project
      const { data: project, error: projectError } = await supabase.
      from('projects').
      insert({
        client_id: user.id,
        created_by: user.id,
        name: setupState.albumName || `${theme.name[language]} Album`,
        album_type: theme.category,
        page_count: setupState.pageCount,
        status: 'draft',
        settings: {
          sizeId: setupState.sizeId,
          width: size.width,
          height: size.height,
          spreadWidth: size.spreadWidth,
          spreadHeight: size.spreadHeight,
          canvasWidth: size.spreadWidth,
          canvasHeight: size.spreadHeight,
          dpi: size.dpi,
          direction: setupState.direction,
          themeId: setupState.themeId,
          bindingType: setupState.bindingId,
          placementMode: mode
        }
      }).
      select().
      single();

      if (projectError) throw projectError;

      // Create spreads
      const spreadCount = Math.ceil(setupState.pageCount / 2) + 1; // +1 for cover
      const spreadsToInsert = [];

      for (let i = 0; i < spreadCount; i++) {
        const isCover = i === 0;
        const pageNumber = isCover ? 0 : (i - 1) * 2 + 1;
        const background = isCover ?
        theme.backgroundPatterns[0] || theme.colors.primary :
        theme.backgroundPatterns[i % theme.backgroundPatterns.length] || theme.colors.background;

        spreadsToInsert.push({
          project_id: project.id,
          spread_index: i,
          is_cover: isCover,
          page_number: pageNumber,
          background_color: background,
          elements: []
        });
      }

      const { error: spreadsError } = await supabase.
      from('spreads').
      insert(spreadsToInsert);

      if (spreadsError) throw spreadsError;

      // Upload photos to storage
      const uploadedPhotos = [];
      for (const photo of photos.filter((p) => p.status === 'done')) {
        const fileExt = photo.file.name.split('.').pop() || 'jpg';
        const fileName = `${user.id}/${project.id}/${photo.id}.${fileExt}`;

        const { error: uploadError } = await supabase.storage.
        from('client-photos').
        upload(fileName, photo.file);

        if (!uploadError) {
          const { data: urlData } = supabase.storage.
          from('client-photos').
          getPublicUrl(fileName);

          uploadedPhotos.push({
            project_id: project.id,
            client_id: user.id,
            storage_path: fileName,
            public_url: urlData.publicUrl,
            original_filename: photo.file.name,
            width: photo.width || 0,
            height: photo.height || 0,
            file_size: photo.file.size
          });
        }
      }

      if (uploadedPhotos.length > 0) {
        await supabase.from('client_photos').insert(uploadedPhotos);
      }

      // Navigate to editor
      navigate(`/editor/${project.id}`, {
        state: {
          setupData: {
            ...setupState,
            photos: uploadedPhotos,
            placementMode: mode
          },
          isNewAlbum: true,
          autoPlace: mode === 'automatic',
          sortOption: mode === 'automatic' ? sortOption : undefined,
          photosPerPage: mode === 'automatic' ? photosPerPage : undefined
        }
      });
    } catch (err: unknown) {
      console.error('Error creating album:', err);
      const errorMessage = err instanceof Error ? err.message : '';
      setError(errorMessage || (language === 'he' ? 'שגיאה ביצירת האלבום' : 'Error creating album'));
    } finally {
      setIsCreating(false);
    }
  };

  const donePhotos = photos.filter((p) => p.status === 'done');
  const estimatedPages = Math.ceil(donePhotos.length / photosPerPage);

  if (!user || !setupState) {
    return (
      <div data-ev-id="ev_78efd2b072" className="min-h-screen bg-white flex items-center justify-center">
        <div data-ev-id="ev_14d8355722" className="animate-spin w-8 h-8 border-2 border-[#00aa9b] border-t-transparent rounded-full" />
      </div>);

  }

  return (
    <div data-ev-id="ev_393d3084be" className="min-h-screen bg-white" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header data-ev-id="ev_c018a24a61" className="py-6 border-b border-gray-100">
        <div data-ev-id="ev_fc22b6de14" className="max-w-4xl mx-auto px-6 flex items-center justify-between">
          <button data-ev-id="ev_01ccbae407"
          onClick={() => navigate('/album/setup', { state: { selectedTheme: setupState.theme } })}
          className="text-gray-500 hover:text-gray-700 text-sm flex items-center gap-1">

            {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            {language === 'he' ? 'חזרה' : 'Back'}
          </button>
          <h1 data-ev-id="ev_d55edbe72f" className="text-lg font-medium text-gray-800">
            {setupState.albumName}
          </h1>
          <div data-ev-id="ev_c4fbba8269" className="w-16" />
        </div>
      </header>

      {/* Main content */}
      <main data-ev-id="ev_ee59379f09" className="py-16">
        {photos.length === 0 ?
        // Import sources view
        <div data-ev-id="ev_278114d028" className="max-w-4xl mx-auto px-6">
            <div data-ev-id="ev_99cd7422da" className="text-center mb-16">
              <h1 data-ev-id="ev_5f467145cd" className="text-3xl font-bold text-gray-900 mb-3">
                {language === 'he' ? 'הוסיפו תמונות' : 'Add Photos'}
              </h1>
              <p data-ev-id="ev_a884cc914d" className="text-gray-500">
                {language === 'he' ?
              'בחרו מאיפה להוסיף תמונות' :
              'Choose where to add photos from'}
              </p>
            </div>

            {/* Source icons row */}
            <div data-ev-id="ev_45b2ebcfa6" className="flex justify-center gap-12">
              {PHOTO_SOURCES.map((source) => {
              const Icon = source.icon;
              return (
                <button data-ev-id="ev_004a87a965"
                key={source.id}
                onClick={() => source.available && fileInputRef.current?.click()}
                disabled={!source.available}
                className={`flex flex-col items-center gap-4 p-6 rounded-2xl transition-all ${
                source.available ?
                'hover:bg-gray-50 cursor-pointer' :
                'opacity-50 cursor-not-allowed'}`
                }>

                    <div data-ev-id="ev_77cc6c261f" className={`w-20 h-20 rounded-2xl flex items-center justify-center ${
                  source.available ?
                  'bg-[#00aa9b]/10 text-[#00aa9b]' :
                  'bg-gray-100 text-gray-400'}`
                  }>
                      <Icon className="w-10 h-10" strokeWidth={1.5} />
                    </div>
                    <div data-ev-id="ev_3d4991eddc" className="text-center">
                      <div data-ev-id="ev_17c77feafc" className={`font-medium ${
                    source.available ? 'text-gray-800' : 'text-gray-400'}`
                    }>
                        {source.name[language]}
                      </div>
                      {source.description &&
                    <div data-ev-id="ev_a4ca9109bb" className="text-xs text-gray-400 mt-1">
                          {source.description[language]}
                        </div>
                    }
                      {!source.available &&
                    <div data-ev-id="ev_53612c7fbc" className="text-xs text-gray-400 mt-1">
                          {language === 'he' ? 'בקרוב' : 'Coming soon'}
                        </div>
                    }
                    </div>
                  </button>);

            })}
            </div>

            {/* Hidden file input */}
            <input data-ev-id="ev_c94a232227"
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden" />

          </div> :

        // Photos grid and placement choice
        <div data-ev-id="ev_95ab166714" className="max-w-5xl mx-auto px-6">
            <div data-ev-id="ev_e88bd086ff" className="text-center mb-8">
              <h2 data-ev-id="ev_ab872f002c" className="text-2xl font-bold text-gray-900 mb-2">
                {language === 'he' ?
              `${donePhotos.length} תמונות נבחרו` :
              `${donePhotos.length} photos selected`}
              </h2>
              <button data-ev-id="ev_cd0c1351ea"
            onClick={() => fileInputRef.current?.click()}
            className="text-[#00aa9b] hover:underline text-sm">

                {language === 'he' ? 'הוסף עוד' : 'Add more'}
              </button>
            </div>

            {/* Photos grid */}
            <div data-ev-id="ev_af1648b8fe" className="grid grid-cols-6 gap-3 mb-12">
              {photos.map((photo) =>
            <div data-ev-id="ev_166ce3882a"
            key={photo.id}
            className="aspect-square relative rounded-lg overflow-hidden bg-gray-100 group">

                  <img data-ev-id="ev_cc192c9aa9"
              src={photo.url}
              alt=""
              className="w-full h-full object-cover" />

                  {photo.status === 'uploading' &&
              <div data-ev-id="ev_2de050fa96" className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    </div>
              }
                  {photo.status === 'error' &&
              <div data-ev-id="ev_060741af24" className="absolute inset-0 bg-red-500/50 flex items-center justify-center">
                      <X className="w-6 h-6 text-white" />
                    </div>
              }
                  <button data-ev-id="ev_f576a2f004"
              onClick={() => handleRemovePhoto(photo.id)}
              className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">

                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
            )}
            </div>

            {/* Hidden file input */}
            <input data-ev-id="ev_ae497add3e"
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden" />


            {/* Placement choice */}
            <div data-ev-id="ev_85db8cfc5b" className="max-w-2xl mx-auto">
              <h3 data-ev-id="ev_666069b09a" className="text-lg font-semibold text-gray-800 text-center mb-6">
                {language === 'he' ? 'איך לסדר את התמונות?' : 'How to arrange the photos?'}
              </h3>

              <div data-ev-id="ev_52b1c0eb39" className="flex gap-6">
                <button data-ev-id="ev_f4e2ae71be"
              onClick={() => handleChoosePlacement('automatic')}
              disabled={isCreating}
              className="flex-1 p-6 rounded-xl border-2 border-gray-200 hover:border-[#00aa9b] hover:bg-[#00aa9b]/5 transition-all text-center group">

                  <div data-ev-id="ev_a06d4cab02" className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#00aa9b]/10 text-[#00aa9b] flex items-center justify-center group-hover:bg-[#00aa9b] group-hover:text-white transition-colors">
                    <Wand2 className="w-7 h-7" />
                  </div>
                  <h4 data-ev-id="ev_c30292b609" className="font-semibold text-gray-800 mb-1">
                    {language === 'he' ? 'סידור אוטומטי' : 'Automatic'}
                  </h4>
                  <p data-ev-id="ev_d1ef6b83fd" className="text-sm text-gray-500">
                    {language === 'he' ?
                  'המערכת תסדר את התמונות באופן אופטימלי' :
                  'Let us arrange your photos optimally'}
                  </p>
                </button>

                <button data-ev-id="ev_e07513ae10"
              onClick={() => handleChoosePlacement('manual')}
              disabled={isCreating}
              className="flex-1 p-6 rounded-xl border-2 border-gray-200 hover:border-[#00aa9b] hover:bg-[#00aa9b]/5 transition-all text-center group">

                  <div data-ev-id="ev_f3aa335cd3" className="w-14 h-14 mx-auto mb-4 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center group-hover:bg-[#00aa9b] group-hover:text-white transition-colors">
                    <Hand className="w-7 h-7" />
                  </div>
                  <h4 data-ev-id="ev_a8a44a3a3d" className="font-semibold text-gray-800 mb-1">
                    {language === 'he' ? 'סידור ידני' : 'Manual'}
                  </h4>
                  <p data-ev-id="ev_ece0f3c11b" className="text-sm text-gray-500">
                    {language === 'he' ?
                  'אני אסדר את התמונות בעצמי' :
                  'I\'ll arrange photos myself'}
                  </p>
                </button>
              </div>

              {isCreating &&
            <div data-ev-id="ev_035c29e585" className="flex items-center justify-center gap-3 mt-8 text-[#00aa9b]">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span data-ev-id="ev_f99dfebe47">{language === 'he' ? 'יוצר אלבום...' : 'Creating album...'}</span>
                </div>
            }

              {error &&
            <div data-ev-id="ev_cf40eda24a" className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg text-center">
                  {error}
                </div>
            }
            </div>
          </div>
        }
      </main>

      {/* Auto-placement modal */}
      <AnimatePresence>
        {showPlacementModal &&
        <motion.div data-ev-id="ev_5205d517bb"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        onClick={() => setShowPlacementModal(false)}>

            <motion.div data-ev-id="ev_8da64e03ce"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

              {/* Modal header */}
              <div data-ev-id="ev_d9abee463f" className="p-6 border-b border-gray-100">
                <h3 data-ev-id="ev_d269265c21" className="text-xl font-semibold text-gray-800">
                  {language === 'he' ? 'הגדרות סידור אוטומטי' : 'Auto-arrangement Settings'}
                </h3>
              </div>

              {/* Modal content */}
              <div data-ev-id="ev_04fff6e01b" className="p-6">
                <div data-ev-id="ev_5029ad65f1" className="flex gap-8">
                  {/* Sort options */}
                  <div data-ev-id="ev_091bc637a7" className="flex-1">
                    <label data-ev-id="ev_80c7857ccd" className="block text-sm font-medium text-gray-700 mb-3">
                      {language === 'he' ? 'מיין תמונות לפי' : 'Sort photos by'}
                    </label>
                    <div data-ev-id="ev_49167237a5" className="space-y-2">
                      {SORT_OPTIONS.map((option) => {
                      const Icon = option.icon;
                      return (
                        <button data-ev-id="ev_5b59031928"
                        key={option.id}
                        onClick={() => setSortOption(option.id)}
                        className={`w-full px-4 py-3 rounded-lg text-right flex items-center gap-3 transition-colors ${
                        sortOption === option.id ?
                        'bg-[#00aa9b] text-white' :
                        'bg-gray-100 text-gray-700 hover:bg-gray-200'}`
                        }>

                            <Icon className="w-4 h-4" />
                            <span data-ev-id="ev_e6430bf2a2" className="text-sm">{option.name[language]}</span>
                          </button>);

                    })}
                    </div>
                  </div>

                  {/* Photos per page */}
                  <div data-ev-id="ev_b17bfe9b16" className="flex-1">
                    <label data-ev-id="ev_c428fe2a56" className="block text-sm font-medium text-gray-700 mb-3">
                      {language === 'he' ? 'תמונות לעמוד' : 'Photos per page'}
                    </label>
                    <input data-ev-id="ev_8f78757f59"
                  type="range"
                  min={1}
                  max={8}
                  value={photosPerPage}
                  onChange={(e) => setPhotosPerPage(Number(e.target.value))}
                  className="w-full accent-[#00aa9b]" />

                    <div data-ev-id="ev_06957a5a11" className="flex justify-between text-sm text-gray-500 mt-2">
                      <span data-ev-id="ev_167c1958b1">1</span>
                      <span data-ev-id="ev_83154754ba" className="font-semibold text-[#00aa9b]">{photosPerPage}</span>
                      <span data-ev-id="ev_1a7ae551e8">8</span>
                    </div>

                    {/* Estimated pages */}
                    <div data-ev-id="ev_860b38adab" className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <div data-ev-id="ev_fd4b742fbe" className="text-sm text-gray-600">
                        {language === 'he' ? 'עמודים משוערים' : 'Estimated pages'}
                      </div>
                      <div data-ev-id="ev_d69f2045a8" className="text-2xl font-bold text-gray-800">
                        {estimatedPages}
                      </div>
                      <div data-ev-id="ev_5a55b81586" className="text-xs text-gray-500">
                        {language === 'he' ?
                      `${donePhotos.length} תמונות × ${photosPerPage} לעמוד` :
                      `${donePhotos.length} photos × ${photosPerPage} per page`}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal footer */}
              <div data-ev-id="ev_a0cb348b22" className="p-6 border-t border-gray-100 flex gap-3">
                <button data-ev-id="ev_bfb3d1c8dc"
              onClick={() => setShowPlacementModal(false)}
              className="flex-1 py-3 rounded-full border border-gray-300 text-gray-700 font-medium hover:bg-gray-50">

                  {language === 'he' ? 'ביטול' : 'Cancel'}
                </button>
                <button data-ev-id="ev_a80accea11"
              onClick={() => {
                setShowPlacementModal(false);
                handleCreateAlbum('automatic');
              }}
              disabled={isCreating}
              className="flex-1 py-3 rounded-full bg-[#00aa9b] text-white font-semibold hover:bg-[#009688] disabled:opacity-50">

                  {isCreating ?
                <Loader2 className="w-5 h-5 animate-spin mx-auto" /> :

                language === 'he' ? 'התחל' : 'Start'
                }
                </button>
              </div>
            </motion.div>
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}