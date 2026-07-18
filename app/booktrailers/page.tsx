import type { Metadata } from "next";
import { SectionHeader } from "../components/section-header";
import { SiteFooter } from "../components/site-footer";
import { featuredTrailer, getTrailerRows, trailerEntries } from "../components/trailer-data";
import { TrailerTheater } from "../components/trailer-theater";

export const metadata: Metadata = {
  title: "Booktrailers | SM Literatura",
  description: "Mira los booktrailers del catálogo de Literatura SM: videos para conocer cada historia antes de leerla, organizados por edad.",
  alternates: { canonical: "/booktrailers" },
};

export default function BooktrailersPage() {
  const rows = getTrailerRows();

  return (
    <main className="trailers-page">
      <SectionHeader />
      <section className="trailers-hero">
        <p className="eyebrow">Booktrailers · {trailerEntries.length} videos</p>
        <h1>Dale play a tu<br /><em>próxima lectura.</em></h1>
        <p className="trailers-intro">Historias que se dejan ver antes de leerse. Elige una edad, reproduce el trailer y llega a la ficha del libro.</p>
      </section>
      <TrailerTheater featured={featuredTrailer} rows={rows} />
      <SiteFooter />
    </main>
  );
}
