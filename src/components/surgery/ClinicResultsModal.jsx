import React, { useState } from 'react';
import { X, BadgeCheck, Phone, Navigation, Mail, Share2, ShieldAlert } from 'lucide-react';

/**
 * Two-step modal:
 * Step 1: Lead capture consent (with DPDP consent for image sharing)
 * Step 2: Clinic results with Call / Directions / Partnership CTAs
 */
export default function ClinicResultsModal({
  isOpen,
  onClose,
  clinics = [],
  note = null,
  selectedProcedures = [],
  compositeImageUrl = null,
  harmonyScore = 0,
  intensity = 0.6,
  onCreateLead = null
}) {
  const [step, setStep] = useState(1);
  const [dpdpConsent, setDpdpConsent] = useState(false);
  const [shareChoice, setShareChoice] = useState(null); // 'yes' | 'no' | null

  if (!isOpen) return null;

  const subcategories = selectedProcedures.map(p => p.subcategory);

  const handleChooseShare = (choice) => {
    setShareChoice(choice);
    if (choice === 'no') {
      setStep(2);
    }
  };

  const handleConfirmShare = () => {
    setStep(2);
  };

  const handleClinicAction = (clinic) => {
    if (shareChoice === 'yes' && onCreateLead) {
      onCreateLead(clinic.id, dpdpConsent);
    }
  };

  const handleClose = () => {
    setStep(1);
    setDpdpConsent(false);
    setShareChoice(null);
    onClose();
  };

  // Format distance
  const formatDist = (km) => km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70" onClick={handleClose} />

      {/* Sheet */}
      <div className="relative w-full sm:max-w-lg bg-gray-950 border border-gray-800 rounded-t-3xl sm:rounded-3xl max-h-[85vh] overflow-y-auto">
        {/* Handle */}
        <div className="sticky top-0 bg-gray-950 z-10 pt-3 pb-2">
          <div className="w-10 h-1 bg-gray-700 rounded-full mx-auto" />
        </div>

        {/* Close */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 p-2 rounded-full bg-gray-900 z-20"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>

        {/* STEP 1: Lead capture consent */}
        {step === 1 && (
          <div className="px-5 pb-6 pt-2">
            <div className="flex items-center gap-2 mb-4">
              <Share2 className="w-5 h-5 text-pink-500" />
              <h3 className="text-base font-semibold">Share Your Simulation?</h3>
            </div>

            <p className="text-sm text-gray-400 leading-relaxed mb-5">
              Share your simulation with the clinic for a personalised consultation?
            </p>

            {/* Yes option */}
            <div className="space-y-3">
              <div className={`border-2 rounded-2xl p-4 transition-all ${
                shareChoice === 'yes' ? 'border-pink-500 bg-pink-500/5' : 'border-gray-800'
              }`}>
                <button
                  onClick={() => setShareChoice('yes')}
                  className="w-full text-left"
                >
                  <span className="text-sm font-medium">Yes, share my simulation</span>
                </button>

                {shareChoice === 'yes' && (
                  <div className="mt-3 space-y-3">
                    {/* DPDP consent */}
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={dpdpConsent}
                        onChange={(e) => setDpdpConsent(e.target.checked)}
                        className="w-4 h-4 mt-0.5 rounded accent-pink-500 flex-shrink-0"
                      />
                      <span className="text-xs text-gray-400 leading-relaxed">
                        Your face image will be shared with the clinic. You can revoke
                        this at any time in Settings.
                      </span>
                    </label>

                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-2.5 flex items-start gap-2">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <p className="text-[11px] text-amber-300/80 leading-relaxed">
                        By consenting, you agree to share your simulation image under the
                        DPDP Act, 2023. Your data will be used solely for consultation purposes.
                      </p>
                    </div>

                    <button
                      onClick={handleConfirmShare}
                      disabled={!dpdpConsent}
                      className="w-full h-10 bg-pink-500 rounded-full font-medium text-sm disabled:opacity-40"
                    >
                      Confirm & Continue
                    </button>
                  </div>
                )}
              </div>

              {/* No option */}
              <button
                onClick={() => handleChooseShare('no')}
                className="w-full h-12 bg-gray-900 border border-gray-800 rounded-2xl font-medium text-sm text-gray-400"
              >
                No, just show clinics
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Clinic results */}
        {step === 2 && (
          <div className="px-5 pb-6 pt-2">
            <h3 className="text-base font-semibold mb-1">Nearest Partner Clinics</h3>
            {note && (
              <p className="text-xs text-amber-400 mb-4">{note}</p>
            )}

            {/* Clinic cards */}
            <div className="space-y-3">
              {clinics.map(clinic => (
                <div
                  key={clinic.id}
                  className="bg-gray-900 border border-gray-800 rounded-2xl p-4"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-semibold">{clinic.clinic_name}</h4>
                        {clinic.is_verified_partner && (
                          <BadgeCheck className="w-4 h-4 text-pink-500" />
                        )}
                      </div>
                      {clinic.doctor_name && (
                        <p className="text-xs text-gray-400 mt-0.5">{clinic.doctor_name}</p>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDist(clinic.distance)}
                    </span>
                  </div>

                  {/* Address */}
                  {clinic.address && (
                    <p className="text-xs text-gray-500 mb-2">
                      {clinic.address}, {clinic.city}, {clinic.state}
                    </p>
                  )}

                  {/* Procedures offered */}
                  {clinic.procedures_offered?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {clinic.procedures_offered.map(proc => (
                        <span
                          key={proc}
                          className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                            subcategories.includes(proc)
                              ? 'bg-pink-500/15 text-pink-400'
                              : 'bg-gray-800 text-gray-500'
                          }`}
                        >
                          {proc}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* CTAs */}
                  <div className="flex gap-2">
                    <a
                      href={`tel:${clinic.phone}`}
                      onClick={() => handleClinicAction(clinic)}
                      className="flex-1 h-9 bg-pink-500 rounded-full flex items-center justify-center gap-1.5 text-xs font-medium"
                    >
                      <Phone className="w-3.5 h-3.5" /> Call
                    </a>
                    <a
                      href={`https://maps.google.com/?q=${clinic.lat},${clinic.lon}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleClinicAction(clinic)}
                      className="flex-1 h-9 bg-gray-800 border border-gray-700 rounded-full flex items-center justify-center gap-1.5 text-xs font-medium"
                    >
                      <Navigation className="w-3.5 h-3.5" /> Directions
                    </a>
                  </div>
                </div>
              ))}

              {clinics.length === 0 && (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No partner clinics found. Try requesting a partnership below.
                </div>
              )}
            </div>

            {/* Request Partnership */}
            <a
              href="mailto:partnerships@celure.ai?subject=Clinic Partnership Enquiry"
              className="mt-4 w-full h-10 border border-gray-700 rounded-full flex items-center justify-center gap-2 text-xs font-medium text-gray-400"
            >
              <Mail className="w-3.5 h-3.5" /> Request Partnership
            </a>
          </div>
        )}
      </div>
    </div>
  );
}