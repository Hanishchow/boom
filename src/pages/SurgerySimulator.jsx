import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Sparkles, Eye, Save, MapPin, Loader2, Brain } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import DisclaimerModal from '@/components/surgery/DisclaimerModal';
import PhotoZone from '@/components/surgery/PhotoZone';
import ProcedureSelector from '@/components/surgery/ProcedureSelector';
import GoldenRatioPanel from '@/components/surgery/GoldenRatioPanel';
import ClinicResultsModal from '@/components/surgery/ClinicResultsModal';
import MultiPhotoUpload from '@/components/surgery/MultiPhotoUpload';
import { findNearestClinics } from '@/lib/clinicMatcher';
import { generateLocalAnalysis, buildLLMPrompt } from '@/lib/surgeryAnalysis';

export default function SurgerySimulator() {
  const navigate = useNavigate();
  const photoZoneRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [procedures, setProcedures] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [selectedProcedures, setSelectedProcedures] = useState([]);
  const [intensity, setIntensity] = useState(0.6);
  const [showLandmarks, setShowLandmarks] = useState(false);
  const [goldenRatioReport, setGoldenRatioReport] = useState(null);
  const [userAge, setUserAge] = useState(null);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [showClinicModal, setShowClinicModal] = useState(false);
  const [matchedClinics, setMatchedClinics] = useState([]);
  const [clinicNote, setClinicNote] = useState(null);
  const [compositeImageUrl, setCompositeImageUrl] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [panelExpanded, setPanelExpanded] = useState(false);

  // Workflow state
  const [step, setStep] = useState('upload'); // 'upload' | 'results'
  const [scanPhotos, setScanPhotos] = useState(null);
  const [initialFrontPhoto, setInitialFrontPhoto] = useState(null);
  const [uploadedPhotos, setUploadedPhotos] = useState({ front: null, right: null, left: null });
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [analyzingAI, setAnalyzingAI] = useState(false);

  // Refs for stable callbacks (avoid stale closures / re-firing effects)
  const proceduresRef = useRef(procedures);
  const userAgeRef = useRef(userAge);
  const goldenRatioReportRef = useRef(null);
  const selectedProceduresRef = useRef(selectedProcedures);
  useEffect(() => { proceduresRef.current = procedures; }, [procedures]);
  useEffect(() => { userAgeRef.current = userAge; }, [userAge]);
  useEffect(() => { selectedProceduresRef.current = selectedProcedures; }, [selectedProcedures]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // Check URL for photo param (from Results page)
      const urlParams = new URLSearchParams(window.location.search);
      const photoParam = urlParams.get('photo');
      if (photoParam) setInitialFrontPhoto(photoParam);

      // Check disclaimer
      const dismissed = localStorage.getItem('surgery_simulator_dismissed') === 'true';
      setDisclaimerAccepted(dismissed);

      // Load procedures and clinics in parallel
      const [procs, clins] = await Promise.all([
        base44.entities.Procedures.filter({ is_active: true }),
        base44.entities.PartnerClinics.filter({ is_active: true })
      ]);
      setProcedures(procs);
      setClinics(clins);

      // Load user profile for DOB + scan photos (RLS auto-filters by current user)
      const user = await base44.auth.me();
      const profiles = await base44.entities.SkinProfile.filter(
        {},
        '-created_date',
        1
      );

      if (profiles.length > 0) {
        const profile = profiles[0];
        if (profile.dob) {
          const birth = new Date(profile.dob);
          const age = Math.floor((Date.now() - birth.getTime()) / (365.25 * 24 * 3600 * 1000));
          setUserAge(age);
        }
        if (profile.front_image_url || profile.right_image_url || profile.left_image_url) {
          setScanPhotos({
            front: profile.front_image_url || profile.face_image_url,
            right: profile.right_image_url,
            left: profile.left_image_url
          });
        }
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptDisclaimer = async () => {
    localStorage.setItem('surgery_simulator_dismissed', 'true');
    try {
      await base44.auth.updateMe({ surgery_simulator_disclaimer_accepted: true });
    } catch (e) { /* non-critical */ }
    setDisclaimerAccepted(true);
  };

  // --- Photos ready from upload step → move to results ---
  const handlePhotosReady = useCallback((photos) => {
    setUploadedPhotos(photos);
    setPhotoUrl(photos.front);
    setStep('results');
  }, []);

  // --- Golden ratio computed: auto-select procedures + AI analysis ---
  // Uses refs for procedures/userAge so the callback identity is stable
  // and doesn't re-fire the PhotoZone effect when they load.
  const handleGoldenRatioComputed = useCallback((report) => {
    setGoldenRatioReport(report);
    goldenRatioReportRef.current = report;
    if (!report) return;

    // Auto-select recommended procedures based on golden ratio scores
    const recommendedNames = report.metrics
      .filter(m => m.score < 70 && m.relatedProcedure)
      .map(m => m.relatedProcedure);
    const currentProcedures = proceduresRef.current;
    const suggested = currentProcedures.filter(p => recommendedNames.includes(p.procedure_name));
    if (suggested.length > 0) {
      setSelectedProcedures(prev => {
        if (prev.length === 0) return suggested.slice(0, 3);
        return prev;
      });
    }

    // AI analysis via InvokeLLM with online data extraction
    setAnalyzingAI(true);
    const prompt = buildLLMPrompt(report, suggested.slice(0, 3), userAgeRef.current);

    base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      model: 'gemini_3_flash'
    })
      .then(text => setAiAnalysis(text))
      .catch(() => {
        // Fallback: local analysis when InvokeLLM is unavailable (credits, network, etc.)
        setAiAnalysis(generateLocalAnalysis(report, suggested.slice(0, 3)));
      })
      .finally(() => setAnalyzingAI(false));
  }, []);

  const handleToggleProcedure = useCallback((procedure) => {
    setSelectedProcedures(prev => {
      const exists = prev.find(p => p.id === procedure.id);
      if (exists) return prev.filter(p => p.id !== procedure.id);
      if (prev.length >= 3) return prev;
      return [...prev, procedure];
    });
  }, []);

  const handleMetricTap = useCallback((relatedProcedureName) => {
    if (!relatedProcedureName) return;
    const proc = procedures.find(p => p.procedure_name === relatedProcedureName);
    if (proc && !selectedProcedures.find(p => p.id === proc.id)) {
      setSelectedProcedures(prev => prev.length >= 3 ? prev : [...prev, proc]);
    }
  }, [procedures, selectedProcedures]);

  const handleIntensityChange = (value) => {
    const snapped = Math.round(value[0] * 4) / 4;
    setIntensity(snapped);
    if (navigator.vibrate) navigator.vibrate(10);
  };

  const dataURLtoBlob = (dataURL) => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    const u8arr = new Uint8Array(bstr.length);
    for (let i = 0; i < bstr.length; i++) u8arr[i] = bstr.charCodeAt(i);
    return new Blob([u8arr], { type: mime });
  };

  const getUserLocation = () => {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
          () => resolve({ lat: 28.6139, lon: 77.2090 }),
          { timeout: 5000, enableHighAccuracy: false }
        );
      } else {
        resolve({ lat: 28.6139, lon: 77.2090 });
      }
    });
  };

  const handleSavePreview = () => {
    if (!photoZoneRef.current) return;
    setIsSaving(true);
    setTimeout(() => {
      try {
        const dataUrl = photoZoneRef.current.getCompositeDataUrl(
          selectedProcedures.map(p => p.procedure_name),
          goldenRatioReport?.overallScore || 0
        );
        if (!dataUrl) return;
        if (navigator.share && navigator.canShare) {
          const blob = dataURLtoBlob(dataUrl);
          const file = new File([blob], 'celure-surgery-simulation.jpg', { type: 'image/jpeg' });
          if (navigator.canShare({ files: [file] })) {
            navigator.share({
              files: [file],
              title: 'Célure Surgery Simulation',
              text: 'Check out my surgery simulation on Célure AI!'
            }).catch(() => {});
            return;
          }
        }
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'celure-surgery-simulation.jpg';
        link.click();
      } catch (err) {
        console.error('Save preview failed:', err);
      } finally {
        setIsSaving(false);
      }
    }, 0);
  };

  const handleBookConsultation = async () => {
    setIsBooking(true);
    try {
      let compositeUrl = null;
      if (photoZoneRef.current) {
        const dataUrl = photoZoneRef.current.getCompositeDataUrl(
          selectedProcedures.map(p => p.procedure_name),
          goldenRatioReport?.overallScore || 0
        );
        if (dataUrl) {
          try {
            const blob = dataURLtoBlob(dataUrl);
            const file = new File([blob], 'simulation.jpg', { type: 'image/jpeg' });
            const result = await base44.integrations.Core.UploadFile({ file });
            compositeUrl = result.file_url;
            setCompositeImageUrl(compositeUrl);
          } catch (uploadErr) {
            // UploadFile may fail if credits are exhausted — proceed without uploaded image
            console.warn('Image upload skipped:', uploadErr);
          }
        }
      }
      const { lat, lon } = await getUserLocation();
      const result = findNearestClinics(clinics, lat, lon, selectedProcedures);
      setMatchedClinics(result.clinics);
      setClinicNote(result.note);
      setShowClinicModal(true);
    } catch (err) {
      console.error('Booking error:', err);
    } finally {
      setIsBooking(false);
    }
  };

  const handleCreateLead = async (clinicId, consentGiven) => {
    try {
      const user = await base44.auth.me();
      await base44.entities.SimulationLead.create({
        user_id: user.id,
        procedure_names: selectedProcedures.map(p => p.procedure_name),
        intensity,
        harmony_score: goldenRatioReport?.overallScore || 0,
        simulation_image_url: consentGiven && compositeImageUrl ? compositeImageUrl : null,
        clinic_id: clinicId,
        consent_given: consentGiven,
        status: 'pending'
      });
    } catch (err) {
      console.error('Failed to create lead:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
      </div>
    );
  }

  if (userAge !== null && userAge < 18) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">This feature is available for users aged 18+.</p>
          <button onClick={() => navigate('/')} className="text-pink-500 text-sm mt-4">
            Go back home
          </button>
        </div>
      </div>
    );
  }

  if (!disclaimerAccepted) {
    return (
      <DisclaimerModal
        userAge={userAge}
        onAccept={handleAcceptDisclaimer}
        onGoBack={() => navigate('/')}
      />
    );
  }

  const recommendedProcedureNames = (goldenRatioReport?.metrics || [])
    .filter(m => m.score < 70 && m.relatedProcedure)
    .map(m => m.relatedProcedure);

  const Header = () => (
    <div className="sticky top-0 z-50 bg-black/90 backdrop-blur border-b border-gray-900 px-4 py-4 flex items-center justify-between">
      <button
        onClick={() => step === 'results' ? setStep('upload') : navigate('/')}
        className="p-2 rounded-full bg-gray-900"
      >
        <ArrowLeft className="w-5 h-5 text-white" />
      </button>
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-pink-500" />
        <span className="font-semibold">Surgery Simulator</span>
      </div>
      {step === 'results' ? (
        <button
          onClick={() => setShowLandmarks(!showLandmarks)}
          className="p-2 rounded-full bg-gray-900"
        >
          <Eye className={`w-5 h-5 ${showLandmarks ? 'text-pink-500' : 'text-gray-400'}`} />
        </button>
      ) : (
        <div className="w-9" />
      )}
    </div>
  );

  // --- Step 1: Photo Upload ---
  if (step === 'upload') {
    return (
      <div className="min-h-screen bg-black text-white pb-24">
        <Header />
        <MultiPhotoUpload
          scanPhotos={scanPhotos}
          initialFrontPhoto={initialFrontPhoto}
          onPhotosReady={handlePhotosReady}
        />
      </div>
    );
  }

  // --- Step 2: AI Analysis + Before/After ---
  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <Header />

      {/* Before/After (front photo) */}
      <div className="px-4 pt-4">
        <PhotoZone
          ref={photoZoneRef}
          procedures={selectedProcedures}
          intensity={intensity}
          showLandmarks={showLandmarks}
          photoUrl={photoUrl}
          onGoldenRatioComputed={handleGoldenRatioComputed}
        />
      </div>

      {/* Profile thumbnails */}
      {(uploadedPhotos.right || uploadedPhotos.left) && (
        <div className="px-4 mt-3">
          <div className="flex gap-3">
            {uploadedPhotos.right && (
              <div className="flex-1">
                <img src={uploadedPhotos.right} alt="Right profile" className="w-full h-24 rounded-xl object-cover" />
                <p className="text-[10px] text-gray-500 text-center mt-1">Right Profile</p>
              </div>
            )}
            {uploadedPhotos.left && (
              <div className="flex-1">
                <img src={uploadedPhotos.left} alt="Left profile" className="w-full h-24 rounded-xl object-cover" />
                <p className="text-[10px] text-gray-500 text-center mt-1">Left Profile</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Analysis */}
      <div className="px-4 mt-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-4 h-4 text-pink-500" />
            <h3 className="text-sm font-semibold">AI Analysis</h3>
          </div>
          {analyzingAI ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-pink-500 animate-spin" />
              <p className="text-sm text-gray-400">Analyzing facial features...</p>
            </div>
          ) : aiAnalysis ? (
            <p className="text-sm text-gray-300 leading-relaxed">{aiAnalysis}</p>
          ) : goldenRatioReport ? (
            <p className="text-sm text-gray-400">
              Based on your golden ratio analysis, procedures have been suggested below.
            </p>
          ) : (
            <p className="text-sm text-gray-500">Waiting for face analysis to complete...</p>
          )}
        </div>
      </div>

      {/* Golden Ratio Panel */}
      <div className="px-4 mt-4">
        {goldenRatioReport ? (
          <GoldenRatioPanel
            report={goldenRatioReport}
            onMetricTap={handleMetricTap}
            isExpanded={panelExpanded}
            onToggleExpand={() => setPanelExpanded(!panelExpanded)}
          />
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center">
            <p className="text-xs text-gray-500">Analyzing facial harmony...</p>
          </div>
        )}
      </div>

      {/* AI-Suggested Procedures */}
      <div className="px-4 mt-6">
        <h3 className="text-sm font-semibold mb-1">AI-Suggested Procedures</h3>
        <p className="text-xs text-gray-500 mb-3">Auto-selected based on your analysis. Tap to refine.</p>
        <ProcedureSelector
          procedures={procedures}
          selectedProcedures={selectedProcedures}
          onToggleProcedure={handleToggleProcedure}
          recommendedProcedureNames={recommendedProcedureNames}
        />
      </div>

      {/* Intensity Slider */}
      {selectedProcedures.length > 0 && (
        <div className="px-4 mt-6">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Simulation Intensity</span>
              <span className="text-sm text-pink-500">{Math.round(intensity * 100)}%</span>
            </div>
            <Slider
              value={[intensity]}
              onValueChange={handleIntensityChange}
              min={0}
              max={1}
              step={0.25}
              className="w-full"
            />
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>Subtle</span>
              <span>Maximum</span>
            </div>
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="px-4 mt-6 flex gap-3">
        <button
          onClick={handleSavePreview}
          disabled={isSaving || !goldenRatioReport}
          className="flex-1 h-12 bg-gray-900 border border-gray-800 rounded-full flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Preview
        </button>
        <button
          onClick={handleBookConsultation}
          disabled={isBooking || !goldenRatioReport || selectedProcedures.length === 0}
          className="flex-1 h-12 bg-pink-500 rounded-full flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50"
        >
          {isBooking ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
          Book Consultation
        </button>
      </div>

      {/* Clinic Results Modal */}
      <ClinicResultsModal
        isOpen={showClinicModal}
        onClose={() => setShowClinicModal(false)}
        clinics={matchedClinics}
        note={clinicNote}
        selectedProcedures={selectedProcedures}
        compositeImageUrl={compositeImageUrl}
        harmonyScore={goldenRatioReport?.overallScore || 0}
        intensity={intensity}
        onCreateLead={handleCreateLead}
      />
    </div>
  );
}