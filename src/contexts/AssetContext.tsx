import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

// ============================================================================
// TYPES
// ============================================================================

export type AssetType = 'template' | 'background' | 'clipart' | 'sticker' | 'font' | 'frame';

export interface Asset {
  id: string;
  asset_type: AssetType;
  category: string;
  name: string;
  name_he: string | null;
  file_url: string;
  thumbnail_url: string | null;
  data_url: string | null;
  preview_data: string | null;
  is_active: boolean;
  is_visible: boolean;
  sort_order: number;
  tags: string[];
  metadata: Record<string, any> | null;
  created_at: string;
  width: number | null;
  height: number | null;
}

export interface AssetUploadData {
  name: string;
  name_he?: string;
  asset_type: AssetType;
  category: string;
  tags?: string[];
  file: File;
}

interface AssetContextType {
  // State
  assets: Asset[];
  loading: boolean;
  error: string | null;
  
  // Filtered getters
  getAssetsByType: (type: AssetType) => Asset[];
  getAssetsByCategory: (type: AssetType, category: string) => Asset[];
  getVisibleAssets: (type: AssetType) => Asset[];
  searchAssets: (query: string, type?: AssetType) => Asset[];
  
  // Actions
  fetchAssets: () => Promise<void>;
  uploadAsset: (data: AssetUploadData) => Promise<Asset | null>;
  updateAsset: (id: string, updates: Partial<Asset>) => Promise<boolean>;
  deleteAsset: (id: string) => Promise<boolean>;
  toggleVisibility: (id: string) => Promise<boolean>;
  
  // Categories
  getCategoriesForType: (type: AssetType) => string[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const ASSET_CATEGORIES: Record<AssetType, string[]> = {
  template: ['wedding', 'baby', 'travel', 'family', 'holiday', 'minimal', 'classic'],
  background: ['solid', 'gradient', 'texture', 'pattern', 'wedding', 'baby', 'travel'],
  clipart: ['wedding', 'baby', 'travel', 'nature', 'celebration', 'abstract'],
  sticker: ['emoji', 'wedding', 'baby', 'travel', 'celebration'],
  frame: ['classic', 'modern', 'decorative', 'minimal'],
  font: ['hebrew', 'english', 'decorative']
};

export const CATEGORY_LABELS: Record<string, { he: string; en: string }> = {
  wedding: { he: 'חתונה', en: 'Wedding' },
  baby: { he: 'תינוק', en: 'Baby' },
  travel: { he: 'טיול', en: 'Travel' },
  family: { he: 'משפחה', en: 'Family' },
  holiday: { he: 'חגים', en: 'Holiday' },
  minimal: { he: 'מינימלי', en: 'Minimal' },
  classic: { he: 'קלאסית', en: 'Classic' },
  solid: { he: 'אחיד', en: 'Solid' },
  gradient: { he: 'גרדיאנט', en: 'Gradient' },
  texture: { he: 'טקסטורה', en: 'Texture' },
  pattern: { he: 'דוגמה', en: 'Pattern' },
  nature: { he: 'טבע', en: 'Nature' },
  celebration: { he: 'חגיגה', en: 'Celebration' },
  abstract: { he: 'אבסטרקט', en: 'Abstract' },
  modern: { he: 'מודרני', en: 'Modern' },
  decorative: { he: 'דקורטיבי', en: 'Decorative' },
  hebrew: { he: 'עברית', en: 'Hebrew' },
  english: { he: 'אנגלית', en: 'English' },
  emoji: { he: 'אמוג׳י', en: 'Emoji' }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });
};

const createThumbnail = (dataUrl: string, maxSize: number = 200): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
    img.src = dataUrl;
  });
};

const getImageDimensions = (dataUrl: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.src = dataUrl;
  });
};

// ============================================================================
// CONTEXT
// ============================================================================

const AssetContext = createContext<AssetContextType | null>(null);

