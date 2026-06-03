import { ReactNode, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
}

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-4xl'
};

export function Modal({ isOpen, onClose, title, children, size = 'md', showCloseButton = true }: ModalProps) {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen &&
      <div data-ev-id="ev_53a495271d" className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          
          {/* Modal Content */}
          <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={`relative w-full ${sizes[size]} mx-4 bg-white rounded-xl shadow-2xl`}>

            {/* Header */}
            {(title || showCloseButton) &&
          <div data-ev-id="ev_f1d5ed020b" className="flex items-center justify-between p-4 border-b border-border">
                {title && <h2 data-ev-id="ev_9d5310c021" className="text-xl font-semibold">{title}</h2>}
                {showCloseButton &&
            <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
                    <X className="w-5 h-5" />
                  </Button>
            }
              </div>
          }
            
            {/* Body */}
            <div data-ev-id="ev_66aac80db7" className="p-4 max-h-[80vh] overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </div>
      }
    </AnimatePresence>);

}