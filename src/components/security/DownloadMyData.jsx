/**
 * DownloadMyData
 * Lets the user download all their data as a JSON file (data portability).
 * Gathers the user's own records (RLS-scoped) and triggers a browser download.
 * No data leaves the user's device.
 */
import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function DownloadMyData() {
  const [downloading, setDownloading] = useState(false);
  const [done, setDone] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    setDone(false);
    try {
      const user = await base44.auth.me();
      const email = user?.email;

      const [profiles, histories, routines, products, consents] = await Promise.all([
        base44.entities.SkinProfile.filter({ created_by: email }),
        base44.entities.AnalysisHistory.filter({ created_by: email }),
        base44.entities.SkincareRoutine.filter({}),
        base44.entities.ProductRecommendation.filter({}),
        base44.entities.UserConsent.filter({ created_by: email })
      ]);

      // Routines and products are linked by profile_id — keep only those belonging to the user's profiles
      const profileIds = new Set(profiles.map(p => p.id));
      const myRoutines = routines.filter(r => profileIds.has(r.profile_id));
      const myProducts = products.filter(p => profileIds.has(p.profile_id));

      const payload = {
        exported_at: new Date().toISOString(),
        account: { id: user?.id || '', email: email || '' },
        skin_profiles: profiles,
        analysis_history: histories,
        skincare_routines: myRoutines,
        product_recommendations: myProducts,
        consent_records: consents
      };

      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `celure-my-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDone(true);
    } catch (err) {
      console.error('Download failed:', err);
    }
    setDownloading(false);
  };

  return (
    <div>
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="flex items-center justify-between w-full py-3 text-left disabled:opacity-50"
      >
        <div className="flex items-center gap-3">
          {downloading ? <Loader2 className="w-5 h-5 text-pink-500 animate-spin" /> : <Download className="w-5 h-5 text-pink-500" />}
          <div>
            <p className="text-pink-400 text-sm font-medium">Download my data</p>
            <p className="text-gray-500 text-xs">Get a JSON copy of everything we hold about you</p>
          </div>
        </div>
      </button>
      {done && <p className="text-green-400 text-xs mt-1">✓ Download started</p>}
    </div>
  );
}