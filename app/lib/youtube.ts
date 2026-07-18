// Helpers puros para los booktrailers alojados en YouTube.

const YOUTUBE_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

export function getYouTubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  const host = parsed.hostname.replace(/^www\./, "");
  let candidate: string | null = null;
  if (host === "youtu.be") {
    candidate = parsed.pathname.slice(1).split("/")[0] || null;
  } else if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
    if (parsed.pathname === "/watch") {
      candidate = parsed.searchParams.get("v");
    } else {
      const match = parsed.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/);
      candidate = match?.[1] ?? null;
    }
  }
  return candidate && YOUTUBE_ID_PATTERN.test(candidate) ? candidate : null;
}

export function youTubeThumbnailUrl(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

export function youTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;
}
