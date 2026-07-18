"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { youTubeEmbedUrl } from "../lib/youtube";
import type { TrailerEntry, TrailerRow } from "./trailer-data";

type Props = { featured: TrailerEntry; rows: TrailerRow[] };

export function TrailerTheater({ featured, rows }: Props) {
  const [active, setActive] = useState(featured);
  const [playing, setPlaying] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);

  const openTrailer = (trailer: TrailerEntry) => {
    setActive(trailer);
    setPlaying(true);
    stageRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="trailer-theater">
      <div className="trailer-stage" ref={stageRef}>
        {playing ? (
          <iframe
            src={youTubeEmbedUrl(active.videoId)}
            title={`Booktrailer de ${active.title}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button className="trailer-stage-poster" type="button" onClick={() => setPlaying(true)} aria-label={`Reproducir el booktrailer de ${active.title}`}>
            <Image src={active.thumbnail} alt="" fill sizes="(max-width: 850px) 92vw, 1180px" priority />
            <span className="trailer-play" aria-hidden="true">▶</span>
          </button>
        )}
      </div>
      <div className="trailer-meta">
        <div>
          <p className="eyebrow">{active.age} · Booktrailer</p>
          <h2>{active.title}</h2>
          <p className="trailer-author">{active.author}</p>
        </div>
        <Link className="dark-button" href={`/libro/${active.slug}`}>Ver ficha del libro <span>↗</span></Link>
      </div>
      <div className="trailer-rows">
        {rows.map((row) => (
          <section key={row.ageGroup} aria-label={`Booktrailers ${row.label}`}>
            <h3>{row.label}</h3>
            <div className="trailer-strip">
              {row.trailers.map((trailer) => (
                <button
                  key={trailer.slug}
                  type="button"
                  className={`trailer-card ${trailer.slug === active.slug ? "is-active" : ""}`}
                  aria-label={`Reproducir el booktrailer de ${trailer.title}`}
                  onClick={() => openTrailer(trailer)}
                >
                  <span className="trailer-thumb">
                    <Image src={trailer.thumbnail} alt="" fill sizes="300px" />
                    <span className="trailer-card-play" aria-hidden="true">▶</span>
                  </span>
                  <strong>{trailer.title}</strong>
                  <small>{trailer.author}</small>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
