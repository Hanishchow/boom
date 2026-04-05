import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Shield, Search, X, ZoomIn, Loader2, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const PAGE_SIZE = 12;

// Selfie angles to display per user
const ANGLES = [
  { key: 'front_image_url', label: 'Front' },
  { key: 'right_image_url', label: 'Right' },
  { key: 'left_image_url', label: 'Left' },
];

const SKIN_CONCERNS = [
  'acne', 'blackheads', 'whiteheads', 'excess_oil', 'large_pores',
  'dryness', 'redness', 'wrinkles', 'hyperpigmentation', 'uneven_tone',
];
const AGE_GROUPS = ['under_20', '20_30', '30_40', '40_50', 'above_50'];
const GENDERS = ['male', 'female', 'other'];

// --- Signed image cell with lazy loading ---
function SignedImage({ fileUri, alt, onClick }) {
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!fileUri) { setError(true); return; }
    let cancelled = false;
    setLoading(true);
    setError(false);

    base44.integrations.Core.CreateFileSignedUrl({ file_uri: fileUri, expires_in: 300 })
      .then(({ signed_url }) => { if (!cancelled) setUrl(signed_url); })
      .catch(() => { if (!cancelled) setError(true); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [fileUri]);

  if (!fileUri) return (
    <div className="aspect-square bg-gray-900 rounded-xl flex items-center justify-center">
      <span className="text-gray-600 text-xs">No image</span>
    </div>
  );

  return (
    <div
      className="aspect-square bg-gray-900 rounded-xl overflow-hidden relative group cursor-pointer"
      onClick={() => url && onClick(url, alt)}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-5 h-5 text-pink-500 animate-spin" />
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs text-gray-600">Unavailable</span>
        </div>
      )}
      {url && (
        <>
          <img
            src={url}
            alt={alt}
            loading="lazy"
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <ZoomIn className="w-6 h-6 text-white" />
          </div>
        </>
      )}
    </div>
  );
}

// --- Full-screen lightbox ---
function Lightbox({ src, alt, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-white"
        onClick={onClose}
      >
        <X className="w-5 h-5" />
      </button>
      <img
        src={src}
        alt={alt}
        className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
        onClick={e => e.stopPropagation()}
      />
      <p className="absolute bottom-4 text-gray-400 text-sm">{alt}</p>
    </div>
  );
}

