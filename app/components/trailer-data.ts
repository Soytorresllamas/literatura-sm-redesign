import sourceTrailers from "../../data/catalog/trailer-index.json";
import { getYouTubeId, youTubeThumbnailUrl } from "../lib/youtube";

type RawTrailerEntry = {
  slug: string;
  title: string;
  author: string;
  age: string;
  ageGroup: string;
  novelty: boolean;
  trailer: string;
};

export type TrailerEntry = Omit<RawTrailerEntry, "trailer"> & { videoId: string; thumbnail: string };

export const trailerEntries: TrailerEntry[] = (sourceTrailers as RawTrailerEntry[]).flatMap(({ trailer, ...entry }) => {
  const videoId = getYouTubeId(trailer);
  return videoId ? [{ ...entry, videoId, thumbnail: youTubeThumbnailUrl(videoId) }] : [];
});

export const featuredTrailer = trailerEntries.find((entry) => entry.novelty) ?? trailerEntries[0];

const rowOrder = ["0–5", "6–8", "9–11", "12–14", "Secundaria", "Bachillerato"];
const rowLabels: Record<string, string> = {
  "0–5": "Primeros lectores · 0 a 5 años",
  "6–8": "Para 6 a 8 años",
  "9–11": "Para 9 a 11 años",
  "12–14": "Para 12 a 14 años",
  Secundaria: "Secundaria",
  Bachillerato: "Bachillerato y jóvenes adultos",
};

export type TrailerRow = { ageGroup: string; label: string; trailers: TrailerEntry[] };

export function getTrailerRows(): TrailerRow[] {
  const groups = new Map<string, TrailerEntry[]>();
  for (const entry of trailerEntries) {
    const list = groups.get(entry.ageGroup) ?? [];
    list.push(entry);
    groups.set(entry.ageGroup, list);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => {
      const aIndex = rowOrder.indexOf(a);
      const bIndex = rowOrder.indexOf(b);
      return (aIndex === -1 ? rowOrder.length : aIndex) - (bIndex === -1 ? rowOrder.length : bIndex) || a.localeCompare(b, "es");
    })
    .map(([ageGroup, trailers]) => ({ ageGroup, label: rowLabels[ageGroup] ?? ageGroup, trailers }));
}
