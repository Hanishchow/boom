import React, { useState } from 'react';
import { Upload, Camera, X, Shield, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function ImageUpload({ onImageUploaded, consent, onConsentChange }) {
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!consent) {
      toast.error('Please provide consent before uploading your image');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Upload to server
      const response = await base44.integrations.Core.UploadFile({ file });
      setUploadedUrl(response.file_url);
      onImageUploaded(response.file_url);
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setUploadedUrl(null);
    onImageUploaded(null);
  };

  return (
    <div className="space-y-4">
      <Card className="p-6 border-2 border-dashed border-blue-200 bg-blue-50/30">
        <div className="flex items-start gap-3 mb-4">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-2">Optional: Upload Face Image</h3>
            <p className="text-sm text-blue-700 mb-3">
              For more accurate analysis, upload a clear front-facing photo in good lighting. 
              Your image is encrypted and never shared.
            </p>
            <div className="flex items-start gap-2">
              <Checkbox 
                id="consent" 
                checked={consent}
                onCheckedChange={onConsentChange}
              />
              <Label htmlFor="consent" className="text-xs text-blue-800 cursor-pointer">
                I consent to image analysis for skin assessment. My image will be processed securely 
                and automatically deleted after analysis.
              </Label>
            </div>
          </div>
        </div>

        {!imagePreview ? (
          <div className="text-center">
            <input
              type="file"
              id="imageUpload"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={!consent || uploading}
            />
            <label htmlFor="imageUpload">
              <Button 
                type="button"
                variant="outline" 
                disabled={!consent || uploading}
                className="cursor-pointer"
                asChild
              >
                <span>
                  {uploading ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <Camera className="w-4 h-4 mr-2" />
                      Choose Image
                    </>
                  )}
                </span>
              </Button>
            </label>
            <p className="text-xs text-gray-500 mt-2">
              JPG, PNG up to 5MB • Clear, front-facing photo recommended
            </p>
          </div>
        ) : (
          <div className="relative">
            <img 
              src={imagePreview} 
              alt="Face preview" 
              className="w-full h-48 object-cover rounded-lg"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={handleRemoveImage}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </Card>

      {!consent && (
        <div className="flex items-start gap-2 text-xs text-amber-700">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>Image upload is optional. You can complete the assessment using the questionnaire alone.</p>
        </div>
      )}
    </div>
  );
}