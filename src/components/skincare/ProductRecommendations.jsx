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
        <Card className="border border-gray-100 hover:border-rose-200 transition-all duration-200 hover:shadow-md overflow-hidden">
          <CollapsibleTrigger className="w-full text-left">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                {/* Product Icon */}
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-rose-100 to-amber-100 text-2xl flex-shrink-0">
                  {productTypeIcons[product.product_type] || '📦'}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gray-800 line-clamp-1">
                        {product.product_name}
                      </p>
                      <p className="text-sm text-gray-500">{product.brand}</p>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {/* Price */}
                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">
                      <IndianRupee className="w-3 h-3 mr-1" />
                      {product.price_range_min}-{product.price_range_max}
                    </Badge>

                    {/* Usage Time */}
                    <Badge variant="outline" className="text-gray-600">
                      {usageTimeIcons[product.usage_time]}
                      <span className="ml-1 capitalize">{product.usage_time}</span>
                    </Badge>

                    {/* Availability */}
                    <Badge className={availabilityColors[product.availability_confidence]}>
                      <MapPin className="w-3 h-3 mr-1" />
                      {product.availability_confidence === 'high' ? 'Easily Available' : 
                       product.availability_confidence === 'medium' ? 'Usually Available' : 'Limited'}
                    </Badge>

                    {/* Generic */}
                    {product.is_pharmacy_generic && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        <Pill className="w-3 h-3 mr-1" />
                        Pharmacy Generic
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="px-4 pb-4 pt-0 border-t border-gray-100">
              <div className="mt-4 space-y-4">
                {/* Why Recommended */}
                <div className="bg-rose-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-rose-800 flex items-center gap-2 mb-1">
                    <CheckCircle className="w-4 h-4" />
                    Why we recommend this
                  </p>
                  <p className="text-sm text-rose-700">{product.why_recommended}</p>
                </div>

                {/* Active Ingredients */}
                {product.active_ingredients && product.active_ingredients.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                      <Beaker className="w-4 h-4 text-purple-500" />
                      Key Ingredients
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {product.active_ingredients.map((ingredient, idx) => (
                        <Badge key={idx} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          {ingredient}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Concerns Addressed */}
                {product.addresses_concerns && product.addresses_concerns.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Addresses</p>
                    <div className="flex flex-wrap gap-2">
                      {product.addresses_concerns.map((concern, idx) => (
                        <Badge key={idx} variant="secondary" className="bg-gray-100 text-gray-700 capitalize">
                          {concern}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Where to Buy Hint */}
                <div className="bg-amber-50 rounded-lg p-3 flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium">Where to find</p>
                    <p className="text-amber-700">
                      Available at most pharmacies like Apollo, MedPlus, Netmeds, PharmEasy, or your local medical store.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Card>
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
      <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm overflow-hidden">
        <CardHeader className="pb-2 bg-gradient-to-r from-rose-50 to-amber-50">
          <CardTitle className="text-lg flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-rose-500" />
            Recommended Products
          </CardTitle>
          <p className="text-sm text-gray-600">
            All products available in Indian pharmacies
          </p>
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          {/* Safety Warnings */}
          {warnings && warnings.length > 0 && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200">
              <p className="font-medium text-red-800 flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4" />
                Ingredient Interactions
              </p>
              {warnings.map((warning, idx) => (
                <div key={idx} className="text-sm text-red-700 mb-2 last:mb-0">
                  <p className="font-medium">
                    {warning.ingredients.join(' + ')}
                  </p>
                  <p>{warning.reason}</p>
                  <p className="text-red-600 italic">{warning.recommendation}</p>
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

          {/* Budget Summary */}
          <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200">
            <p className="font-medium text-emerald-800 flex items-center gap-2 mb-2">
              <IndianRupee className="w-4 h-4" />
              Estimated Total Budget
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-emerald-700">For complete routine</span>
              <span className="font-semibold text-emerald-800">
                ₹{products.reduce((sum, p) => sum + p.price_range_min, 0)} - 
                ₹{products.reduce((sum, p) => sum + p.price_range_max, 0)}
              </span>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-4 p-4 rounded-xl bg-gray-50 border border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              <strong>Disclaimer:</strong> Prices are approximate and may vary. 
              These are general recommendations, not medical prescriptions. 
              Consult a dermatologist if you have specific skin conditions.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}