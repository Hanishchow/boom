import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Droplets, 
  Sparkles, 
  AlertCircle, 
  Sun, 
  Wind, 
  Moon,
  MapPin,
  ThermometerSun,
  CheckCircle,
  Info
} from 'lucide-react';

const skinTypeInfo = {
  dry: { label: 'Dry', color: 'bg-blue-100 text-blue-800', icon: '💧' },
  oily: { label: 'Oily', color: 'bg-yellow-100 text-yellow-800', icon: '✨' },
  combination: { label: 'Combination', color: 'bg-purple-100 text-purple-800', icon: '🎭' },
  normal: { label: 'Normal', color: 'bg-green-100 text-green-800', icon: '🌿' },
  sensitive: { label: 'Sensitive', color: 'bg-rose-100 text-rose-800', icon: '🌸' }
};

const sensitivityColors = {
  low: { label: 'Low', color: 'text-green-600', bg: 'bg-green-100', progress: 33 },
  medium: { label: 'Medium', color: 'text-amber-600', bg: 'bg-amber-100', progress: 66 },
  high: { label: 'High', color: 'text-red-600', bg: 'bg-red-100', progress: 100 }
};

const concernIcons = {
  acne: '🔴',
  pigmentation: '🟤',
  dryness: '💧',
  oiliness: '✨',
  sensitivity: '🌸',
  aging: '⏳',
  texture: '🔲',
  dullness: '🌫️',
  redness: '🔴'
};

export default function SkinProfileCard({ profile }) {
  const {
    skin_type,
    ai_adjusted_skin_type,
    primary_concerns,
    secondary_concerns,
    sensitivity_score,
    climate_zone,
    pollution_level,
    lifestyle_factors,
    ai_detected_concerns
  } = profile;

  const displaySkinType = ai_adjusted_skin_type || skin_type;
  const skinInfo = skinTypeInfo[displaySkinType] || skinTypeInfo.normal;
  const sensitivityInfo = sensitivityColors[sensitivity_score] || sensitivityColors.low;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm overflow-hidden">
        <CardHeader className="pb-2 bg-gradient-to-r from-rose-50 to-amber-50">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-rose-500" />
            Your Skin Profile
          </CardTitle>
        </CardHeader>

        <CardContent className="p-5 space-y-5">
          {/* Skin Type */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{skinInfo.icon}</span>
              <div>
                <p className="text-sm text-gray-500">Skin Type</p>
                <p className="font-semibold text-gray-800">{skinInfo.label}</p>
              </div>
            </div>
            <Badge className={`${skinInfo.color} font-medium`}>
              {ai_adjusted_skin_type && ai_adjusted_skin_type !== skin_type && (
                <span className="mr-1">AI Adjusted</span>
              )}
              {skinInfo.label}
            </Badge>
          </div>

          {ai_adjusted_skin_type && ai_adjusted_skin_type !== skin_type && (
            <div className="bg-blue-50 rounded-lg p-3 flex items-start gap-2 text-sm">
              <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-blue-800">
                Based on your climate ({climate_zone?.replace('_', ' ')}) and responses, 
                your skin behaves more like {skinInfo.label.toLowerCase()} skin.
              </p>
            </div>
          )}

          {/* Sensitivity Score */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <AlertCircle className={`w-4 h-4 ${sensitivityInfo.color}`} />
                <span className="text-sm text-gray-600">Sensitivity Level</span>
              </div>
              <Badge className={`${sensitivityInfo.bg} ${sensitivityInfo.color}`}>
                {sensitivityInfo.label}
              </Badge>
            </div>
            <Progress 
              value={sensitivityInfo.progress} 
              className="h-2"
            />
          </div>

          {/* Primary Concerns */}
          {primary_concerns && primary_concerns.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-600 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-rose-500" />
                Primary Concerns
              </p>
              <div className="flex flex-wrap gap-2">
                {primary_concerns.map((concern, idx) => (
                  <Badge 
                    key={idx}
                    variant="secondary"
                    className="bg-rose-100 text-rose-800 px-3 py-1 text-sm"
                  >
                    {concernIcons[concern] || '•'} {concern.replace('_', ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Secondary Concerns */}
          {secondary_concerns && secondary_concerns.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Secondary Concerns</p>
              <div className="flex flex-wrap gap-2">
                {secondary_concerns.map((concern, idx) => (
                  <Badge 
                    key={idx}
                    variant="outline"
                    className="text-gray-600 px-3 py-1 text-sm"
                  >
                    {concernIcons[concern] || '•'} {concern.replace('_', ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* AI Detected Concerns (if image was analyzed) */}
          {ai_detected_concerns && ai_detected_concerns.length > 0 && (
            <div className="border-t pt-4 mt-4">
              <p className="text-sm font-medium text-gray-600 mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                AI Detected from Photo
              </p>
              <div className="space-y-2">
                {ai_detected_concerns.map((item, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center justify-between bg-gray-50 rounded-lg p-2 px-3"
                  >
                    <span className="text-sm text-gray-700 capitalize">
                      {item.concern.replace('_', ' ')}
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline"
                        className={`text-xs ${
                          item.severity === 'mild' ? 'text-green-600' :
                          item.severity === 'moderate' ? 'text-amber-600' : 'text-red-600'
                        }`}
                      >
                        {item.severity}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {item.confidence}% confidence
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Environmental Factors */}
          <div className="border-t pt-4 mt-4">
            <p className="text-sm font-medium text-gray-600 mb-3">Environmental Factors</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {climate_zone && (
                <div className="bg-amber-50 rounded-lg p-3 text-center">
                  <ThermometerSun className="w-5 h-5 mx-auto text-amber-600 mb-1" />
                  <p className="text-xs text-gray-500">Climate</p>
                  <p className="text-sm font-medium text-gray-800 capitalize">
                    {climate_zone.replace('_', ' ')}
                  </p>
                </div>
              )}
              {lifestyle_factors?.sun_exposure && (
                <div className="bg-yellow-50 rounded-lg p-3 text-center">
                  <Sun className="w-5 h-5 mx-auto text-yellow-600 mb-1" />
                  <p className="text-xs text-gray-500">Sun</p>
                  <p className="text-sm font-medium text-gray-800 capitalize">
                    {lifestyle_factors.sun_exposure}
                  </p>
                </div>
              )}
              {pollution_level && (
                <div className="bg-gray-100 rounded-lg p-3 text-center">
                  <Wind className="w-5 h-5 mx-auto text-gray-600 mb-1" />
                  <p className="text-xs text-gray-500">Pollution</p>
                  <p className="text-sm font-medium text-gray-800 capitalize">
                    {pollution_level}
                  </p>
                </div>
              )}
              {lifestyle_factors?.sleep_quality && (
                <div className="bg-indigo-50 rounded-lg p-3 text-center">
                  <Moon className="w-5 h-5 mx-auto text-indigo-600 mb-1" />
                  <p className="text-xs text-gray-500">Sleep</p>
                  <p className="text-sm font-medium text-gray-800 capitalize">
                    {lifestyle_factors.sleep_quality}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}