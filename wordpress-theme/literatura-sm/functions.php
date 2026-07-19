<?php
/**
 * Tema clásico Literatura SM.
 *
 * Traducción directa del rediseño Next.js a plantillas PHP: misma paleta,
 * mismos componentes, cero proceso de build. Los libros son productos de
 * WooCommerce; el tema solo lee sus metadatos editoriales.
 *
 * @package Literatura_SM
 */

defined( 'ABSPATH' ) || exit;

define( 'LITERATURA_SM_VERSION', '1.0.0' );

require get_template_directory() . '/inc/datos-libro.php';
require get_template_directory() . '/inc/registro-datos.php';
require get_template_directory() . '/inc/seo.php';

/**
 * Soportes del tema y menús.
 */
function literatura_sm_configuracion() {
	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'custom-logo', array( 'height' => 64, 'width' => 150, 'flex-height' => true, 'flex-width' => true ) );
	add_theme_support( 'html5', array( 'search-form', 'gallery', 'caption', 'style', 'script' ) );
	add_theme_support( 'woocommerce' );

	register_nav_menus(
		array(
			'principal' => 'Navegación principal',
			'pie'       => 'Enlaces del pie de página',
		)
	);
}
add_action( 'after_setup_theme', 'literatura_sm_configuracion' );

/**
 * Hojas de estilo y JS. Sin bundler: un CSS y un JS planos.
 */
function literatura_sm_recursos() {
	// La tipografía del rediseño. Si el área de tecnología prefiere
	// autoalojarla, basta sustituir esta línea por un @font-face local.
	wp_enqueue_style(
		'literatura-sm-fuentes',
		'https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,400..700;1,8..60,400..700&display=swap',
		array(),
		null
	);
	wp_enqueue_style(
		'literatura-sm-estilos',
		get_stylesheet_uri(),
		array( 'literatura-sm-fuentes' ),
		LITERATURA_SM_VERSION
	);
	wp_enqueue_script(
		'literatura-sm-interacciones',
		get_template_directory_uri() . '/assets/js/literatura-sm.js',
		array(),
		LITERATURA_SM_VERSION,
		array(
			'in_footer' => true,
			'strategy'  => 'defer',
		)
	);
}
add_action( 'wp_enqueue_scripts', 'literatura_sm_recursos' );

/**
 * Marca <html> con la clase js lo antes posible: el CSS oculta con ella
 * los controles que solo tienen sentido con JavaScript (mejora progresiva).
 */
function literatura_sm_clase_js() {
	echo "<script>document.documentElement.classList.add('js');</script>\n";
}
add_action( 'wp_head', 'literatura_sm_clase_js', 0 );

/**
 * Walker que imprime solo anclas, sin ul/li, para conservar el marcado
 * exacto del rediseño (.main-nav > a y .mobile-navigation > a).
 */
class Literatura_SM_Enlaces_Walker extends Walker {

	/**
	 * Campos de árbol del menú.
	 *
	 * @var array
	 */
	public $db_fields = array(
		'parent' => 'menu_item_parent',
		'id'     => 'db_id',
	);

	/**
	 * Imprime cada elemento como un enlace plano.
	 *
	 * @param string   $output Salida acumulada (por referencia).
	 * @param WP_Post  $item   Elemento del menú.
	 * @param int      $depth  Profundidad (ignorada: menú plano).
	 * @param stdClass $args   Argumentos de wp_nav_menu.
	 * @param int      $id     ID del elemento.
	 */
	public function start_el( &$output, $item, $depth = 0, $args = null, $id = 0 ) {
		$clases   = empty( $item->classes ) ? array() : (array) $item->classes;
		$actual   = in_array( 'current-menu-item', $clases, true ) || in_array( 'current_page_item', $clases, true );
		$output  .= sprintf(
			'<a href="%s"%s%s>%s</a>',
			esc_url( $item->url ),
			$actual ? ' class="active" aria-current="page"' : '',
			empty( $item->target ) ? '' : sprintf( ' target="%s" rel="noreferrer"', esc_attr( $item->target ) ),
			esc_html( $item->title )
		);
	}
}

/**
 * Enlaces por defecto cuando aún no se ha configurado un menú en el admin.
 * Replican la navegación del rediseño; los slugs de página pueden no
 * existir todavía y el helper cae al catálogo.
 *
 * @return array<int, array{url: string, titulo: string}>
 */
function literatura_sm_menu_por_defecto() {
	return array(
		array(
			'url'    => literatura_sm_url_catalogo(),
			'titulo' => 'Explorar libros',
		),
		array(
			'url'    => literatura_sm_url_pagina( 'planes-lectores' ),
			'titulo' => 'Planes lectores',
		),
		array(
			'url'    => literatura_sm_url_pagina( 'booktrailers' ),
			'titulo' => 'Booktrailers',
		),
		array(
			'url'    => literatura_sm_url_pagina( 'recursos' ),
			'titulo' => 'Recursos',
		),
		array(
			'url'    => literatura_sm_url_pagina( 'novedades' ),
			'titulo' => 'Novedades',
		),
	);
}

/**
 * Imprime la navegación (menú del admin o enlaces por defecto).
 *
 * @param string $ubicacion Ubicación registrada del menú.
 */
