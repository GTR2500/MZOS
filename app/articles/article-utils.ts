import { articles } from "./article-data";
import type { PortfolioArticle } from "./article-types";

export const portfolioArticles = articles as readonly PortfolioArticle[];

export function articleBySlug(slug: string) {
  return portfolioArticles.find((article) => article.slug === slug);
}

export function formatArticleDate(value: string) {
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export function articleMetric(article: PortfolioArticle) {
  if (article.metrics?.views != null) return `${article.metrics.views} letture`;
  if (article.metrics?.impressions != null) return `${article.metrics.impressions} impression`;
  return null;
}
