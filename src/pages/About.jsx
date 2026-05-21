import React from 'react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="min-h-screen bg-black text-white pb-24 px-6">
      <div className="max-w-2xl mx-auto pt-12">
        <h1 className="text-3xl font-bold mb-6 text-white">About Célure</h1>

        <p className="text-gray-300 leading-relaxed mb-4">
          Célure is an AI-powered personalised skincare platform built for anyone who wants to truly understand their skin and take care of it the right way. Whether you struggle with acne, dryness, oiliness, pigmentation, or just want to build a healthy routine from scratch, Célure gives you a science-backed plan tailored specifically to you.
        </p>

        <p className="text-gray-300 leading-relaxed mb-4">
          Our platform combines a detailed skin questionnaire with optional facial image analysis to assess your unique skin type, concerns, sensitivity, and environment. Based on your location, climate zone, budget, and lifestyle, Célure generates a complete morning and evening skincare routine along with specific product recommendations — all sourced from pharmacy-available brands in India.
        </p>

        <p className="text-gray-300 leading-relaxed mb-4">
          Célure is built for everyday people who are tired of generic skincare advice and want something that actually works for their skin. From teenagers dealing with breakouts to adults managing signs of ageing, our recommendations are personalised, practical, and affordable.
        </p>

        <p className="text-gray-300 leading-relaxed mb-8">
          The platform is built and maintained by a passionate team dedicated to making dermatology-grade skincare insights accessible to everyone — not just those who can afford expensive consultations. We believe great skin is a right, not a luxury.
        </p>

        <Link to="/SkinAnalysis" className="inline-block bg-pink-500 hover:bg-pink-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
          Get Your Free Skin Analysis →
        </Link>
      </div>
    </div>
  );
}