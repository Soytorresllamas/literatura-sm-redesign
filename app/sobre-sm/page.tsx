import { ScreenHero, ScreenShell } from "../components/screen-components";

export default function AboutPage() {
  return <ScreenShell><ScreenHero eyebrow="Editorial SM" title={<>Leer el mundo, <em>juntos.</em></>} intro="Creamos libros y experiencias que acompañan a lectores de todas las edades." /><section className="manifesto"><p className="eyebrow">Nuestra mirada</p><h2>Una buena historia puede cambiar la forma en que vemos lo que nos rodea.</h2><p>En SM trabajamos para acercar literatura de calidad a niñas, niños, jóvenes, familias y docentes.</p></section><section className="value-grid"><div><strong>Curiosidad</strong><p>Historias que abren preguntas.</p></div><div><strong>Diversidad</strong><p>Voces y mundos para reconocernos.</p></div><div><strong>Comunidad</strong><p>Lecturas para compartir.</p></div></section></ScreenShell>;
}