function literatura_sm_navegacion( $ubicacion = 'principal' ) {
	if ( has_nav_menu( $ubicacion ) ) {
		wp_nav_menu(
			array(
				'theme_location' => $ubicacion,
				'container'      => false,
				'items_wrap'     => '%3$s',
				'depth'          => 1,
				'walker'         => new Literatura_SM_Enlaces_Walker(),
			)
		);
		return;
	}
	foreach ( literatura_sm_menu_por_defecto() as $enlace ) {
		printf( '<a href="%s">%s</a>', esc_url( $enlace['url'] ), esc_html( $enlace['titulo'] ) );
	}
}

/**
 * Variables de consulta de los filtros del catálogo.
 *
 * @param string[] $vars Variables registradas.
 * @return string[]
 */
function literatura_sm_query_vars( $vars ) {
	$vars[] = 'edad';
	$vars[] = 'tema';
	$vars[] = 'plan';
	$vars[] = 'orden';
	return $vars;
}
add_filter( 'query_vars', 'literatura_sm_query_vars' );

/**
 * Aplica los filtros de edad/tema/plan y el orden a la consulta principal
 * del catálogo. Funciona con y sin JavaScript: los filtros llegan como
 * parámetros GET normales.
 *
 * @param WP_Query $consulta Consulta principal.
 */
function literatura_sm_filtra_catalogo( $consulta ) {
	if ( is_admin() || ! $consulta->is_main_query() ) {
		return;
	}

	$es_catalogo = $consulta->is_post_type_archive( 'product' )
		|| $consulta->is_tax( array( 'product_cat', 'product_tag', 'edad_lectora', 'tema', 'plan_lector' ) )
		|| ( $consulta->is_search() && 'product' === $consulta->get( 'post_type' ) )
		|| ( function_exists( 'is_shop' ) && is_shop() );

	if ( ! $es_catalogo ) {
		return;
	}

	$tax_query = (array) $consulta->get( 'tax_query' );
	$filtros   = array(
		'edad' => 'edad_lectora',
		'tema' => 'tema',
		'plan' => 'plan_lector',
	);
	foreach ( $filtros as $variable => $taxonomia ) {
		$valor = sanitize_title( (string) get_query_var( $variable ) );
		if ( '' !== $valor ) {
			$tax_query[] = array(
				'taxonomy' => $taxonomia,
				'field'    => 'slug',
				'terms'    => $valor,
			);
		}
	}
	if ( $tax_query ) {
		$consulta->set( 'tax_query', $tax_query );
	}

	$consulta->set( 'posts_per_page', 24 );

	if ( 'titulo' === get_query_var( 'orden' ) ) {
		$consulta->set( 'orderby', 'title' );
		$consulta->set( 'order', 'ASC' );
	} else {
		// «Más recientes»: el mismo criterio que el rediseño (ID descendente).
		$consulta->set( 'orderby', 'ID' );
		$consulta->set( 'order', 'DESC' );
	}
}
add_action( 'pre_get_posts', 'literatura_sm_filtra_catalogo', 20 );

/**
 * URL del catálogo conservando los filtros activos, para armar enlaces
 * de facetas sin perder el resto de la selección.
 *
 * @param array $cambios Variables a cambiar; valor '' elimina la variable.
 * @return string
 */
function literatura_sm_url_filtros( $cambios = array() ) {
	$actuales = array();
	foreach ( array( 'edad', 'tema', 'plan', 'orden' ) as $variable ) {
		$valor = get_query_var( $variable );
		if ( '' !== $valor ) {
			$actuales[ $variable ] = $valor;
		}
	}
	if ( is_search() ) {
		$actuales['s']         = get_search_query();
		$actuales['post_type'] = 'product';
	}
	$parametros = array_filter( array_merge( $actuales, $cambios ), static fn( $valor ) => '' !== $valor );
	return add_query_arg( array_map( 'rawurlencode', $parametros ), literatura_sm_url_catalogo() );
}

/**
 * El tema dibuja su propio catálogo y ficha; se retiran los estilos y
 * envoltorios genéricos de WooCommerce que no se usan.
 */
add_filter( 'woocommerce_enqueue_styles', '__return_empty_array' );
remove_action( 'woocommerce_before_main_content', 'woocommerce_output_content_wrapper', 10 );
remove_action( 'woocommerce_after_main_content', 'woocommerce_output_content_wrapper_end', 10 );

/**
 * Términos de una taxonomía con conteo, para las facetas de la barra
 * lateral del catálogo.
 *
 * @param string $taxonomia Nombre de la taxonomía.
 * @param int    $maximo    Máximo de términos (0 = sin límite).
 * @return WP_Term[]
 */
function literatura_sm_facetas( $taxonomia, $maximo = 0 ) {
	$terminos = get_terms(
		array(
			'taxonomy'   => $taxonomia,
			'hide_empty' => true,
			'orderby'    => 'count',
			'order'      => 'DESC',
			'number'     => $maximo,
		)
	);
	return is_wp_error( $terminos ) ? array() : $terminos;
}

/**
 * Total de libros publicados (para el contador del panel de filtros).
 *
 * @return int
 */
function literatura_sm_total_libros() {
	$conteo = wp_count_posts( 'product' );
	return isset( $conteo->publish ) ? (int) $conteo->publish : 0;
}
