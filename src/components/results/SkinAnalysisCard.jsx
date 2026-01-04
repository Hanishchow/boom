import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Droplet, Sun, Wind, AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react';

export default function SkinAnalysisCard({ profile }) {
  const getSkinTypeIcon = (type) => {
    switch(type) {
      case 'dry': return Droplet;
      case 'oily': return Sun;
      case 'combination': return Wind;
      default: return CheckCircle2;
    }
  };

  const getSensitivityColor = (level) => {
    switch(level) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const SkinTypeIcon = getSkinTypeIcon(profile.ai_adjusted_skin_type || profile.skin_type);

  return (
    <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SkinTypeIcon className="w-5 h-5 text-blue-600" />
          Your Skin Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Skin Type */}
        <div>
          <div className="text-sm text-gray-600 mb-2">Skin Type</div>
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-600 text-white text-base py-1 px-3">
              {(profile.ai_adjusted_skin_type || profile.skin_type).toUpperCase()}
            </Badge>
            {profile.ai_adjusted_skin_type && profile.ai_adjusted_skin_type !== profile.skin_type && (
              <span className="text-xs text-gray-500">
                (AI-adjusted from {profile.skin_type})
              </span>
            )}
          </div>
        </div>

        {/* Sensitivity Score */}
        <div>
          <div className="text-sm text-gray-600 mb-2">Sensitivity Level</div>
          <Badge className={`${getSensitivityColor(profile.sensitivity_score)} border text-sm py-1 px-3`}>
            {profile.sensitivity_score?.toUpperCase() || 'MEDIUM'}
          </Badge>
        </div>

        {/* Primary Concerns */}
        {profile.primary_concerns && profile.primary_concerns.length > 0 && (
          <div>
            <div className="text-sm text-gray-600 mb-2">Primary Concerns</div>
            <div className="flex flex-wrap gap-2">
              {profile.primary_concerns.map((concern, idx) => (
                <Badge key={idx} variant="outline" className="bg-rose-50 border-rose-200 text-rose-800">
                  {concern.replace(/_/g, ' ').toUpperCase()}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Secondary Concerns */}
        {profile.secondary_concerns && profile.secondary_concerns.length > 0 && (
          <div>
            <div className="text-sm text-gray-600 mb-2">Secondary Concerns</div>
            <div className="flex flex-wrap gap-2">
              {profile.secondary_concerns.map((concern, idx) => (
                <Badge key={idx} variant="outline" className="bg-amber-50 border-amber-200 text-amber-800">
                  {concern.replace(/_/g, ' ')}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* AI Detected Concerns (from image) */}
        {profile.ai_detected_concerns && profile.ai_detected_concerns.length > 0 && (
          <div className="border-t pt-4">
            <div className="text-sm text-gray-600 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              AI Image Analysis Results
            </div>
            <div className="space-y-2">
              {profile.ai_detected_concerns.map((concern, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">{concern.concern}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {concern.severity} severity
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {Math.round(concern.confidence * 100)}% confidence
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Environmental Factors */}
        <div className="border-t pt-4">
          <div className="text-sm text-gray-600 mb-3">Environmental Factors</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500">Sun Exposure</div>
              <div className="text-sm font-medium capitalize">{profile.sun_exposure}</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500">Pollution</div>
              <div className="text-sm font-medium capitalize">{profile.pollution_exposure}</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500">Sleep Quality</div>
              <div className="text-sm font-medium capitalize">{profile.sleep_quality}</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500">Location</div>
              <div className="text-sm font-medium">{profile.location_city}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}