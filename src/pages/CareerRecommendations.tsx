import { useState, useEffect } from 'react';
import { Target, Lightbulb, CheckCircle, Brain, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AiCareerRecommendation, QuizAttempt } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { careerApi, quizApi } from '../services/api';
import { ROUTES } from '../utils/constants';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import EmptyState from '../components/UI/EmptyState';
import Button from '../components/UI/Button';

// A new card component specifically for displaying AI recommendations
const AiCareerCard = ({ recommendation }: { recommendation: AiCareerRecommendation }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200 flex flex-col">
      <div className="flex-grow">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 flex-1 pr-4">{recommendation.title}</h3>
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Target className="w-6 h-6 text-white" />
          </div>
        </div>

        <p className="text-gray-600 mb-6">{recommendation.description}</p>
        
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <div className="flex items-start">
            <Lightbulb className="w-5 h-5 text-blue-600 mr-3 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-blue-900">Why it's a good match:</h4>
              <p className="text-sm text-blue-800">{recommendation.reasoning}</p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-md font-semibold text-gray-700 mb-3">Suggested Skills to Learn:</h4>
          <ul className="space-y-2">
            {recommendation.suggested_skills_to_learn.map((skill, index) => (
              <li key={index} className="flex items-center text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                <span className="text-sm">{skill}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-6 pt-6 border-t border-gray-100">
        <Button className="w-full">
          <span>Explore Path</span>
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default function CareerRecommendations() {
  const { profile } = useAuth();
  const [recommendations, setRecommendations] = useState<AiCareerRecommendation[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getRecommendations = async () => {
      if (!profile?.id) return;

      setLoading(true);
      setError(null);

      try {
        // First, fetch the user's quiz history
        const attempts = await quizApi.getUserAttempts(profile.id);
        setQuizAttempts(attempts);

        if (attempts.length === 0) {
          setLoading(false);
          return;
        }

        // Then, get the AI recommendations
        const aiRecs = await careerApi.getAiCareerRecommendations(profile, attempts);
        setRecommendations(aiRecs);
      } catch (err: any) {
        console.error('Error fetching career recommendations:', err);
        setError('Could not generate career recommendations at this time. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    getRecommendations();
  }, [profile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center p-4">
        <LoadingSpinner size="lg" />
        <p className="text-gray-600 mt-4 text-lg font-medium">Generating your personalized career recommendations...</p>
        <p className="text-gray-500 mt-1">This may take a moment.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <EmptyState
          icon={Target}
          title="Error"
          description={error}
        />
      </div>
    );
  }

  if (quizAttempts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <EmptyState
          icon={Brain}
          title="Take a Quiz to Get Recommendations"
          description="We need to learn more about your skills to provide personalized career recommendations. Complete a skills assessment to get started!"
          actionLabel="Go to Skills Assessment"
          onAction={() => {}} // Placeholder, as Link is used below
        >
           <Link to={ROUTES.SKILLS}>
              <Button className="mt-4">Go to Skills Assessment</Button>
            </Link>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center mb-4">
            <Target className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Your AI-Powered Career Recommendations</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Based on your profile and quiz results, here are some career paths you might excel in.
          </p>
        </header>

        {recommendations.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {recommendations.map((rec) => (
              <AiCareerCard key={rec.title} recommendation={rec} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Target}
            title="No Recommendations Found"
            description="We couldn't generate any recommendations based on your current profile and quiz data."
          />
        )}
      </div>
    </div>
  );
}