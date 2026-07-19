<?php
/**
 * Ficha de libro (single de producto WooCommerce).
 *
 * Los datos editoriales viven en los metadatos del producto; el JSON-LD
 * de libro y las etiquetas sociales se imprimen desde inc/seo.php.
 *
 * @package Literatura_SM
 */

get_header();

while ( have_posts() ) :
	the_post();
	$libro_id  = get_the_ID();
	$titulo    = get_the_title();
	$enlace    = get_permalink();
	$autor     = literatura_sm_autor( $libro_id );
	$edad      = literatura_sm_edad_legible( $libro_id );
	$coleccion = literatura_sm_coleccion( $libro_id );
	$grupo     = literatura_sm_grupo_edad( $libro_id );
	$texto_compartir = literatura_sm_texto_compartir( $libro_id );
	$titulo_compartir = $titulo . ' | ' . get_bloginfo( 'name' );

	$recursos = array_filter(
		array(
			array(
				'etiqueta'    => 'Booktrailer',
				'descripcion' => 'Conoce la historia en video',
				'icono'       => '▶',
				'url'         => literatura_sm_meta( $libro_id, 'liga_de_booktrailer' ),
			),
			array(
				'etiqueta'    => 'Audiolibro',
				'descripcion' => 'Escucha una muestra o la edición disponible',
				'icono'       => '◉',
				'url'         => literatura_sm_meta( $libro_id, 'liga_audiolibros' ),
			),
			array(
				'etiqueta'    => 'Podcast',
				'descripcion' => 'Conversaciones alrededor del libro',
				'icono'       => '◎',
				'url'         => literatura_sm_meta( $libro_id, 'liga_podcast' ),
			),
			array(
				'etiqueta'    => 'Ebook',
				'descripcion' => 'Consulta la edición digital',
				'icono'       => '↗',
				'url'         => literatura_sm_meta( $libro_id, 'liga_ebook_amazon' ),
			),
		),
		static fn( $recurso ) => '' !== $recurso['url']
	);
	?>
