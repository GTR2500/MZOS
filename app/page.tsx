"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import {
  Bot,
  Boxes,
  BrainCircuit,
  Cog,
  Factory,
  FileText,
  Linkedin,
  Maximize2,
  MonitorCog,
  Network,
  Package as PackageIcon,
  PencilRuler,
  Play,
  ShieldCheck,
  UsersRound,
  Workflow,
  Wrench,
  X,
} from "lucide-react";
import { capabilities, caseDomains, caseProjection, cases, domains, type Capability, type CaseStudy, type Domain } from "./cases";
import { caseMedia, featuredStories, lensMessages } from "./stories";

const ALL = "Tutti" as const;
type Lens = Capability | Domain | typeof ALL;
const DEFAULT_HERO = "Il problema appare in un punto. La causa quasi mai vive lì.";

type MediaPreview =
  | { kind: "image"; src: string; alt: string }
  | { kind: "video"; youtube: string; title: string }
  | { kind: "document"; src: string; title: string };

const WMC_MANUAL_PDF = "/MZOS/assets/Hantarex_LCD_40_WMC_Inside_manuale.pdf";

function isCapability(value: Lens): value is Capability {
  return capabilities.includes(value as Capability);
}

const lensIcons = {
  Macchina: Cog,
  Prodotto: PackageIcon,
  Reparto: UsersRound,
  Fabbrica: Factory,
  Sistema: Network,
  Meccanica: Wrench,
  "Design di prodotto": PencilRuler,
  Automazione: Bot,
  Industrializzazione: Boxes,
  Operations: Workflow,
  "Sistemi digitali": MonitorCog,
  "Dati & IA": BrainCircuit,
  Governance: ShieldCheck,
} satisfies Record<Capability | Domain, typeof Cog>;

function LensIcon({ lens }: { lens: Capability | Domain }) {
  const Icon = lensIcons[lens];
  return <Icon aria-hidden="true" focusable="false" strokeWidth={1.65} />;
}
const methodSteps = [
  ["01", "Anomalia", "Parto da ciò che non torna, non dal compito così come viene presentato."],
  ["02", "Struttura reale", "Separo gli effetti dalle cause e ricostruisco dipendenze, vincoli e responsabilità."],
  ["03", "Decisione", "Delimito l’incertezza e individuo le informazioni davvero necessarie per scegliere."],
  ["04", "Trasformazione", "Modifico flussi, sequenze e condizioni perché attività differenti possano convergere."],
  ["05", "Standard", "Porto la soluzione nella realtà e la trasformo in una capacità ripetibile e governabile."],
  ["06", "Apprendimento", "Conservo decisioni e risultati affinché il sistema possa comprendere e migliorare."],
] as const;

const capabilitySpokes = [
  [50, 8],
  [87, 35],
  [79, 82],
  [21, 82],
  [13, 35],
] as const;

