import { CareerPath, Profile } from '../types';

/**
 * Formats a date string into a more readable format.
 * @param dateString - The date string to format.
 * @returns The formatted date string.
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Formats a date-time string into a more readable format.
 * @param dateString - The date-time string to format.
 * @returns The formatted date-time string.
 */
export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Calculates the percentage score of a quiz.
 * @param score - The number of correct answers.
 * @param total - The total number of questions.
 * @returns The percentage score.
 */
export const calculateQuizPercentage = (score: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((score / total) * 100);
};

/**
 * Returns a color class based on the quiz score.
 * @param score - The number of correct answers.
 * @param total - The total number of questions.
 * @returns The color class string.
 */
export const getScoreColor = (score: number, total: number): string => {
  const percentage = calculateQuizPercentage(score, total);
  if (percentage >= 80) return 'text-green-600 bg-green-100';
  if (percentage >= 60) return 'text-yellow-600 bg-yellow-100';
  return 'text-red-600 bg-red-100';
};

/**
 * Calculates the match percentage between a career path and a user's profile.
 * @param path - The career path to match.
 * @param profile - The user's profile.
 * @returns The match percentage.
 */
export const calculateCareerMatch = (path: CareerPath, profile: Profile): number => {
  if (!profile.skills?.length || !path.required_skills?.length) return 0;

  const matchingSkills = path.required_skills.filter((skill) =>
    profile.skills?.some((userSkill) =>
      userSkill.toLowerCase().includes(skill.toLowerCase())
    )
  );

  return Math.round((matchingSkills.length / path.required_skills.length) * 100);
};

/**
 * Checks if a user has a specific skill.
 * @param skill - The skill to check for.
 * @param userSkills - The user's skills.
 * @returns True if the user has the skill, false otherwise.
 */
export const isUserSkillMatch = (skill: string, userSkills?: string[]): boolean => {
  if (!userSkills?.length) return false;
  return userSkills.some((userSkill) =>
    userSkill.toLowerCase().includes(skill.toLowerCase())
  );
};