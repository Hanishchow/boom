import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Sparkles, 
  Camera, 
  ClipboardList, 
  ShoppingBag, 
  Shield, 
  Heart,
  ArrowRight,
  CheckCircle,
  Star,
  Leaf,
  IndianRupee
} from 'lucide-react';

const features = [
  {
    icon: ClipboardList,
    title: 'Smart Skin Quiz',
    description: 'Answer a few questions about your skin type, concerns, and lifestyle'
  },
  {
    icon: Camera,
    title: 'AI Photo Analysis',
    description: 'Optional: Get deeper insights with our secure AI skin scan'
  },
  {
    icon: Sparkles,
    title: 'Personalized Routine',
    description: 'Receive morning, evening, and weekly skincare routines'
  },
  {
    icon: ShoppingBag,
    title: 'Pharmacy Products',
    description: 'Get affordable product recommendations from nearby pharmacies'
  }
];

const benefits = [
  { icon: Shield, text: 'Dermatologist-informed recommendations' },
  { icon: IndianRupee, text: 'Budget-friendly pharmacy products' },
  { icon: Leaf, text: 'Safe, OTC products only - no prescriptions' },
  { icon: Heart, text: 'Customized for Indian climate & skin' }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-rose-200/30 to-amber-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-200/30 to-rose-200/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative max-w-6xl mx-auto px-4 pt-12 pb-20 sm:pt-20 sm:pb-28">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            {/* Logo/Brand */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-rose-100 shadow-sm">
                <Sparkles className="w-5 h-5 text-rose-500" />
                <span className="font-semibold text-gray-800">SkinGenius India</span>
              </div>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Your Personal
              <span className="block bg-gradient-to-r from-rose-600 via-amber-500 to-rose-500 bg-clip-text text-transparent">
                AI Skin Expert
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Get a personalized skincare routine with products available at your nearby pharmacy. 
              Designed for Indian skin & climate.
            </p>

            {/* CTA Button */}
            <Link to={createPageUrl('SkinAnalysis')}>
              <Button 
                size="lg"
                className="bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Start Skin Analysis
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>

            <p className="text-sm text-gray-500 mt-4">
              Free • Takes 3 minutes • No signup required
            </p>
          </motion.div>
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            How It Works
          </h2>
          <p className="text-gray-600">
            Four simple steps to your perfect skincare routine
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm h-full hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-100 to-amber-100 mb-4">
                    <feature.icon className="w-7 h-7 text-rose-600" />
                  </div>
                  <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-rose-500 text-white text-sm font-medium mb-3">
                    {index + 1}
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Benefits */}
      <div className="bg-gradient-to-r from-rose-50 to-amber-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              Why Choose SkinGenius
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm"
              >
                <div className="p-2 rounded-lg bg-gradient-to-br from-rose-100 to-amber-100">
                  <benefit.icon className="w-5 h-5 text-rose-600" />
                </div>
                <span className="text-gray-700 font-medium">{benefit.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Product Brands */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Products From Trusted Brands
          </h2>
          <p className="text-gray-600">
            All recommendations feature affordable products from your local pharmacy
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-6 text-gray-600">
          {['Cetaphil', 'Minimalist', "Re'equil", 'La Shield', 'Episoft', 'Simple', 'Sebamed', 'Physiogel'].map((brand, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100 text-sm font-medium"
            >
              {brand}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Safety Notice */}
      <div className="max-w-4xl mx-auto px-4 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50 overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="p-3 rounded-xl bg-blue-100">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Safe & Responsible Recommendations
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    Our AI provides general skincare guidance using safe, over-the-counter products. 
                    We never recommend prescription medications or make medical diagnoses.
                  </p>
                  <p className="text-blue-700 text-sm font-medium">
                    Always consult a dermatologist for persistent skin conditions or medical concerns.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Final CTA */}
      <div className="bg-gradient-to-r from-rose-500 to-amber-500 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto px-4 text-center text-white"
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Ready to discover your perfect skincare routine?
          </h2>
          <p className="text-rose-100 mb-8 max-w-2xl mx-auto">
            Join thousands who've transformed their skin with personalized, 
            affordable recommendations.
          </p>
          <Link to={createPageUrl('SkinAnalysis')}>
            <Button 
              size="lg"
              variant="secondary"
              className="bg-white text-rose-600 hover:bg-rose-50 px-8 py-6 text-lg rounded-full shadow-lg"
            >
              Get Started Free
              <Sparkles className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p className="mb-2">
            <strong>Disclaimer:</strong> SkinGenius provides general skincare recommendations and is not a substitute for professional medical advice.
          </p>
          <p>
            © 2024 SkinGenius India. Made with ❤️ for Indian skin.
          </p>
        </div>
      </footer>
    </div>
  );
}