import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IndianRupee, MapPin, ShoppingBag, Sparkles } from 'lucide-react';

export default function ProductCard({ product }) {
  const getAvailabilityColor = (confidence) => {
    switch(confidence) {
      case 'high': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900">{product.product_name}</h3>
              {product.prescription_strength && (
                <span
                  className="inline-flex items-center text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded px-1.5 py-0.5 cursor-help"
                  title="Consult a dermatologist before use."
                >
                  Rx
                </span>
              )}
              {product.is_pharmacy_generic && (
                <Badge className="bg-blue-100 text-blue-800 text-xs">Generic</Badge>
              )}
            </div>
            {product.one_line_description && (
              <p
                className="text-sm italic mb-1"
                style={{ color: 'var(--color-text-muted, #6b7280)', fontSize: '0.78rem' }}
              >
                {product.one_line_description}
              </p>
            )}
            <p className="text-sm text-gray-600">{product.brand}</p>
          </div>
          <ShoppingBag className="w-5 h-5 text-gray-400" />
        </div>

        {/* Product Type & Usage */}
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="outline" className="text-xs">
            {product.product_type.replace(/_/g, ' ')}
          </Badge>
          <Badge variant="outline" className="text-xs capitalize">
            {product.usage_time}
          </Badge>
        </div>

        {/* Why Recommended */}
        <div className="mb-3 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-900">{product.why_recommended}</p>
          </div>
        </div>

        {/* Active Ingredients */}
        {product.active_ingredients && product.active_ingredients.length > 0 && (
          <div className="mb-3">
            <div className="text-xs font-semibold text-gray-600 mb-1">Active Ingredients:</div>
            <div className="flex flex-wrap gap-1">
              {product.active_ingredients.map((ingredient, idx) => (
                <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                  {ingredient}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Addresses Concerns */}
        {product.addresses_concerns && product.addresses_concerns.length > 0 && (
          <div className="mb-3">
            <div className="text-xs font-semibold text-gray-600 mb-1">Addresses:</div>
            <div className="flex flex-wrap gap-1">
              {product.addresses_concerns.map((concern, idx) => (
                <Badge key={idx} variant="outline" className="text-xs bg-green-50 border-green-200 text-green-800">
                  {concern.replace(/_/g, ' ')}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Footer - Price & Availability */}
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-1 text-gray-900">
            <IndianRupee className="w-4 h-4" />
            <span className="font-semibold">
              {product.price_range_min} - {product.price_range_max}
            </span>
          </div>
          <Badge className={`${getAvailabilityColor(product.availability_confidence)} border text-xs`}>
            <MapPin className="w-3 h-3 mr-1" />
            {product.availability_confidence} availability
          </Badge>
        </div>

        {/* Suitable For */}
        {product.suitable_for_skin_types && product.suitable_for_skin_types.length > 0 && (
          <div className="mt-3 pt-3 border-t">
            <div className="text-xs text-gray-500">
              Suitable for: {product.suitable_for_skin_types.join(', ')}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}