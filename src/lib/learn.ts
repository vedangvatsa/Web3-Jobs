import learnRuntimeJson from '../../content/learn-runtime.json';

export interface LearnCategory {
 slug: string;
 title: string;
 description: string;
 icon: string;
 order: number;
 lessonCount: number;
 type: 'core' | 'elective';
 duration: string;
 audience: string;
}

export interface QuizQuestion {
 question: string;
 options: string[];
 correct: number;
 explanation: string;
}

export interface LessonMeta {
 slug: string;
 title: string;
 description: string;
 order: number;
 readTime: string;
 difficulty: 'beginner' | 'intermediate' | 'advanced';
 prerequisites: string[];
 hasQuiz: boolean;
}

export interface Lesson extends LessonMeta {
 content: string;
 category: string;
 quiz: QuizQuestion[];
}

type LearnRuntimeData = {
 categories: LearnCategory[];
 lessonsByCategory: Record<string, LessonMeta[]>;
 lessons: Record<string, Lesson>;
};

const data = learnRuntimeJson as LearnRuntimeData;

/**
 * Returns all categories with lesson counts, sorted by order.
 */
export function getCategories(): LearnCategory[] {
 return data.categories || [];
}

/**
 * Returns all lessons in a category, sorted by order.
 */
export function getLessons(categorySlug: string): LessonMeta[] {
 return data.lessonsByCategory?.[categorySlug] || [];
}

/**
 * Returns a single lesson with full markdown content.
 */
export function getLesson(categorySlug: string, lessonSlug: string): Lesson | null {
 return data.lessons?.[`${categorySlug}/${lessonSlug}`] || null;
}

/**
 * Returns the previous and next lessons for navigation.
 */
export function getAdjacentLessons(categorySlug: string, lessonSlug: string): {
 prev: LessonMeta | null;
 next: LessonMeta | null;
} {
 const lessons = getLessons(categorySlug);
 const idx = lessons.findIndex(l => l.slug === lessonSlug);
 return {
  prev: idx > 0 ? lessons[idx - 1] : null,
  next: idx < lessons.length - 1 ? lessons[idx + 1] : null,
 };
}

/**
 * Returns the category metadata for a given slug.
 */
export function getCategory(slug: string): LearnCategory | null {
 return getCategories().find(c => c.slug === slug) || null;
}
