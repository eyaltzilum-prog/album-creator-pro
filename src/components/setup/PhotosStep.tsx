/**
 * Photo Upload Step
 */

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Check, AlertCircle, Image, Plus, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AlbumSetupData, UploadedPhoto } from '@/types/album';
import type { Language } from '@/lib/i18n';
import { Button } from '@/components/ui/Button';

interface PhotosStepProps {
  setupData: AlbumSetupData;
  onUpdate: (updates: Partial<AlbumSetupData>) => void;
  language: Language;
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const createThumbnail = (dataUrl: string, maxSize: number = 150): Promise<string> => {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
    img.src = dataUrl;
  });
};

const getImageDimensions = (dataUrl: string): Promise<{width: number;height: number;}> => {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({ width: 0, height: 0 });
    img.src = dataUrl;
  });
};

export function PhotosStep({ setupData, onUpdate, language }: PhotosStepProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(async (files: FileList | File[]) => {
    setIsProcessing(true);
    const fileArray = Array.from(files);
    const newPhotos: UploadedPhoto[] = [];

    for (const file of fileArray) {
      if (!file.type.startsWith('image/')) continue;
      if (file.size > 20 * 1024 * 1024) continue; // Skip files > 20MB

      const photo: UploadedPhoto = {
        id: generateId(),
        file,
        dataUrl: '',
        thumbnailUrl: '',
        width: 0,
        height: 0,
        name: file.name,
        size: file.size,
        uploadProgress: 0,
        uploadStatus: 'uploading',
        usedOnPages: []
      };

      newPhotos.push(photo);
    }

    // Add photos immediately with uploading status
    onUpdate({ photos: [...setupData.photos, ...newPhotos] });

    // Process each photo
    for (const photo of newPhotos) {
      try {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(photo.file!);
        });

        const [thumbnailUrl, dimensions] = await Promise.all([
        createThumbnail(dataUrl),
        getImageDimensions(dataUrl)]
        );

        // Update the specific photo
        onUpdate({
          photos: setupData.photos.map((p) =>
          p.id === photo.id ?
          { ...p, dataUrl, thumbnailUrl, ...dimensions, uploadProgress: 100, uploadStatus: 'complete' as const } :
          p
          ).concat(
            newPhotos.filter((np) => !setupData.photos.find((sp) => sp.id === np.id)).map((np) =>
            np.id === photo.id ?
            { ...np, dataUrl, thumbnailUrl, ...dimensions, uploadProgress: 100, uploadStatus: 'complete' as const } :
            np
            )
          ).filter((p, i, arr) => arr.findIndex((x) => x.id === p.id) === i)
        });
      } catch (error) {
        // Mark as error
        onUpdate({
          photos: setupData.photos.map((p) =>
          p.id === photo.id ?
          { ...p, uploadStatus: 'error' as const, errorMessage: 'Failed to process' } :
          p
          )
        });
      }
    }

    setIsProcessing(false);
  }, [setupData.photos, onUpdate]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      processFiles(e.target.files);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removePhoto = (photoId: string) => {
    onUpdate({ photos: setupData.photos.filter((p) => p.id !== photoId) });
  };

  const completedPhotos = setupData.photos.filter((p) => p.uploadStatus === 'complete');
  const uploadingPhotos = setupData.photos.filter((p) => p.uploadStatus === 'uploading');
  const errorPhotos = setupData.photos.filter((p) => p.uploadStatus === 'error');

  return (
    <div data-ev-id="ev_434e51c5ac" className="flex flex-col gap-6">
      <div data-ev-id="ev_565e1d0043" className="text-center">
        <h2 data-ev-id="ev_36cad99b4b" className="text-2xl font-bold text-gray-900 mb-2">
          {language === 'he' ? 'העלה תמונות' : 'Upload Photos'}
        </h2>
        <p data-ev-id="ev_486bee557d" className="text-gray-600">
          {language === 'he' ?
          'העלה את התמונות שתרצה לכלול באלבום. תוכל להוסיף עוד מאוחר יותר.' :
          'Upload the photos you want to include in your album. You can add more later.'
          }
        </p>
      </div>

      {/* Hidden file input */}
      <input data-ev-id="ev_9d29402c8a"
      ref={fileInputRef}
      type="file"
      accept="image/*"
      multiple
      onChange={handleFileSelect}
      className="hidden" />


      {/* Drop Zone */}
      <div data-ev-id="ev_5e1b53bc0f"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => fileInputRef.current?.click()}
      className={`relative border-2 border-dashed rounded-2xl p-8 transition-all cursor-pointer ${
      isDragging ?
      'border-primary bg-primary/5 scale-[1.02]' :
      'border-gray-300 hover:border-primary/50 hover:bg-gray-50'}`
      }>

        <div data-ev-id="ev_7333072be8" className="text-center">
          <div data-ev-id="ev_dd0032cd6a" className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
          isDragging ? 'bg-primary/10' : 'bg-gray-100'}`
          }>
            {isProcessing ?
            <Loader2 className="w-8 h-8 text-primary animate-spin" /> :

            <Upload className={`w-8 h-8 ${isDragging ? 'text-primary' : 'text-gray-400'}`} />
            }
          </div>
          
          <h3 data-ev-id="ev_7503d0c1f7" className="font-semibold text-gray-900 mb-1">
            {isDragging ?
            language === 'he' ? 'שחרר להעלאה' : 'Drop to upload' :
            language === 'he' ? 'גרור ושחרר תמונות כאן' : 'Drag and drop photos here'
            }
          </h3>
          <p data-ev-id="ev_cb4317c775" className="text-sm text-gray-500">
            {language === 'he' ?
            'או לחץ לבחירה מהמחשב' :
            'or click to select from your computer'
            }
          </p>
          <p data-ev-id="ev_97c7843d06" className="text-xs text-gray-400 mt-2">
            {language === 'he' ? 'עד 20MB לתמונה • JPG, PNG, WEBP' : 'Up to 20MB per photo • JPG, PNG, WEBP'}
          </p>
        </div>
      </div>

      {/* Photo Stats */}
      {setupData.photos.length > 0 &&
      <div data-ev-id="ev_22fd695b7a" className="flex items-center justify-center gap-6 text-sm">
          {completedPhotos.length > 0 &&
        <div data-ev-id="ev_5969758c46" className="flex items-center gap-2 text-green-600">
              <Check className="w-4 h-4" />
              <span data-ev-id="ev_5dc620048a">{completedPhotos.length} {language === 'he' ? 'הועלו בהצלחה' : 'uploaded'}</span>
            </div>
        }
          {uploadingPhotos.length > 0 &&
        <div data-ev-id="ev_bac9e14388" className="flex items-center gap-2 text-blue-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span data-ev-id="ev_760b8abf3c">{uploadingPhotos.length} {language === 'he' ? 'בתהליך' : 'processing'}</span>
            </div>
        }
          {errorPhotos.length > 0 &&
        <div data-ev-id="ev_35b79d129f" className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span data-ev-id="ev_f0e0310c50">{errorPhotos.length} {language === 'he' ? 'נכשלו' : 'failed'}</span>
            </div>
        }
        </div>
      }

      {/* Photo Grid */}
      {setupData.photos.length > 0 &&
      <div data-ev-id="ev_c13d0a87eb" className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
          <AnimatePresence>
            {setupData.photos.map((photo) =>
          <motion.div data-ev-id="ev_0e472d62c6"
          key={photo.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group">

                {photo.thumbnailUrl ?
            <img data-ev-id="ev_cdb338ee4b"
            src={photo.thumbnailUrl}
            alt={photo.name}
            className="w-full h-full object-cover" /> :


            <div data-ev-id="ev_f353f0774d" className="w-full h-full flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                  </div>
            }

                {/* Status overlay */}
                {photo.uploadStatus === 'uploading' &&
            <div data-ev-id="ev_12f7250a7c" className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  </div>
            }

                {photo.uploadStatus === 'error' &&
            <div data-ev-id="ev_b2c87a8028" className="absolute inset-0 bg-red-500/80 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-white" />
                  </div>
            }

                {/* Remove button */}
                <button data-ev-id="ev_7cbc69f204"
            onClick={(e) => {
              e.stopPropagation();
              removePhoto(photo.id);
            }}
            className="absolute top-1 end-1 w-6 h-6 bg-black/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">

                  <X className="w-4 h-4 text-white" />
                </button>
              </motion.div>
          )}
          </AnimatePresence>

          {/* Add more button */}
          <button data-ev-id="ev_89ede3191c"
        onClick={() => fileInputRef.current?.click()}
        className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-primary/50 flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-primary transition-colors">

            <Plus className="w-6 h-6" />
            <span data-ev-id="ev_5edf5efc53" className="text-xs">{language === 'he' ? 'עוד' : 'More'}</span>
          </button>
        </div>
      }

      {/* Tips */}
      <div data-ev-id="ev_55fae17511" className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div data-ev-id="ev_e59fd69166" className="flex items-start gap-3">
          <Image className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div data-ev-id="ev_37c4d79078" className="text-sm text-blue-800">
            <p data-ev-id="ev_3901148f1f" className="font-medium mb-1">
              {language === 'he' ? 'טיפים לתמונות טובות יותר:' : 'Tips for better photos:'}
            </p>
            <ul data-ev-id="ev_f4cc0db573" className="list-disc list-inside flex flex-col gap-1">
              <li data-ev-id="ev_295b9a009b">{language === 'he' ? 'השתמש בתמונות ברזולוציה גבוהה' : 'Use high resolution images'}</li>
              <li data-ev-id="ev_775d3c9781">{language === 'he' ? 'הימנע מתמונות מטושטשות או חשוכות' : 'Avoid blurry or dark photos'}</li>
              <li data-ev-id="ev_bb6955b30c">{language === 'he' ? 'תוכל להוסיף תמונות גם בשלב העריכה' : 'You can always add more during editing'}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Skip option */}
      {setupData.photos.length === 0 &&
      <p data-ev-id="ev_e7bd2b7cc3" className="text-center text-sm text-gray-500">
          {language === 'he' ?
        'אתה יכול לדלג שלב זה ולהעלות תמונות מאוחר יותר בתוך העורך' :
        'You can skip this step and upload photos later in the editor'
        }
        </p>
      }
    </div>);

}