"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import { useState } from "react";

type Props = { title: string; author?: string; color: string; accent: string; image?: string; large?: boolean };

export function BookCover({ title, author, color, accent, image, large = false }: Props) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(image) && !imageFailed;
  return (
    <div className={`book-cover ${large ? "book-cover-large" : ""} ${showImage ? "book-cover-real" : ""}`} style={{ background: color } as CSSProperties} aria-label={showImage ? `Portada de ${title}` : `Portada conceptual de ${title}`}>
      {showImage && <Image className="cover-image" src={image} alt={`Portada de ${title}`} fill sizes="(max-width: 560px) 92vw, (max-width: 900px) 45vw, 300px" onError={() => setImageFailed(true)} />}
      {!showImage && <>
      <span className="cover-sun" style={{ background: accent }} />
      <span className="cover-mark" style={{ color: accent }}>SM</span>
      <div className="cover-title" style={{ color: accent }}>{title}</div>
      {author && <div className="cover-author" style={{ color: accent }}>{author}</div>}
      <span className="cover-line" style={{ background: accent }} />
      </>}
    </div>
  );
}
