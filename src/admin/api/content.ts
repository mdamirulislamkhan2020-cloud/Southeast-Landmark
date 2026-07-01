export type BlogStatus = "draft" | "published" | "scheduled";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string | null;
  author: string;
  categories: string[];
  tags: string[];
  status: BlogStatus;
  readingTime: number;
  publishAt: string | null;
  publishedAt: string | null;
  seo: { title: string; description: string; keywords: string };
  og: { title: string; description: string; image: string | null };
  createdAt: string;
  updatedAt: string;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  category: string;
  active: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Testimonial {
  id: string;
  name: string;
  position: string;
  company: string;
  image: string | null;
  rating: number;
  review: string;
  active: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}