// --- User selfie row ---
function UserSelfieCard({ profile, onExpand }) {
  const hasSelfies = profile.front_image_url || profile.right_image_url || profile.left_image_url;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
      {/* User info */}
      <div className="mb-3">
        <p className="text-white font-semibold text-sm">{profile.name || '(unnamed)'}</p>
        <p className="text-gray-400 text-xs">{profile.email || profile.created_by}</p>
        <div className="flex flex-wrap gap-1 mt-1.5">
          {profile.age_group && (
            <span className="px-2 py-0.5 bg-gray-800 rounded-full text-xs text-gray-300">
              {profile.age_group.replace(/_/g, '-')}
            </span>
          )}
          {profile.gender && (
            <span className="px-2 py-0.5 bg-gray-800 rounded-full text-xs text-gray-300 capitalize">
              {profile.gender}
            </span>
          )}
          {profile.primary_concerns?.slice(0, 2).map(c => (
            <span key={c} className="px-2 py-0.5 bg-pink-500/10 rounded-full text-xs text-pink-300 capitalize">
              {c.replace('_', ' ')}
            </span>
          ))}
        </div>
        <p className="text-gray-600 text-xs mt-1 font-mono">ID: {profile.user_id || profile.id}</p>
      </div>

      {/* Selfie grid */}
      {hasSelfies ? (
        <div className="grid grid-cols-3 gap-2">
          {ANGLES.map(({ key, label }) => (
            <div key={key}>
              <p className="text-gray-500 text-xs mb-1 text-center">{label}</p>
              <SignedImage
                fileUri={profile[key]}
                alt={`${profile.name || 'User'} — ${label}`}
                onClick={onExpand}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-20 rounded-xl bg-gray-800/50">
          <p className="text-gray-600 text-xs">No selfies captured</p>
        </div>
      )}
    </div>
  );
}

// --- Main admin page ---
export default function AdminSelfies() {
  const [authState, setAuthState] = useState('checking'); // checking | authorized | denied
  const [profiles, setProfiles] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [filterConcern, setFilterConcern] = useState('');
  const [filterAge, setFilterAge] = useState('');
  const [filterGender, setFilterGender] = useState('');

  // Lightbox
  const [lightbox, setLightbox] = useState(null); // { src, alt }

  // 1. Auth check — admin only
  useEffect(() => {
    base44.auth.me()
      .then(user => {
        if (user?.role === 'admin') {
          setAuthState('authorized');
        } else {
          setAuthState('denied');
        }
      })
      .catch(() => setAuthState('denied'));
  }, []);

  // 2. Load all profiles (admin can see all — no created_by filter)
  useEffect(() => {
    if (authState !== 'authorized') return;
    setLoading(true);
    base44.entities.SkinProfile.list('-created_date', 200)
      .then(data => {
        setProfiles(data);
        setFiltered(data);
      })
      .finally(() => setLoading(false));
  }, [authState]);

  // 3. Apply filters
  useEffect(() => {
    let result = profiles;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.email || '').toLowerCase().includes(q) ||
        (p.created_by || '').toLowerCase().includes(q) ||
        (p.user_id || '').toLowerCase().includes(q)
      );
    }
    if (filterConcern) {
      result = result.filter(p =>
        p.primary_concerns?.includes(filterConcern) ||
        p.secondary_concerns?.includes(filterConcern)
      );
    }
    if (filterAge) {
      result = result.filter(p => p.age_group === filterAge);
    }
    if (filterGender) {
      result = result.filter(p => p.gender === filterGender);
    }

    setFiltered(result);
    setPage(0);
  }, [search, filterConcern, filterAge, filterGender, profiles]);

  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const clearFilters = () => {
    setSearch('');
    setFilterConcern('');
    setFilterAge('');
    setFilterGender('');
  };

  // --- Render states ---
  if (authState === 'checking') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
      </div>
    );
  }

  if (authState === 'denied') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-white text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-400 text-sm">This section is restricted to administrators only.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-12">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/95 backdrop-blur border-b border-gray-900 px-4 py-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-xl bg-pink-500/10">
            <Shield className="w-5 h-5 text-pink-500" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Admin — User Selfies</h1>
            <p className="text-xs text-gray-500">Restricted access · Images served via signed URLs</p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by name, email, or user ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-gray-900 border-gray-800 text-white pl-9 h-11 rounded-xl text-sm"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>

        {/* Filters row */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          <select
            value={filterConcern}
            onChange={e => setFilterConcern(e.target.value)}
            className="bg-gray-900 border border-gray-800 text-sm text-gray-300 rounded-xl px-3 py-2 flex-shrink-0 focus:outline-none focus:border-pink-500"
          >
            <option value="">All Concerns</option>
            {SKIN_CONCERNS.map(c => (
              <option key={c} value={c}>{c.replace('_', ' ')}</option>
            ))}
          </select>

          <select
            value={filterAge}
            onChange={e => setFilterAge(e.target.value)}
            className="bg-gray-900 border border-gray-800 text-sm text-gray-300 rounded-xl px-3 py-2 flex-shrink-0 focus:outline-none focus:border-pink-500"
          >
            <option value="">All Ages</option>
            {AGE_GROUPS.map(a => (
              <option key={a} value={a}>{a.replace(/_/g, '-')}</option>
            ))}
          </select>

          <select
            value={filterGender}
            onChange={e => setFilterGender(e.target.value)}
            className="bg-gray-900 border border-gray-800 text-sm text-gray-300 rounded-xl px-3 py-2 flex-shrink-0 focus:outline-none focus:border-pink-500"
          >
            <option value="">All Genders</option>
            {GENDERS.map(g => (
              <option key={g} value={g} className="capitalize">{g}</option>
            ))}
          </select>

          {(filterConcern || filterAge || filterGender) && (
            <button
              onClick={clearFilters}
              className="flex-shrink-0 px-3 py-2 rounded-xl bg-pink-500/10 text-pink-400 text-sm hover:bg-pink-500/20 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Stats */}
        <p className="text-gray-500 text-xs">
          Showing {paginated.length} of {filtered.length} users
          {filtered.length !== profiles.length && ` (filtered from ${profiles.length})`}
        </p>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
          </div>
        ) : paginated.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-sm">No users found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginated.map(profile => (
              <UserSelfieCard
                key={profile.id}
                profile={profile}
                onExpand={(src, alt) => setLightbox({ src, alt })}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="border-gray-800 text-gray-300 bg-transparent"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-gray-400 text-sm">
              Page {page + 1} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="border-gray-800 text-gray-300 bg-transparent"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <Lightbox
          src={lightbox.src}
          alt={lightbox.alt}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
}