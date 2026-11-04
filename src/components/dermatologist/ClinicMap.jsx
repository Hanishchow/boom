import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { base44 } from '@/api/base44Client';
import { Loader2, MapPin, Navigation, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

function haversine(lat1, lon1, lat2, lon2) {
  const toRad = d => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1), dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function ClinicMap({ onSelectClinic }) {
  const [allClinics, setAllClinics] = useState([]);
  const [userPos, setUserPos] = useState(null);
  const [locationDenied, setLocationDenied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cityQuery, setCityQuery] = useState('');
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const list = await base44.entities.PartnerClinics.filter({ is_active: true });
        setAllClinics(list || []);
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => setUserPos({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
            () => setLocationDenied(true),
            { timeout: 10000 }
          );
        } else {
          setLocationDenied(true);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const displayed = useMemo(() => {
    let list = allClinics.filter(c => c.lat != null && c.lon != null);
    if (userPos) {
      list = list
        .map(c => ({ ...c, distance_km: Math.round(haversine(userPos.lat, userPos.lon, c.lat, c.lon) * 10) / 10 }))
        .sort((a, b) => a.distance_km - b.distance_km)
        .slice(0, 15);
    } else if (searched && cityQuery.trim()) {
      const q = cityQuery.trim().toLowerCase();
      list = list.filter(c => (c.city || '').toLowerCase().includes(q) || (c.state || '').toLowerCase().includes(q));
    } else {
      list = list.slice(0, 15);
    }
    return list;
  }, [allClinics, userPos, searched, cityQuery]);

  const mapCenter = useMemo(() => {
    if (userPos) return [userPos.lat, userPos.lon];
    if (displayed.length) return [displayed[0].lat, displayed[0].lon];
    return [20.5937, 78.9629];
  }, [userPos, displayed]);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-pink-500 animate-spin" /></div>;
  }

  return (
    <div>
      {locationDenied && (
        <div className="mb-4">
          <p className="text-gray-400 text-xs mb-2">Location unavailable — search by city or pincode.</p>
          <div className="flex gap-2">
            <Input value={cityQuery} onChange={e => setCityQuery(e.target.value)} placeholder="City or pincode" className="bg-gray-900 border-gray-800" />
            <Button onClick={() => setSearched(true)} className="rounded-xl" style={{ background: '#FF69B4' }}>
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {userPos && (
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
          <Navigation className="w-3 h-3 text-pink-500" /> Showing clinics nearest to your location.
        </div>
      )}

      <div className="rounded-2xl overflow-hidden border border-gray-800 mb-4" style={{ height: 280 }}>
        <MapContainer center={mapCenter} zoom={11} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap" />
          {userPos && (
            <CircleMarker center={[userPos.lat, userPos.lon]} radius={8} pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.8 }}>
              <Popup>You are here</Popup>
            </CircleMarker>
          )}
          {displayed.map((c, i) => (
            <CircleMarker key={c.id || i} center={[c.lat, c.lon]} radius={6} pathOptions={{ color: '#ec4899', fillColor: '#ec4899', fillOpacity: 0.7 }}>
              <Popup>{c.clinic_name}</Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      <p className="text-gray-500 text-xs mb-3">{displayed.length} clinic(s) found</p>

      <div className="space-y-3">
        {displayed.map((c, i) => (
          <button key={c.id || i} onClick={() => onSelectClinic(c)} className="w-full text-left bg-gray-950 border border-gray-800 rounded-2xl p-4 hover:border-pink-500/50 transition-colors">
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-white font-semibold text-sm">{c.clinic_name}</h4>
              {c.distance_km != null && <span className="text-pink-400 text-xs font-medium">{c.distance_km} km</span>}
            </div>
            {c.doctor_name && <p className="text-gray-400 text-xs mt-0.5">Dr. {c.doctor_name}</p>}
            <p className="text-gray-500 text-xs mt-1 flex items-start gap-1"><MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />{[c.address, c.city, c.state].filter(Boolean).join(', ')}</p>
            <div className="flex items-center gap-3 mt-2">
              {c.is_verified_partner && <span className="px-2 py-0.5 rounded-full text-xs bg-pink-500/15 text-pink-300">Verified partner</span>}
              {c.phone && <span className="text-gray-500 text-xs">{c.phone}</span>}
            </div>
          </button>
        ))}
        {displayed.length === 0 && <p className="text-gray-600 text-sm text-center py-8">No clinics found. Try a different city.</p>}
      </div>
    </div>
  );
}