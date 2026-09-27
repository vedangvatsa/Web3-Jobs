import routesJson from '../../content/learn-routes.json';

const routes = routesJson as { courses: Record<string, string>; lessons: Record<string, string> };
export type LearnRoute = { slug: string; category: string; lesson?: string };
export const learnRoutes: LearnRoute[] = [
  ...Object.entries(routes.courses).map(([category, slug]) => ({ slug, category })),
  ...Object.entries(routes.lessons).map(([key, slug]) => {
    const [category, lesson] = key.split('/');
    return { slug, category, lesson };
  }),
];
const bySlug = new Map(learnRoutes.map(route => [route.slug, route]));
const legacyPaths = new Map(learnRoutes.map(route => [
  `/learn/${route.category}${route.lesson ? `/${route.lesson}` : ''}`, `/${route.slug}`,
]));

export function resolveLearnRoute(slug: string): LearnRoute | null {
  return bySlug.get(slug.toLowerCase()) || null;
}

export function getCoursePath(category: string): string {
  const slug = routes.courses[category];
  if (!slug) throw new Error(`No public route registered for learning course: ${category}`);
  return `/${slug}`;
}

export function getLessonPath(category: string, lesson: string): string {
  const slug = routes.lessons[`${category}/${lesson}`];
  if (!slug) throw new Error(`No public route registered for learning lesson: ${category}/${lesson}`);
  return `/${slug}`;
}

export function getLearnRedirectPath(pathname: string): string | null {
  return legacyPaths.get(pathname.replace(/\/+$/, '')) || null;
}

export function canonicalLearnLink(href: string, category: string, lesson: string): string {
  try {
    const url = new URL(href, `https://hashtagweb3.com/learn/${category}/${lesson}`);
    if (!['hashtagweb3.com', 'www.hashtagweb3.com'].includes(url.hostname)) return href;
    const canonical = getLearnRedirectPath(url.pathname);
    if (!canonical) return href;
    return canonical + url.search + url.hash;
  } catch {
    return href;
  }
}
