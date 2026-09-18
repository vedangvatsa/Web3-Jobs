import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';
import type { LearnCategory, Lesson, LessonMeta } from '../src/lib/learn-types';

const LEARN_DIR = path.join(process.cwd(), 'content', 'learn');
const CATEGORIES_FILE = path.join(LEARN_DIR, 'categories.json');
const OUT_FILE = path.join(process.cwd(), 'content', 'learn-runtime.json');

function main() {
  if (!fs.existsSync(CATEGORIES_FILE)) {
    console.warn('[precompute-learn] categories.json not found');
    return;
  }

  const rawCat = JSON.parse(fs.readFileSync(CATEGORIES_FILE, 'utf-8'));
  const lessonsByCategory: Record<string, LessonMeta[]> = {};
  const lessons: Record<string, Lesson> = {};

  const categories: LearnCategory[] = rawCat.categories.map((cat: any) => {
    const catDir = path.join(LEARN_DIR, cat.slug);
    let lessonCount = 0;
    const catLessons: LessonMeta[] = [];
    if (fs.existsSync(catDir)) {
      const files = fs.readdirSync(catDir).filter(f => f.endsWith('.md'));
      lessonCount = files.length;
      files.forEach(file => {
        const lessonSlug = file.replace('.md', '');
        const raw = fs.readFileSync(path.join(catDir, file), 'utf-8');
        const { data, content } = matter(raw);
        const meta: LessonMeta = {
          slug: lessonSlug,
          title: data.title || lessonSlug,
          description: data.description || '',
          order: data.order || 99,
          readTime: data.readTime || '5 min',
          difficulty: data.difficulty || 'beginner',
          prerequisites: data.prerequisites || [],
          hasQuiz: Array.isArray(data.quiz) && data.quiz.length > 0,
        };
        catLessons.push(meta);
        lessons[`${cat.slug}/${lessonSlug}`] = {
          ...meta,
          content,
          category: cat.slug,
          quiz: data.quiz || [],
        };
      });
    }
    catLessons.sort((a, b) => a.order - b.order);
    lessonsByCategory[cat.slug] = catLessons;
    return { ...cat, lessonCount };
  });

  categories.sort((a, b) => a.order - b.order);

  const runtime = { categories, lessonsByCategory, lessons };
  fs.writeFileSync(OUT_FILE, JSON.stringify(runtime));
  console.log(`[precompute-learn] Wrote ${categories.length} categories and ${Object.keys(lessons).length} lessons to ${OUT_FILE}`);
}

main();
