import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Share2, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { createPageUrl } from '../utils';
import SkinAnalysisCard from '../components/results/SkinAnalysisCard';
import RoutineCard from '../components/results/RoutineCard';
import ProductCard from '../components/results/ProductCard';
import SafetyDisclaimer from '../components/SafetyDisclaimer';

export default function Analysis() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [routine, setRoutine] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    loadAnalysisData();
  }, []);

  const loadAnalysisData = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const profileId = urlParams.get('profile');

      if (!profileId) {
        toast.error('No analysis found');
        navigate(createPageUrl('Home'));
        return;
      }

      // Load profile
      const profiles = await base44.entities.SkinProfile.filter({ id: profileId });
      if (profiles.length === 0) {
        toast.error('Profile not found');
        navigate(createPageUrl('Home'));
        return;
      }
      setProfile(profiles[0]);

      // Load routine
      const routines = await base44.entities.SkincareRoutine.filter({ profile_id: profileId });
      if (routines.length > 0) {
        setRoutine(routines[0]);
      }

      // Load products
      const productList = await base44.entities.ProductRecommendation.filter({ profile_id: profileId });
      setProducts(productList);

    } catch (error) {
      console.error('Error loading analysis:', error);
      toast.error('Failed to load analysis');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Skincare Analysis',
          text: 'Check out my personalized skincare routine!',
          url: window.location.href
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your analysis...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No analysis found</p>
          <Button onClick={() => navigate(createPageUrl('Home'))}>
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const groupProductsByType = () => {
    const grouped = {};
    products.forEach(product => {
      if (!grouped[product.usage_time]) {
        grouped[product.usage_time] = [];
      }
      grouped[product.usage_time].push(product);
    });
    return grouped;
  };

  const productsByUsage = groupProductsByType();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => navigate(createPageUrl('Home'))}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Your Personalized Skincare Analysis
          </h1>
          <p className="text-gray-600 text-lg">
            Here's your custom routine and product recommendations
          </p>
        </div>

        {/* Safety Disclaimer */}
        <div className="mb-8">
          <SafetyDisclaimer />
        </div>

        {/* Analysis Results */}
        <div className="space-y-8">
          {/* Skin Analysis */}
          <SkinAnalysisCard profile={profile} />

          {/* Routine */}
          {routine && <RoutineCard routine={routine} />}

          {/* Product Recommendations */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Recommended Products</h2>
            <p className="text-gray-600">
              All products are available at Indian pharmacies and selected based on your skin profile and budget.
            </p>

            {/* Morning Products */}
            {productsByUsage['morning'] && productsByUsage['morning'].length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  🌅 Morning Routine Products
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {productsByUsage['morning'].map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            )}

            {/* Evening Products */}
            {productsByUsage['evening'] && productsByUsage['evening'].length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  🌙 Evening Routine Products
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {productsByUsage['evening'].map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            )}

            {/* Both (Day/Night) Products */}
            {productsByUsage['both'] && productsByUsage['both'].length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  ⏰ Day & Night Products
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {productsByUsage['both'].map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            )}

            {/* Weekly Products */}
            {productsByUsage['weekly'] && productsByUsage['weekly'].length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  📅 Weekly Treatments
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {productsByUsage['weekly'].map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Next Steps */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-3">What's Next?</h3>
            <p className="mb-6 text-blue-100">
              Visit your local pharmacy with this product list. Start with the basics (cleanser, moisturizer, sunscreen) 
              and gradually add treatment products. Be consistent for best results!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                variant="secondary"
                onClick={() => navigate(createPageUrl('Assessment'))}
                className="bg-white text-blue-600 hover:bg-blue-50"
              >
                Take Another Assessment
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate(createPageUrl('History'))}
                className="border-white text-white hover:bg-white/10"
              >
                View Past Analyses
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}