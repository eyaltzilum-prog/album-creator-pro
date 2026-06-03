import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Search, Trash2, Image, Palette,
  Type, Sticker, Frame, LayoutTemplate,
  Grid3X3, List, Eye, EyeOff, Edit2, Check, X,
  ImageOff } from
'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAssets, AssetType, Asset, ASSET_CATEGORIES, CATEGORY_LABELS, AssetUploadData } from '@/contexts/AssetContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

// ============================================================================
// ASSET TYPE CONFIG
// ============================================================================

const assetTypes: {type: AssetType;icon: any;labelHe: string;labelEn: string;}[] = [
{ type: 'template', icon: LayoutTemplate, labelHe: 'תבניות', labelEn: 'Templates' },
{ type: 'background', icon: Image, labelHe: 'רקעים', labelEn: 'Backgrounds' },
{ type: 'clipart', icon: Sticker, labelHe: 'קליפארט', labelEn: 'Clip Art' },
{ type: 'sticker', icon: Sticker, labelHe: 'מדבקות', labelEn: 'Stickers' },
{ type: 'frame', icon: Frame, labelHe: 'מסגרות', labelEn: 'Frames' },
{ type: 'font', icon: Type, labelHe: 'פונטים', labelEn: 'Fonts' }];

// Asset type colors for placeholders
const ASSET_TYPE_COLORS: Record<AssetType, {bg: string;icon: string;}> = {
  template: { bg: 'bg-purple-100', icon: 'text-purple-500' },
  background: { bg: 'bg-blue-100', icon: 'text-blue-500' },
  clipart: { bg: 'bg-pink-100', icon: 'text-pink-500' },
  sticker: { bg: 'bg-yellow-100', icon: 'text-yellow-500' },
  frame: { bg: 'bg-green-100', icon: 'text-green-500' },
  font: { bg: 'bg-gray-100', icon: 'text-gray-500' }
};

// Get asset type icon component
const getAssetTypeIcon = (type: AssetType) => {
  const found = assetTypes.find((t) => t.type === type);
  return found?.icon || Image;
};

// ============================================================================
// ASSET THUMBNAIL COMPONENT
// ============================================================================

interface AssetThumbnailProps {
  asset: {
    name: string;
    asset_type: AssetType;
    file_url: string;
    data_url: string | null;
    thumbnail_url: string | null;
    preview_data: string | null;
  };
  className?: string;
}

function AssetThumbnail({ asset, className = '' }: AssetThumbnailProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if it's a color/gradient (not an image)
  const url = asset.data_url || asset.file_url || '';
  
  // Only treat as color if it's a valid hex color (#fff, #ffffff, #ffffffff) or gradient
  // Not placeholder URLs like #FRAME_SIMPLE or #STICKER_PACIFIER
  const isValidHexColor = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(url);
  const isGradient = url.startsWith('linear-gradient') || url.startsWith('radial-gradient');
  const isColor = isValidHexColor || isGradient;

  // Get preview URL - check preview_data before data_url
  const previewUrl = asset.thumbnail_url || asset.preview_data || asset.data_url || asset.file_url || '';
  
  // Check if previewUrl is actually a valid image URL (not a placeholder like #BALLOON)
  const isValidImageUrl = previewUrl && (
    previewUrl.startsWith('data:') ||
    previewUrl.startsWith('http://') ||
    previewUrl.startsWith('https://') ||
    previewUrl.startsWith('/') ||
    previewUrl.startsWith('blob:')
  );
  
  const hasValidUrl = isValidImageUrl && !isColor;

  // Type colors
  const colors = ASSET_TYPE_COLORS[asset.asset_type] || ASSET_TYPE_COLORS.clipart;
  const TypeIcon = getAssetTypeIcon(asset.asset_type);

  // If it's a color/gradient, render it directly
  if (isColor) {
    return (
      <div data-ev-id="ev_6287443b42"
      className={`w-full h-full ${className}`}
      style={{ background: url }} />);


  }

  // If no valid URL or error loading, show placeholder
  if (!hasValidUrl || hasError) {
    return (
      <div data-ev-id="ev_ea062a53e8" className={`w-full h-full flex flex-col items-center justify-center ${colors.bg} ${className}`}>
        <TypeIcon className={`w-8 h-8 ${colors.icon} mb-1`} />
        <span data-ev-id="ev_a314d856c4" className={`text-[10px] ${colors.icon} opacity-70`}>
          {asset.asset_type}
        </span>
      </div>);

  }

  return (
    <>
      {isLoading &&
      <div data-ev-id="ev_b3e1dc5823" className={`absolute inset-0 flex items-center justify-center ${colors.bg}`}>
          <div data-ev-id="ev_481869f1cb" className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
      <img data-ev-id="ev_d667a9435a"
      src={previewUrl}
      alt={asset.name}
      className={`w-full h-full object-cover ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity ${className}`}
      loading="lazy"
      onLoad={() => setIsLoading(false)}
      onError={() => {
        setHasError(true);
        setIsLoading(false);
      }} />

    </>);

}


// ============================================================================
// UPLOAD MODAL COMPONENT
// ============================================================================

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedType: AssetType;
  onUpload: (data: AssetUploadData) => Promise<void>;
  language: 'he' | 'en';
}

