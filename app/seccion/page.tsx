import { CatalogExplorer } from "../components/catalog-explorer";
import { catalogBooks, catalogStats } from "../components/book-data";
import { ScreenHero, ScreenShell } from "../components/screen-components";

export default function SectionPage() {
  return <ScreenShell><ScreenHero eyebrow="Catálogo completo" title={<>Historias para <em>cada lector.</em></>} intro={`Explora ${catalogStats.total} títulos por edad, tema, autor, colección o ISBN.`} /><CatalogExplorer books={catalogBooks} /></ScreenShell>;
}
