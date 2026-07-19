<?php
/**
 * Helpers de lectura de datos editoriales del libro.
 *
 * Los libros son productos de WooCommerce con metadatos personalizados
 * (autor, edad, isbn, paginas, formato, encuadernacion, coleccion, temas,
 * liga_de_booktrailer, etc.). Estas funciones son el equivalente PHP de
 * scripts/build-catalog-assets.mjs y app/lib/{youtube,share-links}.ts del
 * rediseño Next.js: misma lógica, mismos resultados.
 *
 * @package Literatura_SM
 */

defined( 'ABSPATH' ) || exit;

/**
 * Lee un metadato del libro con valor por defecto.
 *
 * @param int    $libro_id ID del producto.
 * @param string $clave    Clave del metadato (sin guion bajo inicial).
 * @param string $defecto  Valor si el metadato está vacío.
 * @return string
 */
function literatura_sm_meta( $libro_id, $clave, $defecto = '' ) {
	$valor = get_post_meta( $libro_id, $clave, true );
	if ( is_array( $valor ) ) {
		$valor = implode( ', ', array_filter( array_map( 'strval', $valor ) ) );
	}
	$valor = trim( (string) $valor );
	return '' === $valor ? $defecto : $valor;
}

/**
 * Paleta conceptual para portadas sin imagen.
 *
 * Mismo arreglo y mismo módulo por ID que el rediseño Next.js, para que un
 * libro sin portada conserve los mismos colores en ambas versiones.
 *
 * @param int $libro_id ID del producto.
 * @return array{0: string, 1: string} Color de fondo y color de acento.
 */
function literatura_sm_paleta( $libro_id ) {
	$paletas = array(
		array( '#f6b94b', '#145f63' ),
		array( '#ef6f61', '#fff2cf' ),
		array( '#9c6bba', '#f7ce5b' ),
		array( '#7aaed6', '#fff2cf' ),
		array( '#24566a', '#efb04d' ),
		array( '#37334f', '#ed7d70' ),
	);
	return $paletas[ absint( $libro_id ) % count( $paletas ) ];
}

/**
 * Autor del libro (meta `autor`), con reserva editorial.
 *
 * @param int $libro_id ID del producto.
 * @return string
 */
function literatura_sm_autor( $libro_id ) {
	return literatura_sm_meta( $libro_id, 'autor', 'Autor por confirmar' );
}

/**
 * Edad legible para mostrar en la interfaz ("5 +" → "5+").
 *
 * @param int $libro_id ID del producto.
 * @return string
 */
function literatura_sm_edad_legible( $libro_id ) {
	$edad = literatura_sm_meta( $libro_id, 'edad', 'Para todas las edades' );
	$edad = preg_replace( '/\s*\+/', '+', $edad );
	if ( preg_match( '/0\s+a\s+5/i', $edad ) ) {
		return '0–5 años';
	}
	return $edad;
}

/**
 * Grupo de edad del libro, con los mismos cortes que el rediseño.
 *
 * @param int $libro_id ID del producto.
 * @return string 0–5, 6–8, 9–11, 12–14, Secundaria, Bachillerato, Docentes…
 */
function literatura_sm_grupo_edad( $libro_id ) {
	$edad  = strtolower( preg_replace( '/\s+/', '', literatura_sm_meta( $libro_id, 'edad' ) ) );
	$nivel = literatura_sm_meta( $libro_id, 'nivel_escolar' );

	if ( false !== strpos( $edad, 'docente' ) ) {
		return 'Docentes';
	}
	if ( false !== stripos( $nivel, 'bachillerato' ) ) {
		return 'Bachillerato';
	}
	if ( false !== strpos( $edad, '0a5' ) || str_starts_with( $edad, '3+' ) || str_starts_with( $edad, '5+' ) ) {
		return '0–5';
	}
	if ( str_starts_with( $edad, '6+' ) || str_starts_with( $edad, '7+' ) ) {
		return '6–8';
	}
	if ( str_starts_with( $edad, '9+' ) ) {
		return '9–11';
	}
	if ( str_starts_with( $edad, '12+' ) || str_starts_with( $edad, '13+' ) || str_starts_with( $edad, '14+' ) ) {
		return '12–14';
	}
	if ( '' !== $nivel && ! preg_match( '/^todas$/i', $nivel ) ) {
		return $nivel;
	}
	return 'Todas las edades';
}