function UploadModal({ isOpen, onClose, selectedType, onUpload, language }: UploadModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [category, setCategory] = useState(ASSET_CATEGORIES[selectedType][0] || 'general');
  const [tags, setTags] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files).filter(
        (f) => f.type.startsWith('image/') || f.type.startsWith('font/')
      );
      setFiles((prev) => [...prev, ...newFiles]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    const tagList = tags.split(',').map((t) => t.trim()).filter((t) => t);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const name = file.name.replace(/\.[^/.]+$/, ''); // Remove extension

      await onUpload({
        name,
        asset_type: selectedType,
        category,
        tags: tagList,
        file
      });

      setUploadProgress(Math.round((i + 1) / files.length * 100));
    }

    setUploading(false);
    setFiles([]);
    setTags('');
    onClose();
  };

  const getCategoryLabel = (cat: string) => {
    return CATEGORY_LABELS[cat]?.[language] || cat;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="העלאת נכסים חדשים"
      size="lg">

      <div data-ev-id="ev_1bc65cbb69" className="flex flex-col gap-6">
        {/* Category Selection */}
        <div data-ev-id="ev_be99eeec8c">
          <label data-ev-id="ev_691272bd19" className="block text-sm font-medium mb-2">קטגוריה</label>
          <div data-ev-id="ev_d101548a94" className="flex flex-wrap gap-2">
            {ASSET_CATEGORIES[selectedType].map((cat) =>
            <button data-ev-id="ev_093d34bb27"
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
            category === cat ?
            'bg-primary text-white' :
            'bg-muted hover:bg-muted/80'}`
            }>

                {getCategoryLabel(cat)}
              </button>
            )}
          </div>
        </div>

        {/* Tags Input */}
        <div data-ev-id="ev_b1df66189b">
          <label data-ev-id="ev_78e8276b0e" className="block text-sm font-medium mb-2">תגיות (מופרדות בפסיק)</label>
          <input data-ev-id="ev_a7f8cb84c4"
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="לדוגמה: חתונה, פרחים, זהב"
          className="w-full h-10 px-3 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary" />

        </div>

        {/* Drop Zone */}
        <div data-ev-id="ev_fec26c3a47"
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`p-8 border-2 border-dashed rounded-xl text-center cursor-pointer transition-colors ${
        dragActive ?
        'border-primary bg-primary/5' :
        'border-border hover:border-primary/50'}`
        }>

          <Upload className={`w-12 h-12 mx-auto mb-4 ${
          dragActive ? 'text-primary' : 'text-muted-foreground'}`
          } />
          <p data-ev-id="ev_097805c917" className="text-lg font-medium mb-1">גרור קבצים לכאן</p>
          <p data-ev-id="ev_46b3aeee19" className="text-muted-foreground text-sm">או לחץ לבחירה</p>
          <input data-ev-id="ev_bb760b8213"
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,font/*,.ttf,.otf,.woff,.woff2"
          onChange={handleFileSelect}
          className="hidden" />

        </div>

        {/* Selected Files */}
        {files.length > 0 &&
        <div data-ev-id="ev_64e1986c21">
            <label data-ev-id="ev_5c86c4c7ae" className="block text-sm font-medium mb-2">
              קבצים נבחרים ({files.length})
            </label>
            <div data-ev-id="ev_df7ff94a89" className="max-h-40 overflow-y-auto flex flex-col gap-2">
              {files.map((file, index) =>
            <div data-ev-id="ev_bb1b7aa7c9"
            key={index}
            className="flex items-center gap-3 p-2 bg-muted rounded-lg">

                  {file.type.startsWith('image/') &&
              <img data-ev-id="ev_bec44e54a3"
              src={URL.createObjectURL(file)}
              alt={file.name}
              className="w-10 h-10 object-cover rounded" />

              }
                  <span data-ev-id="ev_eb44f091a9" className="flex-1 text-sm truncate">{file.name}</span>
                  <span data-ev-id="ev_e552d7afed" className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                  <button data-ev-id="ev_00bffcd32a"
              onClick={(e) => {
                e.stopPropagation();
                removeFile(index);
              }}
              className="p-1 hover:bg-destructive/10 rounded transition-colors">

                    <X className="w-4 h-4 text-destructive" />
                  </button>
                </div>
            )}
            </div>
          </div>
        }

        {/* Upload Progress */}
        {uploading &&
        <div data-ev-id="ev_7e987ab33e">
            <div data-ev-id="ev_5cbdd8d0f9" className="flex justify-between text-sm mb-1">
              <span data-ev-id="ev_dad6d84e59">מעלה...</span>
              <span data-ev-id="ev_1ff8632e47">{uploadProgress}%</span>
            </div>
            <div data-ev-id="ev_da400460b3" className="h-2 bg-muted rounded-full overflow-hidden">
              <div data-ev-id="ev_098739d7cb"
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${uploadProgress}%` }} />

            </div>
          </div>
        }

        {/* Actions */}
        <div data-ev-id="ev_18e7aff075" className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={uploading}>
            ביטול
          </Button>
          <Button
            onClick={handleUpload}
            disabled={files.length === 0 || uploading}
            className="gap-2">

            <Upload className="w-4 h-4" />
            העלה {files.length > 0 && `(${files.length})`}
          </Button>
        </div>
      </div>
    </Modal>);

}

