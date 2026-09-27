import type { Metadata } from 'next';
import { getCategory, getLesson } from './learn';
import { getCoursePath, getLessonPath, type LearnRoute } from './learn-routes';

export function learnPageMetadata(route: LearnRoute): Metadata {
  const category = getCategory(route.category);
  const lesson = route.lesson ? getLesson(route.category, route.lesson) : null;
  const content = route.lesson ? lesson : category;
  if (!content) return {};
  const title = lesson ? `${lesson.title} - ${category?.title || 'Learn Web3'}` : `${content.title} - Learn Web3`;
  const url = `https://hashtagweb3.com${route.lesson ? getLessonPath(route.category, route.lesson) : getCoursePath(route.category)}`;
  const image = 'https://hashtagweb3.com/og-image-blog.png';
  return {
    title,
    description: content.description,
    alternates: { canonical: url },
    openGraph: {
      title, description: content.description, url, type: lesson ? 'article' : 'website',
      images: [{ url: image, width: 1200, height: 630, alt: content.title }],
    },
    twitter: { card: 'summary_large_image', title, description: content.description, images: [image] },
  };
}
