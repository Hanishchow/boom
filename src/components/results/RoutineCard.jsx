import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sunrise, Moon, Calendar, Check, X, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function RoutineCard({ routine }) {
  const renderRoutineStep = (step, index) => (
    <div key={index} className="p-4 border rounded-lg bg-white hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">
            {step.step_number}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{step.product_type}</h4>
            <p className="text-xs text-gray-500">{step.purpose}</p>
          </div>
        </div>
        {step.duration && (
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {step.duration}
          </Badge>
        )}
      </div>

      <p className="text-sm text-gray-700 mb-3">{step.instructions}</p>

      <div className="grid md:grid-cols-2 gap-3">
        {step.dos && step.dos.length > 0 && (
          <div className="space-y-1">
            <div className="text-xs font-semibold text-green-700 flex items-center gap-1">
              <Check className="w-3 h-3" />
              Do's
            </div>
            <ul className="space-y-1">
              {step.dos.map((item, idx) => (
                <li key={idx} className="text-xs text-gray-600 flex items-start gap-1">
                  <span className="text-green-600 mt-0.5">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {step.donts && step.donts.length > 0 && (
          <div className="space-y-1">
            <div className="text-xs font-semibold text-red-700 flex items-center gap-1">
              <X className="w-3 h-3" />
              Don'ts
            </div>
            <ul className="space-y-1">
              {step.donts.map((item, idx) => (
                <li key={idx} className="text-xs text-gray-600 flex items-start gap-1">
                  <span className="text-red-600 mt-0.5">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );

  const renderWeeklyRoutine = (treatments) => (
    <div className="space-y-3">
      {treatments.map((treatment, index) => (
        <div key={index} className="p-4 border rounded-lg bg-white">
          <div className="flex items-start gap-3 mb-2">
            <Badge className="bg-purple-100 text-purple-800">{treatment.frequency}</Badge>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">{treatment.treatment_type}</h4>
              <p className="text-xs text-gray-500">{treatment.purpose}</p>
            </div>
          </div>
          <p className="text-sm text-gray-700">{treatment.instructions}</p>
        </div>
      ))}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Personalized Skincare Routine</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="morning" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="morning" className="flex items-center gap-2">
              <Sunrise className="w-4 h-4" />
              Morning
            </TabsTrigger>
            <TabsTrigger value="evening" className="flex items-center gap-2">
              <Moon className="w-4 h-4" />
              Evening
            </TabsTrigger>
            <TabsTrigger value="weekly" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Weekly
            </TabsTrigger>
          </TabsList>

          <TabsContent value="morning" className="space-y-3 mt-4">
            {routine.morning_routine && routine.morning_routine.length > 0 ? (
              routine.morning_routine.map((step, idx) => renderRoutineStep(step, idx))
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">No morning routine available</p>
            )}
          </TabsContent>

          <TabsContent value="evening" className="space-y-3 mt-4">
            {routine.evening_routine && routine.evening_routine.length > 0 ? (
              routine.evening_routine.map((step, idx) => renderRoutineStep(step, idx))
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">No evening routine available</p>
            )}
          </TabsContent>

          <TabsContent value="weekly" className="mt-4">
            {routine.weekly_routine && routine.weekly_routine.length > 0 ? (
              renderWeeklyRoutine(routine.weekly_routine)
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">No weekly treatments recommended</p>
            )}
          </TabsContent>
        </Tabs>

        {/* Ingredient Warnings */}
        {routine.ingredient_warnings && routine.ingredient_warnings.length > 0 && (
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
              <X className="w-4 h-4" />
              Important Warnings
            </h4>
            <ul className="space-y-1">
              {routine.ingredient_warnings.map((warning, idx) => (
                <li key={idx} className="text-sm text-amber-800">• {warning}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}