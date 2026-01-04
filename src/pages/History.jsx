import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Eye, Loader2, Sparkles, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { createPageUrl } from './utils';
import { format } from 'date-fns';

export default function History() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [analyses, setAnalyses] = useState([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const user = await base44.auth.me();
      
      // Load all skin profiles for current user
      const profiles = await base44.entities.SkinProfile.filter(
        { created_by: user.email },
        '-created_date',
        50
      );

      setAnalyses(profiles);
    } catch (error) {
      console.error('Error loading history:', error);
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const handleViewAnalysis = (profileId) => {
    navigate(createPageUrl('Analysis') + `?profile=${profileId}`);
  };

  const handleDeleteAnalysis = async (profileId) => {
    if (!confirm('Are you sure you want to delete this analysis?')) return;

    try {
      // Delete related data
      await base44.entities.SkincareRoutine.delete({ profile_id: profileId });
      await base44.entities.ProductRecommendation.delete({ profile_id: profileId });
      await base44.entities.AnalysisHistory.delete({ profile_id: profileId });
      await base44.entities.SkinProfile.delete({ id: profileId });

      toast.success('Analysis deleted successfully');
      loadHistory();
    } catch (error) {
      console.error('Error deleting analysis:', error);
      toast.error('Failed to delete analysis');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => navigate(createPageUrl('Home'))}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <Button onClick={() => navigate(createPageUrl('Assessment'))}>
            <Sparkles className="w-4 h-4 mr-2" />
            New Assessment
          </Button>
        </div>

        {/* Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Analysis History</h1>
          <p className="text-gray-600">View and manage your past skin assessments</p>
        </div>

        {/* History List */}
        {analyses.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="text-center py-16">
              <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Assessments Yet</h3>
              <p className="text-gray-600 mb-6">
                Take your first skin assessment to get personalized recommendations
              </p>
              <Button onClick={() => navigate(createPageUrl('Assessment'))}>
                Start Your First Assessment
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {analyses.map((analysis) => (
              <Card key={analysis.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">
                        Assessment from {format(new Date(analysis.created_date), 'MMM d, yyyy')}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(analysis.created_date), 'h:mm a')}
                      </div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">
                      {analysis.ai_adjusted_skin_type || analysis.skin_type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Key Info */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">Sensitivity</div>
                      <div className="font-medium capitalize">{analysis.sensitivity_score || 'Medium'}</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">Budget</div>
                      <div className="font-medium capitalize">{analysis.budget_range || 'N/A'}</div>
                    </div>
                  </div>

                  {/* Primary Concerns */}
                  {analysis.primary_concerns && analysis.primary_concerns.length > 0 && (
                    <div>
                      <div className="text-xs text-gray-500 mb-2">Primary Concerns:</div>
                      <div className="flex flex-wrap gap-1">
                        {analysis.primary_concerns.map((concern, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {concern.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Image Analysis Indicator */}
                  {analysis.face_image_url && (
                    <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                      <Eye className="w-4 h-4" />
                      Includes AI image analysis
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      className="flex-1"
                      onClick={() => handleViewAnalysis(analysis.id)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteAnalysis(analysis.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}