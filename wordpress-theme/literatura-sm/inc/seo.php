<?php
/**
 * Metadatos sociales y datos estructurados.
 *
 * Open Graph y Twitter Card por libro usando la portada como og:image, y
 * JSON-LD schema.org/Book en cada ficha. La tarjeta compuesta 1200×630 del
 * rediseño Next.js requeriría generar imágenes en el servidor (plugin o
 * servicio externo); la alternativa y el trade-off están documentados en
 * docs/wordpress-directo-plan.md.
 *
 * @package Literatura_SM
 */

defined( 'ABSPATH' ) || exit;

/**
 * ¿Hay un plugin de SEO imprimiendo Open Graph? Si All in One SEO (activo
 * en el sitio actual) u otro equivalente está presente, el tema no duplica
 * etiquetas: solo aporta el JSON-LD de libro, que los plugins no generan.
 *
 * @return bool
 */
function literatura_sm_seo_delegado() {
	return function_exists( 'aioseo' ) || defined( 'WPSEO_VERSION' ) || defined( 'RANK_MATH_VERSION' );
}

/**
 * Imagen social por defecto del sitio (subida desde el Personalizador).
 *
 * @return string URL o cadena vacía.
 */
function literatura_sm_imagen_social_general() {
	return esc_url_raw( (string) get_theme_mod( 'literatura_sm_imagen_social', '' ) );
}

/**
 * Ajuste del Personalizador para la imagen social general (1200×630).
 *
 * @param WP_Customize_Manager $wp_customize Administrador del Personalizador.
 */
function literatura_sm_personalizador( $wp_customize ) {
	$wp_customize->add_section(
		'literatura_sm_social',
		array(
			'title'       => 'Tarjeta para redes sociales',
			'description' => 'Imagen de 1200×630 px que se usa al compartir páginas generales del sitio (la ficha de cada libro usa su portada).',
			'priority'    => 160,
		)
	);
	$wp_customize->add_setting(
		'literatura_sm_imagen_social',
		array(
			'default'           => '',
			'sanitize_callback' => 'esc_url_raw',
		)
	);
	$wp_customize->add_control(
		new WP_Customize_Image_Control(
			$wp_customize,
			'literatura_sm_imagen_social',
			array(
				'label'   => 'Imagen social general',
				'section' => 'literatura_sm_social',
			)
		)
	);
}
add_action( 'customize_register', 'literatura_sm_personalizador' );

/**
 * Imprime las etiquetas Open Graph y Twitter en wp_head.
 */
