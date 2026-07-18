import Link from "next/link";
import { readingPlans } from "../components/book-data";
import { PlanCarousel } from "../components/plan-carousel";
import { ScreenHero, ScreenShell } from "../components/screen-components";

export default function ReadingPlansPage() {
  return (
    <ScreenShell>
      <ScreenHero
        eyebrow="Para docentes"
        title={<>Arma tu plan lector <em>con intención.</em></>}
        intro="Encuentra lecturas adecuadas para cada grupo, propósito y momento del ciclo escolar."
      />
      <section className="plan-builder">
        <div>
          <p className="eyebrow">Planificador</p>
          <h2>Empieza por tu grupo.</h2>
          <p>Selecciona grado, nivel y objetivo. Después podrás guardar y compartir tu selección con tu equipo.</p>
        </div>
        <div className="plan-form">
          <label>
            Grado
            <select>
              <option>Selecciona un grado</option>
              <option>Preescolar</option>
              <option>Primaria</option>
              <option>Secundaria</option>
              <option>Bachillerato</option>
            </select>
          </label>
          <label>
            Propósito
            <select>
              <option>Selecciona un propósito</option>
              <option>Fomentar la imaginación</option>
              <option>Trabajar emociones</option>
              <option>Conversar sobre identidad</option>
            </select>
          </label>
          <button className="dark-button">Ver recomendaciones ↗</button>
        </div>
      </section>
      <section className="screen-content">
        <div className="step-grid">
          <div>
            <span>01</span>
            <strong>Elige el grado</strong>
            <p>Lecturas adecuadas para cada etapa.</p>
          </div>
          <div>
            <span>02</span>
            <strong>Define el propósito</strong>
            <p>Una selección con intención pedagógica.</p>
          </div>
          <div>
            <span>03</span>
            <strong>Comparte el plan</strong>
            <p>Fichas para conversar con tu comunidad.</p>
          </div>
        </div>
      </section>
      <section className="plan-strips" aria-labelledby="plan-strips-title">
        <div className="plan-strips-heading">
          <p className="eyebrow">Colecciones editoriales</p>
          <h2 id="plan-strips-title">Conoce los planes lectores</h2>
          <p>Tres caminos con identidad propia, graduados por nivel escolar.</p>
        </div>
        {readingPlans.map((plan) => (
          <article key={plan.id} className="plan-strip">
            <div className="plan-strip-head">
              <h3>{plan.name}</h3>
              <p>{plan.tagline}</p>
              <p className="plan-strip-meta">
                {plan.books.length} títulos · {plan.levels.length} {plan.levels.length === 1 ? "nivel" : "niveles"}
              </p>
            </div>
            <PlanCarousel books={plan.books.slice(0, 14)} ariaLabel={`Títulos del plan ${plan.name}`} />
            <Link className="arrow-link plan-strip-link" href={`/seccion?plan=${plan.id}`}>
              Explorar catálogo {plan.name} <span>↗</span>
            </Link>
          </article>
        ))}
      </section>
    </ScreenShell>
  );
}
