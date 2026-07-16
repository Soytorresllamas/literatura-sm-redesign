import type { CSSProperties } from "react";

type Props = { title: string; author?: string; color: string; accent: string; image?: string; large?: boolean };

export function BookCover({ title, author, color, accent, image, large = false }: Props) {
  return (
    <div className={`book-cover ${large ? "book-cover-large" : ""} ${image ? "book-cover-real" : ""}`} style={{ background: color } as CSSProperties} aria-label={image ? `Portada de ${title}` : `Portada conceptual de ${title}`}>
      {image && <img className="cover-image" src={image} alt={`Portada de ${title}`} />}
      {!image && <>
      <span className="cover-sun" style={{ background: accent }} />
      <span className="cover-mark" style={{ color: accent }}>SM</span>
      <div className="cover-title" style={{ color: accent }}>{title}</div>
      {author && <div className="cover-author" style={{ color: accent }}>{author}</div>}
      <span className="cover-line" style={{ background: accent }} />
      </>}
    </div>
  );
}
