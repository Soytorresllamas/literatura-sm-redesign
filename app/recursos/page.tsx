import Link from "next/link";
import { ScreenHero, ScreenShell } from "../components/screen-components";

const resources = [
  { title: "Guías de lectura", text: "Preguntas y actividades para conversar después de cada historia.", tone: "coral" },
  { title: "Booktrailers", text: "Mira un adelanto y encuentra el tono de tu próxima lectura.", tone: "yellow" },
  { title: "Audiolibros", text: "Escucha fragmentos para compartir la lectura de otra manera.", tone: "blue" },
  { title: "Fichas docentes", text: "Material descargable para planear experiencias lectoras.", tone: "green" },
];

export default function ResourcesPage() {
  return (
    <ScreenShell>
      <ScreenHero
        eyebrow="Para acompañar la lectura"
        title={<>Más que un <em>libro.</em></>}
        intro="Recursos para que cada historia encuentre su momento en casa, en el aula o en comunidad."
      />
      <section className="screen-content">
        <div className="resource-card-grid">
          {resources.map((resource) => (
            <Link className={`resource-card resource-card-${resource.tone}`} href="/planes-lectores" key={resource.title}>
              <span>✦</span>
              <strong>{resource.title}</strong>
              <p>{resource.text}</p>
              <b>Explorar ↗</b>
            </Link>
          ))}
        </div>
      </section>
    </ScreenShell>
  );
}
