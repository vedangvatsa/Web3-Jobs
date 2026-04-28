import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const LEARN_DIR = path.join(process.cwd(), 'content', 'learn');
const CATEGORIES_FILE = path.join(LEARN_DIR, 'categories.json');

export interface LearnCategory {
  slug: string;
  title: string;
  description: string;
  icon: string;
  order: number;
  lessonCount: number;
}

export interface LessonMeta {
  slug: string;
  title: string;
  description: string;
  order: number;
  readTime: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites: string[];
}

export interface Lesson extends LessonMeta {
  content: string;
  category: string;
}

/**
 * Returns all categories with lesson counts, sorted by order.
 */
export function getCategories(): LearnCategory[] {
  const raw = JSON.parse(fs.readFileSync(CATEGORIES_FILE, 'utf-8'));
  const categories: LearnCategory[] = raw.categories.map((cat: any) => {
    const catDir = path.join(LEARN_DIR, cat.slug);
    let lessonCount = 0;
    if (fs.existsSync(catDir)) {
      lessonCount = fs.readdirSync(catDir).filter(f => f.endsWith('.md')).length;
    }
    return { ...cat, lessonCount };
  });
  return categories.sort((a, b) => a.order - b.order);
}

/**
 * Returns all lessons in a category, sorted by order.
 */
export function getLessons(categorySlug: string): LessonMeta[] {
  const catDir = path.join(LEARN_DIR, categorySlug);
  if (!fs.existsSync(catDir)) return [];

  const files = fs.readdirSync(catDir).filter(f => f.endsWith('.md'));
  const lessons: LessonMeta[] = files.map(file => {
    const raw = fs.readFileSync(path.join(catDir, file), 'utf-8');
    const { data } = matter(raw);
    return {
      slug: file.replace('.md', ''),
      title: data.title || file.replace('.md', ''),
      description: data.description || '',
      order: data.order || 99,
      readTime: data.readTime || '5 min',
      difficulty: data.difficulty || 'beginner',
      prerequisites: data.prerequisites || [],
    };
  });

  return lessons.sort((a, b) => a.order - b.order);
}

/**
 * Returns a single lesson with full markdown content.
 */
export function getLesson(categorySlug: string, lessonSlug: string): Lesson | null {
  const filePath = path.join(LEARN_DIR, categorySlug, `${lessonSlug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);

  return {
    slug: lessonSlug,
    category: categorySlug,
    title: data.title || lessonSlug,
    description: data.description || '',
    order: data.order || 99,
    readTime: data.readTime || '5 min',
    difficulty: data.difficulty || 'beginner',
    prerequisites: data.prerequisites || [],
    content,
  };
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
