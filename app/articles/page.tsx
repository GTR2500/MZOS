import type { Metadata } from "next";
import Link from "next/link";
import { Linkedin } from "lucide-react";
import { articleMetric, formatArticleDate, portfolioArticles } from "./article-utils";
import styles from "./articles.module.css";

export const metadata: Metadata = {
  title: "Articoli | Manuel Zago",
  description: "Articoli su trasformazione industriale, operations, sistemi digitali, dati e governance.",
};

export default function ArticlesPage() {
  return (
    <main className={styles.shell}>
      <header className="topbar">
        <Link className="wordmark" href="/" aria-label="Torna al portfolio">
          <img src="/MZOS/assets/mz-monogram-forest.svg" alt="" aria-hidden="true" />
          <span>Manuel Zago</span>
        </Link>
        <p>Portfolio · Industrial Transformation</p>
        <div className="topbar-actions">
          <Link className={`quiet-action ${styles.navLink}`} href="/">Portfolio</Link>
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

      <section className={styles.archive}>
        <header className={styles.archiveHeader}>
          <div>
            <p>Archivio editoriale</p>
            <h1>Articoli</h1>
          </div>
          <strong>{String(portfolioArticles.length).padStart(2, "0")}</strong>
          <span>
            Esperienza industriale, sistemi, decisioni e trasformazione letti dal lavoro reale.
          </span>
        </header>

        <div className={styles.list}>
          {portfolioArticles.map((article) => {
            const metric = articleMetric(article);
            return (
              <article className={styles.card} key={article.id}>
                {article.cover ? (
                  <Link className={styles.cover} href={`/articles/${article.slug}/`}>
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
                  </Link>
                ) : null}
                <div className={styles.copy}>
                  <div className={styles.meta}>
                    <span>{article.category}</span>
                    <time dateTime={article.publishedAt}>{formatArticleDate(article.publishedAt)}</time>
                    {metric ? <span>{metric}</span> : null}
                  </div>
                  <h2>
                    <Link href={`/articles/${article.slug}/`}>{article.title}</Link>
                  </h2>
                  <p>{article.abstract}</p>
                  <div className={styles.actions}>
                    <Link href={`/articles/${article.slug}/`}>Leggi l’articolo</Link>
                    {article.linkedinUrl ? (
                      <a href={article.linkedinUrl} target="_blank" rel="noreferrer">LinkedIn</a>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <footer className="statusbar">
        <span>Manuel Zago · Product, Operations and Digital Systems</span>
        <span>{portfolioArticles.length} articoli pubblicati</span>
      </footer>
    </main>
  );
}