// ============================================================================
// EDIT ASSET MODAL COMPONENT
// ============================================================================

interface EditModalProps {
  asset: Asset | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Asset>) => Promise<void>;
  language: 'he' | 'en';
}

function EditAssetModal({ asset, isOpen, onClose, onSave, language }: EditModalProps) {
  const [name, setName] = useState(asset?.name || '');
  const [nameHe, setNameHe] = useState(asset?.name_he || '');
  const [category, setCategory] = useState(asset?.category || '');
  const [tags, setTags] = useState(asset?.tags?.join(', ') || '');
  const [saving, setSaving] = useState(false);

  // Update state when asset changes
  useEffect(() => {
    if (asset) {
      setName(asset.name);
      setNameHe(asset.name_he || '');
      setCategory(asset.category);
      setTags(asset.tags?.join(', ') || '');
    }
  }, [asset]);

  const handleSave = async () => {
    if (!asset) return;
    setSaving(true);

    await onSave(asset.id, {
      name,
      name_he: nameHe || null,
      category,
      tags: tags.split(',').map((t) => t.trim()).filter((t) => t)
    });

    setSaving(false);
    onClose();
  };

  const getCategoryLabel = (cat: string) => {
    return CATEGORY_LABELS[cat]?.[language] || cat;
  };

  if (!asset) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="עריכת נכס"
      size="md">

      <div data-ev-id="ev_3a95ce9b26" className="flex flex-col gap-4">
        {/* Preview */}
        <div data-ev-id="ev_1590fe360c" className="w-full aspect-video bg-muted rounded-lg overflow-hidden">
          <AssetThumbnail asset={asset} className="w-full h-full" />
        </div>

        {/* Name EN */}
        <div data-ev-id="ev_53f83226cc">
          <label data-ev-id="ev_beab107f67" className="block text-sm font-medium mb-1">שם (אנגלית)</label>
          <input data-ev-id="ev_c82f06dd12"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full h-10 px-3 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary" />

        </div>

        {/* Name HE */}
        <div data-ev-id="ev_1cdb144d23">
          <label data-ev-id="ev_cf97bb7fb7" className="block text-sm font-medium mb-1">שם (עברית)</label>
          <input data-ev-id="ev_ff4771df1b"
          type="text"
          value={nameHe}
          onChange={(e) => setNameHe(e.target.value)}
          className="w-full h-10 px-3 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary"
          dir="rtl" />

        </div>

        {/* Category */}
        <div data-ev-id="ev_e0fd26b75b">
          <label data-ev-id="ev_1974c1205d" className="block text-sm font-medium mb-2">קטגוריה</label>
          <div data-ev-id="ev_dc9e53e717" className="flex flex-wrap gap-2">
            {ASSET_CATEGORIES[asset.asset_type].map((cat) =>
            <button data-ev-id="ev_150695eaea"
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
            category === cat ?
            'bg-primary text-white' :
            'bg-muted hover:bg-muted/80'}`
            }>

                {getCategoryLabel(cat)}
              </button>
            )}
          </div>
        </div>

        {/* Tags */}
        <div data-ev-id="ev_dd732e3b16">
          <label data-ev-id="ev_46a22e0b12" className="block text-sm font-medium mb-1">תגיות</label>
          <input data-ev-id="ev_04fae07706"
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="מופרדות בפסיק"
          className="w-full h-10 px-3 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary" />

        </div>

        {/* Actions */}
        <div data-ev-id="ev_a2690bb039" className="flex justify-end gap-3 pt-4">
          <Button variant="ghost" onClick={onClose}>
            ביטול
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Check className="w-4 h-4" />
            שמירה
          </Button>
        </div>
      </div>
    </Modal>);

}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AdminAssets() {
  const { t, language, isRTL } = useLanguage();
  const {
    assets,
    loading,
    getAssetsByType,
    uploadAsset,
    updateAsset,
    deleteAsset,
    toggleVisibility,
    fetchAssets
  } = useAssets();

  const [selectedType, setSelectedType] = useState<AssetType>('background');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  // Get assets for current type
  const typeAssets = getAssetsByType(selectedType);

  // Filter assets
  const filteredAssets = typeAssets.filter((asset) => {
    const matchesCategory = selectedCategory === 'all' || asset.category === selectedCategory;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
    asset.name.toLowerCase().includes(query) ||
    (asset.name_he?.toLowerCase() || '').includes(query) ||
    asset.tags?.some((tag) => tag.toLowerCase().includes(query));
    return matchesCategory && matchesSearch;
  });

  const handleUpload = async (data: AssetUploadData) => {
    await uploadAsset(data);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק?')) return;
    await deleteAsset(id);
  };

  const handleToggleVisibility = async (id: string) => {
    await toggleVisibility(id);
  };

  const handleSaveEdit = async (id: string, updates: Partial<Asset>) => {
    await updateAsset(id, updates);
  };

  const getCategoryLabel = (cat: string) => {
    return CATEGORY_LABELS[cat]?.[language] || cat;
  };

  const getAssetPreviewUrl = (asset: Asset): string => {
    return asset.thumbnail_url || asset.preview_data || asset.data_url || asset.file_url || '';
  };

  // Check if it's a color/gradient background (stored as CSS value)
  const isColorAsset = (asset: Asset): boolean => {
    const url = asset.file_url || asset.data_url || '';
    return url.startsWith('#') || url.startsWith('linear-gradient') || url.startsWith('radial-gradient');
  };

  return (
    <div data-ev-id="ev_5667159ea9" className="flex flex-col gap-6">
      {/* Page Header */}
      <div data-ev-id="ev_5fcc5b43d7" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div data-ev-id="ev_946e473d06">
          <h1 data-ev-id="ev_456e39857a" className="text-2xl font-bold text-foreground">{t('assets')}</h1>
          <p data-ev-id="ev_ccd3fa71a3" className="text-muted-foreground mt-1">
            ניהול תבניות, רקעים ונכסי עיצוב • {assets.length} נכסים בסה"כ
          </p>
        </div>
        <Button onClick={() => setShowUploadModal(true)} className="gap-2">
          <Upload className="w-5 h-5" />
          העלאת נכס
        </Button>
      </div>

      {/* Asset Type Tabs */}
      <div data-ev-id="ev_bdaf9ea163" className="flex flex-wrap gap-2">
        {assetTypes.map((type) =>
        <Button
          key={type.type}
          variant={selectedType === type.type ? 'primary' : 'outline'}
          size="sm"
          onClick={() => {
            setSelectedType(type.type);
            setSelectedCategory('all');
          }}
          className="gap-2">

            <type.icon className="w-4 h-4" />
            {language === 'he' ? type.labelHe : type.labelEn}
            <span data-ev-id="ev_95bf97da82" className="px-1.5 py-0.5 text-xs rounded-full bg-white/20">
              {getAssetsByType(type.type).length}
            </span>
          </Button>
        )}
      </div>

      {/* Filters Row */}
      <div data-ev-id="ev_5bdfd7869d" className="flex flex-col sm:flex-row gap-4">
        {/* Category Filter */}
        <div data-ev-id="ev_6cd6ec0b1e" className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === 'all' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setSelectedCategory('all')}>

            הכל
          </Button>
          {ASSET_CATEGORIES[selectedType].map((cat) =>
          <Button
            key={cat}
            variant={selectedCategory === cat ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setSelectedCategory(cat)}>

              {getCategoryLabel(cat)}
            </Button>
          )}
        </div>

        {/* Search & View Mode */}
        <div data-ev-id="ev_128a3efb76" className="flex-1 flex items-center gap-2 justify-end">
          <div data-ev-id="ev_7c6c251494" className="relative w-64">
            <Search className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3' : 'left-3'} w-4 h-4 text-muted-foreground`} />
            <input data-ev-id="ev_8d4444ca22"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`${t('search')}...`}
            className={`w-full h-9 ${isRTL ? 'pr-10 pl-3' : 'pl-10 pr-3'} text-sm rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary`} />

          </div>
          <div data-ev-id="ev_000d9746fc" className="flex border border-border rounded-lg overflow-hidden">
            <button data-ev-id="ev_31782c211b"
            onClick={() => setViewMode('grid')}
            className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-white hover:bg-muted'}`}>

              <Grid3X3 className="w-4 h-4" />
            </button>
            <button data-ev-id="ev_5a14402716"
            onClick={() => setViewMode('list')}
            className={`p-2 ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-white hover:bg-muted'}`}>

              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Assets Grid/List */}
      {loading ?
      <div data-ev-id="ev_e9c0ab4eab" className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) =>
        <div data-ev-id="ev_2d4bc0b33d" key={i} className="aspect-square bg-muted rounded-lg animate-pulse" />
        )}
        </div> :
      filteredAssets.length === 0 ?
      <Card className="p-12 text-center">
          <Palette className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <h3 data-ev-id="ev_da32548c0e" className="text-lg font-medium mb-2">אין נכסים בקטגוריה זו</h3>
          <p data-ev-id="ev_0b636f5901" className="text-muted-foreground mb-4">העלה נכסים כדי להתחיל</p>
          <Button onClick={() => setShowUploadModal(true)} className="gap-2">
            <Upload className="w-5 h-5" />
            העלאת נכס
          </Button>
        </Card> :
      viewMode === 'grid' ?
      <div data-ev-id="ev_7d9e17927f" className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <AnimatePresence>
            {filteredAssets.map((asset, index) =>
          <motion.div
            key={asset.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: index * 0.02 }}
            className={`group relative aspect-square rounded-lg overflow-hidden border transition-colors ${
            asset.is_visible ? 'border-border hover:border-primary' : 'border-destructive/30 opacity-60'}`
            }>

                {/* Asset Preview */}
                <AssetThumbnail asset={asset} />

                {/* Hidden Badge */}
                {!asset.is_visible &&
            <div data-ev-id="ev_2e727ac665" className="absolute top-2 left-2 px-2 py-1 bg-destructive/90 text-white text-xs rounded-full flex items-center gap-1">
                    <EyeOff className="w-3 h-3" />
                    מוסתר
                  </div>
            }

                {/* Hover Actions */}
                <div data-ev-id="ev_5cdc18e649" className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button data-ev-id="ev_32635eb3d6"
              onClick={() => setEditingAsset(asset)}
              className="p-2 bg-white rounded-full hover:bg-muted transition-colors"
              title="עריכה">

                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button data-ev-id="ev_d4c9c00af5"
              onClick={() => handleToggleVisibility(asset.id)}
              className="p-2 bg-white rounded-full hover:bg-muted transition-colors"
              title={asset.is_visible ? 'הסתר' : 'הצג'}>

                    {asset.is_visible ?
                <EyeOff className="w-4 h-4" /> :

                <Eye className="w-4 h-4" />
                }
                  </button>
                  <button data-ev-id="ev_f8b37b3f35"
              onClick={() => handleDelete(asset.id)}
              className="p-2 bg-destructive text-white rounded-full hover:bg-destructive/80 transition-colors"
              title="מחיקה">

                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Name Label */}
                <div data-ev-id="ev_53d7b25013" className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                  <p data-ev-id="ev_729e842bc4" className="text-white text-xs truncate">
                    {language === 'he' ? asset.name_he || asset.name : asset.name}
                  </p>
                </div>
              </motion.div>
          )}
          </AnimatePresence>
        </div> :

      <div data-ev-id="ev_743d63a95d" className="flex flex-col gap-2">
          {filteredAssets.map((asset) =>
        <div data-ev-id="ev_bfee1655dc"
        key={asset.id}
        className={`flex items-center gap-4 p-3 bg-white rounded-lg border transition-colors ${
        asset.is_visible ? 'border-border hover:border-primary' : 'border-destructive/30 opacity-60'}`
        }>

              {/* Thumbnail */}
              <div data-ev-id="ev_d3a3dce771" className="w-16 h-16 rounded overflow-hidden flex-shrink-0">
                <AssetThumbnail asset={asset} />
              </div>

              {/* Info */}
              <div data-ev-id="ev_61e6fac751" className="flex-1">
                <p data-ev-id="ev_cc285c8beb" className="font-medium">
                  {language === 'he' ? asset.name_he || asset.name : asset.name}
                </p>
                <p data-ev-id="ev_afd0b3b4b6" className="text-sm text-muted-foreground">
                  {getCategoryLabel(asset.category)}
                  {asset.tags && asset.tags.length > 0 &&
              <span data-ev-id="ev_982b1711ce" className="mr-2">
                      • {asset.tags.slice(0, 3).join(', ')}
                    </span>
              }
                </p>
              </div>

              {/* Visibility Badge */}
              {!asset.is_visible &&
          <span data-ev-id="ev_674999a1b0" className="px-2 py-1 bg-destructive/10 text-destructive text-xs rounded-full">
                  מוסתר
                </span>
          }

              {/* Actions */}
              <div data-ev-id="ev_55ae0cf218" className="flex items-center gap-1">
                <button data-ev-id="ev_69f089738a"
            onClick={() => setEditingAsset(asset)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="עריכה">

                  <Edit2 className="w-4 h-4" />
                </button>
                <button data-ev-id="ev_24bbc41b90"
            onClick={() => handleToggleVisibility(asset.id)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title={asset.is_visible ? 'הסתר' : 'הצג'}>

                  {asset.is_visible ?
              <EyeOff className="w-4 h-4" /> :

              <Eye className="w-4 h-4" />
              }
                </button>
                <button data-ev-id="ev_d8201bdff9"
            onClick={() => handleDelete(asset.id)}
            className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-destructive"
            title="מחיקה">

                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
        )}
        </div>
      }

      {/* Upload Modal */}
      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        selectedType={selectedType}
        onUpload={handleUpload}
        language={language} />


      {/* Edit Modal */}
      <EditAssetModal
        asset={editingAsset}
        isOpen={!!editingAsset}
        onClose={() => setEditingAsset(null)}
        onSave={handleSaveEdit}
        language={language} />

    </div>);

}