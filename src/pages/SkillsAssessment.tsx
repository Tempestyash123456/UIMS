import { useState, useEffect, useReducer, useCallback } from 'react';
import { Brain, Play, Award, HelpCircle, RefreshCw } from 'lucide-react';
import { QuizCategory, QuizQuestion as QuizQuestionType, QuizAttempt, QuizState } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { quizApi } from '../services/api';
import { getScoreColor } from '../utils/helpers';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Card from '../components/UI/Card';
import QuizProgress from '../components/Quiz/QuizProgress';
import QuizQuestion from '../components/Quiz/QuizQuestion';
import QuizNavigation from '../components/Quiz/QuizNavigation';
import QuizResults from '../components/Quiz/QuizResults';
import toast from 'react-hot-toast';
import Button from '../components/UI/Button';

type QuizAction =
  | { type: 'START_QUIZ'; payload: { questions: QuizQuestionType[]; category: QuizCategory } }
  | { type: 'SELECT_ANSWER'; payload: { questionId: string; answer: string } }
  | { type: 'NEXT_QUESTION' }
  | { type: 'PREV_QUESTION' }
  | { type: 'FINISH_QUIZ'; payload: { score: number; category: QuizCategory } }
  | { type: 'RESET' };

const initialQuizState: QuizState = {
  currentQuestion: 0,
  answers: {},
  timeStarted: 0,
  isCompleted: false,
  score: 0,
};

function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'START_QUIZ':
      return { ...initialQuizState, timeStarted: Date.now() };
    case 'SELECT_ANSWER':
      return { ...state, answers: { ...state.answers, [action.payload.questionId]: action.payload.answer } };
    case 'NEXT_QUESTION':
      return { ...state, currentQuestion: state.currentQuestion + 1 };
    case 'PREV_QUESTION':
      return { ...state, currentQuestion: state.currentQuestion - 1 };
    case 'FINISH_QUIZ':
      return { ...state, isCompleted: true, score: action.payload.score };
    case 'RESET':
      return initialQuizState;
    default:
      return state;
  }
}

const CORE_ASSESSMENT_NAME = 'Programming Fundamentals'; 
const CORE_ASSESSMENT_DESCRIPTION = 'Assessment to check foundational technical knowledge and behavioral aptitude.';

