import { Category } from '../types';

export const FALLBACK_CATEGORIES: Category[] = [
  {
    "id": "indoor",
    "title": "Indoor Studio",
    "subtitle": "Controlled Artistry & Dramatic Light",
    "description": "Meticulously crafted studio portraits with high-end strobe lighting, custom luxury backdrops, and creative creative direction.",
    "cover_image": "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=1200&q=80",
    "display_order": 1,
    "subcategories": [
      {
        "id": "birthday",
        "category_id": "indoor",
        "title": "Birthday Shoots",
        "description": "Joyful studio setups with themed balloon installations, custom props, and lively milestone portraits.",
        "cover_image": "/images/indoor-birthday/birthday-1.jpg",
        "display_order": 1
      },
      {
        "id": "maternity",
        "category_id": "indoor",
        "title": "Maternity Photography",
        "description": "Graceful fine-art portraits celebrating motherhood with radiant studio backdrops, silk drapes, and intimate lighting.",
        "cover_image": "/images/indoor-maternity/indoor-maternity-2.jpg",
        "display_order": 2
      },
      {
        "id": "festive",
        "category_id": "indoor",
        "title": "Festive Photography",
        "description": "Rich ethnic studio celebrations capturing traditional attire, warm brass diyas, and authentic cultural festivities.",
        "cover_image": "/images/indoor-festive/indoor-festive-6.jpg",
        "display_order": 3
      },
      {
        "id": "newborn",
        "category_id": "indoor",
        "title": "Newborn Photography",
        "description": "Gentle, safe, temperature-controlled baby portraits in soft organic knits, cozy nests, and heirloom poses.",
        "cover_image": "/images/indoor-newborn/newborn-2.jpg",
        "display_order": 4
      }
    ]
  },
  {
    "id": "outdoor",
    "title": "Outdoor Shoots",
    "subtitle": "Golden Hour & Scenic Natural Splendor",
    "description": "Vibrant outdoor storytelling bathed in natural golden hour light, breathtaking heritage locations, and expansive scenic landscapes.",
    "cover_image": "https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=1200&q=80",
    "display_order": 2,
    "subcategories": [
      {
        "id": "birthday",
        "category_id": "outdoor",
        "title": "Birthday Shoots",
        "description": "Open-air birthday celebrations featuring garden picnics, balloon releases, and natural energetic laughter.",
        "cover_image": "/images/outdoor-birthday/outdoor-birthday-1.jpg",
        "display_order": 1
      },
      {
        "id": "maternity",
        "category_id": "outdoor",
        "title": "Maternity Photography",
        "description": "Sunset meadows, tranquil lakesides, and ethereal floral landscapes highlighting the beauty of impending motherhood.",
        "cover_image": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80",
        "display_order": 2
      },
      {
        "id": "festive",
        "category_id": "outdoor",
        "title": "Festive Photography",
        "description": "Grand festive celebrations set against historic royal architecture, vibrant bazaars, and traditional outdoor lighting.",
        "cover_image": "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80",
        "display_order": 3
      },
      {
        "id": "newborn",
        "category_id": "outdoor",
        "title": "Newborn Photography",
        "description": "Serene natural daylight portraits with parents in soft botanical gardens and peaceful shaded outdoor groves.",
        "cover_image": "https://images.unsplash.com/photo-1491013516836-7db643ee125a?auto=format&fit=crop&w=800&q=80",
        "display_order": 4
      }
    ]
  },
  {
    "id": "wedding",
    "title": "Wedding Photography",
    "subtitle": "Grandeur, Sacred Vows & Royal Elegance",
    "description": "Fine art documentation of royal celebrations, sacred rituals, authentic emotional candids, and heirloom visual memories that last generations.",
    "cover_image": "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80",
    "display_order": 3,
    "subcategories": []
  },
  {
    "id": "pre-wedding",
    "title": "Pre-Wedding Shoots",
    "subtitle": "Cinematic Romance & Intimate Love Stories",
    "description": "Exclusive destination sessions capturing your unique chemistry against majestic palaces, picturesque sunsets, and romantic panoramas.",
    "cover_image": "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=1200&q=80",
    "display_order": 4,
    "subcategories": []
  }
];