/**
 * Etiquetas de fila para la sección de booktrailers, por grupo de edad.
 *
 * @return array<string, string> Grupo => etiqueta, en orden de aparición.
 */
function literatura_sm_etiquetas_edad() {
	return array(
		'0–5'          => 'Primeros lectores · 0 a 5 años',
		'6–8'          => 'Para 6 a 8 años',
		'9–11'         => 'Para 9 a 11 años',
		'12–14'        => 'Para 12 a 14 años',
		'Secundaria'   => 'Secundaria',
		'Bachillerato' => 'Bachillerato y jóvenes adultos',
	);
}

/**
 * Colección o serie para el sello de la tarjeta (meta `coleccion` con
 * reserva en las categorías del producto).
 *
 * @param int $libro_id ID del producto.
 * @return string
 */
function literatura_sm_coleccion( $libro_id ) {
	$coleccion = literatura_sm_meta( $libro_id, 'coleccion' );
	if ( '' !== $coleccion ) {
		return $coleccion;
	}
	$ignoradas  = '/^(LIJ|Novedad|\d+\s*\+|Primaria|Secundaria|Bachillerato|Preescolar|0 a 5)/i';
	$categorias = get_the_terms( $libro_id, 'product_cat' );
	if ( is_array( $categorias ) ) {
		foreach ( $categorias as $categoria ) {
			if ( ! preg_match( $ignoradas, $categoria->name ) ) {
				return $categoria->name;
			}
		}
	}
	return 'Literatura SM';
}

/**
 * Temas del libro como lista de textos.
 *
 * Prefiere la taxonomía `tema` (registrada por el tema y poblada con
 * `wp literatura-sm sincronizar-taxonomias`); si aún no existe contenido,
 * cae al metadato `temas` separado por comas o pipas.
 *
 * @param int $libro_id ID del producto.
 * @return string[]
 */
function literatura_sm_temas( $libro_id ) {
	$terminos = get_the_terms( $libro_id, 'tema' );
	if ( is_array( $terminos ) && $terminos ) {
		return wp_list_pluck( $terminos, 'name' );
	}
	$meta = literatura_sm_meta( $libro_id, 'temas' );
	if ( '' === $meta ) {
		return array();
	}
	$partes = preg_split( '/[,|]/', $meta );
	return array_values( array_filter( array_map( 'trim', $partes ) ) );
}

/**
 * Tema principal para el sello coral de las tarjetas.
 *
 * @param int $libro_id ID del producto.
 * @return string
 */
function literatura_sm_tema_principal( $libro_id ) {
	$temas = literatura_sm_temas( $libro_id );
	if ( $temas ) {
		return literatura_sm_titulo_frase( $temas[0] );
	}
	return literatura_sm_titulo_frase( literatura_sm_meta( $libro_id, 'genero', 'Literatura' ) );
}

/**
 * Capitaliza cada palabra respetando acentos ("aventura" → "Aventura").
 *
 * @param string $texto Texto en minúsculas.
 * @return string
 */
function literatura_sm_titulo_frase( $texto ) {
	return mb_convert_case( trim( (string) $texto ), MB_CASE_TITLE, 'UTF-8' );
}

/**
 * ¿El libro está marcado como novedad?
 *
 * Igual que el rediseño: manda la categoría Novedad/Novedades del producto;
 * el metadato `novedad` queda como respaldo.
 *
 * @param int $libro_id ID del producto.
 * @return bool
 */
function literatura_sm_es_novedad( $libro_id ) {
	$categorias = get_the_terms( $libro_id, 'product_cat' );
	if ( is_array( $categorias ) ) {
		foreach ( $categorias as $categoria ) {
			if ( preg_match( '/^novedad(?:es)?$/i', $categoria->name ) ) {
				return true;
			}
		}
	}
	return in_array( strtolower( literatura_sm_meta( $libro_id, 'novedad' ) ), array( '1', 'si', 'sí', 'true' ), true );
}

