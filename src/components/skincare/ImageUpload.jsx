import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Camera, 
  Upload, 
  X, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  Loader2,
  Eye,
  Lock
} from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function ImageUpload({ onImageAnalyzed, onSkip, isAnalyzing }) {
  const [consent, setConsent] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('Image size should be less than 10MB');
      return;
    }

    setError(null);
    setSelectedImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleUploadAndAnalyze = async () => {
    if (!selectedImage || !consent) return;

    setUploading(true);
    setError(null);

    try {
      // Upload image
      const { file_url } = await base44.integrations.Core.UploadFile({ file: selectedImage });
      
      // Pass to parent for AI analysis
      onImageAnalyzed(file_url);
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload image. Please try again.');
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
            <CardHeader className="pb-4 border-b bg-gradient-to-r from-rose-50 to-amber-50">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-white shadow-sm">
                  <Camera className="w-6 h-6 text-rose-600" />
                </div>
                <div>
                  <CardTitle className="text-xl sm:text-2xl font-semibold text-gray-800">
                    Optional: Face Photo Analysis
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Our AI can analyze your photo for better recommendations
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Privacy Notice */}
              <div className="bg-blue-50 rounded-xl p-4 flex gap-3">
                <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Your Privacy Matters</p>
                  <ul className="space-y-1 text-blue-700">
                    <li>• Images are processed securely and encrypted</li>
                    <li>• We don't store your photos after analysis</li>
                    <li>• No third-party access to your images</li>
                  </ul>
                </div>
              </div>

              {/* Image Upload Area */}
              <div className="space-y-4">
                {!previewUrl ? (
                  <label 
                    className="block border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center cursor-pointer hover:border-rose-300 hover:bg-rose-50/30 transition-all duration-200"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      capture="user"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-4 rounded-full bg-gradient-to-br from-rose-100 to-amber-100">
                        <Upload className="w-8 h-8 text-rose-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 mb-1">
                          Take a selfie or upload a photo
                        </p>
                        <p className="text-sm text-gray-500">
                          Clear, well-lit face photo works best
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="rounded-full">
                          <Camera className="w-4 h-4 mr-2" />
                          Take Photo
                        </Button>
                        <Button variant="outline" size="sm" className="rounded-full">
                          <Upload className="w-4 h-4 mr-2" />
                          Upload
                        </Button>
                      </div>
                    </div>
                  </label>
                ) : (
                  <div className="relative">
                    <div className="rounded-2xl overflow-hidden border border-gray-200">
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="w-full max-h-80 object-cover"
                      />
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-3 right-3 rounded-full shadow-lg"
                      onClick={handleRemoveImage}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                    <AlertTriangle className="w-4 h-4" />
                    {error}
                  </div>
                )}
              </div>

              {/* Tips for Good Photo */}
              <div className="bg-amber-50 rounded-xl p-4">
                <p className="font-medium text-amber-800 mb-2 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Tips for best results
                </p>
                <ul className="grid grid-cols-2 gap-2 text-sm text-amber-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    Good natural lighting
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    Face clearly visible
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    No heavy filters
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    Clean face (no makeup)
                  </li>
                </ul>
              </div>

              {/* Consent */}
              {selectedImage && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="border border-gray-200 rounded-xl p-4"
                >
                  <label className="flex items-start gap-3 cursor-pointer">
                    <Checkbox 
                      checked={consent}
                      onCheckedChange={setConsent}
                      className="mt-1"
                    />
                    <div className="text-sm">
                      <p className="text-gray-800">
                        I consent to AI analysis of my photo for skincare recommendations
                      </p>
                      <p className="text-gray-500 mt-1 flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Your image is processed securely and not stored permanently
                      </p>
                    </div>
                  </label>
                </motion.div>
              )}

              {/* Medical Disclaimer */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <p className="text-sm text-gray-600">
                    <strong>Disclaimer:</strong> This AI analysis is not a medical diagnosis. 
                    It provides general skincare guidance only. Consult a dermatologist for 
                    medical concerns or persistent skin issues.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button
              variant="outline"
              onClick={onSkip}
              disabled={uploading || isAnalyzing}
              className="flex-1 py-6 text-gray-600 hover:text-gray-800"
            >
              Skip Photo Analysis
            </Button>
            
            <Button
              onClick={handleUploadAndAnalyze}
              disabled={!selectedImage || !consent || uploading || isAnalyzing}
              className="flex-1 py-6 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white"
            >
              {(uploading || isAnalyzing) ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {uploading ? 'Uploading...' : 'Analyzing...'}
                </>
              ) : (
                <>
                  <Camera className="w-5 h-5 mr-2" />
                  Analyze My Skin
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}