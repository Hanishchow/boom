/**
 * UserSelfiesPanel — Admin-only component
 * Lists all user SkinProfiles with selfie images tagged by email.
 * Images served via short-lived signed URLs — never direct storage links.
 */
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Search, X, ZoomIn, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const PAGE_SIZE = 9;

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

// Fetches a signed URL for a private file_uri and renders the image lazily
function SignedImage({ fileUri, alt, onClick }) {
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!fileUri) { setError(true); return; }
    let cancelled = false;
    setLoading(true);
    base44.integrations.Core.CreateFileSignedUrl({ file_uri: fileUri, expires_in: 300 })
      .then(({ signed_url }) => { if (!cancelled) setUrl(signed_url); })
      .catch(() => { if (!cancelled) setError(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [fileUri]);

  if (!fileUri) return (
    <div className="aspect-square bg-gray-800 rounded-lg flex items-center justify-center">
      <span className="text-gray-600 text-xs">—</span>
    </div>
  );

  return (
    <div
      className="aspect-square bg-gray-800 rounded-lg overflow-hidden relative group cursor-pointer"
      onClick={() => url && onClick(url, alt)}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-4 h-4 text-pink-400 animate-spin" />
        </div>
      )}
      {error && !loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-gray-600 text-xs">N/A</span>
        </div>
      )}
      {url && (
        <>
          <img src={url} alt={alt} loading="lazy" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <ZoomIn className="w-5 h-5 text-white" />
          </div>
        </>
      )}
    </div>
  );
}

function Lightbox({ src, alt, onClose }) {
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-6" onClick={onClose}>
      <button className="absolute top-4 right-4 p-2 bg-gray-800 rounded-full hover:bg-gray-700" onClick={onClose}>
        <X className="w-5 h-5 text-white" />
      </button>
      <img src={src} alt={alt} className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl" onClick={e => e.stopPropagation()} />
      <p className="absolute bottom-4 text-gray-400 text-sm">{alt}</p>
    </div>
  );
}

function UserRow({ profile, onExpand }) {
  const hasAny = profile.front_image_url || profile.right_image_url || profile.left_image_url;
  const email = profile.email || profile.created_by || '—';

  return (
    <div className="bg-gray-950 border border-gray-800 rounded-2xl p-4">
      {/* Email tag — primary identifier */}
      <div className="mb-3 pb-3 border-b border-gray-800">
        <p className="text-pink-400 text-xs font-mono font-semibold mb-0.5">{email}</p>
        <p className="text-white text-sm font-medium">{profile.name || '(no name)'}</p>
        <div className="flex flex-wrap gap-1 mt-1">
          {profile.age_group && (
            <span className="px-2 py-0.5 bg-gray-800 rounded-full text-xs text-gray-400">{profile.age_group.replace(/_/g, '-')}</span>
          )}
          {profile.gender && (
            <span className="px-2 py-0.5 bg-gray-800 rounded-full text-xs text-gray-400 capitalize">{profile.gender}</span>
          )}
          {profile.skin_type && (
            <span className="px-2 py-0.5 bg-pink-500/10 rounded-full text-xs text-pink-300 capitalize">{profile.skin_type}</span>
          )}
          {profile.primary_concerns?.slice(0, 2).map(c => (
            <span key={c} className="px-2 py-0.5 bg-blue-500/10 rounded-full text-xs text-blue-300 capitalize">{c.replace('_', ' ')}</span>
          ))}
        </div>
      </div>

      {/* Selfie thumbnails */}
      {hasAny ? (
        <div className="grid grid-cols-3 gap-2">
          {ANGLES.map(({ key, label }) => (
            <div key={key}>
              <p className="text-gray-500 text-xs text-center mb-1">{label}</p>
              <SignedImage fileUri={profile[key]} alt={`${email} — ${label}`} onClick={onExpand} />
            </div>
          ))}
        </div>
      ) : (
        <div className="h-16 rounded-xl bg-gray-900 flex items-center justify-center">
          <p className="text-gray-600 text-xs">No selfies captured</p>
        </div>
      )}
    </div>
  );
}

export default function UserSelfiesPanel() {
  const [profiles, setProfiles] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [filterConcern, setFilterConcern] = useState('');
  const [filterAge, setFilterAge] = useState('');
  const [filterGender, setFilterGender] = useState('');
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    base44.entities.SkinProfile.list('-created_date', 200)
      .then(data => { setProfiles(data); setFiltered(data); })
      .finally(() => setLoading(false));
  }, []);

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
    if (filterConcern) result = result.filter(p => p.primary_concerns?.includes(filterConcern) || p.secondary_concerns?.includes(filterConcern));
    if (filterAge) result = result.filter(p => p.age_group === filterAge);
    if (filterGender) result = result.filter(p => p.gender === filterGender);
    setFiltered(result);
    setPage(0);
  }, [search, filterConcern, filterAge, filterGender, profiles]);

  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  return (
    <div className="space-y-4">
      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by email, name, or user ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-gray-900 border-gray-800 text-white pl-9 h-10 rounded-xl text-sm"
          />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-4 h-4 text-gray-400" /></button>}
        </div>
        <div className="flex gap-2 flex-wrap">
          <select value={filterConcern} onChange={e => setFilterConcern(e.target.value)}
            className="bg-gray-900 border border-gray-800 text-sm text-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:border-pink-500">
            <option value="">All Concerns</option>
            {SKIN_CONCERNS.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
          </select>
          <select value={filterAge} onChange={e => setFilterAge(e.target.value)}
            className="bg-gray-900 border border-gray-800 text-sm text-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:border-pink-500">
            <option value="">All Ages</option>
            {AGE_GROUPS.map(a => <option key={a} value={a}>{a.replace(/_/g, '-')}</option>)}
          </select>
          <select value={filterGender} onChange={e => setFilterGender(e.target.value)}
            className="bg-gray-900 border border-gray-800 text-sm text-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:border-pink-500">
            <option value="">All Genders</option>
            {GENDERS.map(g => <option key={g} value={g} className="capitalize">{g}</option>)}
          </select>
          {(filterConcern || filterAge || filterGender) && (
            <button onClick={() => { setFilterConcern(''); setFilterAge(''); setFilterGender(''); }}
              className="px-3 py-2 rounded-xl bg-pink-500/10 text-pink-400 text-sm hover:bg-pink-500/20 transition-colors">
              Clear
            </button>
          )}
        </div>
      </div>

      <p className="text-gray-500 text-xs">
        {filtered.length} user{filtered.length !== 1 ? 's' : ''} · {filtered.filter(p => p.front_image_url || p.right_image_url || p.left_image_url).length} with selfies
      </p>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-pink-500 animate-spin" /></div>
      ) : paginated.length === 0 ? (
        <div className="text-center py-16"><p className="text-gray-500 text-sm">No users found</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {paginated.map(profile => (
            <UserRow key={profile.id} profile={profile} onExpand={(src, alt) => setLightbox({ src, alt })} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-2">
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
            className="border-gray-800 text-gray-300 bg-transparent">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-gray-400 text-sm">Page {page + 1} of {totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
            className="border-gray-800 text-gray-300 bg-transparent">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {lightbox && <Lightbox src={lightbox.src} alt={lightbox.alt} onClose={() => setLightbox(null)} />}
    </div>
  );
}