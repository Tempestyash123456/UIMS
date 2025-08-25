/*
  # Seed Sample Data for University Platform

  This migration adds sample data for demonstration purposes.
*/

-- Insert sample skills
INSERT INTO skills (name, category, description) VALUES
('JavaScript', 'Programming', 'Modern web development programming language'),
('Python', 'Programming', 'Versatile programming language for data science and web development'),
('React', 'Web Development', 'Popular JavaScript library for building user interfaces'),
('Data Analysis', 'Analytics', 'Ability to interpret and analyze complex datasets'),
('Machine Learning', 'AI/ML', 'Creating algorithms that can learn and make predictions'),
('Project Management', 'Management', 'Planning and executing projects effectively'),
('Public Speaking', 'Communication', 'Presenting ideas clearly to audiences'),
('Writing', 'Communication', 'Creating clear and compelling written content'),
('Leadership', 'Management', 'Guiding and inspiring teams to achieve goals'),
('Design Thinking', 'Creative', 'Problem-solving approach focused on user needs');

-- Insert sample career paths
INSERT INTO career_paths (title, description, required_skills, salary_range, growth_outlook, education_requirements) VALUES
('Software Developer', 'Design and build software applications and systems', ARRAY['JavaScript', 'Python', 'React'], '$70,000 - $130,000', 'Excellent (22% growth)', 'Bachelor''s degree in Computer Science or related field'),
('Data Scientist', 'Analyze complex data to help organizations make informed decisions', ARRAY['Python', 'Data Analysis', 'Machine Learning'], '$95,000 - $165,000', 'Very Good (16% growth)', 'Master''s degree in Statistics, Mathematics, or Computer Science'),
('Product Manager', 'Guide product development from conception to launch', ARRAY['Project Management', 'Leadership', 'Data Analysis'], '$110,000 - $180,000', 'Good (8% growth)', 'MBA or Bachelor''s degree with relevant experience'),
('UX Designer', 'Create user-centered designs for digital products', ARRAY['Design Thinking', 'JavaScript', 'Writing'], '$75,000 - $125,000', 'Good (13% growth)', 'Bachelor''s degree in Design or related field'),
('Marketing Manager', 'Develop and execute marketing strategies', ARRAY['Writing', 'Data Analysis', 'Leadership'], '$65,000 - $115,000', 'Average (6% growth)', 'Bachelor''s degree in Marketing or Business');

-- Insert quiz categories
INSERT INTO quiz_categories (name, description, icon) VALUES
('Programming Fundamentals', 'Test your knowledge of basic programming concepts', 'Code'),
('Data Science', 'Assess your data analysis and statistics skills', 'BarChart3'),
('Web Development', 'Evaluate your web development capabilities', 'Globe'),
('Project Management', 'Check your project management understanding', 'CheckSquare'),
('Communication Skills', 'Measure your communication and presentation abilities', 'MessageSquare');

-- Insert sample quiz questions
INSERT INTO quiz_questions (category_id, question, options, correct_answer, explanation, difficulty_level) VALUES
((SELECT id FROM quiz_categories WHERE name = 'Programming Fundamentals'), 
 'What is a variable in programming?', 
 '{"A": "A fixed value that never changes", "B": "A named storage location for data", "C": "A type of loop", "D": "A programming language"}',
 'B',
 'A variable is a named storage location that can hold data and whose value can be changed during program execution.',
 1),
((SELECT id FROM quiz_categories WHERE name = 'Web Development'), 
 'Which HTML tag is used to create a hyperlink?', 
 '{"A": "<link>", "B": "<href>", "C": "<a>", "D": "<url>"}',
 'C',
 'The <a> (anchor) tag is used to create hyperlinks in HTML, with the href attribute specifying the destination.',
 1),
((SELECT id FROM quiz_categories WHERE name = 'Data Science'), 
 'What does SQL stand for?', 
 '{"A": "Structured Query Language", "B": "Simple Query Language", "C": "Standard Query Language", "D": "Statistical Query Language"}',
 'A',
 'SQL stands for Structured Query Language, used for managing and querying relational databases.',
 1);

-- Insert sample FAQs
INSERT INTO faqs (question, answer, category, tags) VALUES
('How do I register for courses?', 'You can register for courses through the student portal during your assigned registration window. Check your academic calendar for specific dates.', 'Academic', ARRAY['registration', 'courses', 'student-portal']),
('Where can I find information about scholarships?', 'Visit the Financial Aid office or check the university website under Student Services > Financial Aid for comprehensive scholarship information.', 'Financial Aid', ARRAY['scholarships', 'financial-aid', 'funding']),
('What dining options are available on campus?', 'The university offers multiple dining halls, cafeterias, and food courts across campus. Meal plans are available for students living on campus.', 'Campus Life', ARRAY['dining', 'food', 'meal-plans']),
('How do I access the library resources?', 'Use your student ID to access physical resources and your student credentials to log into online databases and digital resources.', 'Academic', ARRAY['library', 'resources', 'research']),
('What career services are available?', 'The Career Center offers resume reviews, interview preparation, job search assistance, and networking events. Book appointments online.', 'Career Services', ARRAY['career', 'jobs', 'internships']);

-- Insert sample events
INSERT INTO events (title, description, event_type, date_time, location, capacity, tags, image_url) VALUES
('Career Fair 2025', 'Meet with top employers and explore internship and job opportunities across various industries.', 'Career', '2025-03-15 10:00:00+00', 'Student Center Ballroom', 500, ARRAY['career', 'networking', 'jobs'], 'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg'),
('Tech Innovation Workshop', 'Learn about the latest trends in technology and innovation from industry experts.', 'Workshop', '2025-02-20 14:00:00+00', 'Engineering Building Room 101', 50, ARRAY['technology', 'innovation', 'workshop'], 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg'),
('Study Abroad Information Session', 'Discover study abroad opportunities and learn about application processes.', 'Information Session', '2025-02-28 16:00:00+00', 'International Center', 100, ARRAY['study-abroad', 'international', 'education'], 'https://images.pexels.com/photos/1595391/pexels-photo-1595391.jpeg'),
('Mental Health Awareness Week', 'Various activities and workshops focused on student mental health and wellness.', 'Wellness', '2025-04-01 09:00:00+00', 'Campus-wide', 1000, ARRAY['mental-health', 'wellness', 'support'], 'https://images.pexels.com/photos/3184419/pexels-photo-3184419.jpeg'),
('Research Symposium', 'Showcase of undergraduate and graduate student research across all disciplines.', 'Academic', '2025-04-15 13:00:00+00', 'Academic Commons', 300, ARRAY['research', 'academic', 'presentation'], 'https://images.pexels.com/photos/301926/pexels-photo-301926.jpeg');