/**
 * Descripción corta del libro en texto plano, recortada para compartir.
 *
 * @param int $libro_id ID del producto.
 * @param int $maximo   Longitud máxima.
 * @return string
 */
function literatura_sm_descripcion_corta( $libro_id, $maximo = 180 ) {
	$post  = get_post( $libro_id );
	$texto = $post ? trim( wp_strip_all_tags( '' !== $post->post_excerpt ? $post->post_excerpt : $post->post_content ) ) : '';
	$texto = preg_replace( '/\s+/', ' ', $texto );
	if ( '' === $texto ) {
		return 'Consulta la ficha editorial de este título y descubre su propuesta de lectura.';
	}
	if ( mb_strlen( $texto ) > $maximo ) {
		return rtrim( mb_substr( $texto, 0, $maximo - 3 ) ) . '…';
	}
	return $texto;
}

/**
 * Texto para compartir la ficha, con la voz del sitio.
 *
 * @param int $libro_id ID del producto.
 * @return string
 */
function literatura_sm_texto_compartir( $libro_id ) {
	return sprintf(
		'«%s», de %s. %s',
		get_the_title( $libro_id ),
		literatura_sm_autor( $libro_id ),
		literatura_sm_descripcion_corta( $libro_id )
	);
}

/*
 * ------------------------------------------------------------------
 * Enlaces de compartir (equivalente de app/lib/share-links.ts).
 * Instagram no ofrece URL web de share: el JS usa la hoja nativa del
 * sistema (navigator.share) o copia el enlace.
 * ------------------------------------------------------------------
 */

/**
 * URL de compartir por WhatsApp.
 *
 * @param string $texto Texto del mensaje.
 * @param string $url   URL a compartir.
 * @return string
 */
function literatura_sm_url_whatsapp( $texto, $url ) {
	return 'https://wa.me/?text=' . rawurlencode( trim( $texto . ' ' . $url ) );
}

/**
 * URL de compartir en Facebook.
 *
 * @param string $url URL a compartir.
 * @return string
 */
function literatura_sm_url_facebook( $url ) {
	return 'https://www.facebook.com/sharer/sharer.php?u=' . rawurlencode( $url );
}

/**
 * URL mailto con asunto y cuerpo.
 *
 * @param string $asunto Asunto del correo.
 * @param string $cuerpo Cuerpo del correo.
 * @return string
 */
function literatura_sm_url_correo( $asunto, $cuerpo ) {
	return 'mailto:?subject=' . rawurlencode( $asunto ) . '&body=' . rawurlencode( $cuerpo );
}

/*
 * ------------------------------------------------------------------
 * YouTube (equivalente de app/lib/youtube.ts). Nada de YouTube se
 * carga hasta que la persona da clic: solo miniaturas de i.ytimg.com
 * y el embed youtube-nocookie bajo demanda.
 * ------------------------------------------------------------------
 */

/**
 * Extrae el ID de video de una URL de YouTube (youtu.be, watch, embed…).
 *
 * @param string $url URL del booktrailer.
 * @return string ID de 11 caracteres, o cadena vacía si no es válido.
 */
function literatura_sm_youtube_id( $url ) {
	if ( ! $url ) {
		return '';
	}
	$partes = wp_parse_url( $url );
	if ( empty( $partes['host'] ) ) {
		return '';
	}
	$host      = preg_replace( '/^www\./', '', strtolower( $partes['host'] ) );
	$ruta      = isset( $partes['path'] ) ? $partes['path'] : '';
	$candidato = '';
	if ( 'youtu.be' === $host ) {
		$segmentos = array_values( array_filter( explode( '/', $ruta ) ) );
		$candidato = isset( $segmentos[0] ) ? $segmentos[0] : '';
	} elseif ( in_array( $host, array( 'youtube.com', 'm.youtube.com', 'youtube-nocookie.com' ), true ) ) {
		if ( '/watch' === $ruta ) {
			parse_str( isset( $partes['query'] ) ? $partes['query'] : '', $consulta );
			$candidato = isset( $consulta['v'] ) ? $consulta['v'] : '';
		} elseif ( preg_match( '#^/(?:embed|shorts|live)/([^/]+)#', $ruta, $coincidencia ) ) {
			$candidato = $coincidencia[1];
		}
	}
	return preg_match( '/^[A-Za-z0-9_-]{11}$/', (string) $candidato ) ? $candidato : '';
}

