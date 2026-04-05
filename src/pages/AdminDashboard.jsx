/**
 * AdminDashboard — restricted to admin role only.
 * Sections: Overview | Data → User Selfies
 */
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Shield, Database, Users, AlertTriangle, Loader2, Camera } from 'lucide-react';
import UserSelfiesPanel from '@/components/admin/UserSelfiesPanel';

const NAV = [
  { id: 'overview', label: 'Overview', icon: Users },
  { id: 'data', label: 'Data', icon: Database },
];

const DATA_SUBSECTIONS = [
  { id: 'selfies', label: 'User Selfies', icon: Camera },
];

export default function AdminDashboard() {
  const [authState, setAuthState] = useState('checking');
  const [activeSection, setActiveSection] = useState('overview');
  const [activeData, setActiveData] = useState('selfies');
  const [stats, setStats] = useState({ profiles: 0, withSelfies: 0, analyses: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    base44.auth.me()
      .then(user => {
        if (user?.role === 'admin') setAuthState('authorized');
        else setAuthState('denied');
      })
      .catch(() => setAuthState('denied'));
  }, []);

  useEffect(() => {
    if (authState !== 'authorized') return;
    Promise.all([
      base44.entities.SkinProfile.list('-created_date', 200),
      base44.entities.AnalysisHistory.list('-created_date', 200),
    ]).then(([profiles, analyses]) => {
      setStats({
        profiles: profiles.length,
        withSelfies: profiles.filter(p => p.front_image_url || p.right_image_url || p.left_image_url).length,
        analyses: analyses.length,
      });
    }).finally(() => setStatsLoading(false));
  }, [authState]);

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
          <p className="text-gray-400 text-sm">This dashboard is restricted to administrators only.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top bar */}
      <div className="bg-gray-950 border-b border-gray-800 px-6 py-4 flex items-center gap-3">
        <div className="p-2 rounded-xl bg-pink-500/10">
          <Shield className="w-5 h-5 text-pink-500" />
        </div>
        <div>
          <h1 className="text-base font-bold">Célure Admin Dashboard</h1>
          <p className="text-xs text-gray-500">Internal use only · Admin access required</p>
        </div>
      </div>

      <div className="flex min-h-[calc(100vh-65px)]">
        {/* Sidebar */}
        <aside className="w-48 bg-gray-950 border-r border-gray-800 p-4 flex-shrink-0">
          <nav className="space-y-1">
            {NAV.map(({ id, label, icon: Icon }) => (
              <div key={id}>
                <button
                  onClick={() => setActiveSection(id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                    activeSection === id ? 'bg-pink-500/10 text-pink-400' : 'text-gray-400 hover:text-white hover:bg-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {label}
                </button>
                {/* Sub-nav for Data section */}
                {id === 'data' && activeSection === 'data' && (
                  <div className="ml-4 mt-1 space-y-1">
                    {DATA_SUBSECTIONS.map(({ id: subId, label: subLabel, icon: SubIcon }) => (
                      <button
                        key={subId}
                        onClick={() => setActiveData(subId)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all text-left ${
                          activeData === subId ? 'bg-pink-500/10 text-pink-300' : 'text-gray-500 hover:text-gray-300'
                        }`}
                      >
                        <SubIcon className="w-3.5 h-3.5" />
                        {subLabel}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6 overflow-auto">
          {activeSection === 'overview' && (
            <div>
              <h2 className="text-lg font-bold mb-6">Overview</h2>
              {statsLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-pink-500 animate-spin" /></div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  {[
                    { label: 'Total Profiles', value: stats.profiles, color: 'text-white' },
                    { label: 'With Selfies', value: stats.withSelfies, color: 'text-pink-400' },
                    { label: 'Total Analyses', value: stats.analyses, color: 'text-blue-400' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                      <p className="text-gray-400 text-sm mb-1">{label}</p>
                      <p className={`text-3xl font-bold ${color}`}>{value}</p>
                    </div>
                  ))}
                </div>
              )}
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-amber-300/80 text-xs leading-relaxed">
                  All data in this dashboard is restricted to admin users. User selfie images are served via short-lived signed URLs and are never publicly accessible.
                </p>
              </div>
            </div>
          )}

          {activeSection === 'data' && activeData === 'selfies' && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Camera className="w-5 h-5 text-pink-400" />
                <div>
                  <h2 className="text-lg font-bold">User Selfies</h2>
                  <p className="text-xs text-gray-500">Tagged by email · Signed URL access only</p>
                </div>
              </div>
              <UserSelfiesPanel />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}