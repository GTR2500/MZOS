export type ArticleBlock = {
  type: "heading" | "paragraph";
  text: string;
};

export type ArticleMetrics = {
  impressions?: number;
  membersReached?: number;
  reactions?: number;
  comments?: number;
  shares?: number;
  views?: number;
};

export type PortfolioArticle = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  abstract: string;
  author: string;
  category: string;
  seoTitle: string;
  seoDescription: string;
  publishedAt: string;
  linkedinUrl: string | null;
  cover: string | null;
  blocks: readonly ArticleBlock[];
  metrics: ArticleMetrics | null;
};
