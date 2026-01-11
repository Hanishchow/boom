import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, Camera, Package, ShoppingBag, User } from 'lucide-react';

export default function Layout({ children, currentPageName }) {
  const hideNav = ['SkinAnalysis'].includes(currentPageName);

  return (
    <div className="min-h-screen bg-black text-white">
      <style>{`
        body {
          background-color: #000000;
          color: #ffffff;
        }
      `}</style>
      
      {children}
      
      {!hideNav && (
        <nav className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 pb-safe z-50">
          <div className="flex items-center justify-around h-16">
            <Link 
              to={createPageUrl('Home')}
              className="flex flex-col items-center gap-1 px-4 py-2"
            >
              <Home className={`w-6 h-6 ${currentPageName === 'Home' ? 'text-pink-500' : 'text-gray-400'}`} />
              <span className={`text-xs ${currentPageName === 'Home' ? 'text-pink-500' : 'text-gray-400'}`}>Home</span>
            </Link>
            
            <Link 
              to={createPageUrl('SkinAnalysis')}
              className="flex flex-col items-center gap-1 px-4 py-2"
            >
              <Camera className={`w-6 h-6 ${currentPageName === 'SkinAnalysis' ? 'text-pink-500' : 'text-gray-400'}`} />
              <span className={`text-xs ${currentPageName === 'SkinAnalysis' ? 'text-pink-500' : 'text-gray-400'}`}>Scan</span>
            </Link>
            
            <Link 
              to={createPageUrl('Products')}
              className="flex flex-col items-center gap-1 px-4 py-2"
            >
              <Package className={`w-6 h-6 ${currentPageName === 'Products' ? 'text-pink-500' : 'text-gray-400'}`} />
              <span className={`text-xs ${currentPageName === 'Products' ? 'text-pink-500' : 'text-gray-400'}`}>Products</span>
            </Link>
            
            <Link 
              to={createPageUrl('Shop')}
              className="flex flex-col items-center gap-1 px-4 py-2"
            >
              <ShoppingBag className={`w-6 h-6 ${currentPageName === 'Shop' ? 'text-pink-500' : 'text-gray-400'}`} />
              <span className={`text-xs ${currentPageName === 'Shop' ? 'text-pink-500' : 'text-gray-400'}`}>Shop</span>
            </Link>
            
            <Link 
              to={createPageUrl('Profile')}
              className="flex flex-col items-center gap-1 px-4 py-2"
            >
              <User className={`w-6 h-6 ${currentPageName === 'Profile' ? 'text-pink-500' : 'text-gray-400'}`} />
              <span className={`text-xs ${currentPageName === 'Profile' ? 'text-pink-500' : 'text-gray-400'}`}>Profile</span>
            </Link>
          </div>
        </nav>
      )}
    </div>
  );
}