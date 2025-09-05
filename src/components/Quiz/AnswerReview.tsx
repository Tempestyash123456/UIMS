import React from 'react';
import { Check, X } from 'lucide-react';
import { QuizQuestion as QuizQuestionType } from '../../types';

interface AnswerReviewProps {
  questions: QuizQuestionType[];
  answers: Record<string, string>;
}

export default function AnswerReview({ questions, answers }: AnswerReviewProps) {
  return (
    <div className="mt-8 pt-6 border-t">
      <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Quiz Review</h3>
      <div className="space-y-6">
        {questions.map((question, index) => {
          const userAnswer = answers[question.id];
          const isCorrect = userAnswer === question.correct_answer;
          return (
            <div key={question.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <p className="font-semibold text-gray-800 mb-4">
                {index + 1}. {question.question}
              </p>
              <div className="space-y-3">
                {Object.entries(question.options).map(([key, value]) => {
                  const isUserSelected = userAnswer === key;
                  const isCorrectAnswer = question.correct_answer === key;
                  
                  let stateClasses = 'border-gray-300';
                  if (isUserSelected && !isCorrect) {
                    stateClasses = 'bg-red-100 border-red-300'; // Incorrectly selected
                  } else if (isCorrectAnswer) {
                    stateClasses = 'bg-green-100 border-green-300'; // Correct answer
                  }

                  return (
                    <div
                      key={key}
                      className={`flex items-center p-3 rounded-lg border ${stateClasses}`}
                    >
                      {isUserSelected && !isCorrect && <X className="w-4 h-4 text-red-600 mr-2 flex-shrink-0" />}
                      {isCorrectAnswer && <Check className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />}
                      <span className="text-sm text-gray-700">{value}</span>
                    </div>
                  );
                })}
              </div>
              {question.explanation && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Explanation: </span>
                    {question.explanation}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}