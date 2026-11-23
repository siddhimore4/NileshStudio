import React from 'react';
import { X, ZoomIn, Calendar, Sparkles } from 'lucide-react';
import { GalleryItem } from '../types';

interface LightboxModalProps {
  item: GalleryItem | null;
  categoryTitle?: string;
  subcategoryTitle?: string;
  onClose: () => void;
  onBookNow: (categoryId: string, subcategoryId?: string) => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  item,
  categoryTitle,
  subcategoryTitle,
  onClose,
  onBookNow,
}) => {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl animate-fade-in">
      <div className="relative max-w-3xl w-full bg-studio-900 border border-gold-500/30 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Close Button Top Right */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-studio-950/80 hover:bg-studio-950 text-studio-200 hover:text-white border border-gold-500/20 flex items-center justify-center transition-colors"
          title="Close Lightbox"
        >
          <X className="w-5 h-5" />
        </button>

        {/* High Resolution Image Container */}
        <div className="relative flex-1 min-h-[300px] sm:min-h-[440px] bg-studio-950 flex items-center justify-center overflow-hidden group">
          <img
            src={item.image_url}
            alt={item.title}
            className="w-full h-full max-h-[65vh] object-contain select-none"
          />

          {/* Watermark / Brand Badge */}
          <div className="absolute bottom-3 left-3 bg-studio-950/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-gold-500/20 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            <span className="font-display font-semibold text-xs tracking-wider text-gold-300">
              NILESH STUDIO ARCHIVE
            </span>
          </div>
        </div>

        {/* Image Details & Direct Booking Action */}
        <div className="p-4 sm:p-6 bg-studio-900 border-t border-gold-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-gold-400 uppercase tracking-wider mb-1">
              <span>{categoryTitle || 'Nilesh Studio'}</span>
              {subcategoryTitle && (
                <>
                  <span className="text-studio-600">•</span>
                  <span>{subcategoryTitle}</span>
                </>
              )}
            </div>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-studio-50">
              {item.title}
            </h3>
            <p className="text-xs text-studio-400 mt-0.5">
              Shot on cinema-grade primes with bespoke studio & ambient lighting.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                onClose();
                onBookNow(item.category_id, item.subcategory_id || undefined);
              }}
              className="w-full sm:w-auto bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-studio-950 font-bold px-5 py-2.5 rounded-xl shadow-glow-gold flex items-center justify-center space-x-2 transition-all duration-200"
            >
              <Calendar className="w-4 h-4 stroke-[2.2]" />
              <span className="text-xs sm:text-sm">Book This Style</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
