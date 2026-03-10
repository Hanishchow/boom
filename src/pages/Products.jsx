import React, { useState } from 'react';
import { Search, Star, ShoppingCart, Filter } from 'lucide-react';
import { Input } from "@/components/ui/input";

const PRODUCTS = [
  // The Ordinary
  { id: 1, name: 'Niacinamide 10% + Zinc 1%', brand: 'The Ordinary', price: 699, rating: 4.8, category: 'serum', concern: 'oiliness', badge: 'Best Seller', emoji: '🧴' },
  { id: 2, name: 'Hyaluronic Acid 2% + B5', brand: 'The Ordinary', price: 799, rating: 4.7, category: 'serum', concern: 'dryness', badge: null, emoji: '💧' },
  { id: 3, name: 'AHA 30% + BHA 2% Peeling', brand: 'The Ordinary', price: 850, rating: 4.6, category: 'exfoliator', concern: 'texture', badge: null, emoji: '✨' },
  { id: 4, name: 'Retinol 0.5% in Squalane', brand: 'The Ordinary', price: 1099, rating: 4.5, category: 'serum', concern: 'aging', badge: null, emoji: '🌙' },
  // Mamaearth
  { id: 5, name: 'Vitamin C Face Serum', brand: 'Mamaearth', price: 499, rating: 4.4, category: 'serum', concern: 'pigmentation', badge: 'Popular', emoji: '🌞' },
  { id: 6, name: 'Oil-Free Moisturizer', brand: 'Mamaearth', price: 349, rating: 4.3, category: 'moisturizer', concern: 'oiliness', badge: null, emoji: '🌿' },
  { id: 7, name: 'Ubtan Face Wash', brand: 'Mamaearth', price: 249, rating: 4.2, category: 'cleanser', concern: 'dullness', badge: null, emoji: '🍯' },
  { id: 8, name: 'Onion Hair & Skin Serum', brand: 'Mamaearth', price: 399, rating: 4.1, category: 'serum', concern: 'texture', badge: null, emoji: '🧅' },
  // Minimalist
  { id: 9, name: 'SPF 50 Sunscreen', brand: 'Minimalist', price: 429, rating: 4.7, category: 'sunscreen', concern: 'sun_damage', badge: 'Must Have', emoji: '☀️' },
  { id: 10, name: '5% Salicylic Acid Serum', brand: 'Minimalist', price: 599, rating: 4.6, category: 'serum', concern: 'acne', badge: null, emoji: '⚗️' },
  { id: 11, name: '10% Lactic Acid', brand: 'Minimalist', price: 549, rating: 4.4, category: 'exfoliator', concern: 'pigmentation', badge: null, emoji: '🔬' },
  { id: 12, name: 'Peptide Moisturizer', brand: 'Minimalist', price: 649, rating: 4.5, category: 'moisturizer', concern: 'aging', badge: null, emoji: '🧬' },
  // Foxtale
  { id: 13, name: 'Barrier Repair Cream', brand: 'Foxtale', price: 749, rating: 4.9, category: 'moisturizer', concern: 'sensitivity', badge: '#1 Rated', emoji: '🛡️' },
  { id: 14, name: 'Waterlight Sunscreen', brand: 'Foxtale', price: 599, rating: 4.8, category: 'sunscreen', concern: 'oiliness', badge: null, emoji: '💦' },
  { id: 15, name: 'Clarifying Face Wash', brand: 'Foxtale', price: 449, rating: 4.5, category: 'cleanser', concern: 'acne', badge: null, emoji: '🌊' },
];

const CATEGORIES = ['All', 'Cleanser', 'Serum', 'Moisturizer', 'Sunscreen', 'Exfoliator'];
const BRANDS = ['All Brands', 'The Ordinary', 'Mamaearth', 'Minimalist', 'Foxtale'];

export default function Products() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeBrand, setActiveBrand] = useState('All Brands');
  const [wishlist, setWishlist] = useState([]);

  const filtered = PRODUCTS.filter(p => {
    const matchCategory = activeCategory === 'all' || p.category === activeCategory;
    const matchBrand = activeBrand === 'All Brands' || p.brand === activeBrand;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchBrand && matchSearch;
  });

  const toggleWishlist = (id) => {
    setWishlist(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      {/* Header */}
      <div className="px-4 pt-8 pb-4">
        <h1 className="text-2xl font-bold mb-1">Products</h1>
        <p className="text-gray-400 text-sm">Curated for Indian skin, budget & climate</p>
      </div>

      {/* Search */}
      <div className="px-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search products or brands..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-gray-900 border-gray-800 text-white pl-10 h-12 rounded-xl"
          />
        </div>
      </div>

      {/* Brand Tabs */}
      <div className="flex gap-2 px-4 mb-4 overflow-x-auto pb-2 no-scrollbar">
        {BRANDS.map(brand => (
          <button
            key={brand}
            onClick={() => setActiveBrand(brand)}
            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${
              activeBrand === brand
                ? 'bg-pink-500 text-white'
                : 'bg-gray-900 text-gray-400 border border-gray-800'
            }`}
          >
            {brand}
          </button>
        ))}
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 px-4 mb-6 overflow-x-auto pb-2 no-scrollbar">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat.toLowerCase())}
            className={`px-4 py-2 rounded-full whitespace-nowrap text-xs transition-all ${
              activeCategory === cat.toLowerCase()
                ? 'bg-gray-100 text-black font-semibold'
                : 'bg-gray-900 text-gray-500 border border-gray-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="px-4">
        <p className="text-gray-500 text-xs mb-4">{filtered.length} products</p>
        <div className="grid grid-cols-2 gap-4">
          {filtered.map((product) => (
            <div key={product.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              {/* Image Area */}
              <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 flex flex-col items-center justify-center relative p-3">
                <span className="text-5xl mb-2">{product.emoji}</span>
                <span className="text-xs text-pink-400 font-semibold text-center">{product.brand}</span>
                {product.badge && (
                  <div className="absolute top-2 left-2 bg-pink-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                    {product.badge}
                  </div>
                )}
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/40 flex items-center justify-center"
                >
                  <span className="text-sm">{wishlist.includes(product.id) ? '❤️' : '🤍'}</span>
                </button>
              </div>

              {/* Info */}
              <div className="p-3">
                <div className="flex items-center gap-1 mb-1">
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                  <span className="text-xs text-gray-300">{product.rating}</span>
                </div>
                <h3 className="text-sm font-semibold leading-tight mb-2 line-clamp-2">{product.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-pink-400 font-bold">₹{product.price}</span>
                  <button className="bg-pink-500 hover:bg-pink-600 text-white text-xs px-3 py-1.5 rounded-full transition-all">
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-sm">No products found</p>
          </div>
        )}
      </div>

      {/* Brand Banner */}
      <div className="mx-4 mt-8 bg-gradient-to-r from-purple-900/60 to-pink-900/60 rounded-3xl p-5 border border-purple-800/40">
        <p className="text-xs text-purple-300 mb-1 tracking-widest">FEATURED</p>
        <h3 className="font-bold text-lg mb-1">Mamaearth Vitamin C Serum</h3>
        <p className="text-sm text-gray-300 mb-3">Brighten your skin with 10% Vitamin C & Turmeric. Indian brand, dermatologist tested.</p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-pink-400">₹499</span>
          <button className="bg-pink-500 text-white text-sm px-5 py-2 rounded-full">Shop Now</button>
        </div>
      </div>
    </div>
  );
}