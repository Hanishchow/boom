import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { User, Bell, Moon, Shield, HelpCircle, ChevronRight } from 'lucide-react';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const profiles = await base44.entities.SkinProfile.list('-created_date', 1);
      if (profiles.length > 0) {
        setProfile(profiles[0]);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <div className="p-6">
        {/* Header */}
        <h1 className="text-2xl font-bold mb-6">Profile</h1>

        {/* User Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center">
                <User className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{profile?.name || user?.full_name || 'User'}</h2>
                <p className="text-sm text-gray-400">{profile?.email || user?.email}</p>
              </div>
            </div>
            <Button variant="ghost" className="text-pink-500 hover:text-pink-400">
              Edit
            </Button>
          </div>

          {profile && (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Skin Type</span>
                <span className="font-medium capitalize">{profile.skin_type}</span>
              </div>
              {profile.diet_type && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Diet Type</span>
                  <span className="font-medium capitalize">{profile.diet_type.replace('_', ' ')}</span>
                </div>
              )}
              {profile.gender && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Gender</span>
                  <span className="font-medium capitalize">{profile.gender}</span>
                </div>
              )}
              {profile.age_group && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Age</span>
                  <span className="font-medium">{profile.age_group.replace('_', '-')}</span>
                </div>
              )}
              {profile.allergies && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Allergies</span>
                  <span className="font-medium">{profile.allergies || 'None'}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Settings */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Settings</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-gray-400" />
                <span>Notifications</span>
              </div>
              <Switch checked={notifications} onCheckedChange={setNotifications} />
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-gray-400" />
                <span>Dark Mode</span>
              </div>
              <Switch checked={darkMode} onCheckedChange={setDarkMode} />
            </div>

            <button className="flex items-center justify-between w-full py-3 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gray-400" />
                <span>Privacy Policy</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            <button className="flex items-center justify-between w-full py-3">
              <div className="flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-gray-400" />
                <span>Help & Support</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        <Button
          onClick={() => base44.auth.logout()}
          variant="outline"
          className="w-full border-red-500 text-red-500 hover:bg-red-500/10 rounded-full h-12"
        >
          Logout
        </Button>
      </div>
    </div>
  );
}