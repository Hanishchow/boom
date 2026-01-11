import React from 'react';
import { ShoppingBag } from 'lucide-react';

export default function Shop() {
  return (
    <div className="min-h-screen bg-black text-white pb-20 flex items-center justify-center">
      <div className="text-center px-6">
        <div className="w-20 h-20 rounded-full bg-gray-900 flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-10 h-10 text-pink-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Shop Coming Soon</h2>
        <p className="text-gray-400">Our e-commerce store is under development</p>
      </div>
    </div>
  );
}