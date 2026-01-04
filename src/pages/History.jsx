import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  History as HistoryIcon, 
  ArrowLeft, 
  Calendar,
  Sparkles,
  Camera,
  ClipboardList,
  ChevronRight,
  Loader2,
  Plus,
  Trash2
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const skinTypeIcons = {
  dry: '💧',
  oily: '✨',
  combination: '🎭',
  normal: '🌿',
  sensitive: '🌸'
};

const analysisTypeIcons = {
  questionnaire: ClipboardList,
  image: Camera,
  combined: Sparkles
};

export default function History() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [analyses, setAnalyses] = useState([]);
  const [profiles, setProfiles] = useState({});

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      
      // Load all analyses
      const allAnalyses = await base44.entities.AnalysisHistory.list('-created_date', 20);
      setAnalyses(allAnalyses);

      // Load corresponding profiles
      const profileIds = [...new Set(allAnalyses.map(a => a.profile_id).filter(Boolean))];
      const profileMap = {};
      
      for (const id of profileIds) {
        const profs = await base44.entities.SkinProfile.filter({ id });
        if (profs.length > 0) {
          profileMap[id] = profs[0];
        }
      }
      
      setProfiles(profileMap);
    } catch (err) {
      console.error('Error loading history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (analysisId, profileId) => {
    try {
      // Delete analysis
      await base44.entities.AnalysisHistory.delete(analysisId);
      
      // Delete related data
      if (profileId) {
        await base44.entities.SkinProfile.delete(profileId);
        
        const routines = await base44.entities.SkincareRoutine.filter({ profile_id: profileId });
        for (const r of routines) {
          await base44.entities.SkincareRoutine.delete(r.id);
        }
        
        const products = await base44.entities.ProductRecommendation.filter({ profile_id: profileId });
        for (const p of products) {
          await base44.entities.ProductRecommendation.delete(p.id);
        }
      }
      
      // Refresh
      await loadHistory();
    } catch (err) {
      console.error('Error deleting:', err);
    }
  };

  const viewResults = (profileId) => {
    navigate(createPageUrl('Results') + `?profile=${profileId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 mx-auto text-rose-500 animate-spin mb-4" />
          <p className="text-gray-600">Loading your history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to={createPageUrl('Home')} className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Home</span>
          </Link>
          
          <div className="flex items-center gap-2">
            <HistoryIcon className="w-5 h-5 text-rose-500" />
            <span className="font-semibold text-gray-800">Analysis History</span>
          </div>

          <Link to={createPageUrl('SkinAnalysis')}>
            <Button size="sm" className="bg-gradient-to-r from-rose-500 to-amber-500">
              <Plus className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">New</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {analyses.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-rose-100 to-amber-100 flex items-center justify-center">
                <HistoryIcon className="w-8 h-8 text-rose-500" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">No Analysis Yet</h2>
              <p className="text-gray-600 mb-6">
                Start your first skin analysis to get personalized recommendations.
              </p>
              <Link to={createPageUrl('SkinAnalysis')}>
                <Button className="bg-gradient-to-r from-rose-500 to-amber-500">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Start Analysis
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {analyses.map((analysis, idx) => {
              const profile = profiles[analysis.profile_id];
              const AnalysisIcon = analysisTypeIcons[analysis.analysis_type] || Sparkles;
              
              return (
                <motion.div
                  key={analysis.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex items-stretch">
                        {/* Left Color Bar */}
                        <div className="w-2 bg-gradient-to-b from-rose-400 to-amber-400" />
                        
                        {/* Content */}
                        <div className="flex-1 p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              {/* Icon */}
                              <div className="p-2 rounded-lg bg-gradient-to-br from-rose-100 to-amber-100">
                                <AnalysisIcon className="w-5 h-5 text-rose-600" />
                              </div>
                              
                              {/* Info */}
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-2xl">
                                    {skinTypeIcons[analysis.skin_type_detected] || '🌟'}
                                  </span>
                                  <span className="font-semibold text-gray-800 capitalize">
                                    {analysis.skin_type_detected} Skin
                                  </span>
                                </div>
                                
                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                  <Calendar className="w-4 h-4" />
                                  {format(new Date(analysis.created_date), 'MMM d, yyyy • h:mm a')}
                                </div>

                                {/* Concerns */}
                                {analysis.concerns_detected && analysis.concerns_detected.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {analysis.concerns_detected.slice(0, 3).map((c, i) => (
                                      <Badge 
                                        key={i} 
                                        variant="secondary" 
                                        className="text-xs bg-gray-100 text-gray-700 capitalize"
                                      >
                                        {c.concern?.replace('_', ' ')}
                                      </Badge>
                                    ))}
                                    {analysis.concerns_detected.length > 3 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{analysis.concerns_detected.length - 3} more
                                      </Badge>
                                    )}
                                  </div>
                                )}

                                {/* Analysis Type Badge */}
                                <div className="mt-2">
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs ${
                                      analysis.analysis_type === 'combined' 
                                        ? 'bg-purple-50 text-purple-700 border-purple-200' 
                                        : 'bg-blue-50 text-blue-700 border-blue-200'
                                    }`}
                                  >
                                    {analysis.analysis_type === 'combined' ? 'Photo + Quiz' : 
                                     analysis.analysis_type === 'image' ? 'Photo Analysis' : 'Quiz Only'}
                                  </Badge>
                                  
                                  <Badge 
                                    variant="outline" 
                                    className={`ml-2 text-xs ${
                                      analysis.sensitivity_score === 'high' ? 'text-red-600' :
                                      analysis.sensitivity_score === 'medium' ? 'text-amber-600' : 'text-green-600'
                                    }`}
                                  >
                                    {analysis.sensitivity_score} sensitivity
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-500">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Analysis</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will permanently delete this analysis and all related data. This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDelete(analysis.id, analysis.profile_id)}
                                      className="bg-red-500 hover:bg-red-600"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>

                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => viewResults(analysis.profile_id)}
                                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                              >
                                View
                                <ChevronRight className="w-4 h-4 ml-1" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}