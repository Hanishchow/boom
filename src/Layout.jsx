import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Sparkles, Home, History, Camera } from 'lucide-react';

export default function Layout({ children, currentPageName }) {
  // Don't show nav on certain pages
  const hideNav = ['SkinAnalysis'].includes(currentPageName);

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
      
      {/* Mobile Bottom Navigation - only show on certain pages */}
      {!hideNav && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe sm:hidden z-50">
          <div className="flex items-center justify-around py-2">
            <Link 
              to={createPageUrl('Home')}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                currentPageName === 'Home' 
                  ? 'text-rose-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="text-xs">Home</span>
            </Link>
            
            <Link 
              to={createPageUrl('SkinAnalysis')}
              className="flex flex-col items-center gap-1 px-4 py-2"
            >
              <div className="p-2 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-lg -mt-4">
                <Camera className="w-6 h-6" />
              </div>
              <span className="text-xs text-gray-700">Analyze</span>
            </Link>
            
            <Link 
              to={createPageUrl('History')}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                currentPageName === 'History' 
                  ? 'text-rose-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <History className="w-5 h-5" />
              <span className="text-xs">History</span>
            </Link>
          </div>
        </nav>
      )}
    </div>
  );
}