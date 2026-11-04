import React, { useEffect, useState } from 'react';
import { jsPDF } from 'jspdf';
import { Download, FileText, Loader2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

async function buildPdf({ profile, triage, scanPhotoUrl }) {
  const doc = new jsPDF();
  const scanDate = triage.scan_date ? new Date(triage.scan_date) : new Date();

  doc.setFontSize(18);
  doc.text('Acne Screening Report', 15, 22);
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text('Celure - AI Skincare Screening', 15, 29);
  doc.setTextColor(0);

  doc.setFontSize(11);
  let y = 45;
  doc.text(`Patient: ${profile?.name || '-'}`, 15, y); y += 7;
  doc.text(`Scan date: ${scanDate.toLocaleString()}`, 15, y); y += 7;
  doc.text(`Severity tier: ${(triage.severity_tier || '').toUpperCase()}`, 15, y); y += 7;
  doc.text(`Estimated lesions: ${triage.lesion_estimate ?? '-'}`, 15, y); y += 12;

  if (scanPhotoUrl) {
    try {
      const img = await loadImage(scanPhotoUrl);
      const canvas = document.createElement('canvas');
      canvas.width = img.width; canvas.height = img.height;
      canvas.getContext('2d').drawImage(img, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
      doc.addImage(dataUrl, 'JPEG', 15, y, 45, 45);
      doc.setFontSize(9); doc.setTextColor(120);
      doc.text('Scan photo', 15, y + 52);
      doc.setTextColor(0);
    } catch (e) { console.warn('photo embed failed', e); }
  }

  let y2 = y + 65;
  doc.setFontSize(12); doc.text('Key findings', 15, y2); y2 += 7;
  doc.setFontSize(10);
  (triage.key_findings || []).forEach(f => { doc.text(`- ${f}`, 18, y2); y2 += 6; });
  y2 += 4;
  doc.setFontSize(12); doc.text('Affected zones', 15, y2); y2 += 7;
  doc.setFontSize(10); doc.text((triage.affected_zones || []).join(', ') || '-', 18, y2); y2 += 12;
  doc.setFontSize(12); doc.text('Topics to discuss with the doctor', 15, y2); y2 += 7;
  doc.setFontSize(10);
  (triage.topics_to_discuss || []).forEach(t => { doc.text(`- ${t}`, 18, y2); y2 += 6; });
  y2 += 8;
  doc.setFontSize(9); doc.setTextColor(150);
  doc.text('AI-generated screening report, not a medical diagnosis.', 15, y2);

  return doc.output('blob');
}

export default function DiagnosisReport({ profile, triage, scanPhotoUrl, onPdfBlob, onContinue }) {
  const [building, setBuilding] = useState(true);
  const [blobUrl, setBlobUrl] = useState(null);

  useEffect(() => {
    let active = true;
    let createdUrl = null;
    (async () => {
      try {
        const blob = await buildPdf({ profile, triage, scanPhotoUrl });
        if (!active) return;
        createdUrl = URL.createObjectURL(blob);
        setBlobUrl(createdUrl);
        onPdfBlob?.(blob);
      } catch (e) {
        console.error('PDF build failed', e);
      } finally {
        if (active) setBuilding(false);
      }
    })();
    return () => { active = false; if (createdUrl) URL.revokeObjectURL(createdUrl); };
    // eslint-disable-next-line
  }, []);

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5 text-pink-500" />
        <h2 className="text-lg font-bold">Diagnosis Report</h2>
      </div>

      <div className="bg-gray-950 border border-gray-800 rounded-2xl p-5 mb-4">
        <div className="flex gap-4 mb-4">
          {scanPhotoUrl ? (
            <img src={scanPhotoUrl} alt="scan" className="w-20 h-20 rounded-xl object-cover border border-gray-800" />
          ) : (
            <div className="w-20 h-20 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center text-2xl">🧑</div>
          )}
          <div className="flex-1">
            <p className="text-white font-semibold">{profile?.name || '-'}</p>
            <p className="text-gray-400 text-xs">{triage.scan_date ? new Date(triage.scan_date).toLocaleString() : ''}</p>
            <span className="inline-block mt-2 px-2 py-1 rounded-full text-xs bg-red-500/15 text-red-400 uppercase font-semibold">
              {triage.severity_tier} acne
            </span>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Key findings</p>
            <ul className="text-gray-200 space-y-1">
              {(triage.key_findings || []).map((f, i) => <li key={i} className="flex gap-2"><span className="text-pink-500">•</span>{f}</li>)}
            </ul>
          </div>
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Affected zones</p>
            <p className="text-gray-200">{(triage.affected_zones || []).join(', ') || '-'}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Topics to discuss with the doctor</p>
            <ul className="text-gray-200 space-y-1">
              {(triage.topics_to_discuss || []).map((t, i) => <li key={i} className="flex gap-2"><span className="text-pink-500">•</span>{t}</li>)}
            </ul>
          </div>
        </div>

        <div className="mt-4 bg-amber-500/5 border border-amber-500/20 rounded-xl p-3">
          <p className="text-amber-300/80 text-xs">AI-generated screening report, not a medical diagnosis.</p>
        </div>
      </div>

      <a
        href={blobUrl || '#'}
        download="celure-acne-report.pdf"
        className={`w-full flex items-center justify-center gap-2 h-12 rounded-xl text-sm font-medium mb-3 ${blobUrl ? 'bg-gray-900 border border-gray-800 text-white' : 'bg-gray-900/50 text-gray-600'}`}
      >
        {building ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
        {building ? 'Preparing PDF…' : 'Download PDF'}
      </a>

      <Button
        onClick={onContinue}
        disabled={building}
        className="w-full h-14 rounded-xl font-semibold text-base"
        style={{ background: '#FF69B4' }}
      >
        Continue to map <ChevronRight className="w-5 h-5 ml-1" />
      </Button>
    </div>
  );
}