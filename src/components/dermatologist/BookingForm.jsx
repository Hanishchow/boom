import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { MapPin, Phone, Loader2, Calendar, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const TIME_SLOTS = ['09:00–10:00', '10:00–11:00', '11:00–12:00', '12:00–13:00', '14:00–15:00', '15:00–16:00', '16:00–17:00'];

export default function BookingForm({ clinic, profile, pdfBlob, scanPhotoUrl, severityTier, onBooked }) {
  const [name, setName] = useState(profile?.name || '');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [slot, setSlot] = useState(TIME_SLOTS[0]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !date) {
      setError('Please fill in your name, phone and preferred date.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      let reportFileUri = null;
      if (pdfBlob) {
        try {
          const file = new File([pdfBlob], 'celure-acne-report.pdf', { type: 'application/pdf' });
          const up = await base44.integrations.Core.UploadPrivateFile({ file });
          reportFileUri = up?.file_uri || null;
        } catch (e) { console.warn('report upload failed', e); }
      }
      let userId = '';
      try { const u = await base44.auth.me(); userId = u?.id || ''; } catch {}

      const appt = await base44.entities.Appointments.create({
        user_id: userId,
        profile_id: profile?.id || null,
        clinic_place_id: clinic.place_id || '',
        clinic_name: clinic.clinic_name,
        clinic_address: [clinic.address, clinic.city, clinic.state].filter(Boolean).join(', '),
        clinic_lat: clinic.lat ?? null,
        clinic_lon: clinic.lon ?? null,
        clinic_rating: clinic.rating ?? null,
        clinic_uri: clinic.uri || '',
        patient_name: name.trim(),
        patient_phone: phone.trim(),
        preferred_date: date,
        preferred_time_slot: slot,
        report_file_uri: reportFileUri,
        scan_photo_url: scanPhotoUrl || null,
        severity_tier: severityTier || 'severe',
        status: 'pending'
      });
      onBooked(appt);
    } catch (err) {
      console.error(err);
      setError(err?.message || 'Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="bg-gray-950 border border-gray-800 rounded-2xl p-5">
        <h3 className="text-white font-bold mb-1">{clinic.clinic_name}</h3>
        {clinic.is_verified_partner && <span className="inline-block mb-2 px-2 py-0.5 rounded-full text-xs bg-pink-500/15 text-pink-300">Verified partner</span>}
        <div className="flex items-start gap-2 text-gray-400 text-sm mb-1"><MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" /><span>{[clinic.address, clinic.city, clinic.state].filter(Boolean).join(', ')}</span></div>
        {clinic.distance_km != null && <p className="text-gray-500 text-xs">{clinic.distance_km} km away</p>}
        {clinic.doctor_name && <p className="text-gray-400 text-sm mt-1">Dr. {clinic.doctor_name}</p>}
        {clinic.phone && <div className="flex items-center gap-2 text-gray-400 text-sm mt-1"><Phone className="w-4 h-4" />{clinic.phone}</div>}
      </div>

      <div>
        <Label className="text-gray-300">Your name</Label>
        <div className="relative mt-1">
          <User className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
          <Input value={name} onChange={e => setName(e.target.value)} className="pl-9 bg-gray-900 border-gray-800" placeholder="Full name" />
        </div>
      </div>
      <div>
        <Label className="text-gray-300">Phone number</Label>
        <div className="relative mt-1">
          <Phone className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
          <Input value={phone} onChange={e => setPhone(e.target.value)} className="pl-9 bg-gray-900 border-gray-800" placeholder="10-digit mobile" />
        </div>
      </div>
      <div>
        <Label className="text-gray-300">Preferred date</Label>
        <div className="relative mt-1">
          <Calendar className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
          <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="pl-9 bg-gray-900 border-gray-800" />
        </div>
      </div>
      <div>
        <Label className="text-gray-300">Time slot</Label>
        <div className="relative mt-1">
          <Clock className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
          <select value={slot} onChange={e => setSlot(e.target.value)} className="pl-9 w-full h-10 rounded-md bg-gray-900 border border-gray-800 text-white text-sm">
            {TIME_SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <Button type="submit" disabled={submitting} className="w-full h-14 rounded-xl font-semibold text-base" style={{ background: '#FF69B4' }}>
        {submitting ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Booking…</> : 'Book appointment'}
      </Button>
    </form>
  );
}