export default function SkillsAssessment() {
  const { profile } = useAuth();
  const [assessmentCategory, setAssessmentCategory] = useState<QuizCategory | null>(null);
  const [questions, setQuestions] = useState<QuizQuestionType[]>([]);
  const [quizState, dispatch] = useReducer(quizReducer, initialQuizState);
  const [quizHistory, setQuizHistory] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  
  
  const assessmentCategoryPlaceholder: QuizCategory = {
    id: assessmentCategory?.id || 'temp-id',
    name: CORE_ASSESSMENT_NAME,
    description: CORE_ASSESSMENT_DESCRIPTION,
  };


  const fetchInitialData = useCallback(async () => {
    if (!profile?.id) return;
    try {
      // 1. Get the ID for the CORE assessment
      const coreCategory = await quizApi.getCategoryByName(CORE_ASSESSMENT_NAME);
      setAssessmentCategory(coreCategory);
      
      // 2. Fetch all attempts for this specific assessment
      const attemptsData = await quizApi.getUserAttempts(profile.id);
      
      // Filter the attempts to only show history for the single assessment
      const history = attemptsData.filter(a => a.quiz_categories?.name === CORE_ASSESSMENT_NAME);
      setQuizHistory(history);
      
    } catch (error) {
      toast.error('Failed to load assessment data. Check if category "Programming Fundamentals" exists.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const startAssessment = async () => {
    if (!assessmentCategory?.id) {
        toast.error('Assessment category not found.');
        return;
    }
    setLoading(true);
    try {
      // Fetch only questions for the determined category (limited to 30 in API)
      const questionsData = await quizApi.getQuestions(assessmentCategory.id);
      
      if (questionsData.length === 0) {
        toast.error('No questions available. Please ensure questions are seeded for the assessment category.');
        return;
      }
      
      setQuestions(questionsData);
      dispatch({ type: 'START_QUIZ', payload: { questions: questionsData, category: assessmentCategory } });
    } catch (error) {
      toast.error('Failed to load assessment questions.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const finishQuiz = async () => {
    if (!profile?.id || !assessmentCategory) return;
    const score = questions.reduce((acc, q) => acc + (quizState.answers[q.id] === q.correct_answer ? 1 : 0), 0);
    
    // Use the fetched assessmentCategory ID
    await quizApi.saveAttempt({
      user_id: profile.id,
      category_id: assessmentCategory.id, 
      score,
      total_questions: questions.length,
      answers: quizState.answers,
    });
    
    dispatch({ type: 'FINISH_QUIZ', payload: { score, category: assessmentCategory } });
    fetchInitialData(); // Reload history
  };
  
  const currentQuestion = questions[quizState.currentQuestion];

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;

  // Render Quiz Results
  if (quizState.isCompleted) {
    return (
      <QuizResults 
        category={assessmentCategory || assessmentCategoryPlaceholder} 
        score={quizState.score} 
        totalQuestions={questions.length} 
        timeStarted={quizState.timeStarted} 
        onRetakeQuiz={() => dispatch({ type: 'RESET' })}
        questions={questions}
        answers={quizState.answers}
      />
    );
  }

  // Render Active Quiz
  if (questions.length > 0 && assessmentCategory) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <QuizProgress 
            categoryName={assessmentCategory.name} 
            currentQuestion={quizState.currentQuestion} 
            totalQuestions={questions.length} 
            timeStarted={quizState.timeStarted} 
          />
          <QuizQuestion 
            question={currentQuestion} 
            selectedAnswer={quizState.answers[currentQuestion.id]} 
            onSelectAnswer={answer => dispatch({ type: 'SELECT_ANSWER', payload: { questionId: currentQuestion.id, answer } })} 
          />
          <QuizNavigation 
            currentQuestion={quizState.currentQuestion} 
            totalQuestions={questions.length} 
            hasAnswer={!!quizState.answers[currentQuestion.id]} 
            onPrevious={() => dispatch({ type: 'PREV_QUESTION' })} 
            onNext={() => quizState.currentQuestion < questions.length - 1 ? dispatch({ type: 'NEXT_QUESTION' }) : finishQuiz()} 
          />
        </div>
      </div>
    );
  }

  // Render Start/History Screen
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-xl w-full">
          <header className="mb-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <Brain className="w-8 h-8 text-purple-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">Initial Skills Assessment</h1>
            </div>
            <p className="text-lg text-gray-600">
              {CORE_ASSESSMENT_DESCRIPTION}
            </p>
          </header>
          
          {/* Quiz History Card */}
          {quizHistory.length > 0 && (
            <Card className="mb-8 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Award className="w-6 h-6 text-yellow-600 mr-2" />
                Latest Assessment Score
              </h2>
              {quizHistory.slice(0, 1).map(attempt => (
                <div key={attempt.id} className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{CORE_ASSESSMENT_NAME}</h3>
                    <div className={`text-sm font-semibold ${getScoreColor(attempt.score, attempt.total_questions)}`}>
                      Score: {attempt.score}/{attempt.total_questions}
                    </div>
                  </div>
                  <Button onClick={startAssessment} variant="outline" icon={<RefreshCw className="w-4 h-4" />}>
                    Retake Test
                  </Button>
                </div>
              ))}
            </Card>
          )}

          {/* Start Assessment Card */}
          <Card hover padding="lg" className="text-center">
            <div className="flex items-center justify-center text-4xl font-bold text-blue-600 mb-4">
                <HelpCircle className="w-8 h-8 mr-3" /> {quizHistory.length > 0 ? 'Ready for Retake' : '30 Questions'}
            </div>
            <p className="text-gray-700 mb-6">
              This test is crucial for generating your personalized career path recommendations.
            </p>
            <Button onClick={startAssessment} size="lg" icon={<Play />}>
              {quizHistory.length > 0 ? 'Start Retake' : 'Start Assessment'}
            </Button>
          </Card>
        </div>
      </div>
  );
}