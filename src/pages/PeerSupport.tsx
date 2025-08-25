import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Users, Plus, MessageSquare, ThumbsUp, Filter, ArrowLeft } from 'lucide-react';
import { PeerQuestion, PeerAnswer } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { peerApi } from '../services/api';
import { QUIZ_CATEGORIES } from '../utils/constants';
import { formatDate } from '../utils/helpers';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import SearchInput from '../components/UI/SearchInput';
import EmptyState from '../components/UI/EmptyState';
import Button from '../components/UI/Button';
import toast from 'react-hot-toast';

// NewQuestionForm component
const NewQuestionForm = ({ onCancel, onSubmit }: { onCancel: () => void; onSubmit: (formData: FormData) => void }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Ask a Question</h2>
        <p className="text-gray-600 mt-1">Share your question with the community</p>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(new FormData(e.currentTarget)); }} className="p-6 space-y-4">
        <input name="title" placeholder="Title" required className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
        <select name="category" required className="w-full px-4 py-3 border border-gray-300 rounded-lg">
          {QUIZ_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <textarea name="content" rows={6} placeholder="Description..." required className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
        <input name="tags" placeholder="Tags (comma-separated)" className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
        <div className="flex justify-end space-x-4 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit">Post Question</Button>
        </div>
      </form>
    </div>
  </div>
);

// QuestionDetailView component
const QuestionDetailView = ({ question, onBack }: { question: PeerQuestion; onBack: () => void }) => {
  const { profile } = useAuth();
  const [answers, setAnswers] = useState<PeerAnswer[]>([]);

  useEffect(() => {
    const fetchAnswers = async () => {
      const data = await peerApi.getAnswers(question.id);
      setAnswers(data);
    };
    fetchAnswers();
  }, [question.id]);

  const submitAnswer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!profile?.id) return;

    const formData = new FormData(e.currentTarget);
    const content = formData.get('answer') as string;
    
    await peerApi.createAnswer({ question_id: question.id, user_id: profile.id, content });
    toast.success('Answer posted!');
    e.currentTarget.reset();
    const data = await peerApi.getAnswers(question.id);
    setAnswers(data);
  };

  return (
    <div>
      <Button variant="ghost" onClick={onBack} icon={<ArrowLeft />}>Back to Questions</Button>
      <div className="bg-white rounded-xl p-6 my-6">
        <h1 className="text-2xl font-bold mb-4">{question.title}</h1>
        <p className="whitespace-pre-wrap mb-6">{question.content}</p>
        <div className="flex items-center space-x-4 pt-4 border-t">
          <button className="flex items-center space-x-2"><ThumbsUp size={16} /><span>{question.upvotes}</span></button>
          <div className="flex items-center space-x-2"><MessageSquare size={16} /><span>{answers.length} answers</span></div>
        </div>
      </div>
      <div className="bg-white rounded-xl p-6 mb-6">
        <h3 className="text-lg font-bold mb-4">Your Answer</h3>
        <form onSubmit={submitAnswer} className="space-y-4">
          <textarea name="answer" rows={4} required className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
          <Button type="submit">Post Answer</Button>
        </form>
      </div>
      <div className="space-y-4">
        {answers.map(answer => (
          <div key={answer.id} className="bg-white rounded-xl p-6">
            <p className="font-medium">{answer.profiles?.full_name || 'Anonymous'}</p>
            <p className="text-sm text-gray-500 mb-2">{formatDate(answer.created_at)}</p>
            <p className="whitespace-pre-wrap">{answer.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function PeerSupport() {
  const { profile } = useAuth();
  const [questions, setQuestions] = useState<PeerQuestion[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showNewQuestion, setShowNewQuestion] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<PeerQuestion | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await peerApi.getQuestions();
      setQuestions(data);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      const searchMatch = searchTerm
        ? q.title.toLowerCase().includes(searchTerm.toLowerCase()) || q.content.toLowerCase().includes(searchTerm.toLowerCase())
        : true;
      const categoryMatch = selectedCategory !== 'all' ? q.category === selectedCategory : true;
      return searchMatch && categoryMatch;
    });
  }, [questions, searchTerm, selectedCategory]);

  const submitQuestion = async (formData: FormData) => {
    if (!profile?.id) return;
    try {
      await peerApi.createQuestion({
        user_id: profile.id,
        title: formData.get('title') as string,
        content: formData.get('content') as string,
        category: formData.get('category') as string,
        tags: (formData.get('tags') as string)?.split(',').map(t => t.trim())
      });
      toast.success('Question posted!');
      setShowNewQuestion(false);
      fetchQuestions();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error('Failed to post question.');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;
  }
  
  if (selectedQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <QuestionDetailView question={selectedQuestion} onBack={() => setSelectedQuestion(null)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center mb-4">
              <Users className="w-8 h-8 text-green-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">Ask a Peer</h1>
            </div>
            <p className="text-gray-600 text-lg">
              Get help from fellow students and share your knowledge.
            </p>
          </div>
          <Button onClick={() => setShowNewQuestion(true)} icon={<Plus />}>Ask Question</Button>
        </header>

        {showNewQuestion && <NewQuestionForm onCancel={() => setShowNewQuestion(false)} onSubmit={submitQuestion} />}

        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Search questions..." className="flex-1" />
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="px-4 py-3 border border-gray-300 rounded-lg">
                <option value="all">All Categories</option>
                {QUIZ_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {filteredQuestions.length > 0 ? filteredQuestions.map(q => (
            <div key={q.id} onClick={() => setSelectedQuestion(q)} className="bg-white rounded-xl p-6 cursor-pointer hover:shadow-md">
              <h2 className="text-xl font-bold mb-2">{q.title}</h2>
              <p className="line-clamp-2 mb-4">{q.content}</p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>By {q.profiles?.full_name || 'Anonymous'} on {formatDate(q.created_at)}</span>
                <div className="flex items-center space-x-4">
                  <span className="flex items-center"><ThumbsUp size={16} className="mr-1" /> {q.upvotes}</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">{q.category}</span>
                </div>
              </div>
            </div>
          )) : (
            <EmptyState icon={Users} title="No Questions Found" description="Be the first to ask a question!" />
          )}
        </div>
      </div>
    </div>
  );
}