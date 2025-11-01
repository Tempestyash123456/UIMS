import { useState, useEffect, useCallback } from 'react';
import { Target, Lightbulb, CheckCircle, Brain, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AiCareerRecommendation, QuizCategory } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { careerApi, quizApi } from '../services/api';
import { ROUTES } from '../utils/constants';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { EmptyState } from '../components/UI/EmptyState';
import Button from '../components/UI/Button';
import { useLocalStorage } from '../hooks/useLocalStorage';
import toast from 'react-hot-toast';

// ⬅️ FINAL UPDATED AiCareerCard component for clean, single-card display
const AiCareerCard = ({ recommendation }: { recommendation: AiCareerRecommendation }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 flex flex-col max-w-4xl mx-auto"> 
      
      {/* HEADER ROW: Title and Icon */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
        <h3 className="text-3xl font-extrabold text-gray-900 flex-1 pr-4">
          {recommendation.course_stream || 'Recommended Course/Stream'} 
        </h3>
        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <Target className="w-6 h-6 text-white" />
        </div>
      </div>
      
      <div className="space-y-6 flex-grow">
        
        {/* Prerequisites Section */}
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-start">
            <CheckCircle className="w-5 h-5 text-green-700 mr-3 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-green-900">Required Prerequisites:</h4>
              <p className="text-sm text-green-800 mt-1">{recommendation.prerequisites || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Reasoning Section */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-start">
            <Lightbulb className="w-5 h-5 text-blue-700 mr-3 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-blue-900">Reasoning:</h4>
              {/* Ensure whitespace-pre-wrap allows new lines but the max-length hint should enforce brevity */}
              <p className="text-sm text-blue-800 mt-1 whitespace-pre-wrap">{recommendation.reasoning || 'Reasoning unavailable.'}</p>
            </div>
          </div>
        </div>
        
      </div>

    </div>
  );
};

// Define the Core Assessment Name constant
const CORE_ASSESSMENT_NAME = 'Programming Fundamentals';

export default function CareerRecommendations() {
  const { profile } = useAuth();
  const [recommendations, setRecommendations] = useState<AiCareerRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coreCategory, setCoreCategory] = useState<QuizCategory | null>(null);
  const [hasAttempted, setHasAttempted] = useState(false);
  
  const [isDataInitialized, setIsDataInitialized] = useState(false); 

  // Use localStorage hooks for caching
  const [cachedRecs, setCachedRecs] = useLocalStorage<AiCareerRecommendation[] | null>('careerRecs', null);
  const [cachedSnapshot, setCachedSnapshot] = useLocalStorage<string | null>('careerRecsSnapshot', null);


  // 1. Fetch the Core Assessment Category ID
  useEffect(() => {
    let isMounted = true;
    const fetchCoreCategory = async () => {
      try {
        const category = await quizApi.getCategoryByName(CORE_ASSESSMENT_NAME);
        if (isMounted) {
            setCoreCategory(category);
        }
      } catch (err) {
        if (isMounted) {
            console.error('Failed to fetch core category:', err);
            setError('System Error: Core assessment category is missing.');
        }
      }
    };
    fetchCoreCategory();
    return () => { isMounted = false; };
  }, []); // Run only once

  
  // 2. Main recommendation fetch logic
  const getRecommendations = useCallback(async (forceRefresh = false) => {
    if (!profile || !coreCategory) return; 
    
    if (isDataInitialized && !forceRefresh) {
        return;
    }

    setLoading(true);
    setError(null);

    try {
      const attempts = await quizApi.getAttemptsByCategoryId(profile.id, coreCategory.id);

      if (attempts.length === 0) {
        setHasAttempted(false);
        setRecommendations([]);
        setIsDataInitialized(true); 
        setLoading(false);
        return; 
      }
      
      setHasAttempted(true);

      // --- Caching Logic ---
      const lastAttemptTimestamp = attempts[0]?.created_at || '';
      const newSnapshot = `core-attempts:${attempts.length}-last:${lastAttemptTimestamp}`;

      if (!forceRefresh && newSnapshot === cachedSnapshot && cachedRecs) {
        setRecommendations(cachedRecs);
        if (cachedRecs.length > 0 && !isDataInitialized) {
           toast('Recommendations loaded from cache.', { icon: '💾' });
        }
        setLoading(false);
        setIsDataInitialized(true); 
        return;
      }
      // --- End Caching Logic ---

      // Fetch new recommendations from the AI
      const aiRecs = await careerApi.getAiCareerRecommendations(profile, attempts);
      setRecommendations(aiRecs);
      
      // Update the cache
      setCachedRecs(aiRecs);
      setCachedSnapshot(newSnapshot);
      
      toast.success('New recommendations generated!'); 

    } catch (err: any) {
      console.error('Error fetching career recommendations:', err);
      setError('Could not generate career recommendations. Please try refreshing.');
      toast.error('Failed to generate recommendations.');
    } finally {
      setLoading(false);
      setIsDataInitialized(true);
    }
  }, [profile, coreCategory, isDataInitialized, cachedSnapshot, cachedRecs, setCachedRecs, setCachedSnapshot]);

  // 3. Effect to run the main logic once all dependencies are met
  useEffect(() => {
    if (profile && coreCategory && !isDataInitialized) {
      getRecommendations();
    }
  }, [profile, coreCategory, isDataInitialized, getRecommendations]);

  
  // --- Render Logic ---

  // 1. Initial State (Waiting for necessary IDs/Profile)
  if (loading || !coreCategory || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center p-4">
        <LoadingSpinner size="lg" />
        <p className="text-gray-600 mt-4 text-lg font-medium">
          {error ? "System Error" : "Initializing career system and fetching core data..."}
        </p>
        <p className="text-gray-500 mt-1">This may take a moment.</p>
      </div>
    );
  }

  // 2. Hard Error State (e.g., core category missing, network failure after fetch)
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <EmptyState 
          icon={Target} 
          title="Recommendation Error" 
          description={error} 
          actionLabel="Try Refreshing Page"
          onAction={() => window.location.reload()}
        />
      </div>
    );
  }

  // 3. Empty State (User has not taken the required assessment)
  if (!hasAttempted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <EmptyState
          icon={Brain}
          title="Take the Initial Assessment"
          description={`You must complete the 30-question Initial Skills Assessment ("${coreCategory.name}") to generate personalized career recommendations.`}
        >
          </EmptyState>
           <Link to={ROUTES.SKILLS}>
              <Button className="mt-4">Go to Skills Assessment</Button>
            </Link>
        
      </div>
    );
  }

  // 4. Success State (Recommendations Loaded)
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center mb-4">
                <Target className="w-8 h-8 text-blue-600 mr-3" />
                <h1 className="text-3xl font-bold text-gray-900">Course Recommendation</h1>
              </div>
              <p className="text-gray-600 text-lg">
                Based on your Assessment score, here is the best academic path for you.
              </p>
            </div>
            <Button variant="outline" onClick={() => getRecommendations(true)} icon={<RefreshCw className="w-4 h-4"/>}>
              Refresh
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6"> 
          {recommendations.length > 0 && recommendations.map((rec, index) => (
            <AiCareerCard key={index} recommendation={rec} /> 
          ))}
        </div>
      </div>
    </div>
  );
}