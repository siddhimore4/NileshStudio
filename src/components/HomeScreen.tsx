import React from 'react';
import {
  Camera,
  Sparkles,
  Calendar,
  ArrowRight,
  Star,
  Award,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Heart
} from 'lucide-react';
import { Category, Customer } from '../types';

interface HomeScreenProps {
  categories: Category[];
  customer: Customer | null;
  onSelectCategory: (categoryId: string) => void;
  onOpenBooking: (categoryId?: string) => void;
  onRequireAuth: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  categories,
  customer,
  onSelectCategory,
  onOpenBooking,
  onRequireAuth,
}) => {
  return (
    <div className="pb-28 animate-fade-in">
      {/* Hero Studio Banner */}
      <div className="relative overflow-hidden px-4 pt-4 sm:pt-6 pb-6">
        <div className="max-w-4xl mx-auto relative rounded-3xl bg-gradient-to-br from-studio-900 via-studio-850 to-studio-950 border border-gold-500/30 p-6 sm:p-10 shadow-2xl overflow-hidden">
          {/* Subtle Ambient Radial Glows */}
          <div className="absolute -top-32 -right-32 w-72 h-72 bg-gold-500/15 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-32 -left-32 w-72 h-72 bg-gold-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10">
            {/* Top Badge & Studio Brand Logo */}
            <div className="flex items-center space-x-3.5 mb-4">
              <div className="relative group shrink-0">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-gold-400 to-amber-200 rounded-full blur opacity-60 group-hover:opacity-90 transition duration-300"></div>
                <img
                  src="/logo.png"
                  alt="Nilesh Studio"
                  className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover ring-2 ring-gold-400/70 shadow-glow-gold bg-black"
                />
              </div>
              <div>
                <div className="inline-flex items-center space-x-1.5 bg-studio-950/80 backdrop-blur-md border border-gold-500/40 px-3 py-1 rounded-full text-[11px] font-semibold text-gold-400 shadow-sm">
                  <Sparkles className="w-3 h-3 text-gold-400" />
                  <span>PREMIER PHOTOGRAPHY STUDIO</span>
                </div>
                <div className="font-display font-bold text-xs uppercase tracking-widest text-gold-300/90 mt-1">
                  NILESH STUDIO • SINCE 2014
                </div>
              </div>
            </div>

            {/* Greeting & Headline */}
            <div className="mb-4">
              {customer && (
                <p className="text-xs uppercase tracking-widest text-gold-400 font-semibold mb-1">
                  Namaste, {customer.fullName}
                </p>
              )}
              <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-wide text-white leading-tight">
                Capturing <span className="text-gold-gradient">Timeless</span> Stories & Raw Emotion
              </h1>
            </div>

            <p className="text-xs sm:text-base text-studio-300 max-w-xl mb-6 font-light leading-relaxed">
              Welcome to <span className="text-gold-300 font-medium">Nilesh Studio</span>. Explore our bespoke indoor & outdoor collections, royal weddings, and cinematic pre-wedding stories. Reserve your appointment with real-time slot booking.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2.5 sm:space-y-0 sm:space-x-3.5">
              <button
                onClick={() => onOpenBooking()}
                className="bg-gradient-to-r from-gold-500 via-gold-400 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-studio-950 font-extrabold text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-glow-gold flex items-center justify-center space-x-2 transition-all transform active:scale-[0.98]"
              >
                <Calendar className="w-4 h-4 stroke-[2.5]" />
                <span>Book a Photoshoot Slot</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>

              <button
                onClick={() => onSelectCategory('indoor')}
                className="bg-studio-950/70 hover:bg-studio-950 text-studio-200 hover:text-gold-300 border border-gold-500/30 text-xs sm:text-sm font-semibold px-5 py-3.5 rounded-xl transition-colors text-center"
              >
                Browse Gallery
              </button>
            </div>

            {/* Studio Key Metrics */}
            <div className="grid grid-cols-3 gap-3 pt-6 mt-6 border-t border-gold-500/15">
              <div>
                <span className="font-display font-extrabold text-lg sm:text-2xl text-gold-400 block">
                  10+ Years
                </span>
                <span className="text-[10px] sm:text-xs text-studio-400 font-medium">
                  Studio Heritage
                </span>
              </div>
              <div>
                <span className="font-display font-extrabold text-lg sm:text-2xl text-gold-400 block">
                  5,000+
                </span>
                <span className="text-[10px] sm:text-xs text-studio-400 font-medium">
                  Moments Preserved
                </span>
              </div>
              <div>
                <div className="flex items-center space-x-1">
                  <span className="font-display font-extrabold text-lg sm:text-2xl text-gold-400 block">
                    4.9
                  </span>
                  <Star className="w-3.5 h-3.5 fill-gold-400 text-gold-400 mb-0.5" />
                </div>
                <span className="text-[10px] sm:text-xs text-studio-400 font-medium">
                  Customer Rating
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Categories Section Header */}
      <div className="max-w-4xl mx-auto px-4 mt-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center space-x-1.5 text-gold-400 text-xs font-bold uppercase tracking-wider mb-0.5">
              <Camera className="w-3.5 h-3.5" />
              <span>Photography Categories</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
              Explore Our Portfolio
            </h2>
          </div>
          <span className="text-xs text-studio-400 hidden sm:inline">
            Tap any card to view subcategories & sample photos
          </span>
        </div>

        {/* The 4 Main Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {categories.map((category) => {
            const isIndoorOrOutdoor = category.id === 'indoor' || category.id === 'outdoor';
            return (
              <div
                key={category.id}
                className="group relative bg-studio-900 border border-gold-500/20 hover:border-gold-500/50 rounded-3xl overflow-hidden shadow-lg hover:shadow-glow-gold transition-all duration-300 flex flex-col justify-between"
              >
                {/* Clickable Image Header */}
                <div
                  onClick={() => onSelectCategory(category.id)}
                  className="relative h-56 sm:h-64 w-full cursor-pointer overflow-hidden"
                >
                  <img
                    src={category.cover_image}
                    alt={category.title}
                    loading="lazy"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-studio-950 via-studio-950/40 to-transparent"></div>

                  {/* Top Category Badge */}
                  <div className="absolute top-3.5 left-3.5 bg-studio-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-gold-500/30 text-[10px] font-bold text-gold-300 uppercase tracking-wider">
                    {category.id === 'indoor' ? 'Studio Controlled' : category.id === 'outdoor' ? 'Natural Light' : 'Signature Series'}
                  </div>

                  {/* Subcategories Count if applicable */}
                  {isIndoorOrOutdoor && category.subcategories && (
                    <div className="absolute top-3.5 right-3.5 bg-studio-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-gold-500/20 text-[10px] font-semibold text-studio-200">
                      4 Subcategories
                    </div>
                  )}

                  {/* Category Title & Subtitle overlaid on image */}
                  <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="font-serif text-2xl font-bold text-white group-hover:text-gold-300 transition-colors">
                      {category.title}
                    </h3>
                    <p className="text-xs text-gold-400/90 font-medium mt-0.5">
                      {category.subtitle}
                    </p>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-xs text-studio-300 leading-relaxed line-clamp-2 mb-3.5">
                      {category.description}
                    </p>

                    {/* Subcategories chips preview for Indoor & Outdoor */}
                    {isIndoorOrOutdoor && category.subcategories && (
                      <div className="mb-4">
                        <span className="text-[10px] font-bold text-studio-400 uppercase tracking-wider block mb-1.5">
                          Featured Subcategories:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {category.subcategories.map((sub) => (
                            <span
                              key={sub.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectCategory(category.id);
                              }}
                              className="text-[11px] font-medium bg-studio-850 hover:bg-studio-800 text-studio-300 hover:text-gold-300 border border-studio-750 px-2.5 py-0.5 rounded-lg transition-colors cursor-pointer"
                            >
                              {sub.title}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Wedding / Pre-Wedding Specific Highlights */}
                    {!isIndoorOrOutdoor && (
                      <div className="mb-4 flex flex-wrap gap-1.5 text-[11px]">
                        <span className="bg-gold-500/10 border border-gold-500/20 text-gold-300 px-2.5 py-0.5 rounded-lg font-medium">
                          Royal Candids
                        </span>
                        <span className="bg-gold-500/10 border border-gold-500/20 text-gold-300 px-2.5 py-0.5 rounded-lg font-medium">
                          Cinema Drone
                        </span>
                        <span className="bg-gold-500/10 border border-gold-500/20 text-gold-300 px-2.5 py-0.5 rounded-lg font-medium">
                          Heirloom Album
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="pt-3 border-t border-studio-800/80 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onSelectCategory(category.id)}
                      className="text-xs font-bold text-studio-200 hover:text-gold-400 flex items-center space-x-1 group/btn"
                    >
                      <span>Explore Gallery</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>

                    <button
                      onClick={() => onOpenBooking(category.id)}
                      className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-studio-950 font-bold text-xs px-4 py-2 rounded-xl shadow flex items-center space-x-1.5 transition-all"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Book Slot</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Studio Quality Pillars */}
      <div className="max-w-4xl mx-auto px-4 mt-12">
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-gold-500/20">
          <div className="text-center max-w-lg mx-auto mb-6">
            <h3 className="font-serif text-2xl font-bold text-white mb-1.5">
              The Nilesh Studio Standard
            </h3>
            <p className="text-xs text-studio-400">
              Every appointment is treated as fine art, with bespoke lighting and individual creative direction.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-studio-900/60 rounded-2xl border border-studio-800">
              <div className="w-10 h-10 rounded-xl bg-gold-500/15 text-gold-400 border border-gold-500/30 flex items-center justify-center mx-auto mb-2.5">
                <Camera className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-xs sm:text-sm text-white mb-1">
                Cinema-Grade Optics
              </h4>
              <p className="text-[11px] text-studio-400">
                Full-frame high-resolution sensors and G-Master prime glass capturing every minute nuance.
              </p>
            </div>

            <div className="p-4 bg-studio-900/60 rounded-2xl border border-studio-800">
              <div className="w-10 h-10 rounded-xl bg-gold-500/15 text-gold-400 border border-gold-500/30 flex items-center justify-center mx-auto mb-2.5">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-xs sm:text-sm text-white mb-1">
                Masterpiece Grading
              </h4>
              <p className="text-[11px] text-studio-400">
                Hand-retouched skin tones, color calibration, and print-ready heirloom post-production.
              </p>
            </div>

            <div className="p-4 bg-studio-900/60 rounded-2xl border border-studio-800">
              <div className="w-10 h-10 rounded-xl bg-gold-500/15 text-gold-400 border border-gold-500/30 flex items-center justify-center mx-auto mb-2.5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-xs sm:text-sm text-white mb-1">
                Guaranteed Slot Availability
              </h4>
              <p className="text-[11px] text-studio-400">
                Real-time appointment reservation prevents overlapping shoots and guarantees dedicated studio attention.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