/**
 * Miniatura del video en el CDN de YouTube.
 *
 * @param string $video_id ID del video.
 * @return string
 */
function literatura_sm_youtube_miniatura( $video_id ) {
	return 'https://i.ytimg.com/vi/' . rawurlencode( $video_id ) . '/hqdefault.jpg';
}

/**
 * URL de embed sin cookies, con autoplay al insertarse tras el clic.
 *
 * @param string $video_id ID del video.
 * @return string
 */
function literatura_sm_youtube_embed( $video_id ) {
	return 'https://www.youtube-nocookie.com/embed/' . rawurlencode( $video_id ) . '?autoplay=1&rel=0';
}

/**
 * Libros publicados con booktrailer válido, listos para las filas.
 *
 * @return array<int, array{id:int, titulo:string, autor:string, edad:string, grupo:string, video:string, miniatura:string, url:string, novedad:bool}>
 */
function literatura_sm_libros_con_trailer() {
	$consulta = new WP_Query(
		array(
			'post_type'      => 'product',
			'post_status'    => 'publish',
			'posts_per_page' => -1,
			'orderby'        => 'ID',
			'order'          => 'DESC',
			'no_found_rows'  => true,
			'meta_query'     => array(
				array(
					'key'     => 'liga_de_booktrailer',
					'value'   => '',
					'compare' => '!=',
				),
			),
		)
	);

	$trailers = array();
	foreach ( $consulta->posts as $post ) {
		$video_id = literatura_sm_youtube_id( literatura_sm_meta( $post->ID, 'liga_de_booktrailer' ) );
		if ( '' === $video_id ) {
			continue;
		}
		$trailers[] = array(
			'id'        => $post->ID,
			'titulo'    => get_the_title( $post ),
			'autor'     => literatura_sm_autor( $post->ID ),
			'edad'      => literatura_sm_edad_legible( $post->ID ),
			'grupo'     => literatura_sm_grupo_edad( $post->ID ),
			'video'     => $video_id,
			'miniatura' => literatura_sm_youtube_miniatura( $video_id ),
			'url'       => get_permalink( $post ),
			'novedad'   => literatura_sm_es_novedad( $post->ID ),
		);
	}
	return $trailers;
}

/**
 * Agrupa los trailers en filas por edad, en el orden editorial del sitio.
 *
 * @param array $trailers Resultado de literatura_sm_libros_con_trailer().
 * @return array<int, array{grupo:string, etiqueta:string, trailers:array}>
 */
function literatura_sm_filas_de_trailers( $trailers ) {
	$orden  = array_keys( literatura_sm_etiquetas_edad() );
	$grupos = array();
	foreach ( $trailers as $trailer ) {
		$grupos[ $trailer['grupo'] ][] = $trailer;
	}
	uksort(
		$grupos,
		static function ( $a, $b ) use ( $orden ) {
			$pos_a = array_search( $a, $orden, true );
			$pos_b = array_search( $b, $orden, true );
			$pos_a = false === $pos_a ? count( $orden ) : $pos_a;
			$pos_b = false === $pos_b ? count( $orden ) : $pos_b;
			return $pos_a === $pos_b ? strcmp( $a, $b ) : $pos_a - $pos_b;
		}
	);

	$etiquetas = literatura_sm_etiquetas_edad();
	$filas     = array();
	foreach ( $grupos as $grupo => $lista ) {
		$filas[] = array(
			'grupo'    => $grupo,
			'etiqueta' => isset( $etiquetas[ $grupo ] ) ? $etiquetas[ $grupo ] : $grupo,
			'trailers' => $lista,
		);
	}
	return $filas;
}

