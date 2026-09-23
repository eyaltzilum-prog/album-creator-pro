/**
 * Album Setup Wizard
 * 7-step customer journey: Size → Pages → Direction → Theme → Photos → Placement → Editor
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  BookOpen,
  Layers,
  ArrowLeftRight,
  Palette,
  Upload,
  Wand2,
  Image,
  X,
  AlertCircle,
  Loader2,
  Plus,
  Trash2 } from
'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { ALBUM_SIZES, VALID_PAGE_COUNTS, getAlbumSizeById, type AlbumSize } from '@/lib/albumSizes';
import { THEMES, THEME_CATEGORIES, getThemeById, type Theme } from '@/lib/themes';
import { type AlbumSetupData, type UploadedPhoto, type ReadingDirection, type PlacementMode, DEFAULT_SETUP_DATA } from '@/types/album';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

const STEPS = [
{ id: 'size', icon: BookOpen, label: { he: 'גודל', en: 'Size' } },
{ id: 'pages', icon: Layers, label: { he: 'עמודים', en: 'Pages' } },
{ id: 'direction', icon: ArrowLeftRight, label: { he: 'כיוון', en: 'Direction' } },
{ id: 'theme', icon: Palette, label: { he: 'עיצוב', en: 'Theme' } },
{ id: 'photos', icon: Image, label: { he: 'תמונות', en: 'Photos' } },
{ id: 'placement', icon: Wand2, label: { he: 'סידור', en: 'Placement' } }];


export default function AlbumSetup() {
  const navigate = useNavigate();
  const { t, language, isRTL } = useLanguage();
  const { user, profile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentStep, setCurrentStep] = useState(0);
  const [setupData, setSetupData] = useState<AlbumSetupData>(DEFAULT_SETUP_DATA);
  const [themeCategory, setThemeCategory] = useState('all');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingCount, setUploadingCount] = useState(0);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const updateSetup = useCallback((updates: Partial<AlbumSetupData>) => {
    setSetupData((prev) => ({ ...prev, ...updates }));
  }, []);

  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 0:return !!setupData.sizeId;
      case 1:return setupData.pageCount >= 10 && setupData.pageCount <= 100;
      case 2:return !!setupData.direction;
      case 3:return !!setupData.themeId;
      case 4:return setupData.photos.length > 0;
      case 5:return !!setupData.placementMode;
      default:return true;
    }
  }, [currentStep, setupData]);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1 && canProceed()) {
      setCurrentStep((prev) => prev + 1);
    } else if (currentStep === STEPS.length - 1) {
      handleCreateAlbum();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Photo upload handling
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newPhotos: UploadedPhoto[] = [];
    setUploadingCount(files.length);

    for (const file of files) {
      const id = uuidv4();
      const reader = new FileReader();

      const photo: UploadedPhoto = {
        id,
        file,
        dataUrl: '',
        thumbnailUrl: '',
        width: 0,
        height: 0,
        name: file.name,
        size: file.size,
        uploadProgress: 0,
        uploadStatus: 'pending',
        usedOnPages: []
      };

      // Read file as data URL
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        const img = new window.Image();
        img.onload = () => {
          photo.dataUrl = dataUrl;
          photo.thumbnailUrl = dataUrl;
          photo.width = img.width;
          photo.height = img.height;
          photo.uploadStatus = 'complete';
          photo.uploadProgress = 100;

          setSetupData((prev) => ({
            ...prev,
            photos: [...prev.photos, photo]
          }));
          setUploadingCount((prev) => Math.max(0, prev - 1));
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePhoto = (photoId: string) => {
    setSetupData((prev) => ({
      ...prev,
      photos: prev.photos.filter((p) => p.id !== photoId)
    }));
  };

  // Create album and navigate to editor
  const handleCreateAlbum = async () => {
    if (!supabase || !user || !setupData.size || !setupData.theme) {
      setError(language === 'he' ? 'חסרים נתונים נדרשים' : 'Missing required data');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      // Create the project
      const { data: project, error: projectError } = await supabase.
      from('projects').
      insert({
        client_id: user.id,
        created_by: user.id,
        name: `${setupData.theme.name[language]} Album`,
        album_type: setupData.theme.category,
        page_count: setupData.pageCount,
        status: 'draft',
        settings: {
          sizeId: setupData.sizeId,
          width: setupData.size.width,
          height: setupData.size.height,
          spreadWidth: setupData.size.spreadWidth,
          spreadHeight: setupData.size.spreadHeight,
          dpi: setupData.size.dpi,
          direction: setupData.direction,
          themeId: setupData.themeId,
          placementMode: setupData.placementMode
        }
      }).
      select().
      single();

      if (projectError) throw projectError;

      // Create spreads
      const spreadsToCreate = [];
      const numSpreads = Math.ceil(setupData.pageCount / 2);

      // Cover spread
      spreadsToCreate.push({
        project_id: project.id,
        spread_index: 0,
        spread_type: 'cover',
        canvas_data: { objects: [], background: setupData.theme.backgroundPatterns[0] || '#ffffff' }
      });

      // Interior spreads
      for (let i = 1; i <= numSpreads; i++) {
        spreadsToCreate.push({
          project_id: project.id,
          spread_index: i,
          spread_type: 'interior',
          canvas_data: { objects: [], background: setupData.theme.backgroundPatterns[0] || '#ffffff' }
        });
      }

      const { error: spreadsError } = await supabase.
      from('spreads').
      insert(spreadsToCreate);

      if (spreadsError) throw spreadsError;

      // Upload photos to storage and save references
      for (const photo of setupData.photos) {
        if (photo.file) {
          const filePath = `${user.id}/${project.id}/${photo.id}-${photo.name}`;

          // Upload to storage
          const { error: uploadError } = await supabase.storage.
          from('client-photos').
          upload(filePath, photo.file);

          if (!uploadError) {
            const { data: urlData } = supabase.storage.
            from('client-photos').
            getPublicUrl(filePath);

            // Save photo reference
            await supabase.from('client_photos').insert({
              project_id: project.id,
              uploaded_by: user.id,
              file_url: urlData.publicUrl,
              thumbnail_url: urlData.publicUrl,
              original_name: photo.name,
              width: photo.width,
              height: photo.height,
              file_size: photo.size
            });
          }
        }
      }

      // Navigate to the new editor with setup data
      navigate(`/editor/${project.id}`, {
        state: {
          setupData,
          isNewAlbum: true,
          autoPlace: setupData.placementMode === 'automatic'
        }
      });

    } catch (e) {
      const err = e as Error;
      console.error('Error creating album:', err);
      setError(err.message || (language === 'he' ? 'שגיאה ביצירת האלבום' : 'Error creating album'));
    } finally {
      setIsCreating(false);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Size selection
        return (
          <div data-ev-id="ev_eaa0a68e50" className="flex flex-col gap-6">
            <div data-ev-id="ev_31d6c0fdef" className="text-center mb-4">
              <h2 data-ev-id="ev_bf4bbd33f5" className="text-2xl font-bold text-gray-900 mb-2">
                {language === 'he' ? 'בחר גודל אלבום' : 'Choose Album Size'}
              </h2>
              <p data-ev-id="ev_fd6782fd5f" className="text-gray-600">
                {language === 'he' ? 'בחר את הגודל המתאים לאלבום שלך' : 'Select the perfect size for your album'}
              </p>
            </div>
            <div data-ev-id="ev_54b77ed04d" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {ALBUM_SIZES.map((size) =>
              <button data-ev-id="ev_6ed622b5ed"
              key={size.id}
              onClick={() => updateSetup({ sizeId: size.id, size })}
              className={`relative p-4 rounded-xl border-2 transition-all ${
              setupData.sizeId === size.id ?
              'border-primary bg-primary/5 ring-2 ring-primary/20' :
              'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`
              }>

                  {size.popular &&
                <span data-ev-id="ev_c554e0f102" className="absolute -top-2 -right-2 bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                      {language === 'he' ? 'פופולרי' : 'Popular'}
                    </span>
                }
                  <div data-ev-id="ev_c148b14f91"
                className="mx-auto mb-3 bg-gray-100 rounded border border-gray-200"
                style={{
                  width: size.category === 'square' ? 60 : size.category === 'landscape' ? 80 : 50,
                  height: size.category === 'square' ? 60 : size.category === 'landscape' ? 50 : 80
                }} />

                  <div data-ev-id="ev_24e181d6a8" className="text-center">
                    <div data-ev-id="ev_344e9b86a6" className="font-semibold text-gray-900">{size.name[language]}</div>
                    <div data-ev-id="ev_64331fce9a" className="text-sm text-gray-500">
                      {size.widthCm}×{size.heightCm} cm
                    </div>
                  </div>
                </button>
              )}
            </div>
          </div>);


      case 1: // Page count
        return (
          <div data-ev-id="ev_bb8253720d" className="flex flex-col gap-6">
            <div data-ev-id="ev_34794d13f7" className="text-center mb-4">
              <h2 data-ev-id="ev_3c3b60600c" className="text-2xl font-bold text-gray-900 mb-2">
                {language === 'he' ? 'בחר מספר עמודים' : 'Choose Page Count'}
              </h2>
              <p data-ev-id="ev_d921b828c3" className="text-gray-600">
                {language === 'he' ? 'מספר העמודים הפנימיים (לא כולל כריכה)' : 'Interior pages (not including covers)'}
              </p>
            </div>
            <div data-ev-id="ev_8b6fb64cb5" className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {VALID_PAGE_COUNTS.map((option) =>
              <button data-ev-id="ev_540d38f80c"
              key={option.value}
              onClick={() => updateSetup({ pageCount: option.value })}
              className={`p-4 rounded-xl border-2 transition-all ${
              setupData.pageCount === option.value ?
              'border-primary bg-primary/5 ring-2 ring-primary/20' :
              'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`
              }>

                  <div data-ev-id="ev_760d3554a9" className="text-2xl font-bold text-gray-900">{option.value}</div>
                  <div data-ev-id="ev_20debcf3ce" className="text-sm text-gray-500">
                    {language === 'he' ? 'עמודים' : 'pages'}
                  </div>
                  <div data-ev-id="ev_90fcb30550" className="text-xs text-gray-400 mt-1">
                    {Math.ceil(option.value / 2)} {language === 'he' ? 'פריסות' : 'spreads'}
                  </div>
                </button>
              )}
            </div>
          </div>);


      case 2: // Direction
        return (
          <div data-ev-id="ev_16af8b4bfd" className="flex flex-col gap-6">
            <div data-ev-id="ev_d2f5d7cb10" className="text-center mb-4">
              <h2 data-ev-id="ev_906573de3d" className="text-2xl font-bold text-gray-900 mb-2">
                {language === 'he' ? 'כיוון קריאה' : 'Reading Direction'}
              </h2>
              <p data-ev-id="ev_32dc23aea9" className="text-gray-600">
                {language === 'he' ? 'בחר את כיוון הקריאה של האלבום' : 'Choose how your album reads'}
              </p>
            </div>
            <div data-ev-id="ev_99398fc310" className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <button data-ev-id="ev_91c18e29b7"
              onClick={() => updateSetup({ direction: 'rtl' })}
              className={`p-6 rounded-xl border-2 transition-all ${
              setupData.direction === 'rtl' ?
              'border-primary bg-primary/5 ring-2 ring-primary/20' :
              'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`
              }>

                <div data-ev-id="ev_b6a38b4f12" className="flex items-center justify-center gap-2 mb-3">
                  <ChevronLeft className="w-6 h-6" />
                  <div data-ev-id="ev_8f0511727b" className="flex gap-1">
                    <div data-ev-id="ev_3f7fe94a3d" className="w-8 h-10 bg-gray-200 rounded" />
                    <div data-ev-id="ev_5cac09e0b6" className="w-8 h-10 bg-gray-300 rounded" />
                  </div>
                </div>
                <div data-ev-id="ev_fbc36b003a" className="font-semibold text-gray-900">
                  {language === 'he' ? 'מימין לשמאל' : 'Right to Left'}
                </div>
                <div data-ev-id="ev_973d51acaa" className="text-sm text-gray-500">
                  {language === 'he' ? 'לעברית וערבית' : 'Hebrew & Arabic'}
                </div>
              </button>
              <button data-ev-id="ev_595c5b9264"
              onClick={() => updateSetup({ direction: 'ltr' })}
              className={`p-6 rounded-xl border-2 transition-all ${
              setupData.direction === 'ltr' ?
              'border-primary bg-primary/5 ring-2 ring-primary/20' :
              'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`
              }>

                <div data-ev-id="ev_18278c6c48" className="flex items-center justify-center gap-2 mb-3">
                  <div data-ev-id="ev_843394c478" className="flex gap-1">
                    <div data-ev-id="ev_4f37ea5360" className="w-8 h-10 bg-gray-300 rounded" />
                    <div data-ev-id="ev_a7e7cd8045" className="w-8 h-10 bg-gray-200 rounded" />
                  </div>
                  <ChevronRight className="w-6 h-6" />
                </div>
                <div data-ev-id="ev_eee130289d" className="font-semibold text-gray-900">
                  {language === 'he' ? 'משמאל לימין' : 'Left to Right'}
                </div>
                <div data-ev-id="ev_d628e0f483" className="text-sm text-gray-500">
                  {language === 'he' ? 'לאנגלית ושפות אירופאיות' : 'English & European'}
                </div>
              </button>
            </div>
          </div>);


      case 3: // Theme
        return (
          <div data-ev-id="ev_95626f91fc" className="flex flex-col gap-6">
            <div data-ev-id="ev_99d82ed256" className="text-center mb-4">
              <h2 data-ev-id="ev_0695b5220e" className="text-2xl font-bold text-gray-900 mb-2">
                {language === 'he' ? 'בחר נושא עיצוב' : 'Choose a Theme'}
              </h2>
              <p data-ev-id="ev_389b190102" className="text-gray-600">
                {language === 'he' ? 'הנושא קובע צבעים, פונטים ופריסות' : 'Theme sets colors, fonts, and layouts'}
              </p>
            </div>
            {/* Category filter */}
            <div data-ev-id="ev_a2fda57fcc" className="flex flex-wrap justify-center gap-2">
              {THEME_CATEGORIES.map((cat) =>
              <button data-ev-id="ev_f6c7750dd6"
              key={cat.id}
              onClick={() => setThemeCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm transition-all ${
              themeCategory === cat.id ?
              'bg-primary text-white' :
              'bg-gray-100 text-gray-700 hover:bg-gray-200'}`
              }>

                  {cat.name[language]}
                </button>
              )}
            </div>
            {/* Theme grid */}
            <div data-ev-id="ev_7e44ed2a0b" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {THEMES.filter((t) => themeCategory === 'all' || t.category === themeCategory).map((theme) =>
              <button data-ev-id="ev_05a0faad78"
              key={theme.id}
              onClick={() => updateSetup({ themeId: theme.id, theme })}
              className={`relative overflow-hidden rounded-xl border-2 transition-all ${
              setupData.themeId === theme.id ?
              'border-primary ring-2 ring-primary/20' :
              'border-gray-200 hover:border-gray-300'}`
              }>

                  {/* Theme preview */}
                  <div data-ev-id="ev_09f88cc0d4"
                className="h-32 w-full"
                style={{ background: theme.previewGradient }}>

                    {/* Mini spread preview */}
                    <div data-ev-id="ev_ce0ef46bb9" className="flex items-center justify-center h-full p-4">
                      <div data-ev-id="ev_4b3f000f2f" className="flex gap-1 shadow-lg rounded overflow-hidden">
                        <div data-ev-id="ev_5906a573ef"
                      className="w-12 h-16"
                      style={{ backgroundColor: theme.colors.surface }}>

                          <div data-ev-id="ev_2bb9c1f926"
                        className="m-1.5 h-10 rounded-sm"
                        style={{ backgroundColor: theme.colors.background }} />

                        </div>
                        <div data-ev-id="ev_1c63f6a6f9"
                      className="w-12 h-16"
                      style={{ backgroundColor: theme.colors.surface }}>

                          <div data-ev-id="ev_21a2d3284b"
                        className="m-1.5 h-10 rounded-sm"
                        style={{ backgroundColor: theme.colors.background }} />

                        </div>
                      </div>
                    </div>
                  </div>
                  <div data-ev-id="ev_4b550d2388" className="p-3 bg-white">
                    <div data-ev-id="ev_995e6a0258" className="font-semibold text-gray-900 text-sm">
                      {theme.name[language]}
                    </div>
                    <div data-ev-id="ev_9aeeb5a0c3" className="text-xs text-gray-500 line-clamp-1">
                      {theme.description[language]}
                    </div>
                  </div>
                  {setupData.themeId === theme.id &&
                <div data-ev-id="ev_c8d8af62c7" className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                }
                </button>
              )}
            </div>
          </div>);


      case 4: // Photos
        return (
          <div data-ev-id="ev_fcf97a6726" className="flex flex-col gap-6">
            <div data-ev-id="ev_7e08148459" className="text-center mb-4">
              <h2 data-ev-id="ev_02cc85af80" className="text-2xl font-bold text-gray-900 mb-2">
                {language === 'he' ? 'העלה תמונות' : 'Upload Photos'}
              </h2>
              <p data-ev-id="ev_50343d96ad" className="text-gray-600">
                {language === 'he' ? 'בחר את התמונות לאלבום שלך' : 'Select photos for your album'}
              </p>
            </div>

            {/* Upload area */}
            <div data-ev-id="ev_2e5c05ce6d"
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all">

              <input data-ev-id="ev_7588631862"
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden" />

              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <div data-ev-id="ev_7f507122f3" className="text-lg font-medium text-gray-700">
                {language === 'he' ? 'לחץ להעלאת תמונות' : 'Click to upload photos'}
              </div>
              <div data-ev-id="ev_3f2719d975" className="text-sm text-gray-500 mt-1">
                {language === 'he' ? 'או גרור תמונות לכאן' : 'or drag and drop here'}
              </div>
            </div>

            {uploadingCount > 0 &&
            <div data-ev-id="ev_e342c50f04" className="flex items-center justify-center gap-2 text-primary">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span data-ev-id="ev_aa6c9734ad">{language === 'he' ? `מעלה ${uploadingCount} תמונות...` : `Uploading ${uploadingCount} photos...`}</span>
              </div>
            }

            {/* Photo grid */}
            {setupData.photos.length > 0 &&
            <div data-ev-id="ev_e9a3753b88">
                <div data-ev-id="ev_1812f5810f" className="flex items-center justify-between mb-3">
                  <span data-ev-id="ev_bb97e3af0e" className="text-sm font-medium text-gray-700">
                    {setupData.photos.length} {language === 'he' ? 'תמונות' : 'photos'}
                  </span>
                  <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}>

                    <Plus className="w-4 h-4 mr-1" />
                    {language === 'he' ? 'הוסף עוד' : 'Add more'}
                  </Button>
                </div>
                <div data-ev-id="ev_06cd794a7e" className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                  {setupData.photos.map((photo) =>
                <div data-ev-id="ev_4be50724c5" key={photo.id} className="relative group aspect-square">
                      <img data-ev-id="ev_27fa1842f0"
                  src={photo.thumbnailUrl || photo.dataUrl}
                  alt={photo.name}
                  className="w-full h-full object-cover rounded-lg" />

                      <button data-ev-id="ev_505d3ccbd8"
                  onClick={(e) => {
                    e.stopPropagation();
                    removePhoto(photo.id);
                  }}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">

                        <X className="w-4 h-4" />
                      </button>
                    </div>
                )}
                </div>
              </div>
            }
          </div>);


      case 5: // Placement mode
        return (
          <div data-ev-id="ev_20642ab467" className="flex flex-col gap-6">
            <div data-ev-id="ev_173cca7880" className="text-center mb-4">
              <h2 data-ev-id="ev_a3a4b73b81" className="text-2xl font-bold text-gray-900 mb-2">
                {language === 'he' ? 'מצב הכנסת תמונות' : 'Photo Placement Mode'}
              </h2>
              <p data-ev-id="ev_2b208f147a" className="text-gray-600">
                {language === 'he' ? 'בחר איך להכניס תמונות לאלבום' : 'Choose how to place photos in your album'}
              </p>
            </div>
            <div data-ev-id="ev_4fbe1ea84b" className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              <button data-ev-id="ev_af8def83d6"
              onClick={() => updateSetup({ placementMode: 'manual' })}
              className={`p-6 rounded-xl border-2 text-${isRTL ? 'right' : 'left'} transition-all ${
              setupData.placementMode === 'manual' ?
              'border-primary bg-primary/5 ring-2 ring-primary/20' :
              'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`
              }>

                <div data-ev-id="ev_0c27bdf293" className="flex items-center gap-3 mb-3">
                  <div data-ev-id="ev_af0544668c" className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <Layers className="w-6 h-6 text-gray-600" />
                  </div>
                  <div data-ev-id="ev_29e038217a">
                    <div data-ev-id="ev_456b019ee5" className="font-semibold text-gray-900">
                      {language === 'he' ? 'הכנסה ידנית' : 'Manual Placement'}
                    </div>
                  </div>
                </div>
                <p data-ev-id="ev_e1ac770506" className="text-sm text-gray-600">
                  {language === 'he' ?
                  'גרור תמונות לעמודים ריקים או למסגרות מוכנות. שליטה מלאה על המיקום והגודל של כל תמונה.' :
                  'Drag photos to empty pages or pre-made frames. Full control over position and size of each photo.'}
                </p>
              </button>
              <button data-ev-id="ev_e5c72da490"
              onClick={() => updateSetup({ placementMode: 'automatic' })}
              className={`p-6 rounded-xl border-2 text-${isRTL ? 'right' : 'left'} transition-all ${
              setupData.placementMode === 'automatic' ?
              'border-primary bg-primary/5 ring-2 ring-primary/20' :
              'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`
              }>

                <div data-ev-id="ev_bc08c50252" className="flex items-center gap-3 mb-3">
                  <div data-ev-id="ev_6487883945" className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Wand2 className="w-6 h-6 text-primary" />
                  </div>
                  <div data-ev-id="ev_a231066258">
                    <div data-ev-id="ev_94b268be18" className="font-semibold text-gray-900">
                      {language === 'he' ? 'הכנסה אוטומטית' : 'Automatic Placement'}
                    </div>
                  </div>
                </div>
                <p data-ev-id="ev_171f8aa558" className="text-sm text-gray-600">
                  {language === 'he' ?
                  'התמונות יפוזרו אוטומטית על פני העמודים בהתאם לנושא שבחרת. ניתן לערוך אחר כך.' :
                  'Photos will be automatically distributed across pages using your theme layouts. You can edit afterwards.'}
                </p>
                {setupData.photos.length > 0 &&
                <div data-ev-id="ev_e98f4d859b" className="mt-3 p-2 bg-blue-50 rounded-lg text-xs text-blue-700">
                    {language === 'he' ?
                  `${setupData.photos.length} תמונות יפוזרו על ${Math.ceil(setupData.pageCount / 2)} פריסות` :
                  `${setupData.photos.length} photos will be placed across ${Math.ceil(setupData.pageCount / 2)} spreads`}
                  </div>
                }
              </button>
            </div>
          </div>);


      default:
        return null;
    }
  };

  return (
    <div data-ev-id="ev_d9832772bf" className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header data-ev-id="ev_fdcbf40361" className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div data-ev-id="ev_810c944610" className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div data-ev-id="ev_59a0b704a3" className="flex items-center gap-3">
            <div data-ev-id="ev_5bbacbd191" className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div data-ev-id="ev_4268ae7f25">
              <h1 data-ev-id="ev_3ac9d6eada" className="font-bold text-lg text-gray-900">
                {language === 'he' ? 'יוצר האלבומים' : 'Album Creator'}
              </h1>
              <p data-ev-id="ev_78f5aa732f" className="text-xs text-gray-500">
                {language === 'he' ? 'יצירת אלבום חדש' : 'Create New Album'}
              </p>
            </div>
          </div>
          <Button variant="ghost" onClick={() => navigate('/projects')}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Progress steps */}
      <div data-ev-id="ev_e2d1801609" className="bg-white border-b border-gray-200 py-4">
        <div data-ev-id="ev_fe3cb992ec" className="max-w-4xl mx-auto px-4">
          <div data-ev-id="ev_b2f46ab947" className="flex items-center justify-between">
            {STEPS.map((step, index) =>
            <div data-ev-id="ev_4829d0c16b" key={step.id} className="flex items-center">
                <button data-ev-id="ev_aff42f958d"
              onClick={() => index < currentStep && setCurrentStep(index)}
              disabled={index > currentStep}
              className={`flex flex-col items-center gap-1 ${
              index <= currentStep ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`
              }>

                  <div data-ev-id="ev_bd67220d2d"
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                index < currentStep ?
                'bg-primary text-white' :
                index === currentStep ?
                'bg-primary/10 text-primary ring-2 ring-primary' :
                'bg-gray-100 text-gray-400'}`
                }>

                    {index < currentStep ?
                  <Check className="w-5 h-5" /> :

                  <step.icon className="w-5 h-5" />
                  }
                  </div>
                  <span data-ev-id="ev_c831414cfe"
                className={`text-xs font-medium hidden md:block ${
                index === currentStep ? 'text-primary' : 'text-gray-500'}`
                }>

                    {language === 'he' ? step.label.he : step.label.en}
                  </span>
                </button>
                {index < STEPS.length - 1 &&
              <div data-ev-id="ev_4ee629cdce"
              className={`w-8 md:w-16 h-0.5 mx-2 ${
              index < currentStep ? 'bg-primary' : 'bg-gray-200'}`
              } />

              }
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <main data-ev-id="ev_7397df106c" className="max-w-5xl mx-auto px-4 py-8">
        {error &&
        <div data-ev-id="ev_eb98ccb1c5" className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span data-ev-id="ev_ac1bbbce7d">{error}</span>
          </div>
        }

        <AnimatePresence mode="wait">
          <motion.div data-ev-id="ev_3e3304de20"
          key={currentStep}
          initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
          transition={{ duration: 0.2 }}>

            {renderStepContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer navigation */}
      <footer data-ev-id="ev_353d1f5de8" className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-4">
        <div data-ev-id="ev_dc7e58d7ce" className="max-w-5xl mx-auto px-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="gap-2">

            {isRTL ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            {language === 'he' ? 'חזור' : 'Back'}
          </Button>

          <div data-ev-id="ev_a0b2899462" className="text-sm text-gray-500">
            {currentStep + 1} / {STEPS.length}
          </div>

          <Button
            onClick={handleNext}
            disabled={!canProceed() || isCreating}
            className="gap-2">

            {isCreating ?
            <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {language === 'he' ? 'יוצר...' : 'Creating...'}
              </> :
            currentStep === STEPS.length - 1 ?
            <>
                {language === 'he' ? 'צור אלבום' : 'Create Album'}
                <Check className="w-5 h-5" />
              </> :

            <>
                {language === 'he' ? 'המשך' : 'Next'}
                {isRTL ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </>
            }
          </Button>
        </div>
      </footer>
    </div>);

}