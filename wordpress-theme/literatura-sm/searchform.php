<?php
/**
 * Formulario de búsqueda del sitio: siempre busca en el catálogo.
 *
 * @package Literatura_SM
 */

defined( 'ABSPATH' ) || exit;
?>
<form class="wide-search" role="search" action="<?php echo esc_url( home_url( '/' ) ); ?>" method="get">
	<span aria-hidden="true">⌕</span>
	<label class="screen-reader-text" for="busqueda-sitio">Buscar libros</label>
	<input id="busqueda-sitio" type="search" name="s" value="<?php echo esc_attr( get_search_query() ); ?>" placeholder="Busca por título, autor o ISBN" />
	<input type="hidden" name="post_type" value="product" />
	<button type="submit">Buscar</button>
</form>