<main id="contenido">
	<nav class="book-breadcrumbs" aria-label="Migas de pan">
		<a href="<?php echo esc_url( home_url( '/' ) ); ?>">Inicio</a>
		<span aria-hidden="true">/</span>
		<a href="<?php echo esc_url( literatura_sm_url_catalogo() ); ?>">Explorar libros</a>
		<span aria-hidden="true">/</span>
		<strong><?php echo esc_html( $titulo ); ?></strong>
	</nav>

	<section class="book-detail">
		<div class="detail-visual">
			<?php if ( literatura_sm_es_novedad( $libro_id ) ) : ?>
				<span class="detail-label">Novedad</span>
			<?php endif; ?>
			<?php get_template_part( 'template-parts/portada-libro', null, array( 'libro_id' => $libro_id, 'grande' => true ) ); ?>

			<div
				class="share-menu"
				data-compartir
				data-titulo="<?php echo esc_attr( $titulo_compartir ); ?>"
				data-texto="<?php echo esc_attr( $texto_compartir ); ?>"
				data-url="<?php echo esc_url( $enlace ); ?>"
			>
				<span class="share-label">Compartir</span>
				<div class="share-buttons">
					<a class="share-button" aria-label="Compartir por WhatsApp" href="<?php echo esc_url( literatura_sm_url_whatsapp( $texto_compartir, $enlace ) ); ?>" target="_blank" rel="noreferrer">
						<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 1.8a8.2 8.2 0 1 1-4.2 15.3l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 0 1 12 3.8ZM8.9 7.3c-.2 0-.5 0-.7.3-.2.3-.9.9-.9 2.1s.9 2.4 1 2.6c.1.2 1.8 2.9 4.4 3.9 2.2.9 2.6.7 3.1.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.2-.2-.5-.3l-1.7-.8c-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.1-.2 0-.4.1-.5l.5-.6c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5L10 7.6c-.2-.4-.4-.3-.5-.3h-.6Z"/></svg>
					</a>
					<a class="share-button" aria-label="Compartir en Facebook" href="<?php echo esc_url( literatura_sm_url_facebook( $enlace ) ); ?>" target="_blank" rel="noreferrer">
						<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13.5 21v-7h2.4l.4-2.9h-2.8V9.2c0-.8.2-1.4 1.4-1.4h1.5V5.2c-.3 0-1.2-.1-2.2-.1-2.2 0-3.6 1.3-3.6 3.7v2.3H8.1V14h2.5v7h2.9Z"/></svg>
					</a>
					<button class="share-button" aria-label="Compartir en Instagram" type="button" data-instagram>
						<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 4.6c2.4 0 2.7 0 3.7.1 1 0 1.5.2 1.8.3.5.2.8.4 1.1.7.3.3.5.6.7 1.1.1.3.3.8.3 1.8.1 1 .1 1.3.1 3.7s0 2.7-.1 3.7c0 1-.2 1.5-.3 1.8-.2.5-.4.8-.7 1.1-.3.3-.6.5-1.1.7-.3.1-.8.3-1.8.3-1 .1-1.3.1-3.7.1s-2.7 0-3.7-.1c-1 0-1.5-.2-1.8-.3a3 3 0 0 1-1.1-.7 3 3 0 0 1-.7-1.1c-.1-.3-.3-.8-.3-1.8-.1-1-.1-1.3-.1-3.7s0-2.7.1-3.7c0-1 .2-1.5.3-1.8.2-.5.4-.8.7-1.1.3-.3.6-.5 1.1-.7.3-.1.8-.3 1.8-.3 1-.1 1.3-.1 3.7-.1ZM12 3c-2.4 0-2.7 0-3.7.1-1 0-1.6.2-2.2.4-.6.2-1.1.6-1.6 1-.5.5-.8 1-1 1.6-.2.6-.4 1.2-.4 2.2C3 9.3 3 9.6 3 12s0 2.7.1 3.7c0 1 .2 1.6.4 2.2.2.6.6 1.1 1 1.6.5.5 1 .8 1.6 1 .6.2 1.2.4 2.2.4 1 .1 1.3.1 3.7.1s2.7 0 3.7-.1c1 0 1.6-.2 2.2-.4a4.4 4.4 0 0 0 2.6-2.6c.2-.6.4-1.2.4-2.2.1-1 .1-1.3.1-3.7s0-2.7-.1-3.7c0-1-.2-1.6-.4-2.2a4.4 4.4 0 0 0-2.6-2.6c-.6-.2-1.2-.4-2.2-.4C14.7 3 14.4 3 12 3Zm0 4.4a4.6 4.6 0 1 0 0 9.2 4.6 4.6 0 0 0 0-9.2ZM12 15a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm4.8-8.9a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2Z"/></svg>
					</button>
					<a class="share-button" aria-label="Compartir por correo" href="<?php echo esc_url( literatura_sm_url_correo( $titulo_compartir, $texto_compartir . "\n\n" . $enlace ) ); ?>">
						<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm8 7.4L4.8 6.8v10.4h14.4V6.8L12 12.4Zm0-2L18.6 6H5.4L12 10.4Z"/></svg>
					</a>
					<button class="share-button" aria-label="Copiar enlace" type="button" data-copiar>
						<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M10.6 13.4a1 1 0 0 0 1.4 0l4.3-4.3a2.5 2.5 0 0 0-3.5-3.5l-2 2a1 1 0 1 0 1.4 1.5l2-2a.5.5 0 0 1 .7.7l-4.3 4.2a1 1 0 0 0 0 1.4Zm2.8-2.8a1 1 0 0 0-1.4 0l-4.3 4.3a2.5 2.5 0 0 0 3.5 3.5l2-2a1 1 0 1 0-1.4-1.5l-2 2a.5.5 0 0 1-.7-.7l4.3-4.2a1 1 0 0 0 0-1.4Z"/></svg>
					</button>
				</div>
				<span class="share-notice" role="status" aria-live="polite" data-aviso></span>
			</div>
		</div>
		<div class="detail-copy">
			<p class="eyebrow"><?php echo esc_html( $coleccion . ' · ' . $edad ); ?></p>
			<h1><?php echo esc_html( $titulo ); ?></h1>
			<p class="detail-author"><?php echo esc_html( $autor ); ?></p>
			<div class="detail-description">
				<?php
				$contenido = get_the_content();
				if ( '' !== trim( wp_strip_all_tags( $contenido ) ) ) {
					echo wp_kses_post( wpautop( $contenido ) );
				} else {
					echo '<p>Consulta la ficha editorial de este título y descubre su propuesta de lectura.</p>';
				}
				?>
			</div>
			<div class="detail-tags">
				<span><?php echo esc_html( $edad ); ?></span>
				<?php $nivel_escolar = literatura_sm_meta( $libro_id, 'nivel_escolar' ); ?>
				<?php if ( $nivel_escolar ) : ?>
					<span><?php echo esc_html( literatura_sm_titulo_frase( $nivel_escolar ) ); ?></span>
				<?php endif; ?>
				<?php $grado = literatura_sm_meta( $libro_id, 'grado_escolar' ); ?>
				<?php if ( $grado && strcasecmp( $grado, $nivel_escolar ) !== 0 ) : ?>
					<span><?php echo esc_html( literatura_sm_titulo_frase( $grado ) ); ?></span>
				<?php endif; ?>
				<?php foreach ( array_slice( literatura_sm_temas( $libro_id ), 0, 3 ) as $tema_nombre ) : ?>
					<span><?php echo esc_html( literatura_sm_titulo_frase( $tema_nombre ) ); ?></span>
				<?php endforeach; ?>
			</div>
		</div>
	</section>

	<section class="book-info-section">
		<div class="book-info-intro">
			<p class="eyebrow">Conoce el libro</p>
			<h2>Una lectura para<br /><em>crecer juntos.</em></h2>
		</div>
		<div class="book-info-grid">
			<div>
				<h3>Sobre la historia</h3>
				<p><?php echo esc_html( literatura_sm_descripcion_corta( $libro_id, 400 ) ); ?></p>
			</div>
			<div>
				<h3>Datos editoriales</h3>
				<dl>
					<dt>Autor</dt>
					<dd><?php echo esc_html( $autor ); ?></dd>
					<?php $ilustrador = literatura_sm_meta( $libro_id, 'ilustrador' ); ?>
					<?php if ( $ilustrador ) : ?>
						<dt>Ilustrador</dt>
						<dd><?php echo esc_html( $ilustrador ); ?></dd>
					<?php endif; ?>
					<dt>ISBN</dt>
					<dd><?php echo esc_html( literatura_sm_meta( $libro_id, 'isbn', 'Por confirmar' ) ); ?></dd>
					<dt>Páginas</dt>
					<dd><?php echo esc_html( literatura_sm_meta( $libro_id, 'paginas', 'Por confirmar' ) ); ?></dd>
					<?php $formato = literatura_sm_meta( $libro_id, 'formato' ); ?>
					<?php if ( $formato ) : ?>
						<dt>Formato</dt>
						<dd><?php echo esc_html( $formato ); ?></dd>
					<?php endif; ?>
					<?php $encuadernacion = literatura_sm_meta( $libro_id, 'encuadernacion' ); ?>
					<?php if ( $encuadernacion ) : ?>
						<dt>Encuadernación</dt>
						<dd><?php echo esc_html( $encuadernacion ); ?></dd>
					<?php endif; ?>
				</dl>
			</div>
			<div>
				<h3>Recursos disponibles</h3>
				<?php if ( $recursos ) : ?>
					<ul class="resource-list">
						<?php foreach ( $recursos as $recurso ) : ?>
							<li>
								<span aria-hidden="true"><?php echo esc_html( $recurso['icono'] ); ?></span>
								<a href="<?php echo esc_url( $recurso['url'] ); ?>" target="_blank" rel="noreferrer">
									<strong><?php echo esc_html( $recurso['etiqueta'] ); ?></strong>
									<small><?php echo esc_html( $recurso['descripcion'] ); ?></small>
								</a>
							</li>
						<?php endforeach; ?>
					</ul>
				<?php else : ?>
					<p>Los recursos complementarios se publicarán en esta ficha cuando estén disponibles.</p>
				<?php endif; ?>
			</div>
		</div>
	</section>

	<?php $relacionados = literatura_sm_relacionados( $libro_id, 3 ); ?>
	<?php if ( $relacionados ) : ?>
		<section class="related-section">
			<div class="section-heading">
				<div>
					<p class="eyebrow">También puede gustarte</p>
					<h2>Más historias para <?php echo esc_html( $grupo ); ?></h2>
				</div>
				<a class="arrow-link" href="<?php echo esc_url( literatura_sm_url_catalogo() ); ?>">Ver catálogo <span aria-hidden="true">↗</span></a>
			</div>
			<div class="related-books">
				<?php foreach ( $relacionados as $relacionado ) : ?>
					<div class="related-item">
						<a href="<?php echo esc_url( get_permalink( $relacionado ) ); ?>">
							<?php get_template_part( 'template-parts/portada-libro', null, array( 'libro_id' => $relacionado->ID ) ); ?>
						</a>
						<strong><?php echo esc_html( get_the_title( $relacionado ) ); ?></strong>
						<span><?php echo esc_html( literatura_sm_autor( $relacionado->ID ) ); ?></span>
					</div>
				<?php endforeach; ?>
			</div>
		</section>
	<?php endif; ?>
</main>
	<?php
endwhile;

get_footer();
