
export interface Job {
  id: string;
  title: string;
  company: string;
  link: string;
  date: string; // ISO string for serialization
  source: string;
}

// Represents a piece of text that can be styled (e.g., bold, italic)
type StyledText = {
  type: 'text';
  value: string;
  style?: 'bold' | 'italic';
};

// Represents a hyperlink
type Link = {
  type: 'link';
  href: string;
  value: string;
};

// Represents a list item, which can contain text or links
type ListItem = {
  type: 'li';
  children: (StyledText | Link)[];
};

// Represents a paragraph within a blockquote
type BlockquoteParagraph = {
    type: 'p';
    children: (StyledText | Link)[];
}

// A block of content can be a paragraph, heading, list, image, or blockquote
type ContentBlock = {
  type: 'p' | 'h2' | 'h3' | 'ul';
  children: (StyledText | Link | ListItem)[];
} | {
    type: 'blockquote';
    children: BlockquoteParagraph[];
} | {
  type: 'image';
  src: string;
  alt: string;
  caption?: string;
  'data-ai-hint'?: string;
} | {
    type: 'cta',
    text: string;
    href: string;
};

// The entire content of an article is an array of these blocks
export type ArticleContent = ContentBlock[];

export interface Article {
  slug: string;
  title: string;
  image: string;
  description: string;
  content: ArticleContent;
}
