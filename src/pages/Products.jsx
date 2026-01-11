import React, { useState } from 'react';
import { Search, SlidersHorizontal, Star } from 'lucide-react';
import { Input } from "@/components/ui/input";

const PRODUCTS = [
  {
    id: 1,
    name: 'Barrier Repair Cream',
    brand: 'Foxtale',
    price: 22.99,
    rating: 4.9,
    image: null
  },
  {
    id: 2,
    name: 'Moisturizing Cream',
    brand: 'CeraVe',
    price: 18.99,
    rating: 4.9,
    image: null
  }
];

export default function Products() {
  const [activeCategory, setActiveCategory] = useState('all');

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <div className="p-6">
        {/* Header */}
        <h1 className="text-2xl font-bold mb-4">Products</h1>
        <p className="text-gray-400 text-sm mb-6">Discover skincare products tailored to your needs</p>

        {/* Search & Filter */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search products..."
              className="bg-gray-900 border-gray-800 text-white pl-10 h-12 rounded-xl"
            />
          </div>
          <button className="bg-gray-900 border border-gray-800 rounded-xl p-3">
            <SlidersHorizontal className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Categories */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['All', 'Cleanser', 'Serum', 'Moisturizer'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat.toLowerCase())}
              className={`px-6 py-2 rounded-full whitespace-nowrap transition-all ${
                activeCategory === cat.toLowerCase()
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-900 text-gray-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Featured Products */}
        <h2 className="text-lg font-semibold mb-4">Featured Products</h2>
        <div className="grid grid-cols-2 gap-4">
          {PRODUCTS.map((product) => (
            <div key={product.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <div className="aspect-square bg-gray-800 flex items-center justify-center">
                <p className="text-gray-600">Product Image</p>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-1 mb-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-semibold">{product.rating}</span>
                </div>
                <p className="text-xs text-pink-500 mb-1">{product.brand}</p>
                <h3 className="font-semibold text-sm mb-2 line-clamp-2">{product.name}</h3>
                <p className="text-lg font-bold">${product.price}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Carousel Banner */}
        <div className="mt-8 bg-gradient-to-r from-purple-900 to-blue-900 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🌿</span>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Mama Earth Vitamin C Serum</h3>
              <p className="text-sm text-gray-300">Brighten your skin with 10% Vitamin C & Turmeric</p>
            </div>
          </div>
          <div className="flex justify-center gap-2 mt-4">
            <div className="w-2 h-2 rounded-full bg-pink-500" />
            <div className="w-2 h-2 rounded-full bg-gray-600" />
            <div className="w-2 h-2 rounded-full bg-gray-600" />
          </div>
        </div>
      </div>
    </div>
  );
}