import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";

const PRODUCTS = [
  { id: 1, name: 'Niacinamide 10% + Zinc 1%', brand: 'The Ordinary', price: 699, category: 'serum', concern: 'oiliness' },
  { id: 2, name: 'Hyaluronic Acid 2% + B5', brand: 'The Ordinary', price: 799, category: 'serum', concern: 'dryness' },
  { id: 3, name: 'AHA 30% + BHA 2% Peeling', brand: 'The Ordinary', price: 850, category: 'exfoliator', concern: 'texture' },
  { id: 4, name: 'Retinol 0.5% in Squalane', brand: 'The Ordinary', price: 1099, category: 'serum', concern: 'aging' },
  { id: 5, name: 'Vitamin C Face Serum', brand: 'Mamaearth', price: 499, category: 'serum', concern: 'pigmentation' },
  { id: 6, name: 'Oil-Free Moisturizer', brand: 'Mamaearth', price: 349, category: 'moisturizer', concern: 'oiliness' },
  { id: 7, name: 'Ubtan Face Wash', brand: 'Mamaearth', price: 249, category: 'cleanser', concern: 'dullness' },
  { id: 8, name: 'Onion Hair & Skin Serum', brand: 'Mamaearth', price: 399, category: 'serum', concern: 'texture' },
  { id: 9, name: 'SPF 50 Sunscreen', brand: 'Minimalist', price: 429, category: 'sunscreen', concern: 'sun_damage' },
  { id: 10, name: '5% Salicylic Acid Serum', brand: 'Minimalist', price: 599, category: 'serum', concern: 'acne' },
  { id: 11, name: '10% Lactic Acid', brand: 'Minimalist', price: 549, category: 'exfoliator', concern: 'pigmentation' },
  { id: 12, name: 'Peptide Moisturizer', brand: 'Minimalist', price: 649, category: 'moisturizer', concern: 'aging' },
  { id: 13, name: 'Barrier Repair Cream', brand: 'Foxtale', price: 749, category: 'moisturizer', concern: 'sensitivity' },
  { id: 14, name: 'Waterlight Sunscreen', brand: 'Foxtale', price: 599, category: 'sunscreen', concern: 'oiliness' },
  { id: 15, name: 'Clarifying Face Wash', brand: 'Foxtale', price: 449, category: 'cleanser', concern: 'acne' },
];

const CATEGORIES = ['All', 'Cleanser', 'Serum', 'Moisturizer', 'Sunscreen', 'Exfoliator'];
const BRANDS = ['All Brands', 'The Ordinary', 'Mamaearth', 'Minimalist', 'Foxtale'];

export default function Products() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeBrand, setActiveBrand] = useState('All Brands');

  const filtered = PRODUCTS.filter(p => {
    const matchCategory = activeCategory === 'all' || p.category === activeCategory;
    const matchBrand = activeBrand === 'All Brands' || p.brand === activeBrand;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchBrand && matchSearch;
  });

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      {/* Header */}
      <div className="px-4 pt-8 pb-2">
        <h1 className="text-2xl font-bold mb-1">Products</h1>
        <p className="text-gray-400 text-sm">Curated for Indian skin, budget & climate</p>
      </div>

      {/* Editorial independence note */}
      <div className="px-4 mb-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-300">No brand pays to appear here.</p>
        </div>
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
              {/* Neutral placeholder image area (no product photo uploaded yet) */}
              <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 flex flex-col items-center justify-center p-3">
                <span className="text-xs text-gray-500 uppercase tracking-wider mb-1">{product.category}</span>
                <span className="text-sm text-pink-400 font-semibold text-center">{product.brand}</span>
              </div>

              {/* Info */}
              <div className="p-3">
                <h3 className="text-sm font-semibold leading-tight mb-2 line-clamp-2">{product.name}</h3>
                <span className="text-pink-400 font-bold">₹{product.price}</span>
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
    </div>
  );
}