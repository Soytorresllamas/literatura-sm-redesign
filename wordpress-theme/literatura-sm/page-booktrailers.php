<?php
/**
 * Template Name: Booktrailers
 *
 * Sala de booktrailers sobre la banda tinta oscura del sitio: un
 * hero-reproductor que no carga nada de YouTube hasta el clic (solo
 * miniaturas de i.ytimg.com; el embed es youtube-nocookie) y filas por
 * edad con scroll horizontal. Sin JavaScript, el póster abre el video en
 * YouTube y cada tarjeta lleva a la ficha del libro.
 *
 * @package Literatura_SM
 */

get_header();

$trailers  = literatura_sm_libros_con_trailer();
$destacado = literatura_sm_trailer_destacado( $trailers );
$filas     = literatura_sm_filas_de_trailers( $trailers );
?>
<main id="contenido" class="trailers-page">
	<section class="trailers-hero">
		<p class="eyebrow">Booktrailers · <?php echo esc_html( count( $trailers ) ); ?> videos</p>
		<h1>Dale play a tu<br /><em>próxima lectura.</em></h1>
		<p class="trailers-intro">Historias que se dejan ver antes de leerse. Elige una edad, reproduce el trailer y llega a la ficha del libro.</p>
	</section>

	<?php if ( $destacado ) : ?>
		<div class="trailer-theater" data-teatro>
			<div class="trailer-stage" data-escenario>
				<a
					class="trailer-stage-poster"
					data-poster
					href="<?php echo esc_url( 'https://www.youtube.com/watch?v=' . $destacado['video'] ); ?>"
					data-video="<?php echo esc_attr( $destacado['video'] ); ?>"
					aria-label="<?php echo esc_attr( 'Reproducir el booktrailer de ' . $destacado['titulo'] ); ?>"
				>
					<img src="<?php echo esc_url( $destacado['miniatura'] ); ?>" alt="" decoding="async" />
					<span class="trailer-play" aria-hidden="true">▶</span>
				</a>
			</div>
			<div class="trailer-meta">
				<div>
					<p class="eyebrow" data-meta-edad><?php echo esc_html( $destacado['edad'] ); ?> · Booktrailer</p>
					<h2 data-meta-titulo><?php echo esc_html( $destacado['titulo'] ); ?></h2>
					<p class="trailer-author" data-meta-autor><?php echo esc_html( $destacado['autor'] ); ?></p>
				</div>
				<a class="dark-button" data-meta-enlace href="<?php echo esc_url( $destacado['url'] ); ?>">Ver ficha del libro <span aria-hidden="true">↗</span></a>
			</div>
			<div class="trailer-rows">
				<?php foreach ( $filas as $fila ) : ?>
					<section aria-label="<?php echo esc_attr( 'Booktrailers ' . $fila['etiqueta'] ); ?>">
						<h3><?php echo esc_html( $fila['etiqueta'] ); ?></h3>
						<div class="trailer-strip">
							<?php foreach ( $fila['trailers'] as $trailer ) : ?>
								<a
									class="trailer-card <?php echo $trailer['video'] === $destacado['video'] ? 'is-active' : ''; ?>"
									data-trailer
									data-video="<?php echo esc_attr( $trailer['video'] ); ?>"
									data-titulo="<?php echo esc_attr( $trailer['titulo'] ); ?>"
									data-autor="<?php echo esc_attr( $trailer['autor'] ); ?>"
									data-edad="<?php echo esc_attr( $trailer['edad'] ); ?>"
									data-miniatura="<?php echo esc_url( $trailer['miniatura'] ); ?>"
									href="<?php echo esc_url( $trailer['url'] ); ?>"
									aria-label="<?php echo esc_attr( 'Reproducir el booktrailer de ' . $trailer['titulo'] ); ?>"
								>
									<span class="trailer-thumb">
										<img src="<?php echo esc_url( $trailer['miniatura'] ); ?>" alt="" loading="lazy" decoding="async" />
										<span class="trailer-card-play" aria-hidden="true">▶</span>
									</span>
									<strong><?php echo esc_html( $trailer['titulo'] ); ?></strong>
									<small><?php echo esc_html( $trailer['autor'] ); ?></small>
								</a>
							<?php endforeach; ?>
						</div>
					</section>
				<?php endforeach; ?>
			</div>
		</div>
	<?php else : ?>
		<div class="trailer-theater">
			<p class="trailers-intro" style="padding: 0 max(4vw, calc((100% - 1080px) / 2)) 60px;">Todavía no hay booktrailers cargados. Agrega la liga de YouTube en el campo «liga_de_booktrailer» de cada libro y aparecerán aquí.</p>
		</div>
	<?php endif; ?>
</main>
<?php
get_footer();
