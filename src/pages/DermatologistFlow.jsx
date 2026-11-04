import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { CheckCircle2, Home, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FlowStep from '@/components/dermatologist/FlowStep';
import SevereMessage from '@/components/dermatologist/SevereMessage';
import DiagnosisReport from '@/components/dermatologist/DiagnosisReport';
import ClinicMap from '@/components/dermatologist/ClinicMap';
import BookingForm from '@/components/dermatologist/BookingForm';

const STEPS = { MESSAGE: 0, REPORT: 1, MAP: 2, BOOKING: 3, CONFIRM: 4 };

export default function DermatologistFlow() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const profileId = params.get('profile');

  const [profile, setProfile] = useState(null);
  const [scanPhotoUrl, setScanPhotoUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(STEPS.MESSAGE);
  const [pdfBlob, setPdfBlob] = useState(null);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [appointment, setAppointment] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const list = await base44.entities.SkinProfile.filter({ id: profileId });
        if (!list.length) { navigate(createPageUrl('Home')); return; }
        const p = list[0];
        setProfile(p);
        const photoUri = p.front_image_url || p.face_image_url;
        if (photoUri) {
          try {
            const signed = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: photoUri });
            setScanPhotoUrl(signed?.signed_url || null);
          } catch (e) { console.warn('signed url failed', e); }
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, []);

  const triage = profile ? {
    severity_tier: profile.severity_tier,
    lesion_estimate: profile.severity_lesion_estimate,
    key_findings: profile.severity_key_findings || [],
    affected_zones: profile.severity_affected_zones || [],
    topics_to_discuss: profile.severity_topics_to_discuss || [],
    confidence: profile.severity_confidence,
    scan_date: profile.severity_scan_date
  } : null;

  if (loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center"><div className="w-8 h-8 border-4 border-gray-800 border-t-pink-500 rounded-full animate-spin" /></div>;
  }
  if (!profile) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-gray-400">Profile not found.</div>;
  }

  const goHome = () => navigate(createPageUrl('Home'));

  if (step === STEPS.MESSAGE) {
    return (
      <FlowStep title="Severe Acne" stepLabel="1 of 5" onBack={goHome}>
        <SevereMessage onContinue={() => setStep(STEPS.REPORT)} />
      </FlowStep>
    );
  }

  if (step === STEPS.REPORT) {
    return (
      <FlowStep title="Diagnosis Report" stepLabel="2 of 5" onBack={() => setStep(STEPS.MESSAGE)}>
        <DiagnosisReport
          profile={profile}
          triage={triage}
          scanPhotoUrl={scanPhotoUrl}
          onPdfBlob={setPdfBlob}
          onContinue={() => setStep(STEPS.MAP)}
        />
      </FlowStep>
    );
  }

  if (step === STEPS.MAP) {
    return (
      <FlowStep title="Nearby Dermatologists" stepLabel="3 of 5" onBack={() => setStep(STEPS.REPORT)}>
        <ClinicMap onSelectClinic={(c) => { setSelectedClinic(c); setStep(STEPS.BOOKING); }} />
      </FlowStep>
    );
  }

  if (step === STEPS.BOOKING) {
    return (
      <FlowStep title="Book Appointment" stepLabel="4 of 5" onBack={() => setStep(STEPS.MAP)}>
        <BookingForm
          clinic={selectedClinic}
          profile={profile}
          pdfBlob={pdfBlob}
          scanPhotoUrl={profile.front_image_url || profile.face_image_url}
          severityTier={triage.severity_tier}
          onBooked={(a) => { setAppointment(a); setStep(STEPS.CONFIRM); }}
        />
      </FlowStep>
    );
  }

  return (
    <FlowStep title="Appointment Booked" stepLabel="5 of 5" onBack={() => setStep(STEPS.BOOKING)}>
      <div className="flex flex-col items-center text-center pt-6">
        <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mb-5">
          <CheckCircle2 className="w-10 h-10 text-green-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Appointment requested!</h2>
        <p className="text-gray-400 text-sm mb-1">{appointment?.clinic_name || selectedClinic?.clinic_name}</p>
        <p className="text-gray-500 text-xs mb-6">{appointment?.preferred_date} · {appointment?.preferred_time_slot}</p>
        <p className="text-gray-500 text-xs max-w-sm mb-8">Your diagnosis report has been attached. The clinic will confirm your slot.</p>
        <div className="w-full space-y-3">
          <Button onClick={() => navigate(createPageUrl('SkinAnalysis'))} variant="outline" className="w-full h-12 rounded-xl border-gray-700">
            <RefreshCw className="w-4 h-4 mr-2" /> Start new scan
          </Button>
          <Button onClick={goHome} className="w-full h-12 rounded-xl" style={{ background: '#FF69B4' }}>
            <Home className="w-4 h-4 mr-2" /> Back to Home
          </Button>
        </div>
      </div>
    </FlowStep>
  );
}