import { useState, useEffect, useCallback, useMemo } from 'react';
import { HelpCircle, Filter, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { FAQ as FAQType } from '../types';
import { faqApi } from '../services/api';
import { useDebounce } from '../hooks/useDebounce';
import { QUIZ_CATEGORIES } from '../utils/constants';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import SearchInput from '../components/UI/SearchInput';
import { EmptyState } from '../components/UI/EmptyState';
import toast from 'react-hot-toast'; // Import toast

const FaqItem = ({
  faq,
  isExpanded,
  onToggle,
  isFeatured = false,
}: {
  faq: FAQType;
  isExpanded: boolean;
  onToggle: () => void;
  isFeatured?: boolean;
}) => (
  <div
    className={`rounded-xl p-6 ${
      isFeatured
        ? 'bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200'
        : 'bg-white shadow-sm border border-gray-100'
    }`}
  >
    <button
      onClick={onToggle}
      className="w-full text-left flex items-center justify-between"
      aria-expanded={isExpanded}
    >
      <h3 className="text-lg font-semibold text-gray-900 pr-4">{faq.question}</h3>
      {isExpanded ? (
        <ChevronUp className="w-5 h-5 text-purple-600 flex-shrink-0" />
      ) : (
        <ChevronDown className="w-5 h-5 text-purple-600 flex-shrink-0" />
      )}
    </button>

    {isExpanded && (
      <div className={`mt-4 pt-4 border-t ${isFeatured ? 'border-purple-200' : 'border-gray-200'}`}>
        <p className="text-gray-700 whitespace-pre-wrap">{faq.answer}</p>
        <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
              {faq.category}
            </span>
            <div className="flex items-center">
              <Eye className="w-4 h-4 mr-1" />
              <span>{faq.view_count} views</span>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
);

export default function FAQ() {
  const [faqs, setFaqs] = useState<FAQType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false); // New Error State

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const fetchFAQs = useCallback(async () => {
    setLoading(true);
    setHasError(false); // Reset error state on new fetch attempt
    try {
      const data = debouncedSearchTerm
        ? await faqApi.searchFAQs(debouncedSearchTerm)
        : await faqApi.getFAQs(selectedCategory);
      setFaqs(data);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      toast.error('Failed to load FAQs.');
      setHasError(true); // Set error on failure
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, debouncedSearchTerm]);

  useEffect(() => {
    fetchFAQs();
  }, [fetchFAQs]);

  const toggleFaq = async (faqId: string) => {
    const newExpandedFaq = expandedFaq === faqId ? null : faqId;
    setExpandedFaq(newExpandedFaq);

    if (newExpandedFaq) {
      try {
        await faqApi.incrementViewCount(faqId);
        setFaqs((prevFaqs) =>
          prevFaqs.map((faq) =>
            faq.id === faqId ? { ...faq, view_count: faq.view_count + 1 } : faq
          )
        );
      } catch (error) {
        // Log the error but don't set hasError to true, as content is still visible
        console.error('Error incrementing view count:', error);
        toast.error('Failed to track view count.');
      }
    }
  };
  
  const featuredFaqs = useMemo(() => faqs.filter((faq) => faq.is_featured).slice(0, 3), [faqs]);

  if (hasError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <EmptyState
            icon={HelpCircle}
            title="Data Load Error"
            description="Failed to retrieve FAQs. Please check your connection or try again."
            actionLabel="Reload FAQs"
            onAction={fetchFAQs} // Allow user to retry the fetch
        />
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
        <p className="ml-4 text-gray-600">Loading FAQs...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center mb-4">
            <HelpCircle className="w-8 h-8 text-purple-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Find quick answers to common questions about university life.
          </p>
        </header>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search FAQs..."
              className="flex-1"
            />
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Categories</option>
                {QUIZ_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {!searchTerm && selectedCategory === 'all' && featuredFaqs.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Featured Questions</h2>
            <div className="space-y-4">
              {featuredFaqs.map((faq) => (
                <FaqItem
                  key={faq.id}
                  faq={faq}
                  isExpanded={expandedFaq === faq.id}
                  onToggle={() => toggleFaq(faq.id)}
                  isFeatured
                />
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          {faqs
            .filter((faq) => !faq.is_featured || searchTerm || selectedCategory !== 'all')
            .map((faq) => (
              <FaqItem
                key={faq.id}
                faq={faq}
                isExpanded={expandedFaq === faq.id}
                onToggle={() => toggleFaq(faq.id)}
              />
            ))}
        </div>

        {faqs.length === 0 && (
          <EmptyState
            icon={HelpCircle}
            title="No FAQs Found"
            description={
              searchTerm || selectedCategory !== 'all'
                ? 'Try adjusting your search terms or category filter.'
                : 'No frequently asked questions are available yet.'
            }
          />
        )}
      </div>
    </div>
  );
}