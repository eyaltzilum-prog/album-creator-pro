/**
 * Compact Editor Toolbar - Thin top bar for editor
 * Height: 48-56px as per design spec
 */
import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ChevronLeft,
  Save,
  Undo2,
  Redo2,
  Eye,
  Settings,
  Send,
  Loader2,
  Check,
  AlertCircle,
  Maximize2,
  Minimize2 } from
'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/Button';

interface EditorToolbarProps {
  albumTitle: string;
  isSaving: boolean;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  canUndo: boolean;
  canRedo: boolean;
  isFocusMode: boolean;
  onSave: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onPreview: () => void;
  onSubmit: () => void;
  onSettings: () => void;
  onToggleFocusMode: () => void;
  onBack: () => void;
  canSubmit?: boolean;
}

export function EditorToolbar({
  albumTitle,
  isSaving,
  saveStatus,
  canUndo,
  canRedo,
  isFocusMode,
  onSave,
  onUndo,
  onRedo,
  onPreview,
  onSubmit,
  onSettings,
  onToggleFocusMode,
  onBack,
  canSubmit = true
}: EditorToolbarProps) {
  const { language, isRTL } = useLanguage();
  const navigate = useNavigate();

  const getSaveStatusIcon = () => {
    switch (saveStatus) {
      case 'saving':
        return <Loader2 className="w-4 h-4 animate-spin text-gray-400" />;
      case 'saved':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getSaveStatusText = () => {
    switch (saveStatus) {
      case 'saving':
        return language === 'he' ? 'שומר...' : 'Saving...';
      case 'saved':
        return language === 'he' ? 'נשמר' : 'Saved';
      case 'error':
        return language === 'he' ? 'שגיאה' : 'Error';
      default:
        return '';
    }
  };

  return (
    <header data-ev-id="ev_cbf622b22f"
    className="h-12 bg-gray-900 border-b border-gray-700 px-3 flex items-center justify-between flex-shrink-0 z-50"
    dir={isRTL ? 'rtl' : 'ltr'}>

      {/* Left section - Back & Title */}
      <div data-ev-id="ev_c813b59e28" className="flex items-center gap-3 min-w-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-gray-400 hover:text-white p-1.5">

          <ChevronLeft className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
        </Button>
        
        <div data-ev-id="ev_7870320eb3" className="flex items-center gap-2 min-w-0">
          <h1 data-ev-id="ev_63beae3f0d" className="text-sm font-medium text-white truncate max-w-[200px]">
            {albumTitle}
          </h1>
          {/* Save status indicator */}
          <div data-ev-id="ev_b96d2a102f" className="flex items-center gap-1 text-xs">
            {getSaveStatusIcon()}
            <span data-ev-id="ev_caa00370fd" className={`${
            saveStatus === 'error' ? 'text-red-400' :
            saveStatus === 'saved' ? 'text-green-400' : 'text-gray-500'}`
            }>
              {getSaveStatusText()}
            </span>
          </div>
        </div>
      </div>

      {/* Center section - History controls */}
      <div data-ev-id="ev_26347cdaf1" className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onUndo}
          disabled={!canUndo}
          className="text-gray-400 hover:text-white p-1.5 disabled:opacity-30"
          title={language === 'he' ? 'בטל (Ctrl+Z)' : 'Undo (Ctrl+Z)'}>

          <Undo2 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRedo}
          disabled={!canRedo}
          className="text-gray-400 hover:text-white p-1.5 disabled:opacity-30"
          title={language === 'he' ? 'שחזר (Ctrl+Y)' : 'Redo (Ctrl+Y)'}>

          <Redo2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Right section - Actions */}
      <div data-ev-id="ev_dab1d26903" className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleFocusMode}
          className="text-gray-400 hover:text-white p-1.5"
          title={language === 'he' ? isFocusMode ? 'צא ממצב מרוכז' : 'מצב מרוכז' : isFocusMode ? 'Exit Focus Mode' : 'Focus Mode'}>

          {isFocusMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onSettings}
          className="text-gray-400 hover:text-white p-1.5"
          title={language === 'he' ? 'הגדרות' : 'Settings'}>

          <Settings className="w-4 h-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onPreview}
          className="text-gray-400 hover:text-white p-1.5"
          title={language === 'he' ? 'תצוגה מקדימה' : 'Preview'}>

          <Eye className="w-4 h-4" />
        </Button>

        <div data-ev-id="ev_4a4bb637a5" className="w-px h-6 bg-gray-700 mx-1" />

        <Button
          variant="secondary"
          size="sm"
          onClick={onSave}
          disabled={isSaving}
          className="h-8 px-3 text-sm">

          {isSaving ?
          <Loader2 className="w-4 h-4 animate-spin" /> :

          <>
              <Save className="w-4 h-4 mr-1" />
              {language === 'he' ? 'שמור' : 'Save'}
            </>
          }
        </Button>

        {canSubmit &&
        <Button
          size="sm"
          onClick={onSubmit}
          className="h-8 px-3 text-sm">

            <Send className="w-4 h-4 mr-1" />
            {language === 'he' ? 'שלח' : 'Submit'}
          </Button>
        }
      </div>
    </header>);

}