/**
 * Trailer destacado: la novedad más reciente con video, o el primero.
 *
 * @param array $trailers Resultado de literatura_sm_libros_con_trailer().
 * @return array|null
 */
function literatura_sm_trailer_destacado( $trailers ) {
	foreach ( $trailers as $trailer ) {
		if ( $trailer['novedad'] ) {
			return $trailer;
		}
	}
	return $trailers ? $trailers[0] : null;
}

/**
 * Novedades del catálogo (categoría Novedad/Novedades), más recientes primero.
 *
 * @param int $limite Número máximo de libros; -1 para todos.
 * @return WP_Post[]
 */
function literatura_sm_novedades( $limite = 8 ) {
	$consulta = new WP_Query(
		array(
			'post_type'      => 'product',
			'post_status'    => 'publish',
			'posts_per_page' => $limite,
			'orderby'        => 'ID',
			'order'          => 'DESC',
			'no_found_rows'  => true,
			'tax_query'      => array(
				array(
					'taxonomy' => 'product_cat',
					'field'    => 'slug',
					'terms'    => array( 'novedad', 'novedades' ),
				),
			),
		)
	);
	if ( $consulta->posts ) {
		return $consulta->posts;
	}
	// Sin categoría de novedades todavía: mostramos lo más reciente.
	$recientes = new WP_Query(
		array(
			'post_type'      => 'product',
			'post_status'    => 'publish',
			'posts_per_page' => $limite,
			'orderby'        => 'ID',
			'order'          => 'DESC',
			'no_found_rows'  => true,
		)
	);
	return $recientes->posts;
}

/**
 * Libros relacionados: comparten tema con el libro actual; si faltan,
 * se completan con títulos recientes.
 *
 * @param int $libro_id ID del producto.
 * @param int $limite   Cuántos relacionados.
 * @return WP_Post[]
 */
function literatura_sm_relacionados( $libro_id, $limite = 3 ) {
	$argumentos = array(
		'post_type'      => 'product',
		'post_status'    => 'publish',
		'posts_per_page' => $limite,
		'post__not_in'   => array( $libro_id ),
		'orderby'        => 'ID',
		'order'          => 'DESC',
		'no_found_rows'  => true,
	);

	$temas         = get_the_terms( $libro_id, 'tema' );
	$relacionados  = array();
	if ( is_array( $temas ) && $temas ) {
		$argumentos['tax_query'] = array(
			array(
				'taxonomy' => 'tema',
				'field'    => 'term_id',
				'terms'    => wp_list_pluck( $temas, 'term_id' ),
			),
		);
		$consulta     = new WP_Query( $argumentos );
		$relacionados = $consulta->posts;
	}

	if ( count( $relacionados ) < $limite ) {
		unset( $argumentos['tax_query'] );
		$argumentos['post__not_in'] = array_merge( array( $libro_id ), wp_list_pluck( $relacionados, 'ID' ) );
		$argumentos['posts_per_page'] = $limite - count( $relacionados );
		$relleno      = new WP_Query( $argumentos );
		$relacionados = array_merge( $relacionados, $relleno->posts );
	}

	return $relacionados;
}

/**
 * URL del catálogo (archivo de productos), destino de búsquedas y filtros.
 *
 * @return string
 */
function literatura_sm_url_catalogo() {
	if ( function_exists( 'wc_get_page_id' ) ) {
		$tienda = wc_get_page_id( 'shop' );
		if ( $tienda > 0 ) {
			$enlace = get_permalink( $tienda );
			if ( $enlace ) {
				return $enlace;
			}
		}
	}
	$enlace = get_post_type_archive_link( 'product' );
	return $enlace ? $enlace : home_url( '/' );
}

/**
 * URL de una página del sitio por slug, con reserva al catálogo.
 *
 * @param string $slug Slug de la página (por ejemplo `planes-lectores`).
 * @return string
 */
function literatura_sm_url_pagina( $slug ) {
	$pagina = get_page_by_path( $slug );
	if ( $pagina instanceof WP_Post && 'publish' === $pagina->post_status ) {
		return get_permalink( $pagina );
	}
	return literatura_sm_url_catalogo();
}
