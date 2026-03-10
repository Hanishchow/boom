import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  ShoppingBag, 
  ChevronDown, 
  IndianRupee,
  CheckCircle,
  MapPin,
  Beaker,
  Sun,
  Moon,
  Calendar,
  Pill,
  AlertTriangle
} from 'lucide-react';

const productTypeIcons = {
  cleanser: '🧴',
  toner: '💧',
  serum: '✨',
  moisturizer: '🧈',
  sunscreen: '🌞',
  spot_treatment: '🎯',
  exfoliator: '🧪',
  mask: '🎭',
  eye_cream: '👁️',
  lip_balm: '💋'
};

const usageTimeIcons = {
  morning: <Sun className="w-3 h-3" />,
  evening: <Moon className="w-3 h-3" />,
  both: <span className="text-xs">AM/PM</span>,
  weekly: <Calendar className="w-3 h-3" />
};

const availabilityColors = {
  high: 'bg-green-100 text-green-800',
  medium: 'bg-amber-100 text-amber-800',
  low: 'bg-red-100 text-red-800'
};

function ProductCard({ product, index }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="bg-gray-900 border border-gray-800 hover:border-pink-500/30 transition-all rounded-2xl overflow-hidden">
          <CollapsibleTrigger className="w-full text-left">
            <div className="p-4">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-pink-500/10 text-2xl flex-shrink-0">
                  {productTypeIcons[product.product_type] || '📦'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-white line-clamp-1">{product.product_name}</p>
                      <p className="text-sm text-pink-400">{product.brand}</p>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge variant="secondary" className="bg-green-500/10 text-green-400 border-0 text-xs">
                      <IndianRupee className="w-3 h-3 mr-1" />{product.price_range_min}–{product.price_range_max}
                    </Badge>
                    <Badge variant="outline" className="text-gray-400 border-gray-700 text-xs capitalize">
                      {product.usage_time}
                    </Badge>
                    {product.is_pharmacy_generic && (
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs">
                        <Pill className="w-3 h-3 mr-1" />Generic
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="px-4 pb-4 border-t border-gray-800">
              <div className="mt-4 space-y-3">
                <div className="bg-pink-500/10 rounded-xl p-3">
                  <p className="text-sm font-medium text-pink-300 flex items-center gap-2 mb-1">
                    <CheckCircle className="w-4 h-4" /> Why we recommend this
                  </p>
                  <p className="text-sm text-gray-300">{product.why_recommended}</p>
                </div>
                {product.active_ingredients?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-purple-400 flex items-center gap-2 mb-2">
                      <Beaker className="w-4 h-4" /> Key Ingredients
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {product.active_ingredients.map((ingredient, idx) => (
                        <Badge key={idx} variant="outline" className="bg-purple-500/10 text-purple-300 border-purple-500/20 text-xs">
                          {ingredient}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div className="bg-amber-500/10 rounded-xl p-3 flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-amber-300">Apollo, MedPlus, Netmeds, PharmEasy, or your local pharmacy.</p>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </motion.div>
  );
}

export default function ProductRecommendations({ products, warnings }) {
  // Group products by usage time
  const groupedProducts = {
    morning: products.filter(p => p.usage_time === 'morning' || p.usage_time === 'both'),
    evening: products.filter(p => p.usage_time === 'evening' || p.usage_time === 'both'),
    weekly: products.filter(p => p.usage_time === 'weekly')
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="bg-gray-950 border border-gray-800 rounded-3xl overflow-hidden">
        <div className="p-5 border-b border-gray-800">
          <h2 className="text-white font-bold text-lg flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-pink-500" />
            Recommended Products
          </h2>
          <p className="text-gray-400 text-sm mt-1">Available in Indian pharmacies & online</p>
        </div>

        <div className="p-4 space-y-4">
          {warnings && warnings.length > 0 && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <p className="font-medium text-red-400 flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4" />
                Ingredient Interactions
              </p>
              {warnings.map((warning, idx) => (
                <div key={idx} className="text-sm text-red-300 mb-2 last:mb-0">
                  <p className="font-medium text-red-400">{warning.ingredients.join(' + ')}</p>
                  <p>{warning.reason}</p>
                  <p className="text-red-300 italic">{warning.recommendation}</p>
                </div>
              ))}
            </div>
          )}

          {/* Product List */}
          <div className="space-y-3">
            {products.map((product, idx) => (
              <ProductCard key={idx} product={product} index={idx} />
            ))}
          </div>

          <div className="mt-4 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
            <p className="font-medium text-green-400 flex items-center gap-2 mb-2">
              <IndianRupee className="w-4 h-4" /> Estimated Total Budget
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">For complete routine</span>
              <span className="font-semibold text-green-400">
                ₹{products.reduce((sum, p) => sum + (p.price_range_min || 0), 0)} – ₹{products.reduce((sum, p) => sum + (p.price_range_max || 0), 0)}
              </span>
            </div>
          </div>

          <p className="text-xs text-gray-600 text-center px-2">
            Prices are approximate. Not medical prescriptions — consult a dermatologist for specific conditions.
          </p>
        </div>
      </div>
    </motion.div>
  );
}