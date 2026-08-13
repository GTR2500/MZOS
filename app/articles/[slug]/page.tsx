import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Linkedin } from "lucide-react";
import { articleBySlug, formatArticleDate, portfolioArticles } from "../article-utils";
import styles from "../articles.module.css";

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return portfolioArticles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = articleBySlug(slug);
  if (!article) return {};
  return {
    title: `${article.seoTitle} | Manuel Zago`,
    description: article.seoDescription,
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = articleBySlug(slug);
  if (!article) notFound();

  return (
    <main className={styles.shell}>
      <header className="topbar">
        <Link className="wordmark" href="/" aria-label="Torna al portfolio">
          <img src="/MZOS/assets/mz-monogram-forest.svg" alt="" aria-hidden="true" />
          <span>Manuel Zago</span>
        </Link>
        <p>Portfolio · Industrial Transformation</p>
        <div className="topbar-actions">
          <Link className={`quiet-action ${styles.navLink}`} href="/articles/">Articoli</Link>
          <a
            className="linkedin-action"
            href="https://www.linkedin.com/in/manuelzago/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Apri il profilo LinkedIn di Manuel Zago"
          >
            <Linkedin aria-hidden="true" focusable="false" strokeWidth={1.7} />
          </a>
        </div>
      </header>

      <article className={styles.articlePage}>
        <Link className={styles.back} href="/articles/">← Archivio articoli</Link>
        <header className={styles.articleHeader}>
          <div className={styles.meta}>
            <span>{article.category}</span>
            <time dateTime={article.publishedAt}>{formatArticleDate(article.publishedAt)}</time>
          </div>
          <h1>{article.title}</h1>
          <p>{article.abstract}</p>
        </header>

        {article.cover ? (
          <figure className={styles.heroCover}>
            {article.cover.toLowerCase().endsWith(".mp4") ? (
              <video
                src={article.cover}
                aria-label={`Copertina di ${article.title}`}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
              />
            ) : (
              <img src={article.cover} alt={`Copertina di ${article.title}`} />
            )}
          </figure>
        ) : null}

        <div className={styles.articleBody}>
          {article.blocks.map((block, index) =>
            block.type === "heading" ? (
              <h2 key={`${article.id}-${index}`}>{block.text}</h2>
            ) : (
              <p key={`${article.id}-${index}`}>{block.text}</p>
            ),
          )}
        </div>

        <footer className={styles.articleFooter}>
          <span>{article.author}</span>
          {article.linkedinUrl ? (
            <a href={article.linkedinUrl} target="_blank" rel="noreferrer">
              Apri l’originale su LinkedIn
            </a>
          ) : null}
        </footer>
      </article>

      <footer className="statusbar">
        <span>Manuel Zago · Product, Operations and Digital Systems</span>
        <span>Articolo · {formatArticleDate(article.publishedAt)}</span>
      </footer>
    </main>
  );
}
