<?php
/**
 * Catálogo con filtros por edad, tema y plan lector.
 *
 * Toda la selección viaja como parámetros GET (?edad=, ?tema=, ?plan=,
 * ?orden=, ?s=): funciona sin JavaScript con el botón «Aplicar» y el JS
 * solo añade el auto-envío al cambiar un filtro. La consulta principal ya
 * llega filtrada desde literatura_sm_filtra_catalogo().
 *
 * @package Literatura_SM
 */

defined( 'ABSPATH' ) || exit;

global $wp_query;

$url_catalogo = literatura_sm_url_catalogo();
$total_libros = literatura_sm_total_libros();
$encontrados  = (int) $wp_query->found_posts;
$edad_activa  = sanitize_title( (string) get_query_var( 'edad' ) );
$tema_activo  = sanitize_title( (string) get_query_var( 'tema' ) );
$plan_activo  = sanitize_title( (string) get_query_var( 'plan' ) );
$orden_activo = (string) get_query_var( 'orden' );
$busqueda     = get_search_query();

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
$temas  = literatura_sm_facetas( 'tema', 10 );
$planes = literatura_sm_facetas( 'plan_lector' );
?>
<main id="contenido">
	<section class="section-hero">
		<nav class="breadcrumbs" aria-label="Migas de pan">
			<a href="<?php echo esc_url( home_url( '/' ) ); ?>">Inicio</a>
			<span aria-hidden="true">/</span>
			<strong>Explorar libros</strong>
		</nav>
		<p class="eyebrow">Catálogo completo</p>
		<h1>Historias para <em>cada lector.</em></h1>
		<p>Explora <?php echo esc_html( $total_libros ); ?> títulos por edad, tema, autor, colección o ISBN.</p>
	</section>

	<form class="section-layout" action="<?php echo esc_url( $url_catalogo ); ?>" method="get" data-filtros-auto>
		<input type="hidden" name="post_type" value="product" />
		<aside class="filter-sidebar">
			<div class="filter-heading">
				<strong>Filtrar resultados</strong>
				<a href="<?php echo esc_url( $url_catalogo ); ?>">Limpiar</a>
			</div>
			<label class="side-search">
				<span aria-hidden="true">⌕</span>
				<span class="screen-reader-text">Buscar en el catálogo</span>
				<input type="search" name="s" value="<?php echo esc_attr( $busqueda ); ?>" placeholder="Buscar en el catálogo" />
			</label>
			<fieldset>
				<legend>Edad</legend>
				<label>
					<input type="radio" name="edad" value="" <?php checked( '', $edad_activa ); ?> /> Todas <span><?php echo esc_html( $total_libros ); ?></span>
				</label>
				<?php foreach ( $edades as $termino ) : ?>
					<label>
						<input type="radio" name="edad" value="<?php echo esc_attr( $termino->slug ); ?>" <?php checked( $termino->slug, $edad_activa ); ?> />
						<?php echo esc_html( $termino->name ); ?><span><?php echo esc_html( $termino->count ); ?></span>
					</label>
				<?php endforeach; ?>
			</fieldset>
			<fieldset>
				<legend>Tema</legend>
				<label>
					<input type="radio" name="tema" value="" <?php checked( '', $tema_activo ); ?> /> Todos <span><?php echo esc_html( $total_libros ); ?></span>
				</label>
				<?php foreach ( $temas as $termino ) : ?>
					<label>
						<input type="radio" name="tema" value="<?php echo esc_attr( $termino->slug ); ?>" <?php checked( $termino->slug, $tema_activo ); ?> />
						<?php echo esc_html( $termino->name ); ?><span><?php echo esc_html( $termino->count ); ?></span>
					</label>
				<?php endforeach; ?>
			</fieldset>
			<?php if ( $planes ) : ?>
				<fieldset>
					<legend>Plan lector</legend>
					<label>
						<input type="radio" name="plan" value="" <?php checked( '', $plan_activo ); ?> /> Todos <span><?php echo esc_html( $total_libros ); ?></span>
					</label>
					<?php foreach ( $planes as $termino ) : ?>
						<label>
							<input type="radio" name="plan" value="<?php echo esc_attr( $termino->slug ); ?>" <?php checked( $termino->slug, $plan_activo ); ?> />
							<?php echo esc_html( $termino->name ); ?><span><?php echo esc_html( $termino->count ); ?></span>
						</label>
					<?php endforeach; ?>
				</fieldset>
			<?php endif; ?>
			<button class="filter-apply" type="submit">Aplicar filtros</button>
		</aside>
		<div class="results-column">
			<div class="results-toolbar">
				<p><strong><?php echo esc_html( $encontrados ); ?></strong> <?php echo esc_html( 1 === $encontrados ? 'título encontrado' : 'títulos encontrados' ); ?></p>
				<label>
					Ordenar
					<select name="orden">
						<option value="" <?php selected( '', $orden_activo ); ?>>Más recientes</option>
						<option value="titulo" <?php selected( 'titulo', $orden_activo ); ?>>A–Z</option>
					</select>
				</label>
			</div>
			<?php if ( have_posts() ) : ?>
				<div class="section-book-grid">
					<?php
					while ( have_posts() ) {
						the_post();
						get_template_part( 'template-parts/tarjeta-libro', null, array( 'libro_id' => get_the_ID() ) );
					}
					?>
				</div>
				<?php
				the_posts_pagination(
					array(
						'mid_size'  => 1,
						'prev_text' => '← Anteriores',
						'next_text' => 'Siguientes →',
						'screen_reader_text' => 'Más páginas del catálogo',
						'class'     => 'pagination',
					)
				);
				?>
			<?php else : ?>
				<div class="empty-state">No encontramos libros con estos filtros. Prueba con otra edad, tema o término.</div>
			<?php endif; ?>
		</div>
	</form>
</main>
