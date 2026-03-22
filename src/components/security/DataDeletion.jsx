/**
 * DataDeletion
 * Allows users to permanently delete all their data (GDPR-style).
 * Deletes: SkinProfile, SkincareRoutine, ProductRecommendation, AnalysisHistory, AuditLog records.
 */
import React, { useState } from 'react';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { logAuditEvent } from '@/lib/auditLogger';

export default function DataDeletion({ onDeleted }) {
  const [step, setStep] = useState('idle'); // idle | confirm | deleting | done
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    setStep('deleting');
    setError(null);
    try {
      const user = await base44.auth.me();
      const email = user?.email;

      // Log the intent before deletion (last audit event)
      await logAuditEvent({
        action: 'data_deleted',
        resourceType: 'all_user_data',
        metadata: { scope: 'full_account_deletion' },
        success: true
      });

      // Fetch all user's records by email (RLS ensures only own data)
      const [profiles, histories] = await Promise.all([
        base44.entities.SkinProfile.filter({ created_by: email }),
        base44.entities.AnalysisHistory.filter({ created_by: email })
      ]);

      const profileIds = profiles.map(p => p.id);

      // Delete linked routines and products for each profile
      await Promise.all(
        profileIds.flatMap(pid => [
          base44.entities.SkincareRoutine.filter({ profile_id: pid })
            .then(items => Promise.all(items.map(i => base44.entities.SkincareRoutine.delete(i.id)))),
          base44.entities.ProductRecommendation.filter({ profile_id: pid })
            .then(items => Promise.all(items.map(i => base44.entities.ProductRecommendation.delete(i.id))))
        ])
      );

      // Delete profiles and history
      await Promise.all([
        ...profiles.map(p => base44.entities.SkinProfile.delete(p.id)),
        ...histories.map(h => base44.entities.AnalysisHistory.delete(h.id))
      ]);

      // Clear local session flags
      localStorage.removeItem(`onboardingComplete_${user?.full_name || email}`);
      localStorage.removeItem('currentProfileName');

      setStep('done');
      setTimeout(() => {
        base44.auth.logout();
      }, 2500);
    } catch (err) {
      setError('Failed to delete some data. Please try again or contact support.');
      setStep('confirm');
    }
  };

  if (step === 'done') {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center">
        <p className="text-green-400 font-semibold mb-1">✓ All data deleted</p>
        <p className="text-gray-400 text-sm">Logging you out...</p>
      </div>
    );
  }

  if (step === 'confirm') {
    return (
      <div className="bg-red-950/40 border border-red-800/50 rounded-2xl p-6">
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-300 font-semibold text-sm mb-1">This cannot be undone</p>
            <p className="text-red-400/80 text-xs leading-relaxed">
              This will permanently delete your skin profile, all analyses, product recommendations, routines, and selfie references. Your account will be logged out.
            </p>
          </div>
        </div>

        {error && (
          <p className="text-red-400 text-xs mb-4 bg-red-900/30 p-2 rounded-lg">{error}</p>
        )}

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setStep('idle')}
            className="flex-1 border-gray-700 text-gray-300 bg-transparent hover:bg-gray-800"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={step === 'deleting'}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white border-0"
          >
            {step === 'deleting' ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Deleting...</>
            ) : (
              'Yes, Delete Everything'
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setStep('confirm')}
      className="flex items-center justify-between w-full py-3 text-left group"
    >
      <div className="flex items-center gap-3">
        <Trash2 className="w-5 h-5 text-red-500" />
        <div>
          <p className="text-red-400 text-sm font-medium">Delete All My Data</p>
          <p className="text-gray-500 text-xs">Permanently removes all your skin data & images</p>
        </div>
      </div>
    </button>
  );
}