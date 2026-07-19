<?php
/**
 * Pie de página del sitio.
 *
 * @package Literatura_SM
 */
?>
<footer class="site-footer">
	<div class="brand brand-footer">
		<?php if ( has_custom_logo() ) : ?>
			<?php the_custom_logo(); ?>
		<?php else : ?>
			<span class="brand-symbol" aria-hidden="true">sm</span>
			literatura
		<?php endif; ?>
	</div>
	<p>Historias para leer el mundo.</p>
	<div class="footer-links">
		<?php if ( has_nav_menu( 'pie' ) ) : ?>
			<?php literatura_sm_navegacion( 'pie' ); ?>
		<?php else : ?>
			<a href="<?php echo esc_url( home_url( '/' ) ); ?>">Inicio</a>
			<a href="<?php echo esc_url( literatura_sm_url_catalogo() ); ?>">Catálogo</a>
			<a href="<?php echo esc_url( literatura_sm_url_pagina( 'planes-lectores' ) ); ?>">Docentes</a>
			<a href="<?php echo esc_url( literatura_sm_url_pagina( 'recursos' ) ); ?>">Recursos</a>
			<a href="<?php echo esc_url( literatura_sm_url_pagina( 'contacto' ) ); ?>">Contacto</a>
		<?php endif; ?>
	</div>
	<small>© SM México · Privacidad · Cookies</small>
</footer>
<?php wp_footer(); ?>
</body>
</html>
