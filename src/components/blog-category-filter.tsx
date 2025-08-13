
'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function BlogCategoryFilter({ categories }: { categories: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get('category') || 'All';

  const handleCategoryClick = (category: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    if (category === 'All') {
      current.delete('category');
    } else {
      current.set('category', category);
    }
    const search = current.toString();
    const query = search ? `?${search}` : '';
    router.push(`${pathname}${query}`);
  };

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {categories.map((category) => (
        <Button
          key={category}
          variant={selectedCategory === category ? 'default' : 'outline'}
          onClick={() => handleCategoryClick(category)}
          className="rounded-full"
        >
          {category}
        </Button>
      ))}
    </div>
  );
}
