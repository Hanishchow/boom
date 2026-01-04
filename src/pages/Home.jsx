import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Shield, MapPin, TrendingUp, ArrowRight, CheckCircle } from 'lucide-react';
import { createPageUrl } from '../utils';
import SafetyDisclaimer from '../components/SafetyDisclaimer';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            AI-Powered Skincare for India
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
            Your Personal
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Skin Expert</span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get personalized skincare routines with products available at your local Indian pharmacy. 
            Science-backed recommendations, affordable solutions.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to={createPageUrl('Assessment')}>
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg">
                Start Free Assessment
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to={createPageUrl('History')}>
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg">
                View Past Results
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mt-20">
          <Card className="border-2 border-blue-100 hover:border-blue-300 transition-colors">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">AI Skin Analysis</h3>
              <p className="text-sm text-gray-600">
                Advanced AI analyzes your skin type, concerns, and environmental factors
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-100 hover:border-purple-300 transition-colors">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Local Products</h3>
              <p className="text-sm text-gray-600">
                Recommendations from Indian pharmacies near you - affordable & accessible
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-100 hover:border-green-300 transition-colors">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Dermatologist-Safe</h3>
              <p className="text-sm text-gray-600">
                Only OTC products, no prescription drugs. Safety validation built-in
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-100 hover:border-orange-300 transition-colors">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Personalized Routine</h3>
              <p className="text-sm text-gray-600">
                Morning, evening, and weekly routines tailored to your unique skin
              </p>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <div className="max-w-4xl mx-auto mt-24">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How It Works</h2>
          <div className="space-y-6">
            {[
              { step: 1, title: 'Complete Questionnaire', desc: 'Answer questions about your skin type, concerns, lifestyle, and budget' },
              { step: 2, title: 'Optional Image Upload', desc: 'Upload a face photo for AI-powered visual analysis (completely optional & secure)' },
              { step: 3, title: 'AI Analysis', desc: 'Our AI analyzes your data and identifies your skin profile with precision' },
              { step: 4, title: 'Get Personalized Routine', desc: 'Receive custom morning, evening, and weekly skincare routines' },
              { step: 5, title: 'Product Recommendations', desc: 'Discover products available at nearby Indian pharmacies within your budget' }
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-4 p-4 bg-white rounded-lg border border-gray-200">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trusted Brands */}
        <div className="max-w-4xl mx-auto mt-24 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Trusted Pharmacy Brands We Recommend</h3>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {['Cetaphil', 'Simple', 'Minimalist', "Re'equil", 'Episoft', 'La Shield', 'Bioderma', 'Neutrogena'].map((brand) => (
              <div key={brand} className="px-6 py-3 bg-white rounded-lg border border-gray-200 text-gray-700 font-medium">
                {brand}
              </div>
            ))}
          </div>
        </div>

        {/* Safety Disclaimer */}
        <div className="max-w-4xl mx-auto mt-16">
          <SafetyDisclaimer />
        </div>

        {/* CTA */}
        <div className="max-w-4xl mx-auto mt-16 text-center">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-0">
            <CardContent className="p-12">
              <h2 className="text-3xl font-bold text-white mb-4">Ready to Transform Your Skin?</h2>
              <p className="text-blue-100 mb-6 text-lg">
                Join thousands of Indians getting personalized, affordable skincare
              </p>
              <Link to={createPageUrl('Assessment')}>
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-6 text-lg">
                  Start Your Free Assessment Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}