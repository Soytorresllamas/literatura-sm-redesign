<?php
/**
 * Página 404 juguetona: el librero desordenado y tres historias que sí
 * existen para no dejar a nadie sin lectura.
 *
 * @package Literatura_SM
 */

get_header();

$sugerencias = array_slice( literatura_sm_novedades( 3 ), 0, 3 );
?>
<main id="contenido">
	<section class="not-found-hero">
		<svg class="not-found-shelf" viewBox="0 0 320 150" aria-hidden="true" focusable="false">
			<rect x="10" y="120" width="300" height="8" rx="3" fill="var(--ink)" opacity="0.85" />
			<rect x="30" y="52" width="22" height="68" rx="3" fill="var(--coral)" />
			<rect x="56" y="44" width="20" height="76" rx="3" fill="var(--blue)" />
			<rect x="80" y="58" width="24" height="62" rx="3" fill="var(--yellow)" />
			<rect x="108" y="48" width="20" height="72" rx="3" fill="var(--ink)" opacity="0.8" />
			<g transform="rotate(9 160 116)">
				<rect x="132" y="60" width="22" height="60" rx="3" fill="var(--coral)" opacity="0.9" />
			</g>
			<text x="196" y="112" font-size="52" font-family="inherit" fill="var(--muted)">?</text>
			<g transform="rotate(-74 258 128)">
				<rect x="246" y="70" width="20" height="58" rx="3" fill="var(--blue)" />
			</g>
		</svg>
		<p class="eyebrow">Error 404</p>
		<h1>Este capítulo no existe… <em>todavía.</em></h1>
		<p>
			Buscamos en todos los estantes y hasta debajo del librero, pero esta
			página se nos traspapeló. Mientras la encontramos, hay cientos de
			historias esperándote.
		</p>
		<div class="not-found-actions">
			<a class="dark-button" href="<?php echo esc_url( literatura_sm_url_catalogo() ); ?>">Explorar el catálogo</a>
			<a class="arrow-link" href="<?php echo esc_url( literatura_sm_url_pagina( 'novedades' ) ); ?>">Ver novedades <span aria-hidden="true">↗</span></a>
			<a class="arrow-link" href="<?php echo esc_url( home_url( '/' ) ); ?>">Volver al inicio <span aria-hidden="true">↗</span></a>
		</div>
	</section>
	<?php if ( $sugerencias ) : ?>
		<section class="not-found-suggestions" aria-labelledby="titulo-sugerencias">
			<h2 id="titulo-sugerencias">Estas historias sí existen</h2>
			<div class="section-book-grid">
				<?php foreach ( $sugerencias as $libro ) : ?>
					<?php get_template_part( 'template-parts/tarjeta-libro', null, array( 'libro_id' => $libro->ID ) ); ?>
				<?php endforeach; ?>
			</div>
		</section>
	<?php endif; ?>
</main>
<?php
get_footer();
