import { ScreenHero, ScreenShell } from "../components/screen-components";

const authors = ["M. B. Brozon", "Carles Ballesteros", "Rachel Elliot", "Ana Romero", "David Lozano", "Enrique Escalona"];
export default function AuthorsPage() {
  return <ScreenShell><ScreenHero eyebrow="Voces detrás de las historias" title={<>Conoce a nuestros <em>autores.</em></>} intro="Personas que escriben, ilustran y hacen posible cada encuentro con la lectura." /><section className="screen-content"><div className="author-grid">{authors.map((author, index) => <a className="author-card" href="/autor" key={author}><span className={`author-avatar author-avatar-${index % 4}`}>{author.split(" ").map((word) => word[0]).join("").slice(0, 2)}</span><span><strong>{author}</strong><small>{index % 2 ? "Autor e ilustrador" : "Autor"}</small></span><b>↗</b></a>)}</div></section></ScreenShell>;
}