export default function Home() {
  const root = useRef<HTMLElement>(null);
  const storyPanel = useRef<HTMLElement>(null);
  const methodPanel = useRef<HTMLElement>(null);
  const mediaPanel = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<Lens>(ALL);
  const [selected, setSelected] = useState<CaseStudy | null>(null);
  const [methodOpen, setMethodOpen] = useState(false);
  const [visited, setVisited] = useState<string[]>([]);
  const [previewLens, setPreviewLens] = useState<Capability | Domain | null>(null);
  const [heroEcho, setHeroEcho] = useState<string | null>(null);
  const [mediaPreview, setMediaPreview] = useState<MediaPreview | null>(null);

  const visibleCases = useMemo(
    () => filter === ALL
      ? cases
      : isCapability(filter)
        ? cases.filter((item) => item.capability === filter)
        : cases.filter((item) => caseDomains[item.id]?.includes(filter)),
    [filter],
  );

  const relatedDomains = useMemo(
    () => new Set(visibleCases.flatMap((item) => caseDomains[item.id] ?? [])),
    [visibleCases],
  );

  const relatedCapabilities = useMemo(
    () => new Set(visibleCases.map((item) => item.capability)),
    [visibleCases],
  );

  const insight = visited.length === 0
    ? "Scegli un segnale. Segui ciò che collega."
    : visited.length === 1
      ? "Un caso può sembrare un’eccezione. Il secondo rivela il metodo."
      : visited.length < 4
        ? "La costante non è il settore. È il modo di leggere il sistema."
        : "Dalla macchina al sistema: cambia la scala, non cambia la logica.";

  const featuredStory = selected ? featuredStories.find((story) => story.id === selected.id) : undefined;
  const selectedMedia = selected ? caseMedia[selected.id] : undefined;
  const heroMessage = previewLens
    ? lensMessages[previewLens]
    : filter !== ALL
      ? lensMessages[filter]
      : heroEcho ?? DEFAULT_HERO;

  useEffect(() => {
    if (!root.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".topbar", { y: -14, opacity: 0, duration: 0.7 })
        .from(".intro-line", { y: 28, opacity: 0, duration: 0.85, stagger: 0.09 }, "-=0.3")
        .from(".system-map", { scale: 0.94, opacity: 0, filter: "blur(14px)", duration: 1.1 }, "-=0.55")
        .from(".processor", { scale: 0.82, opacity: 0, duration: 0.95 }, "-=0.8")
        .fromTo(
          ".capability-node, .domain-node",
          { opacity: 0 },
          { opacity: 1, duration: 0.65, stagger: 0.035, clearProps: "opacity", ease: "power3.out" },
          "-=0.68",
        )
        .from(".case-index", { x: 28, opacity: 0, duration: 0.8 }, "-=0.6");
      gsap.fromTo(".connection-field line", { opacity: 0, strokeDashoffset: 4 }, { opacity: 1, strokeDashoffset: 0, duration: 1.4, stagger: 0.035, ease: "power2.out" });
      gsap.to(".processor-glow", {
        scale: 1.14,
        opacity: 0.92,
        duration: 3.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      const map = root.current?.querySelector<HTMLElement>(".system-map");
      const processor = map?.querySelector<HTMLElement>(".processor");
      const glow = map?.querySelector<HTMLElement>(".processor-glow");
      if (!map || !processor || !glow) return;

      const move = (event: PointerEvent) => {
        const bounds = map.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;
        gsap.to(processor, { x: x * 7, y: y * 7, rotationY: x * 5, rotationX: y * -5, duration: 0.7, ease: "power3.out", overwrite: "auto" });
        gsap.to(glow, { x: x * 18, y: y * 18, duration: 1, ease: "power3.out", overwrite: "auto" });
      };
      const leave = () => {
        gsap.to(processor, { x: 0, y: 0, rotationY: 0, rotationX: 0, duration: 1, ease: "elastic.out(1, .45)" });
        gsap.to(glow, { x: 0, y: 0, duration: 1, ease: "power3.out" });
      };
      map.addEventListener("pointermove", move);
      map.addEventListener("pointerleave", leave);
      return () => {
        map.removeEventListener("pointermove", move);
        map.removeEventListener("pointerleave", leave);
      };
    }, root);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!root.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.fromTo(
      ".case-row",
      { x: 14, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.34, stagger: 0.025, ease: "power2.out", overwrite: true },
    );
  }, [filter]);

  useEffect(() => {
    if (!root.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.fromTo(
      ".dynamic-hero-line",
      { y: 12, opacity: 0.18, filter: "blur(5px)" },
      { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.42, ease: "power3.out", overwrite: true },
    );
  }, [heroMessage]);

  useEffect(() => {
    if (!selected || !storyPanel.current) return;
    document.body.style.overflow = "hidden";
    storyPanel.current.focus();
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.fromTo(
        storyPanel.current,
        { clipPath: "inset(0 0 0 100%)" },
        { clipPath: "inset(0 0 0 0%)", duration: 0.62, ease: "power4.inOut" },
      );
      gsap.fromTo(
        storyPanel.current.querySelectorAll(".story-reveal"),
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.06, delay: 0.25, ease: "power3.out" },
      );
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selected]);

  useEffect(() => {
    if (!methodOpen || !methodPanel.current) return;
    document.body.style.overflow = "hidden";
    methodPanel.current.focus();
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(methodPanel.current, { clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0% 0 0 0)", duration: 0.72, ease: "power4.inOut" })
        .fromTo(".method-reveal", { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.58, stagger: 0.055 }, "-=0.28")
        .fromTo(".method-path", { scaleX: 0 }, { scaleX: 1, duration: 1, transformOrigin: "left center" }, "-=0.6");
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [methodOpen]);

  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (mediaPreview) {
          setMediaPreview(null);
          return;
        }
        setSelected(null);
        setMethodOpen(false);
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [mediaPreview]);

  useEffect(() => {
    if (!mediaPreview || !mediaPanel.current) return;
    mediaPanel.current.focus();
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.fromTo(
        mediaPanel.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.24, ease: "power2.out" },
      );
      gsap.fromTo(
        mediaPanel.current.querySelector(".media-lightbox-content"),
        { scale: 0.94, y: 12 },
        { scale: 1, y: 0, duration: 0.38, ease: "power3.out" },
      );
    }
  }, [mediaPreview]);

  function openCase(item: CaseStudy) {
    setMediaPreview(null);
    setSelected(item);
    setVisited((current) => current.includes(item.id) ? current : [...current, item.id]);
    const story = featuredStories.find((entry) => entry.id === item.id);
    setHeroEcho(story?.residue ?? item.implication);
  }

  function chooseLens(item: Capability | Domain) {
    setFilter((current) => current === item ? ALL : item);
    if (window.matchMedia("(max-width: 920px)").matches) {
      document.querySelector(".case-index")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function resetSystem() {
    setFilter(ALL);
    setHeroEcho(null);
    setPreviewLens(null);
  }

  return (
    <main className="site-shell" ref={root}>
      <header className="topbar">
        <a className="wordmark" href="#top" aria-label="Manuel Zago, inizio pagina">
          <img src="/MZOS/assets/mz-monogram-forest.svg" alt="" aria-hidden="true" />
          <span>Manuel Zago</span>
        </a>
        <p>Portfolio · Industrial Transformation</p>
        <div className="topbar-actions">
          <a className="quiet-action" href="/MZOS/articles/" style={{ textDecoration: "none" }}>Articoli</a>
          <a
            className="linkedin-action"
            href="https://www.linkedin.com/in/manuelzago/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Apri il profilo LinkedIn di Manuel Zago in una nuova scheda"
          >
            <Linkedin aria-hidden="true" focusable="false" strokeWidth={1.7} />
          </a>
          <button className="quiet-action" type="button" onClick={() => setMethodOpen(true)}>
            Il metodo
          </button>
        </div>
      </header>

      <section className="viewport" id="top" aria-label="Portfolio di Manuel Zago">
        <div className="positioning">
          <p className="eyebrow intro-line">Industrial Transformation Executive</p>
          <h1 className="intro-line dynamic-hero-line" aria-live="polite">{heroMessage}</h1>
          <p className="lead intro-line">
            Macchine, prodotti, reparti, fabbriche e sistemi sono scale dello stesso lavoro: leggere le dipendenze invisibili e trasformarle in capacità operative.
          </p>
          <div className="recognition-sequence intro-line" aria-label="Dalla manifestazione del problema alla capacità">
            <span>Segnale</span><i aria-hidden="true" />
            <span>Struttura</span><i aria-hidden="true" />
            <span>Capacità</span>
          </div>
          <button className="method-entry intro-line" type="button" onClick={() => setMethodOpen(true)}>
            <span>La trasformazione raramente manca di iniziative.</span>
            <strong>Manca chi le rende un unico sistema.</strong>
            <i>Segui le connessioni →</i>
          </button>
        </div>

        <div className={`system-map ${filter !== ALL ? "has-selection" : ""} ${filter !== ALL && !isCapability(filter) ? "domain-selected" : ""}`} aria-label="Cinque scale e otto domini collegati">
          <div className="ambient ambient-a" aria-hidden="true" />
          <div className="ambient ambient-b" aria-hidden="true" />
          <svg className="connection-field" viewBox="0 0 100 100" aria-hidden="true">
            <g className="capability-connections">
              {capabilitySpokes.map(([x, y], index) => (
                <line
                  key={capabilities[index]}
                  x1="50"
                  y1="50"
                  x2={x}
                  y2={y}
                  data-related={relatedCapabilities.has(capabilities[index])}
                  data-active={filter === capabilities[index]}
                />
              ))}
            </g>
          </svg>
          <div className="processor-glow" aria-hidden="true" />
          <div className={`processor-stage ${filter !== ALL ? "is-recessed" : ""}`}>
            <button className="processor" type="button" onClick={resetSystem} aria-label="Mostra tutte le storie">
              <span className="processor-kicker">Il nucleo</span>
              <img className="processor-monogram" src="/MZOS/assets/mz-monogram-bone.svg" alt="" aria-hidden="true" />
              <span className="processor-message">
                <span>legge · connette</span>
                <span>rende stabile</span>
              </span>
            </button>
          </div>
          {capabilities.map((item, index) => (
            <button
              className={`capability-node node-${index + 1} ${filter === item ? "is-active is-focused" : ""}`}
              type="button"
              onClick={() => chooseLens(item)}
              onPointerEnter={() => setPreviewLens(item)}
              onPointerLeave={() => setPreviewLens(null)}
              onFocus={() => setPreviewLens(item)}
              onBlur={() => setPreviewLens(null)}
              key={item}
              aria-pressed={filter === item}
              aria-controls="case-archive"
              aria-label={`${filter === item ? "Rimuovi" : "Applica"} la lente ${item}`}
              data-related={relatedCapabilities.has(item)}
            >
              <span className="satellite-mark" aria-hidden="true">
                <LensIcon lens={item} />
                <b>{String(index + 1).padStart(2, "0")}</b>
              </span>
              <span className="satellite-label">{item}</span>
            </button>
          ))}
          <div className="domain-system" aria-label="Domini attraversati e integrati">
            <span className="domain-system-title">Competenze trasversali</span>
            {domains.map((domain, index) => (
              <button
                type="button"
                className={`domain-node domain-${index + 1} ${filter === domain ? "is-active is-focused" : ""}`}
                key={domain}
                onClick={() => chooseLens(domain)}
                onPointerEnter={() => setPreviewLens(domain)}
                onPointerLeave={() => setPreviewLens(null)}
                onFocus={() => setPreviewLens(domain)}
                onBlur={() => setPreviewLens(null)}
                aria-pressed={filter === domain}
                aria-controls="case-archive"
                aria-label={`${filter === domain ? "Rimuovi" : "Applica"} la lente ${domain}`}
                data-related={relatedDomains.has(domain)}
              >
                <span className="domain-glyph" aria-hidden="true"><LensIcon lens={domain} /></span>
                <span className="satellite-label">{domain}</span>
              </button>
            ))}
          </div>
          <span className="orbit orbit-a" aria-hidden="true" />
          <span className="orbit orbit-b" aria-hidden="true" />
          <p className="map-caption" aria-hidden="true"><span>05</span> scale <i /> <span>08</span> domini <i /> una sola architettura</p>
        </div>

        <aside className="case-index" id="case-archive" aria-label="Indice delle storie">
          <div className="index-head">
            <div>
              <span>Archivio</span>
              <strong>{filter === ALL ? "Storie" : filter}</strong>
            </div>
            <span className="count">{String(visibleCases.length).padStart(2, "0")}</span>
          </div>
          <div className="filters" aria-label="Filtra per capacità">
            <button type="button" onClick={() => setFilter(ALL)} className={filter === ALL ? "active" : ""}>Tutte</button>
            {capabilities.map((item) => (
              <button type="button" onClick={() => setFilter(item)} className={filter === item ? "active" : ""} key={item}>{item}</button>
            ))}
          </div>
          <p className="insight-line" aria-live="polite">{insight}</p>
          <div className="case-list">
            {filter === ALL && <p className="case-tier-label case-tier-label-fundamental">Storie in evidenza oggi</p>}
            {visibleCases.map((item, index) => (
              <Fragment key={item.id}>
                {filter === ALL && index === 6 && <p className="case-tier-label">Altre storie</p>}
                <button
                  className={`case-row ${item.fundamental ? "case-row-fundamental" : ""}`}
                  type="button"
                  onClick={() => openCase(item)}
                >
                  <span className="row-number">{item.number}</span>
                  <span className="row-copy">
                    {item.fundamental && <em>In evidenza oggi</em>}
                    <strong>{item.title}</strong>
                    <small>{item.context}</small>
                  </span>
                  <span className="row-arrow" aria-hidden="true">→</span>
                </button>
              </Fragment>
            ))}
          </div>
        </aside>
      </section>

      <footer className="statusbar">
        <span>Manuel Zago · Product, Operations and Digital Systems</span>
        <span>19 storie · 5 scale · 8 domini</span>
      </footer>

      {selected && (
        <section className="story-panel" ref={storyPanel} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="story-title">
          <div className="story-top story-reveal">
            <div className="story-brand">
              <span>{selected.number}</span>
              <strong>{selected.capability}</strong>
            </div>
            <button type="button" onClick={() => setSelected(null)} aria-label="Chiudi la storia">Chiudi <span>×</span></button>
          </div>
          <div className={`story-grid ${featuredStory ? "story-grid-editorial" : ""}`}>
            <div className={`story-title story-reveal ${featuredStory ? "has-editorial" : ""}`}>
              <p>{selected.context} · {selected.period}</p>
              <h2 id="story-title">{selected.title}</h2>
              <p className="story-summary">{selected.summary}</p>
              <div className="story-domains" aria-label="Domini integrati in questo caso">
                {(caseDomains[selected.id] ?? []).map((domain) => (
                  <button key={domain} type="button" onClick={() => { setSelected(null); setFilter(domain); }}>{domain}</button>
                ))}
              </div>
              {selectedMedia?.image && (
                <figure className="story-media story-media-single">
                  <button
                    className="media-trigger"
                    type="button"
                    onClick={() => setMediaPreview({
                      kind: "image",
                      src: selectedMedia.image!,
                      alt: `Documento visivo del caso ${selected.title}`,
                    })}
                    aria-label={`Ingrandisci l'immagine del caso ${selected.title}`}
                  >
                    <img src={selectedMedia.image} alt={`Documento visivo del caso ${selected.title}`} />
                    {selectedMedia.caption && <span className="media-context-label">{selectedMedia.caption}</span>}
                    <span className="media-expand" aria-hidden="true"><Maximize2 /></span>
                  </button>
                </figure>
              )}
              {(selectedMedia?.gallery || selectedMedia?.youtube) && (
                <div className={`story-media-cluster ${selectedMedia.gallery && selectedMedia.youtube ? "is-combined" : ""}`}>
                  {selectedMedia.youtube && (
                    <button
                      className="story-media story-video story-video-trigger"
                      type="button"
                      onClick={() => setMediaPreview({
                        kind: "video",
                        youtube: selectedMedia.youtube!,
                        title: `Video del caso ${selected.title}`,
                      })}
                      aria-label={`Apri a centro schermo il video del caso ${selected.title}`}
                    >
                      <img
                        src={`https://i.ytimg.com/vi/${selectedMedia.youtube}/hqdefault.jpg`}
                        alt=""
                        loading="lazy"
                      />
                      <span className="story-video-overlay"><Play aria-hidden="true" /> Guarda il video</span>
                      <span className="media-expand" aria-hidden="true"><Maximize2 /></span>
                    </button>
                  )}
                  {selectedMedia.gallery && (
                    <div
                      className={`story-media story-media-gallery gallery-${selectedMedia.gallery.length} ${selected.id === "power-center" ? "thermal-gallery" : ""}`}
                      aria-label={`Immagini del caso ${selected.title}`}
                    >
                      {selectedMedia.gallery.map((image, index) => (
                        <figure key={image}>
                          <button
                            className={`media-trigger ${selected.id === "wmc-inside" && index === 2 ? "media-document-trigger" : ""}`}
                            type="button"
                            onClick={() => setMediaPreview(
                              selected.id === "wmc-inside" && index === 2
                                ? { kind: "document", src: WMC_MANUAL_PDF, title: "Manuale originale Hantarex LCD 40 WMC Inside" }
                                : { kind: "image", src: image, alt: `${selected.title}, immagine ${index + 1}` },
                            )}
                            aria-label={selected.id === "wmc-inside" && index === 2
                              ? "Apri il manuale originale Hantarex LCD 40 WMC Inside"
                              : `Ingrandisci ${selected.title}, immagine ${index + 1}`}
                          >
                            <img src={image} alt={`${selected.title}, immagine ${index + 1}`} />
                            {selectedMedia.galleryCaptions?.[index] && (
                              <span className="media-context-label">{selectedMedia.galleryCaptions[index]}</span>
                            )}
                            {selected.id === "wmc-inside" && index === 2 ? (
                              <span className="media-document-badge" aria-hidden="true"><FileText /> Manuale originale <small>PDF · 8 pagine</small></span>
                            ) : (
                              <span className="media-expand" aria-hidden="true"><Maximize2 /></span>
                            )}
                          </button>
                        </figure>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="story-body">
              {featuredStory && (
                <article className="story-reveal story-anecdote">
                  <span>La storia</span>
                  <h3>{featuredStory.opening}</h3>
                  <p>{featuredStory.body}</p>
                  <strong>{featuredStory.residue}</strong>
                  {featuredStory.sources && (
                    <div className="story-sources" aria-label="Fonti ufficiali del caso">
                      {featuredStory.sources.map((source) => (
                        <a key={source.href} href={source.href} target="_blank" rel="noreferrer">{source.label} <span aria-hidden="true">↗</span></a>
                      ))}
                    </div>
                  )}
                </article>
              )}
              <article className="story-reveal"><span>Ciò che non tornava</span><p>{selected.premise}</p></article>
              <article className="story-reveal"><span>La leva</span><p>{selected.move}</p></article>
              <article className="story-reveal"><span>La prova</span><p>{selected.result}</p></article>
              <article className="story-reveal implication"><span>Ciò che è rimasto</span><p>{selected.implication}</p></article>
              <article className="story-reveal projection"><span>La domanda per la tua azienda</span><p>{caseProjection[selected.id]}</p></article>
            </div>
          </div>
          <div className="story-nav story-reveal">
            <span>Non è il settore a collegare le storie. È la struttura dell’intervento.</span>
            <button type="button" onClick={() => {
              const sequence = visibleCases.length ? visibleCases : cases;
              const current = sequence.findIndex((item) => item.id === selected.id);
              openCase(sequence[(current + 1) % sequence.length]);
            }}>Storia successiva <span>→</span></button>
          </div>
        </section>
      )}

      {mediaPreview && (
        <div
          className="media-lightbox"
          ref={mediaPanel}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label={mediaPreview.kind === "image" ? mediaPreview.alt : mediaPreview.title}
          onClick={() => setMediaPreview(null)}
        >
          <button
            className="media-lightbox-close"
            type="button"
            onClick={() => setMediaPreview(null)}
            aria-label="Chiudi visualizzazione ingrandita"
          >
            <span>Chiudi</span><X aria-hidden="true" />
          </button>
          <div className="media-lightbox-content" onClick={(event) => event.stopPropagation()}>
            {mediaPreview.kind === "image" ? (
              <img src={mediaPreview.src} alt={mediaPreview.alt} />
            ) : mediaPreview.kind === "video" ? (
              <div className="media-lightbox-video">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${mediaPreview.youtube}?autoplay=1&rel=0`}
                  title={mediaPreview.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="media-lightbox-document">
                <iframe src={`${mediaPreview.src}#page=2&view=FitH`} title={mediaPreview.title} />
                <a href={mediaPreview.src} target="_blank" rel="noreferrer">Apri il PDF in una nuova scheda</a>
              </div>
            )}
          </div>
        </div>
      )}

      {methodOpen && (
        <section className="method-panel" ref={methodPanel} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="method-title">
          <div className="method-top method-reveal">
            <div><span>Il metodo</span><strong>Come affronto i sistemi complessi</strong></div>
            <button type="button" onClick={() => setMethodOpen(false)} aria-label="Chiudi il metodo">Chiudi <span>×</span></button>
          </div>
          <div className="method-hero">
            <div className="method-statement method-reveal">
              <p>Inclinare i piani</p>
              <h2 id="method-title">Il cambiamento regge quando entra nella geometria del sistema.</h2>
            </div>
            <div className="method-explanation method-reveal">
              <p>Non affido il risultato soltanto alla pressione sulle persone. Modifico condizioni, sequenze, informazioni, responsabilità e vincoli affinché la direzione corretta diventi anche quella più naturale.</p>
              <p>Meccanica, prodotto, automazione, operations, digitale, dati e governance non sono competenze esposte in vetrina. Sono leve diverse, scelte e collegate in funzione dell’obiettivo.</p>
            </div>
          </div>
          <div className="method-sequence" aria-label="Dal problema alla capacità">
            <span className="method-path" aria-hidden="true" />
            {methodSteps.map(([number, title, copy]) => (
              <article className="method-step method-reveal" key={number}>
                <span>{number}</span>
                <strong>{title}</strong>
                <p>{copy}</p>
              </article>
            ))}
          </div>
          <div className="method-close method-reveal">
            <p>La differenza non è risolvere di più.</p>
            <strong>È vedere abbastanza del sistema da impedire che lo stesso problema continui a riprodursi altrove.</strong>
            <button type="button" onClick={() => setMethodOpen(false)}>Esplora le prove <span>→</span></button>
          </div>
        </section>
      )}
    </main>
  );
}
