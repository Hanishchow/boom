import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  Sun, 
  Moon, 
  Calendar, 
  ChevronDown, 
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Info
} from 'lucide-react';

const stepIcons = {
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

function RoutineStep({ step, index }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-white border border-gray-100 hover:border-rose-200 transition-all duration-200 hover:shadow-sm">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-rose-100 to-amber-100 text-xl">
              {stepIcons[step.product_type] || '•'}
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-gray-800 capitalize">
                {step.product_type.replace('_', ' ')}
              </p>
              <p className="text-sm text-gray-500">{step.purpose}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs text-gray-500">
                <Clock className="w-3 h-3 mr-1" />
                {step.duration}
              </Badge>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-2 ml-14 p-4 rounded-xl bg-gray-50 border border-gray-100"
          >
            <div className="space-y-4">
              {/* Instructions */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-500" />
                  How to use
                </p>
                <p className="text-sm text-gray-600">{step.instructions}</p>
              </div>

              {/* Do's */}
              {step.dos && step.dos.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-green-700 mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Do's
                  </p>
                  <ul className="space-y-1">
                    {step.dos.map((item, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Don'ts */}
              {step.donts && step.donts.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-red-700 mb-2 flex items-center gap-2">
                    <XCircle className="w-4 h-4" />
                    Don'ts
                  </p>
                  <ul className="space-y-1">
                    {step.donts.map((item, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-red-500 mt-0.5">✗</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        </CollapsibleContent>
      </Collapsible>
    </motion.div>
  );
}

function WeeklyTreatment({ treatment, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="p-4 rounded-xl bg-white border border-gray-100"
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-medium text-gray-800 capitalize">
            {treatment.treatment_type.replace('_', ' ')}
          </p>
          <p className="text-sm text-gray-500">{treatment.purpose}</p>
        </div>
        <Badge variant="outline" className="text-xs">
          {treatment.frequency}
        </Badge>
      </div>
      <p className="text-sm text-gray-600 mt-2">{treatment.instructions}</p>
    </motion.div>
  );
}

export default function RoutineDisplay({ routine }) {
  const { morning_routine, evening_routine, weekly_routine, ingredient_warnings } = routine;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm overflow-hidden">
        <CardHeader className="pb-2 bg-gradient-to-r from-rose-50 to-amber-50">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-rose-500" />
            Your Personalized Routine
          </CardTitle>
        </CardHeader>

        <CardContent className="p-4">
          {/* Warnings */}
          {ingredient_warnings && ingredient_warnings.length > 0 && (
            <div className="mb-4 p-4 rounded-xl bg-amber-50 border border-amber-200">
              <p className="font-medium text-amber-800 flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4" />
                Important Warnings
              </p>
              <ul className="space-y-1">
                {ingredient_warnings.map((warning, idx) => (
                  <li key={idx} className="text-sm text-amber-700 flex items-start gap-2">
                    <span className="mt-0.5">⚠️</span>
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Tabs defaultValue="morning" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="morning" className="flex items-center gap-2">
                <Sun className="w-4 h-4" />
                <span className="hidden sm:inline">Morning</span>
                <span className="sm:hidden">AM</span>
              </TabsTrigger>
              <TabsTrigger value="evening" className="flex items-center gap-2">
                <Moon className="w-4 h-4" />
                <span className="hidden sm:inline">Evening</span>
                <span className="sm:hidden">PM</span>
              </TabsTrigger>
              <TabsTrigger value="weekly" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">Weekly</span>
                <span className="sm:hidden">Week</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="morning" className="mt-0">
              <div className="space-y-3">
                {morning_routine?.map((step, idx) => (
                  <RoutineStep key={idx} step={step} index={idx} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="evening" className="mt-0">
              <div className="space-y-3">
                {evening_routine?.map((step, idx) => (
                  <RoutineStep key={idx} step={step} index={idx} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="weekly" className="mt-0">
              <div className="space-y-3">
                {weekly_routine && weekly_routine.length > 0 ? (
                  weekly_routine.map((treatment, idx) => (
                    <WeeklyTreatment key={idx} treatment={treatment} index={idx} />
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p>No weekly treatments recommended</p>
                    <p className="text-sm">Focus on your daily routine for now</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}