export const FALLBACK_GALLERY_ITEMS: any[] = [
  {
    "id": "ib-1",
    "category_id": "indoor",
    "subcategory_id": "birthday",
    "title": "Happy Birthday Little Explorer",
    "image_url": "/images/indoor-birthday/birthday-1.jpg",
    "display_order": 1
  },
  {
    "id": "in-1",
    "category_id": "indoor",
    "subcategory_id": "newborn",
    "title": "Newborn Macro Details & Tender Touch",
    "image_url": "/images/indoor-newborn/newborn-1.jpg",
    "display_order": 1
  },
  {
    "id": "ob-1",
    "category_id": "outdoor",
    "subcategory_id": "birthday",
    "title": "Beachside Teepee & Wooden Milestone Blocks",
    "image_url": "/images/outdoor-birthday/outdoor-birthday-1.jpg",
    "display_order": 1
  },
  {
    "id": "im-1",
    "category_id": "indoor",
    "subcategory_id": "maternity",
    "title": "A Little Miracle \u2014 Ultrasound Sonogram Portrait",
    "image_url": "/images/indoor-maternity/indoor-maternity-1.jpg",
    "display_order": 1
  },
  {
    "id": "if-1",
    "category_id": "indoor",
    "subcategory_id": "festive",
    "title": "Mahashivratri Divine Blessings \u2014 Little Bholenath",
    "image_url": "/images/indoor-festive/indoor-festive-1.jpg",
    "display_order": 1
  },
  {
    "id": "ib-2",
    "category_id": "indoor",
    "subcategory_id": "birthday",
    "title": "Birthday Joy & Teddy Bear Picnic",
    "image_url": "/images/indoor-birthday/birthday-2.jpg",
    "display_order": 2
  },
  {
    "id": "in-2",
    "category_id": "indoor",
    "subcategory_id": "newborn",
    "title": "Serene Sage Green Carriage Nest",
    "image_url": "/images/indoor-newborn/newborn-2.jpg",
    "display_order": 2
  },
  {
    "id": "ob-2",
    "category_id": "outdoor",
    "subcategory_id": "birthday",
    "title": "Sunset Shoreline Family Joy & Laughter",
    "image_url": "/images/outdoor-birthday/outdoor-birthday-2.jpg",
    "display_order": 2
  },
  {
    "id": "im-2",
    "category_id": "indoor",
    "subcategory_id": "maternity",
    "title": "Royal Nauvari Heritage & Floral Jewelry Grace",
    "image_url": "/images/indoor-maternity/indoor-maternity-2.jpg",
    "display_order": 2
  },
  {
    "id": "if-2",
    "category_id": "indoor",
    "subcategory_id": "festive",
    "title": "Ram Krishna Hari Mauli \u2014 Little Warkari Devotee",
    "image_url": "/images/indoor-festive/indoor-festive-2.jpg",
    "display_order": 2
  },
  {
    "id": "ib-3",
    "category_id": "indoor",
    "subcategory_id": "birthday",
    "title": "Vintage Scooter Milestone Ride",
    "image_url": "/images/indoor-birthday/birthday-3.jpg",
    "display_order": 3
  },
  {
    "id": "in-3",
    "category_id": "indoor",
    "subcategory_id": "newborn",
    "title": "Arched Sunlit Window Slumber",
    "image_url": "/images/indoor-newborn/newborn-3.jpg",
    "display_order": 3
  },
  {
    "id": "ob-3",
    "category_id": "outdoor",
    "subcategory_id": "birthday",
    "title": "First Birthday Clapping Joy by the Waves",
    "image_url": "/images/outdoor-birthday/outdoor-birthday-3.jpg",
    "display_order": 3
  },
  {
    "id": "im-3",
    "category_id": "indoor",
    "subcategory_id": "maternity",
    "title": "Sunlit Windowside Parental Warmth & Laughter",
    "image_url": "/images/indoor-maternity/indoor-maternity-3.jpg",
    "display_order": 3
  },
  {
    "id": "if-3",
    "category_id": "indoor",
    "subcategory_id": "festive",
    "title": "Diwali Festive Joy \u2014 Golden Kurta & Dhoti Milestone",
    "image_url": "/images/indoor-festive/indoor-festive-3.jpg",
    "display_order": 3
  },
  {
    "id": "im-4",
    "category_id": "indoor",
    "subcategory_id": "maternity",
    "title": "Traditional Royal Blessing Couple Portrait",
    "image_url": "/images/indoor-maternity/indoor-maternity-4.jpg",
    "display_order": 4
  },
  {
    "id": "if-4",
    "category_id": "indoor",
    "subcategory_id": "festive",
    "title": "Navratri Garba Queen \u2014 Little Dandiya Celebrations",
    "image_url": "/images/indoor-festive/indoor-festive-4.jpg",
    "display_order": 4
  },
  {
    "id": "im-5",
    "category_id": "indoor",
    "subcategory_id": "maternity",
    "title": "Couture Chocolate Ruffle Mermaid Studio Gown",
    "image_url": "/images/indoor-maternity/indoor-maternity-5.jpg",
    "display_order": 5
  },
  {
    "id": "if-5",
    "category_id": "indoor",
    "subcategory_id": "festive",
    "title": "Shubh Deepavali Illumination \u2014 Sacred Diya Glow",
    "image_url": "/images/indoor-festive/indoor-festive-5.jpg",
    "display_order": 5
  },
  {
    "id": "if-6",
    "category_id": "indoor",
    "subcategory_id": "festive",
    "title": "Gokulashtami Bal Gopal \u2014 Makhan Matki Play",
    "image_url": "/images/indoor-festive/indoor-festive-6.jpg",
    "display_order": 6
  },
  {
    "id": "if-7",
    "category_id": "indoor",
    "subcategory_id": "festive",
    "title": "Divine Flute Melody \u2014 Royal Little Kanha",
    "image_url": "/images/indoor-festive/indoor-festive-7.jpg",
    "display_order": 7
  },
  {
    "id": "om-1",
    "category_id": "outdoor",
    "subcategory_id": "maternity",
    "title": "Golden Meadow Breeze & Flowing Gown",
    "image_url": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=900&q=80",
    "display_order": 21
  },
  {
    "id": "om-2",
    "category_id": "outdoor",
    "subcategory_id": "maternity",
    "title": "Sunset Stroll Along Scenic Waterway",
    "image_url": "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=80",
    "display_order": 22
  },
  {
    "id": "om-3",
    "category_id": "outdoor",
    "subcategory_id": "maternity",
    "title": "Dusk Silhouette Against Grand Horizons",
    "image_url": "https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=900&q=80",
    "display_order": 23
  },
  {
    "id": "om-4",
    "category_id": "outdoor",
    "subcategory_id": "maternity",
    "title": "Enchanted Forest Sunray Maternity",
    "image_url": "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=900&q=80",
    "display_order": 24
  },
  {
    "id": "of-1",
    "category_id": "outdoor",
    "subcategory_id": "festive",
    "title": "Heritage Archway Royal Festive Portrait",
    "image_url": "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80",
    "display_order": 25
  },
  {
    "id": "of-2",
    "category_id": "outdoor",
    "subcategory_id": "festive",
    "title": "Vibrant Festive Market Evening Lights",
    "image_url": "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=900&q=80",
    "display_order": 26
  },
  {
    "id": "of-3",
    "category_id": "outdoor",
    "subcategory_id": "festive",
    "title": "Grand Courtyard Royal Festive Couple",
    "image_url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=80",
    "display_order": 27
  },
  {
    "id": "of-4",
    "category_id": "outdoor",
    "subcategory_id": "festive",
    "title": "Botanical Garden Festive Splendor",
    "image_url": "https://images.unsplash.com/photo-1506863530036-1efeddceb993?auto=format&fit=crop&w=900&q=80",
    "display_order": 28
  },
  {
    "id": "on-1",
    "category_id": "outdoor",
    "subcategory_id": "newborn",
    "title": "Sweet Baby in Natural Wicker on Green Grass",
    "image_url": "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=900&q=80",
    "display_order": 29
  },
  {
    "id": "on-2",
    "category_id": "outdoor",
    "subcategory_id": "newborn",
    "title": "Family Blossom Shaded Portrait with Baby",
    "image_url": "https://images.unsplash.com/photo-1491013516836-7db643ee125a?auto=format&fit=crop&w=900&q=80",
    "display_order": 30
  },
  {
    "id": "on-3",
    "category_id": "outdoor",
    "subcategory_id": "newborn",
    "title": "Gentle Park Breeze Family Bonding",
    "image_url": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=900&q=80",
    "display_order": 31
  },
  {
    "id": "on-4",
    "category_id": "outdoor",
    "subcategory_id": "newborn",
    "title": "Warm Golden Sunlight on Mother & Child",
    "image_url": "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=900&q=80",
    "display_order": 32
  },
  {
    "id": "wed-1",
    "category_id": "wedding",
    "subcategory_id": null,
    "title": "Royal Indian Bride in Intricate Velvet Lehenga",
    "image_url": "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=900&q=80",
    "display_order": 33
  },
  {
    "id": "wed-2",
    "category_id": "wedding",
    "subcategory_id": null,
    "title": "Sacred Mandap Rituals & Holy Fire Blessings",
    "image_url": "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80",
    "display_order": 34
  },
  {
    "id": "wed-3",
    "category_id": "wedding",
    "subcategory_id": null,
    "title": "Floral Varmala Exchange & Candid Laughter",
    "image_url": "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=900&q=80",
    "display_order": 35
  },
  {
    "id": "wed-4",
    "category_id": "wedding",
    "subcategory_id": null,
    "title": "Grand Royal Baraat & Sparkler Procession",
    "image_url": "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=80",
    "display_order": 36
  },
  {
    "id": "pw-1",
    "category_id": "pre-wedding",
    "subcategory_id": null,
    "title": "Regal Black-Tie Couple at Heritage Palace",
    "image_url": "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=900&q=80",
    "display_order": 37
  },
  {
    "id": "pw-2",
    "category_id": "pre-wedding",
    "subcategory_id": null,
    "title": "Cinematic Sunset Glow by Mountain Lake",
    "image_url": "https://images.unsplash.com/photo-1529636798458-92182e662485?auto=format&fit=crop&w=900&q=80",
    "display_order": 38
  },
  {
    "id": "pw-3",
    "category_id": "pre-wedding",
    "subcategory_id": null,
    "title": "Misty Pine Forest Romantic Rendezvous",
    "image_url": "https://images.unsplash.com/photo-1494774157365-9e04c6720e47?auto=format&fit=crop&w=900&q=80",
    "display_order": 39
  },
  {
    "id": "pw-4",
    "category_id": "pre-wedding",
    "subcategory_id": null,
    "title": "Palace Pillars Silhouette & Golden Flare",
    "image_url": "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=900&q=80",
    "display_order": 40
  }
];
