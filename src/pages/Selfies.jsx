import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, X, ZoomIn, AlertTriangle } from 'lucide-react';

function SignedImage({ fileUri, label }) {
  const [url, setUrl] = useState(null);
  const [lightbox, setLightbox] = useState(false);

  useEffect(() => {
    if (!fileUri) return;
    base44.integrations.Core.CreateFileSignedUrl({ file_uri: fileUri, expires_in: 300 })
      .then(({ signed_url }) => setUrl(signed_url))
      .catch(() => {});
  }, [fileUri]);

  if (!fileUri) return (
    <div className="aspect-square bg-gray-800 rounded-xl flex items-center justify-center">
      <span className="text-gray-600 text-xs">—</span>
    </div>
  );

  return (
    <>
      <div
        className="aspect-square bg-gray-800 rounded-xl overflow-hidden relative group cursor-pointer"
        onClick={() => url && setLightbox(true)}
      >
        {url ? (
          <>
            <img src={url} alt={label} loading="lazy" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <ZoomIn className="w-5 h-5 text-white" />
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-4 h-4 text-pink-400 animate-spin" />
          </div>
        )}
        <span className="absolute bottom-1 left-0 right-0 text-center text-xs text-white/70">{label}</span>
      </div>

      {lightbox && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-6" onClick={() => setLightbox(false)}>
          <button className="absolute top-4 right-4 p-2 bg-gray-800 rounded-full" onClick={() => setLightbox(false)}>
            <X className="w-5 h-5 text-white" />
          </button>
          <img src={url} alt={label} className="max-w-full max-h-[85vh] object-contain rounded-xl" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </>
  );
}

export default function Selfies() {
  const [authState, setAuthState] = useState('checking');
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me()
      .then(user => {
        if (user?.role === 'admin') {
          setAuthState('ok');
          return base44.entities.SkinProfile.list('-created_date', 500);
        } else {
          setAuthState('denied');
        }
      })
      .then(data => { if (data) setProfiles(data); })
      .finally(() => setLoading(false));
  }, []);

  if (authState === 'checking' || loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
    </div>
  );

  if (authState === 'denied') return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="text-center">
        <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <h2 className="text-white text-xl font-bold mb-2">Access Denied</h2>
        <p className="text-gray-400 text-sm">Admin only.</p>
      </div>
    </div>
  );

  const withSelfies = profiles.filter(p => p.front_image_url || p.right_image_url || p.left_image_url);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-1">Selfies</h1>
        <p className="text-gray-500 text-sm mb-6">{withSelfies.length} users with selfies · Admin view</p>

        {withSelfies.length === 0 ? (
          <p className="text-gray-500 text-center py-16">No selfies captured yet.</p>
        ) : (
          <div className="space-y-6">
            {withSelfies.map(profile => (
              <div key={profile.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                {/* User tag */}
                <p className="text-pink-400 text-xs font-mono mb-0.5">{profile.email || profile.created_by}</p>
                <p className="text-white text-sm font-medium mb-3">{profile.name || '(no name)'}</p>

                {/* 3 selfie thumbnails inline */}
                <div className="grid grid-cols-3 gap-3">
                  <SignedImage fileUri={profile.front_image_url} label="Front" />
                  <SignedImage fileUri={profile.right_image_url} label="Right" />
                  <SignedImage fileUri={profile.left_image_url} label="Left" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}