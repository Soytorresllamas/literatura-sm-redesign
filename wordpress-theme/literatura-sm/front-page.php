<?php
/**
 * Portada del sitio: hero con buscador, carrusel de novedades, rutas
 * rápidas, catálogo con panel de filtros, bloque escuela, banda de
 * recursos y teaser oscuro de booktrailers.
 *
 * @package Literatura_SM
 */

get_header();

$url_catalogo     = literatura_sm_url_catalogo();
$url_booktrailers = literatura_sm_url_pagina( 'booktrailers' );
$novedades        = literatura_sm_novedades( 8 );
$total_libros     = literatura_sm_total_libros();
$trailers_teaser  = array_slice( literatura_sm_libros_con_trailer(), 0, 5 );
?>
<main id="contenido">

	<section class="hero" id="inicio">
		<div class="hero-copy">
			<p class="eyebrow">Literatura infantil y juvenil · México</p>
			<h1>Encuentra una historia para <em>cada momento.</em></h1>
			<p class="hero-intro">Libros para descubrir, conversar y leer juntos en casa o en la escuela.</p>
			<form class="hero-search" role="search" action="<?php echo esc_url( home_url( '/' ) ); ?>" method="get">
				<span aria-hidden="true">⌕</span>
				<input type="search" name="s" placeholder="Busca por título, autor o ISBN" aria-label="Buscar libros" value="" />
				<input type="hidden" name="post_type" value="product" />
				<button type="submit">Buscar</button>
			</form>
			<div class="hero-links">
				<a href="<?php echo esc_url( $url_catalogo ); ?>">Explorar el catálogo <span aria-hidden="true">↗</span></a>
				<a href="#escuela">Elegir para mi grupo <span aria-hidden="true">↗</span></a>
			</div>
		</div>
		<div class="hero-art" aria-label="Composición de libros de colores">
			<div class="tape tape-one"></div>
			<div class="hero-book hero-book-back"><span>historias<br />que dejan<br />huella</span></div>
			<div class="hero-book hero-book-front"><span>leer<br /><strong>juntos</strong></span><small>SM literatura</small></div>
			<div class="hero-sparkle" aria-hidden="true">✦</div>
			<div class="hero-note">Una buena historia<br /><strong>siempre encuentra</strong><br />a su lector.</div>
		</div>
	</section>

	<?php if ( $novedades ) : ?>
		<?php
		$total_novedades = count( $novedades );
		$primera         = $novedades[0];
		/**
		 * Clase de posición inicial de cada diapositiva; el JS recalcula al
		 * navegar. Misma lógica circular que el rediseño.
		 *
		 * @param int $indice Índice de la diapositiva.
		 * @param int $total  Total de diapositivas.
		 * @return string
		 */
		$clase_posicion = static function ( $indice, $total ) {
			$distancia = $indice;
			if ( $distancia > $total / 2 ) {
				$distancia -= $total;
			}
			$clases = array(
				-2 => 'is-far-previous',
				-1 => 'is-previous',
				0  => 'is-active',
				1  => 'is-next',
				2  => 'is-far-next',
			);
			return isset( $clases[ $distancia ] ) ? $clases[ $distancia ] : 'is-hidden';
		};
		?>
		<section class="novelty-section" aria-labelledby="titulo-novedades">
			<div class="novelty-heading">
				<div>
					<p class="eyebrow">Lo más reciente de Literatura SM</p>
					<h2 id="titulo-novedades">Novedades</h2>
				</div>
				<div>
					<span><?php echo esc_html( $total_novedades . ( 1 === $total_novedades ? ' libro nuevo' : ' libros nuevos' ) ); ?></span>
					<a class="arrow-link" href="<?php echo esc_url( literatura_sm_url_pagina( 'novedades' ) ); ?>">Ver todas las novedades <span aria-hidden="true">↗</span></a>
				</div>
			</div>
			<div class="novelty-carousel" data-carrusel-novedades role="region" aria-roledescription="carrusel" aria-label="Novedades editoriales" tabindex="0">
				<div class="novelty-stage">
					<?php foreach ( $novedades as $indice => $novedad ) : ?>
						<a
							class="novelty-slide <?php echo esc_attr( $clase_posicion( $indice, $total_novedades ) ); ?>"
							href="<?php echo esc_url( get_permalink( $novedad ) ); ?>"
							data-indice="<?php echo esc_attr( $indice ); ?>"
							data-titulo="<?php echo esc_attr( get_the_title( $novedad ) ); ?>"
							data-autor="<?php echo esc_attr( literatura_sm_autor( $novedad->ID ) ); ?>"
							data-nota="<?php echo esc_attr( literatura_sm_descripcion_corta( $novedad->ID, 220 ) ); ?>"
							aria-label="<?php echo esc_attr( 0 === $indice ? 'Ver ficha de ' . get_the_title( $novedad ) : get_the_title( $novedad ) . ' — ' . literatura_sm_autor( $novedad->ID ) ); ?>"
							<?php echo 0 === $indice ? 'aria-current="true"' : 'tabindex="-1"'; ?>
						>
							<?php get_template_part( 'template-parts/portada-libro', null, array( 'libro_id' => $novedad->ID ) ); ?>
						</a>
					<?php endforeach; ?>
					<button class="novelty-arrow novelty-arrow-previous" type="button" data-anterior aria-label="Libro anterior">←</button>
					<button class="novelty-arrow novelty-arrow-next" type="button" data-siguiente aria-label="Libro siguiente">→</button>
				</div>
				<div class="novelty-copy" data-copia aria-live="polite">
					<span class="novelty-counter" data-contador>01 / <?php echo esc_html( str_pad( (string) $total_novedades, 2, '0', STR_PAD_LEFT ) ); ?></span>
					<h3><a data-titulo-enlace href="<?php echo esc_url( get_permalink( $primera ) ); ?>"><?php echo esc_html( get_the_title( $primera ) ); ?></a></h3>
					<p class="novelty-author" data-autor-activo><?php echo esc_html( literatura_sm_autor( $primera->ID ) ); ?></p>
					<p class="novelty-note" data-nota-activa><?php echo esc_html( literatura_sm_descripcion_corta( $primera->ID, 220 ) ); ?></p>
					<a class="novelty-link" data-enlace-activo href="<?php echo esc_url( get_permalink( $primera ) ); ?>">Ver libro →</a>
				</div>
				<div class="novelty-controls">
					<button type="button" data-anterior aria-label="Libro anterior">←</button>
					<div class="novelty-dots" aria-label="Seleccionar novedad">
						<?php foreach ( $novedades as $indice => $novedad ) : ?>
							<button
								type="button"
								class="<?php echo 0 === $indice ? 'is-active' : ''; ?>"
								data-punto="<?php echo esc_attr( $indice ); ?>"
								aria-label="<?php echo esc_attr( get_the_title( $novedad ) ); ?>"
								<?php echo 0 === $indice ? 'aria-current="true"' : ''; ?>
							></button>
						<?php endforeach; ?>
					</div>
					<button type="button" data-siguiente aria-label="Libro siguiente">→</button>
				</div>
			</div>
		</section>
	<?php endif; ?>

	<section class="quick-paths" aria-label="Rutas rápidas">
		<div class="section-label">Empieza por aquí</div>
		<div class="path-grid">
			<a class="path-card path-coral" href="<?php echo esc_url( $url_catalogo ); ?>">
				<span class="path-icon" aria-hidden="true">✺</span>
				<span><strong>Para cada edad</strong><small>De primeros lectores a bachillerato</small></span>
				<b aria-hidden="true">↗</b>
			</a>
			<a class="path-card path-yellow" href="<?php echo esc_url( literatura_sm_url_filtros( array( 'tema' => 'emociones' ) ) ); ?>">
				<span class="path-icon" aria-hidden="true">◒</span>
				<span><strong>Por tema</strong><small>Aventura, emociones, misterio y más</small></span>
				<b aria-hidden="true">↗</b>
			</a>
			<a class="path-card path-blue" href="<?php echo esc_url( literatura_sm_url_pagina( 'planes-lectores' ) ); ?>">
				<span class="path-icon" aria-hidden="true">▦</span>
				<span><strong>Para la escuela</strong><small>Planes lectores y recursos docentes</small></span>
				<b aria-hidden="true">↗</b>
			</a>
		</div>
	</section>

	<section class="catalog-section" id="explorar">
		<div class="section-heading">
			<div><p class="eyebrow">Para descubrir hoy</p><h2>Historias que abren mundos</h2></div>
			<a class="arrow-link" href="<?php echo esc_url( $url_catalogo ); ?>">Ver todo el catálogo <span aria-hidden="true">↗</span></a>
		</div>
		<div class="catalog-filter-panel">
			<div class="filter-panel-heading">
				<div><p class="eyebrow">Encuentra más rápido</p><h3>Elige una lectura para cada etapa.</h3></div>
				<div class="filter-result-count"><strong><?php echo esc_html( $total_libros ); ?></strong><span><?php echo esc_html( 1 === $total_libros ? 'historia disponible' : 'historias disponibles' ); ?></span></div>
			</div>
			<div class="filter-row">
				<div class="filter-block">
					<span class="filter-label">¿Para quién es la lectura?</span>
					<div class="filter-group">
						<a class="filter-active" href="<?php echo esc_url( $url_catalogo ); ?>">Todas</a>
						<?php
						$orden_edades = array_keys( literatura_sm_etiquetas_edad() );
						$edades       = literatura_sm_facetas( 'edad_lectora' );
						usort(
							$edades,
							static function ( $a, $b ) use ( $orden_edades ) {
								$pos_a = array_search( $a->name, $orden_edades, true );
								$pos_b = array_search( $b->name, $orden_edades, true );
								$pos_a = false === $pos_a ? count( $orden_edades ) : $pos_a;
								$pos_b = false === $pos_b ? count( $orden_edades ) : $pos_b;
								return $pos_a === $pos_b ? strcoll( $a->name, $b->name ) : $pos_a - $pos_b;
							}
						);
						?>
						<?php foreach ( $edades as $edad_termino ) : ?>
							<a href="<?php echo esc_url( add_query_arg( 'edad', $edad_termino->slug, $url_catalogo ) ); ?>"><?php echo esc_html( $edad_termino->name ); ?></a>
						<?php endforeach; ?>
					</div>
				</div>
				<form class="theme-select" action="<?php echo esc_url( $url_catalogo ); ?>" method="get" data-filtros-auto>
					<label class="filter-label" for="tema-portada">Explora por tema</label>
					<select id="tema-portada" name="tema">
						<option value="">Todos los temas</option>
						<?php foreach ( literatura_sm_facetas( 'tema', 12 ) as $tema_termino ) : ?>
							<option value="<?php echo esc_attr( $tema_termino->slug ); ?>"><?php echo esc_html( $tema_termino->name ); ?></option>
						<?php endforeach; ?>
					</select>
					<button class="filter-apply" type="submit">Aplicar</button>
				</form>
			</div>
		</div>
		<div class="catalog-grid">
			<?php
			$destacados = new WP_Query(
				array(
					'post_type'      => 'product',
					'post_status'    => 'publish',
					'posts_per_page' => 12,
					'orderby'        => 'ID',
					'order'          => 'DESC',
					'no_found_rows'  => true,
				)
			);
			foreach ( $destacados->posts as $libro ) {
				get_template_part( 'template-parts/tarjeta-libro', null, array( 'libro_id' => $libro->ID ) );
			}
			?>
		</div>
		<div class="load-more-row">
			<a class="load-more-button" href="<?php echo esc_url( $url_catalogo ); ?>">Mostrar más historias</a>
		</div>
	</section>

	<section class="school-section" id="escuela">
		<div class="school-stamp">para<br /><strong>la escuela</strong></div>
		<div class="school-copy">
			<p class="eyebrow">Una selección que sí hace sentido</p>
			<h2>Arma tu plan lector<br /><em>con intención.</em></h2>
			<p>Filtra por grado, nivel de dificultad y propósito. Compara títulos y comparte tu selección con tu equipo docente.</p>
			<a class="dark-button" href="<?php echo esc_url( literatura_sm_url_pagina( 'planes-lectores' ) ); ?>">Explorar planes lectores <span aria-hidden="true">↗</span></a>
		</div>
		<div class="school-list">
			<div><span>01</span><strong>Elige el grado</strong><small>Preescolar · Primaria · Secundaria</small></div>
			<div><span>02</span><strong>Encuentra el nivel</strong><small>Lecturas adecuadas para cada grupo</small></div>
			<div><span>03</span><strong>Comparte tu selección</strong><small>Fichas y recursos para acompañar</small></div>
		</div>
	</section>

	<section class="resource-section" id="recursos">
		<div><p class="eyebrow">Para acompañar la lectura</p><h2>Más que un libro.</h2></div>
		<p>Guías, booktrailers, audiolibros y recursos para que cada historia encuentre su momento.</p>
		<a class="arrow-link" href="<?php echo esc_url( literatura_sm_url_pagina( 'recursos' ) ); ?>">Ver recursos <span aria-hidden="true">↗</span></a>
	</section>

	<?php if ( $trailers_teaser ) : ?>
		<section class="trailer-teaser" aria-label="Booktrailers">
			<div class="trailer-teaser-copy">
				<p class="eyebrow">Booktrailers</p>
				<h2>Mira la historia<br /><em>antes de leerla.</em></h2>
				<p>Videos del catálogo para elegir la siguiente lectura en familia o con tu grupo.</p>
				<a class="dark-button" href="<?php echo esc_url( $url_booktrailers ); ?>">Ver todos los booktrailers <span aria-hidden="true">↗</span></a>
			</div>
			<div class="trailer-teaser-strip">
				<?php foreach ( $trailers_teaser as $trailer ) : ?>
					<a class="trailer-teaser-card" href="<?php echo esc_url( $url_booktrailers ); ?>">
						<span class="trailer-thumb">
							<img src="<?php echo esc_url( $trailer['miniatura'] ); ?>" alt="" loading="lazy" decoding="async" />
							<span class="trailer-card-play" aria-hidden="true">▶</span>
						</span>
						<strong><?php echo esc_html( $trailer['titulo'] ); ?></strong>
					</a>
				<?php endforeach; ?>
			</div>
		</section>
	<?php endif; ?>

</main>
<?php
get_footer();