function literatura_sm_etiquetas_sociales() {
	if ( literatura_sm_seo_delegado() ) {
		return;
	}

	$es_libro = is_singular( 'product' );
	$libro_id = $es_libro ? get_queried_object_id() : 0;

	if ( $es_libro ) {
		$titulo      = get_the_title( $libro_id );
		$descripcion = literatura_sm_descripcion_corta( $libro_id );
		$url         = get_permalink( $libro_id );
		$tipo        = 'book';
	} else {
		$titulo      = is_front_page() ? get_bloginfo( 'name' ) . ' | Historias para cada momento' : wp_get_document_title();
		$descripcion = get_bloginfo( 'description' );
		$url         = home_url( add_query_arg( array(), '' ) );
		$tipo        = 'website';
	}

	echo "\n<!-- Literatura SM: etiquetas sociales -->\n";
	printf( '<meta property="og:type" content="%s" />' . "\n", esc_attr( $tipo ) );
	printf( '<meta property="og:site_name" content="%s" />' . "\n", esc_attr( get_bloginfo( 'name' ) ) );
	printf( '<meta property="og:locale" content="es_MX" />' . "\n" );
	printf( '<meta property="og:title" content="%s" />' . "\n", esc_attr( $titulo ) );
	if ( $descripcion ) {
		printf( '<meta property="og:description" content="%s" />' . "\n", esc_attr( $descripcion ) );
	}
	printf( '<meta property="og:url" content="%s" />' . "\n", esc_url( $url ) );

	$imagen = array();
	if ( $es_libro && has_post_thumbnail( $libro_id ) ) {
		$imagen = wp_get_attachment_image_src( get_post_thumbnail_id( $libro_id ), 'full' );
	} elseif ( literatura_sm_imagen_social_general() ) {
		$imagen = array( literatura_sm_imagen_social_general(), 1200, 630 );
	}
	if ( $imagen ) {
		printf( '<meta property="og:image" content="%s" />' . "\n", esc_url( $imagen[0] ) );
		if ( ! empty( $imagen[1] ) && ! empty( $imagen[2] ) ) {
			printf( '<meta property="og:image:width" content="%d" />' . "\n", (int) $imagen[1] );
			printf( '<meta property="og:image:height" content="%d" />' . "\n", (int) $imagen[2] );
		}
	}

	if ( $es_libro ) {
		$autor = literatura_sm_autor( $libro_id );
		$isbn  = literatura_sm_meta( $libro_id, 'isbn' );
		printf( '<meta property="book:author" content="%s" />' . "\n", esc_attr( $autor ) );
		if ( $isbn ) {
			printf( '<meta property="book:isbn" content="%s" />' . "\n", esc_attr( $isbn ) );
		}
	}

	// Las portadas son verticales: la tarjeta "summary" las muestra completas
	// como miniatura cuadrada; "summary_large_image" las recortaría mal.
	$tarjeta = $es_libro ? 'summary' : 'summary_large_image';
	printf( '<meta name="twitter:card" content="%s" />' . "\n", esc_attr( $tarjeta ) );
	printf( '<meta name="twitter:title" content="%s" />' . "\n", esc_attr( $titulo ) );
	if ( $descripcion ) {
		printf( '<meta name="twitter:description" content="%s" />' . "\n", esc_attr( $descripcion ) );
	}
	if ( $imagen ) {
		printf( '<meta name="twitter:image" content="%s" />' . "\n", esc_url( $imagen[0] ) );
	}
}
add_action( 'wp_head', 'literatura_sm_etiquetas_sociales', 5 );

/**
 * JSON-LD schema.org/Book en la ficha, con los mismos campos opcionales
 * que el rediseño: solo se emiten si existen.
 */
function literatura_sm_json_ld_libro() {
	if ( ! is_singular( 'product' ) ) {
		return;
	}
	$libro_id = get_queried_object_id();

	$datos = array(
		'@context'   => 'https://schema.org',
		'@type'      => 'Book',
		'name'       => get_the_title( $libro_id ),
		'author'     => array(
			'@type' => 'Person',
			'name'  => literatura_sm_autor( $libro_id ),
		),
		'publisher'  => array(
			'@type' => 'Organization',
			'name'  => 'Ediciones SM',
		),
		'inLanguage' => 'es',
	);

	$isbn = literatura_sm_meta( $libro_id, 'isbn' );
	if ( $isbn ) {
		$datos['isbn'] = $isbn;
	}
	$paginas = absint( literatura_sm_meta( $libro_id, 'paginas' ) );
	if ( $paginas ) {
		$datos['numberOfPages'] = $paginas;
	}
	if ( has_post_thumbnail( $libro_id ) ) {
		$datos['image'] = get_the_post_thumbnail_url( $libro_id, 'full' );
	}
	$genero = literatura_sm_meta( $libro_id, 'genero' );
	if ( $genero ) {
		$datos['genre'] = literatura_sm_titulo_frase( $genero );
	}
	$descripcion = literatura_sm_descripcion_corta( $libro_id, 400 );
	if ( $descripcion ) {
		$datos['description'] = $descripcion;
	}

	printf(
		'<script type="application/ld+json">%s</script>' . "\n",
		wp_json_encode( $datos, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES )
	);
}
add_action( 'wp_head', 'literatura_sm_json_ld_libro', 6 );
