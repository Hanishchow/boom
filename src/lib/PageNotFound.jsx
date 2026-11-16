import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function PageNotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-7xl font-light text-gray-700">404</h1>
          <div className="h-0.5 w-16 bg-pink-500 mx-auto" />
        </div>
        <div className="space-y-3">
          <h2 className="text-2xl font-medium text-white">Page not found</h2>
          <p className="text-gray-400 leading-relaxed">
            The page you're looking for doesn't exist or has moved.
          </p>
        </div>
        <div className="pt-4">
          <Link
            to="/"
            className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white rounded-full"
            style={{ background: '#FF69B4' }}
          >
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}