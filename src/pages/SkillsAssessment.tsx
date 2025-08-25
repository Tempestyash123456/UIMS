import { useState, useEffect, useReducer, useCallback } from 'react';
import { Brain, Play, Award } from 'lucide-react'; // Changed Trophy to Award
import { QuizCategory, QuizQuestion as QuizQuestionType, QuizAttempt, QuizState } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { quizApi } from '../services/api';
import { getScoreColor } from '../utils/helpers';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Card from '../components/UI/Card';
import EmptyState from '../components/UI/EmptyState';
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
  | { type: 'FINISH_QUIZ'; payload: { score: number } }
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

export default function SkillsAssessment() {
  const { profile } = useAuth();
  const [categories, setCategories] = useState<QuizCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<QuizCategory | null>(null);
  const [questions, setQuestions] = useState<QuizQuestionType[]>([]);
  const [quizState, dispatch] = useReducer(quizReducer, initialQuizState);
  const [userAttempts, setUserAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInitialData = useCallback(async () => {
    try {
      const [categoriesData, attemptsData] = await Promise.all([
        quizApi.getCategories(),
        profile?.id ? quizApi.getUserAttempts(profile.id) : Promise.resolve([]),
      ]);
      setCategories(categoriesData);
      setUserAttempts(attemptsData);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error('Failed to load assessment data.');
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const startQuiz = async (category: QuizCategory) => {
    const questionsData = await quizApi.getQuestions(category.id);
    setQuestions(questionsData);
    setSelectedCategory(category);
    dispatch({ type: 'START_QUIZ', payload: { questions: questionsData, category } });
  };

  const finishQuiz = async () => {
    if (!profile?.id || !selectedCategory) return;
    const score = questions.reduce((acc, q) => acc + (quizState.answers[q.id] === q.correct_answer ? 1 : 0), 0);
    
    await quizApi.saveAttempt({
      user_id: profile.id,
      category_id: selectedCategory.id,
      score,
      total_questions: questions.length,
      answers: quizState.answers,
    });
    
    dispatch({ type: 'FINISH_QUIZ', payload: { score } });
    fetchInitialData();
  };
  
  const currentQuestion = questions[quizState.currentQuestion];

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;

  if (quizState.isCompleted) {
    return <QuizResults category={selectedCategory!} score={quizState.score} totalQuestions={questions.length} timeStarted={quizState.timeStarted} onRetakeQuiz={() => dispatch({ type: 'RESET' })} />;
  }

  if (questions.length > 0 && selectedCategory) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <QuizProgress categoryName={selectedCategory.name} currentQuestion={quizState.currentQuestion} totalQuestions={questions.length} timeStarted={quizState.timeStarted} />
          <QuizQuestion question={currentQuestion} selectedAnswer={quizState.answers[currentQuestion.id]} onSelectAnswer={answer => dispatch({ type: 'SELECT_ANSWER', payload: { questionId: currentQuestion.id, answer } })} />
          <QuizNavigation currentQuestion={quizState.currentQuestion} totalQuestions={questions.length} hasAnswer={!!quizState.answers[currentQuestion.id]} onPrevious={() => dispatch({ type: 'PREV_QUESTION' })} onNext={() => quizState.currentQuestion < questions.length - 1 ? dispatch({ type: 'NEXT_QUESTION' }) : finishQuiz()} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md-p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Skills Assessment</h1>
          <p className="text-lg text-gray-600">Test your knowledge and discover your strengths.</p>
        </header>

        {userAttempts.length > 0 && (
          <Card className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Award className="w-6 h-6 text-yellow-600 mr-2" />
              Your Recent Attempts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {userAttempts.slice(0, 3).map(attempt => (
                <div key={attempt.id} className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium">{attempt.quiz_categories?.name}</h3>
                  <div className={`text-sm ${getScoreColor(attempt.score, attempt.total_questions)}`}>
                    Score: {attempt.score}/{attempt.total_questions}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.length > 0 ? categories.map(category => (
            <Card key={category.id} hover>
              <h3 className="text-xl font-bold">{category.name}</h3>
              <p className="text-gray-600 my-4">{category.description}</p>
              <Button onClick={() => startQuiz(category)} icon={<Play />}>Start Quiz</Button>
            </Card>
          )) : (
            <EmptyState icon={Brain} title="No Assessments Available" description="Check back later for new skill assessments." />
          )}
        </div>
      </div>
    </div>
  );
}