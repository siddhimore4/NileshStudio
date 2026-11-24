import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Sparkles, Eye, Camera, Heart, CheckCircle2 } from 'lucide-react';
import { Category, Subcategory, GalleryItem } from '../types';
import { api } from '../api';
import { LightboxModal } from './LightboxModal';
import { FALLBACK_GALLERY_ITEMS } from '../data/fallbackCatalog';

interface CategoryDetailViewProps {
  category: Category;
  onBack: () => void;
  onBookNow: (categoryId: string, subcategoryId?: string) => void;
}

export const CategoryDetailView: React.FC<CategoryDetailViewProps> = ({
  category,
  onBack,
  onBookNow,
}) => {
  const [selectedSubcatId, setSelectedSubcatId] = useState<string>(
    category.subcategories && category.subcategories.length > 0
      ? category.subcategories[0].id
      : ''
  );
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLightboxItem, setActiveLightboxItem] = useState<GalleryItem | null>(null);

  const isIndoorOrOutdoor = category.id === 'indoor' || category.id === 'outdoor';

  useEffect(() => {
    async function loadGallery() {
      setLoading(true);
      try {
        if (isIndoorOrOutdoor) {
          const items = await api.getGallery(category.id, selectedSubcatId || undefined);
          if (items && items.length > 0) {
            setGalleryItems(items);
          } else {
            // fallback if empty
            const fallback = FALLBACK_GALLERY_ITEMS.filter(
              g => g.category_id === category.id && g.subcategory_id === selectedSubcatId
            );
            setGalleryItems(fallback);
          }
        } else {
          const items = await api.getGallery(category.id);
          if (items && items.length > 0) {
            setGalleryItems(items);
          } else {
            const fallback = FALLBACK_GALLERY_ITEMS.filter(g => g.category_id === category.id);
            setGalleryItems(fallback);
          }
        }
      } catch (err) {
        console.warn('Network gallery fetch failed, using bundled gallery:', err);
        const fallback = isIndoorOrOutdoor
          ? FALLBACK_GALLERY_ITEMS.filter(g => g.category_id === category.id && g.subcategory_id === selectedSubcatId)
          : FALLBACK_GALLERY_ITEMS.filter(g => g.category_id === category.id);
        setGalleryItems(fallback);
      } finally {
        setLoading(false);
      }
    }
    loadGallery();
  }, [category.id, selectedSubcatId, isIndoorOrOutdoor]);

  // Current active subcategory details if applicable
  const currentSubcategory = category.subcategories?.find(s => s.id === selectedSubcatId);

  return (
    <div className="min-h-screen bg-studio-950 pb-24 animate-fade-in">
      {/* Lightbox Modal */}
      <LightboxModal
        item={activeLightboxItem}
        categoryTitle={category.title}
        subcategoryTitle={currentSubcategory?.title}
        onClose={() => setActiveLightboxItem(null)}
        onBookNow={onBookNow}
      />

      {/* Top Navigation Bar with Category Title */}
      <div className="sticky top-0 z-30 bg-studio-950/90 backdrop-blur-md border-b border-gold-500/15 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-studio-300 hover:text-gold-400 font-medium text-xs sm:text-sm transition-colors group"
          >
            <div className="w-8 h-8 rounded-lg bg-studio-900 border border-gold-500/20 flex items-center justify-center group-hover:border-gold-400 transition-colors">
              <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
            </div>
            <span>Back to Categories</span>
          </button>

          <button
            onClick={() => onBookNow(category.id, isIndoorOrOutdoor ? selectedSubcatId : undefined)}
            className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-studio-950 font-bold text-xs px-4 py-2 rounded-xl shadow-glow-gold flex items-center space-x-1.5 transition-all"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Book Now</span>
          </button>
        </div>
      </div>

      {/* Hero Category Banner */}
      <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-studio-900">
        <img
          src={category.cover_image}
          alt={category.title}
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-studio-950 via-studio-950/60 to-studio-950/20"></div>

        {/* Hero Content */}
        <div className="absolute bottom-6 left-0 right-0 px-4 sm:px-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center space-x-1.5 bg-studio-900/80 backdrop-blur-md border border-gold-500/30 px-3 py-1 rounded-full text-[11px] font-semibold text-gold-400 mb-2.5">
            <Sparkles className="w-3 h-3 text-gold-400" />
            <span>{isIndoorOrOutdoor ? 'Studio Collection' : 'Masterpiece Series'}</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-white tracking-wide mb-1.5">
            {category.title}
          </h1>
          <p className="text-gold-300/90 font-medium text-xs sm:text-sm mb-2">
            {category.subtitle}
          </p>
          <p className="text-xs sm:text-sm text-studio-300 max-w-2xl line-clamp-2">
            {category.description}
          </p>
        </div>
      </div>

      {/* Subcategories Navigation for Indoor and Outdoor */}
      {isIndoorOrOutdoor && category.subcategories && category.subcategories.length > 0 && (
        <div className="max-w-4xl mx-auto px-4 pt-6">
          <div className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-studio-400 mb-2.5">
              Select Subcategory
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {category.subcategories.map((subcat) => {
                const isActive = selectedSubcatId === subcat.id;
                return (
                  <button
                    key={subcat.id}
                    onClick={() => setSelectedSubcatId(subcat.id)}
                    className={`relative p-3 rounded-2xl text-left border transition-all duration-200 flex flex-col justify-between overflow-hidden ${
                      isActive
                        ? 'bg-studio-850 border-gold-500 shadow-glow-gold'
                        : 'bg-studio-900/80 border-studio-800 hover:border-gold-500/30 hover:bg-studio-850/60'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className={`text-xs font-bold tracking-wide ${isActive ? 'text-gold-400' : 'text-studio-200'}`}>
                        {subcat.title}
                      </span>
                      {isActive && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-gold-400" />
                      )}
                    </div>
                    <span className="text-[10px] text-studio-400 line-clamp-1">
                      {subcat.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Subcategory Banner Card */}
          {currentSubcategory && (
            <div className="glass-card-gold p-4 sm:p-5 rounded-2xl mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gold-400">
                  Current Selection
                </span>
                <h3 className="font-serif text-xl font-bold text-white">
                  {currentSubcategory.title}
                </h3>
                <p className="text-xs text-studio-300 mt-0.5 max-w-xl">
                  {currentSubcategory.description}
                </p>
              </div>
              <button
                onClick={() => onBookNow(category.id, currentSubcategory.id)}
                className="w-full sm:w-auto bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-studio-950 font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-glow-gold flex items-center justify-center space-x-2 transition-all shrink-0"
              >
                <Calendar className="w-4 h-4 stroke-[2.2]" />
                <span>Book {currentSubcategory.title}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Wedding / Pre-Wedding Premium Highlight Overview */}
      {!isIndoorOrOutdoor && (
        <div className="max-w-4xl mx-auto px-4 pt-6">
          <div className="glass-panel p-5 sm:p-6 rounded-3xl mb-6 border border-gold-500/25">
            <div className="flex items-center space-x-2 mb-2">
              <Sparkles className="w-4 h-4 text-gold-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-gold-400">
                Exclusive Nilesh Studio Signature Service
              </span>
            </div>
            <h3 className="font-serif text-2xl font-bold text-white mb-2">
              {category.id === 'wedding'
                ? 'Royal Wedding Photography & Heirloom Cinematography'
                : 'Cinematic Pre-Wedding Shoots & Destination Love Stories'}
            </h3>
            <p className="text-xs sm:text-sm text-studio-300 leading-relaxed mb-4">
              {category.id === 'wedding'
                ? 'Every Indian wedding is a symphony of timeless rituals, sacred commitments, and unscripted joy. Our bespoke wedding team blends royal portraiture with authentic documentary candids. Equipped with high-end full-frame cinema bodies, drone coverage, and signature color grading, we preserve your memories as high-definition heirlooms.'
                : 'Your journey to "Forever" deserves a visual tribute. We curate breathtaking outdoor sunset sessions, majestic palace locations, and intimate scenic backdrops with creative fashion-inspired framing.'}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-studio-800 text-xs">
              <div className="flex items-center space-x-2 text-studio-300">
                <CheckCircle2 className="w-4 h-4 text-gold-400 shrink-0" />
                <span>Dual Sony FX3/A7R V</span>
              </div>
              <div className="flex items-center space-x-2 text-studio-300">
                <CheckCircle2 className="w-4 h-4 text-gold-400 shrink-0" />
                <span>G-Master Prime Lenses</span>
              </div>
              <div className="flex items-center space-x-2 text-studio-300">
                <CheckCircle2 className="w-4 h-4 text-gold-400 shrink-0" />
                <span>Calibrated Studio Strobe</span>
              </div>
              <div className="flex items-center space-x-2 text-studio-300">
                <CheckCircle2 className="w-4 h-4 text-gold-400 shrink-0" />
                <span>Handcrafted Photo Books</span>
              </div>
            </div>

            <div className="mt-5 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-studio-800/60">
              <div className="text-xs text-studio-400">
                Selected by over 800+ couples across Maharashtra & nationwide.
              </div>
              <button
                onClick={() => onBookNow(category.id)}
                className="w-full sm:w-auto bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-studio-950 font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-glow-gold flex items-center justify-center space-x-2"
              >
                <Calendar className="w-4 h-4 stroke-[2.2]" />
                <span>Reserve {category.title} Slot</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gallery Section */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-serif text-xl font-bold text-studio-100 flex items-center space-x-2">
              <Camera className="w-4 h-4 text-gold-400" />
              <span>Sample Photograph Gallery</span>
            </h3>
            <p className="text-xs text-studio-400">
              Tap any photo to expand into high-resolution view
            </p>
          </div>
          <span className="text-xs font-semibold text-gold-400/80 bg-studio-900 border border-gold-500/20 px-2.5 py-1 rounded-lg">
            {galleryItems.length} Samples
          </span>
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="h-56 rounded-2xl skeleton-shimmer"></div>
            ))}
          </div>
        ) : galleryItems.length === 0 ? (
          <div className="p-8 text-center text-studio-400 glass-card rounded-2xl">
            No sample photographs found for this category.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {galleryItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setActiveLightboxItem(item)}
                className="group relative h-64 sm:h-72 rounded-2xl overflow-hidden bg-studio-900 border border-studio-800 hover:border-gold-500/40 cursor-pointer shadow-md transition-all duration-300 hover:shadow-glow-gold hover:-translate-y-1"
              >
                <img
                  src={item.image_url}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-studio-950 via-studio-950/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>

                {/* Tap to expand pill */}
                <div className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-studio-950/70 backdrop-blur-md border border-gold-500/20 flex items-center justify-center text-gold-400 group-hover:scale-110 transition-transform">
                  <Eye className="w-3.5 h-3.5" />
                </div>

                {/* Caption bottom */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5">
                  <p className="text-[11px] font-semibold text-white line-clamp-2 leading-snug drop-shadow-sm">
                    {item.title}
                  </p>
                  <p className="text-[10px] text-gold-400/90 mt-0.5 flex items-center space-x-1">
                    <span>Tap to view larger</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom Booking Action Bar */}
        <div className="mt-8 p-6 bg-gradient-to-br from-studio-900 to-studio-950 border border-gold-500/30 rounded-3xl text-center shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6 text-gold-400" />
          </div>
          <h4 className="font-serif text-xl sm:text-2xl font-bold text-white mb-1.5">
            Ready to book your {category.title} session?
          </h4>
          <p className="text-xs sm:text-sm text-studio-400 max-w-md mx-auto mb-4">
            Select your preferred date & check real-time available time slots between 10:30 AM and 8:30 PM.
          </p>
          <button
            onClick={() => onBookNow(category.id, isIndoorOrOutdoor ? selectedSubcatId : undefined)}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-gold-500 via-gold-400 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-studio-950 font-extrabold text-sm px-8 py-3.5 rounded-xl shadow-glow-gold transition-all duration-200"
          >
            <Calendar className="w-4 h-4 stroke-[2.5]" />
            <span>Book {isIndoorOrOutdoor && currentSubcategory ? currentSubcategory.title : category.title} Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
