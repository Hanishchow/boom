import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function QuestionnaireStep({ 
  step, 
  data, 
  onChange,
  title,
  description 
}) {
  const handleCheckboxChange = (field, value, checked) => {
    const currentValues = data[field] || [];
    if (checked) {
      onChange(field, [...currentValues, value]);
    } else {
      onChange(field, currentValues.filter(v => v !== value));
    }
  };

  const renderStepContent = () => {
    switch(step) {
      case 1: // Basic Info
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label>Age Group</Label>
              <Select value={data.age_group || ''} onValueChange={(val) => onChange('age_group', val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your age group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="under_20">Under 20</SelectItem>
                  <SelectItem value="20_30">20-30</SelectItem>
                  <SelectItem value="30_40">30-40</SelectItem>
                  <SelectItem value="40_50">40-50</SelectItem>
                  <SelectItem value="above_50">Above 50</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Gender (Optional)</Label>
              <Select value={data.gender || ''} onValueChange={(val) => onChange('gender', val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 2: // Skin Type
        return (
          <div className="space-y-4">
            <Label>What's your skin type?</Label>
            <RadioGroup value={data.skin_type || ''} onValueChange={(val) => onChange('skin_type', val)}>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="dry" id="dry" />
                <Label htmlFor="dry" className="flex-1 cursor-pointer">
                  <div className="font-medium">Dry</div>
                  <div className="text-xs text-gray-500">Feels tight, flaky, or rough</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="oily" id="oily" />
                <Label htmlFor="oily" className="flex-1 cursor-pointer">
                  <div className="font-medium">Oily</div>
                  <div className="text-xs text-gray-500">Shiny, greasy, visible pores</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="combination" id="combination" />
                <Label htmlFor="combination" className="flex-1 cursor-pointer">
                  <div className="font-medium">Combination</div>
                  <div className="text-xs text-gray-500">Oily T-zone, dry cheeks</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="normal" id="normal" />
                <Label htmlFor="normal" className="flex-1 cursor-pointer">
                  <div className="font-medium">Normal</div>
                  <div className="text-xs text-gray-500">Balanced, not too dry or oily</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="sensitive" id="sensitive" />
                <Label htmlFor="sensitive" className="flex-1 cursor-pointer">
                  <div className="font-medium">Sensitive</div>
                  <div className="text-xs text-gray-500">Easily irritated, redness-prone</div>
                </Label>
              </div>
            </RadioGroup>
          </div>
        );

      case 3: // Skin Concerns
        return (
          <div className="space-y-4">
            <Label>Select your skin concerns (choose all that apply)</Label>
            <div className="space-y-2">
              {[
                { value: 'acne', label: 'Acne & Breakouts', desc: 'Pimples, whiteheads, blackheads' },
                { value: 'pigmentation', label: 'Pigmentation & Dark Spots', desc: 'Uneven skin tone, hyperpigmentation' },
                { value: 'dryness', label: 'Dryness', desc: 'Dehydrated, flaky skin' },
                { value: 'oiliness', label: 'Excess Oiliness', desc: 'Shiny, greasy skin' },
                { value: 'sensitivity', label: 'Sensitivity & Redness', desc: 'Irritation, redness, reactions' },
                { value: 'aging', label: 'Signs of Aging', desc: 'Fine lines, wrinkles, loss of firmness' },
                { value: 'dullness', label: 'Dullness', desc: 'Lack of radiance, tired-looking skin' },
                { value: 'open_pores', label: 'Open Pores', desc: 'Visible, enlarged pores' }
              ].map(concern => (
                <div key={concern.value} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                  <Checkbox
                    id={concern.value}
                    checked={(data.skin_concerns || []).includes(concern.value)}
                    onCheckedChange={(checked) => handleCheckboxChange('skin_concerns', concern.value, checked)}
                  />
                  <Label htmlFor={concern.value} className="flex-1 cursor-pointer">
                    <div className="font-medium">{concern.label}</div>
                    <div className="text-xs text-gray-500">{concern.desc}</div>
                  </Label>
                </div>
              ))}
            </div>
          </div>
        );

      case 4: // Lifestyle
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label>Daily Sun Exposure</Label>
              <RadioGroup value={data.sun_exposure || ''} onValueChange={(val) => onChange('sun_exposure', val)}>
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="minimal" id="sun_minimal" />
                  <Label htmlFor="sun_minimal" className="cursor-pointer">Minimal (mostly indoors)</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="moderate" id="sun_moderate" />
                  <Label htmlFor="sun_moderate" className="cursor-pointer">Moderate (1-2 hours outdoors)</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="high" id="sun_high" />
                  <Label htmlFor="sun_high" className="cursor-pointer">High (3+ hours outdoors)</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label>Pollution Exposure</Label>
              <RadioGroup value={data.pollution_exposure || ''} onValueChange={(val) => onChange('pollution_exposure', val)}>
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="low" id="pollution_low" />
                  <Label htmlFor="pollution_low" className="cursor-pointer">Low (rural/suburban area)</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="moderate" id="pollution_moderate" />
                  <Label htmlFor="pollution_moderate" className="cursor-pointer">Moderate (urban area)</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="high" id="pollution_high" />
                  <Label htmlFor="pollution_high" className="cursor-pointer">High (metro/industrial area)</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label>Sleep Quality</Label>
              <RadioGroup value={data.sleep_quality || ''} onValueChange={(val) => onChange('sleep_quality', val)}>
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="poor" id="sleep_poor" />
                  <Label htmlFor="sleep_poor" className="cursor-pointer">Poor (less than 5 hours)</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="average" id="sleep_average" />
                  <Label htmlFor="sleep_average" className="cursor-pointer">Average (5-7 hours)</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="good" id="sleep_good" />
                  <Label htmlFor="sleep_good" className="cursor-pointer">Good (7+ hours)</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        );

      case 5: // Location & Budget
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label>City</Label>
              <Input
                placeholder="e.g., Mumbai, Delhi, Bangalore"
                value={data.location_city || ''}
                onChange={(e) => onChange('location_city', e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <Label>Pincode (Optional)</Label>
              <Input
                placeholder="e.g., 400001"
                value={data.pincode || ''}
                onChange={(e) => onChange('pincode', e.target.value)}
                maxLength={6}
              />
            </div>

            <div className="space-y-3">
              <Label>Budget Preference</Label>
              <RadioGroup value={data.budget_range || ''} onValueChange={(val) => onChange('budget_range', val)}>
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="budget" id="budget_budget" />
                  <Label htmlFor="budget_budget" className="flex-1 cursor-pointer">
                    <div className="font-medium">Budget Friendly</div>
                    <div className="text-xs text-gray-500">₹100-500 per product</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="mid-range" id="budget_mid" />
                  <Label htmlFor="budget_mid" className="flex-1 cursor-pointer">
                    <div className="font-medium">Mid-Range</div>
                    <div className="text-xs text-gray-500">₹500-1500 per product</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="premium" id="budget_premium" />
                  <Label htmlFor="budget_premium" className="flex-1 cursor-pointer">
                    <div className="font-medium">Premium</div>
                    <div className="text-xs text-gray-500">₹1500+ per product</div>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {renderStepContent()}
      </CardContent>
    </Card>
  );
}