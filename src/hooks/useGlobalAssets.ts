import { useMemo } from 'react';
import { useAssets, Asset, AssetType } from '@/contexts/AssetContext';

/**
 * Hook for accessing global assets in the user editor
 * Returns only visible assets that admins have made available
 */
export function useGlobalAssets() {
  const { assets, loading, getVisibleAssets, searchAssets } = useAssets();

  // Get visible backgrounds
  const backgrounds = useMemo(() => {
    return getVisibleAssets('background');
  }, [getVisibleAssets]);

  // Get visible frames
  const frames = useMemo(() => {
    return getVisibleAssets('frame');
  }, [getVisibleAssets]);

  // Get visible clipart
  const clipart = useMemo(() => {
    return getVisibleAssets('clipart');
  }, [getVisibleAssets]);

  // Get visible stickers
  const stickers = useMemo(() => {
    return getVisibleAssets('sticker');
  }, [getVisibleAssets]);

  // Get visible fonts
  const fonts = useMemo(() => {
    return getVisibleAssets('font');
  }, [getVisibleAssets]);

  // Get visible templates
  const templates = useMemo(() => {
    return getVisibleAssets('template');
  }, [getVisibleAssets]);

  // Group backgrounds by category
  const backgroundsByCategory = useMemo(() => {
    const grouped: Record<string, Asset[]> = {};
    backgrounds.forEach(bg => {
      if (!grouped[bg.category]) grouped[bg.category] = [];
      grouped[bg.category].push(bg);
    });
    return grouped;
  }, [backgrounds]);

  // Group frames by category
  const framesByCategory = useMemo(() => {
    const grouped: Record<string, Asset[]> = {};
    frames.forEach(frame => {
      if (!grouped[frame.category]) grouped[frame.category] = [];
      grouped[frame.category].push(frame);
    });
    return grouped;
  }, [frames]);

  // Get decorations (clipart + stickers combined)
  const decorations = useMemo(() => {
    return [...clipart, ...stickers];
  }, [clipart, stickers]);

  // Search function for user editor
  const search = (query: string, type?: AssetType) => {
    const results = searchAssets(query, type);
    // Only return visible results for user editor
    return results.filter(a => a.is_visible);
  };

  // Check if a background is a color (solid or gradient)
  const isColorBackground = (asset: Asset): boolean => {
    const metadata = asset.metadata as Record<string, any> | null;
    return metadata?.type === 'color' || metadata?.type === 'gradient';
  };

  // Get background value (color, gradient, or image URL)
  const getBackgroundValue = (asset: Asset): string => {
    return asset.data_url || asset.file_url;
  };

  // Get frame metadata
  const getFrameConfig = (asset: Asset) => {
    const metadata = (asset.metadata || {}) as Record<string, any>;
    return {
      shape: metadata.shape || 'rectangle',
      borderRadius: metadata.borderRadius || 0,
      borderWidth: metadata.borderWidth || 0,
      borderColor: metadata.borderColor || '#000000',
      shadow: metadata.shadow || false,
      style: metadata.style || null
    };
  };

  return {
    // Loading state
    loading,
    
    // Asset collections
    backgrounds,
    frames,
    clipart,
    stickers,
    fonts,
    templates,
    decorations,
    
    // Grouped assets
    backgroundsByCategory,
    framesByCategory,
    
    // Utility functions
    search,
    isColorBackground,
    getBackgroundValue,
    getFrameConfig,
    
    // Counts
    totalAssets: assets.filter(a => a.is_visible).length,
    backgroundCount: backgrounds.length,
    frameCount: frames.length,
    decorationCount: decorations.length
  };
}

export default useGlobalAssets;
