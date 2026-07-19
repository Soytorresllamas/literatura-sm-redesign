<?php
/**
 * Cabecera del sitio: barra fija con marca, navegación de escritorio
 * (>850 px) y menú móvil desplegable (≤850 px).
 *
 * @package Literatura_SM
 */
?><!doctype html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<?php wp_head(); ?>
	<noscript>
		<style>
			/* Sin JavaScript, el menú móvil queda siempre desplegado bajo 850 px. */
			@media (max-width: 850px) { .mobile-navigation[hidden] { display: grid; } }
			.mobile-menu-toggle { display: none !important; }
		</style>
	</noscript>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<a class="skip-link screen-reader-text" href="#contenido">Saltar al contenido</a>
<header class="site-header">
	<?php if ( has_custom_logo() ) : ?>
		<span class="brand brand-header"><?php the_custom_logo(); ?></span>
	<?php else : ?>
		<a class="brand brand-header" href="<?php echo esc_url( home_url( '/' ) ); ?>" aria-label="<?php echo esc_attr( get_bloginfo( 'name' ) ); ?>, inicio">
			<span class="brand-symbol" aria-hidden="true">sm</span>
			literatura
		</a>
	<?php endif; ?>
	<nav class="main-nav" aria-label="Navegación principal">
		<?php literatura_sm_navegacion( 'principal' ); ?>
	</nav>
	<button class="mobile-menu-toggle" type="button" aria-expanded="false" aria-controls="navegacion-movil" data-menu-movil>
		Menú <span aria-hidden="true">＋</span>
	</button>
	<div class="header-actions">
		<a class="text-button" href="<?php echo esc_url( literatura_sm_url_pagina( 'planes-lectores' ) ); ?>">Soy docente</a>
	</div>
	<nav class="mobile-navigation" id="navegacion-movil" aria-label="Navegación móvil" hidden>
		<?php literatura_sm_navegacion( 'principal' ); ?>
		<a href="<?php echo esc_url( literatura_sm_url_catalogo() ); ?>">Buscar</a>
	</nav>
</header>