export function AssetProvider({ children }: { children: ReactNode }) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false); // Start as false - don't block app
  const [error, setError] = useState<string | null>(null);

  // Fetch all assets - disabled temporarily to fix database timeout
  const fetchAssets = useCallback(async () => {
    // TEMPORARILY DISABLED - database overloaded from font uploads
    // Re-enable once database recovers
    console.log('Asset loading disabled temporarily');
    setLoading(false);
    return;
    
    /*
    if (!supabase) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('assets')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .limit(200);
      
      if (fetchError) throw fetchError;
      setAssets((data as Asset[]) || []);
    } catch (err) {
      console.error('Error fetching assets:', err);
      setError('Failed to load assets');
    } finally {
      setLoading(false);
    }
    */
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  // Get assets by type
  const getAssetsByType = useCallback((type: AssetType): Asset[] => {
    return assets.filter(a => a.asset_type === type);
  }, [assets]);

  // Get assets by type and category
  const getAssetsByCategory = useCallback((type: AssetType, category: string): Asset[] => {
    return assets.filter(a => a.asset_type === type && a.category === category);
  }, [assets]);

  // Get only visible assets (for user editor)
  const getVisibleAssets = useCallback((type: AssetType): Asset[] => {
    return assets.filter(a => a.asset_type === type && a.is_visible);
  }, [assets]);

  // Search assets
  const searchAssets = useCallback((query: string, type?: AssetType): Asset[] => {
    const lowerQuery = query.toLowerCase();
    return assets.filter(a => {
      if (type && a.asset_type !== type) return false;
      return (
        a.name.toLowerCase().includes(lowerQuery) ||
        (a.name_he?.toLowerCase() || '').includes(lowerQuery) ||
        a.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    });
  }, [assets]);

  // Upload new asset
  const uploadAsset = useCallback(async (data: AssetUploadData): Promise<Asset | null> => {
    if (!supabase) return null;
    
    try {
      // Convert file to base64
      const dataUrl = await fileToBase64(data.file);
      
      // Create thumbnail for images
      let thumbnailUrl = dataUrl;
      let width: number | null = null;
      let height: number | null = null;
      
      if (data.file.type.startsWith('image/')) {
        thumbnailUrl = await createThumbnail(dataUrl);
        const dimensions = await getImageDimensions(dataUrl);
        width = dimensions.width;
        height = dimensions.height;
      }
      
      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');
      
      // Calculate sort order
      const maxSort = assets
        .filter(a => a.asset_type === data.asset_type)
        .reduce((max, a) => Math.max(max, a.sort_order), 0);
      
      // Insert into database
      const { data: newAsset, error: insertError } = await supabase
        .from('assets')
        .insert({
          name: data.name,
          name_he: data.name_he || null,
          asset_type: data.asset_type,
          category: data.category,
          tags: data.tags || [],
          file_url: dataUrl,
          thumbnail_url: thumbnailUrl,
          data_url: dataUrl,
          preview_data: thumbnailUrl,
          width,
          height,
          is_active: true,
          is_visible: true,
          sort_order: maxSort + 1,
          uploaded_by: userData.user.id,
          metadata: { originalName: data.file.name, mimeType: data.file.type, size: data.file.size }
        })
        .select()
        .single();
      
      if (insertError) throw insertError;
      
      // Update local state
      setAssets(prev => [...prev, newAsset as Asset]);
      
      return newAsset as Asset;
    } catch (err) {
      console.error('Error uploading asset:', err);
      setError('Failed to upload asset');
      return null;
    }
  }, [assets]);

  // Update asset
  const updateAsset = useCallback(async (id: string, updates: Partial<Asset>): Promise<boolean> => {
    if (!supabase) return false;
    
    try {
      const { error: updateError } = await supabase
        .from('assets')
        .update(updates)
        .eq('id', id);
      
      if (updateError) throw updateError;
      
      // Update local state
      setAssets(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
      
      return true;
    } catch (err) {
      console.error('Error updating asset:', err);
      return false;
    }
  }, []);

  // Delete asset
  const deleteAsset = useCallback(async (id: string): Promise<boolean> => {
    if (!supabase) return false;
    
    try {
      const { error: deleteError } = await supabase
        .from('assets')
        .delete()
        .eq('id', id);
      
      if (deleteError) throw deleteError;
      
      // Update local state
      setAssets(prev => prev.filter(a => a.id !== id));
      
      return true;
    } catch (err) {
      console.error('Error deleting asset:', err);
      return false;
    }
  }, []);

  // Toggle visibility
  const toggleVisibility = useCallback(async (id: string): Promise<boolean> => {
    const asset = assets.find(a => a.id === id);
    if (!asset) return false;
    return updateAsset(id, { is_visible: !asset.is_visible });
  }, [assets, updateAsset]);

  // Get categories for type
  const getCategoriesForType = useCallback((type: AssetType): string[] => {
    return ASSET_CATEGORIES[type] || [];
  }, []);

  const value: AssetContextType = {
    assets,
    loading,
    error,
    getAssetsByType,
    getAssetsByCategory,
    getVisibleAssets,
    searchAssets,
    fetchAssets,
    uploadAsset,
    updateAsset,
    deleteAsset,
    toggleVisibility,
    getCategoriesForType
  };

  return (
    <AssetContext.Provider value={value}>
      {children}
    </AssetContext.Provider>
  );
}

export function useAssets() {
  const context = useContext(AssetContext);
  if (!context) {
    throw new Error('useAssets must be used within an AssetProvider');
  }
  return context;
}

export default AssetContext;
