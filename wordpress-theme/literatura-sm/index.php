<?php
/**
 * Plantilla comodín: páginas sueltas y cualquier contenido sin plantilla
 * propia, con el encabezado interior del rediseño.
 *
 * @package Literatura_SM
 */

get_header();
?>
<main id="contenido">
	<?php if ( have_posts() ) : ?>
		<?php while ( have_posts() ) : ?>
			<?php the_post(); ?>
			<section class="screen-hero">
				<nav class="breadcrumbs" aria-label="Migas de pan">
					<a href="<?php echo esc_url( home_url( '/' ) ); ?>">Inicio</a>
					<span aria-hidden="true">/</span>
					<strong><?php the_title(); ?></strong>
				</nav>
				<h1><?php the_title(); ?></h1>
			</section>
			<section class="screen-content">
				<div class="entry-content">
					<?php the_content(); ?>
				</div>
			</section>
		<?php endwhile; ?>
	<?php else : ?>
		<section class="screen-hero">
			<h1>No hay contenido aquí… <em>todavía.</em></h1>
		</section>
		<section class="screen-content">
			<div class="empty-state">Vuelve pronto o explora el catálogo mientras tanto.</div>
		</section>
	<?php endif; ?>
</main>
<?php
get_footer();
