<?php
/**
 * Registro del modelo de datos: metadatos editoriales, taxonomías de
 * exploración y comando WP-CLI para poblarlas desde los metadatos
 * existentes de WooCommerce.
 *
 * @package Literatura_SM
 */

defined( 'ABSPATH' ) || exit;

/**
 * Metadatos editoriales que el catálogo ya trae en producción.
 *
 * Las claves coinciden exactamente con los campos personalizados del
 * WooCommerce actual (ver docs/wordpress-directo-plan.md para el mapeo
 * completo). Registrarlas las expone en la REST API y las documenta
 * para el equipo editorial.
 *
 * @return array<string, string> Clave => descripción.
 */
function literatura_sm_campos_editoriales() {
	return array(
		'autor'                       => 'Nombre de la autora o autor.',
		'nacionalidad_del_autor'      => 'Nacionalidad de la autora o autor.',
		'ilustrador'                  => 'Nombre de la ilustradora o ilustrador.',
		'nacionalidad_del_ilustrador' => 'Nacionalidad de la ilustradora o ilustrador.',
		'coleccion'                   => 'Colección o serie editorial.',
		'genero'                      => 'Género literario (narrativa, ilustrado…).',
		'temas'                       => 'Temas separados por comas (respaldo de la taxonomía tema).',
		'edad'                        => 'Edad sugerida, por ejemplo «9 +».',
		'nivel_escolar'               => 'Nivel escolar: Preescolar, Primaria, Secundaria o Bachillerato.',
		'grado_escolar'               => 'Grado escolar sugerido.',
		'isbn'                        => 'ISBN-13 del título.',
		'paginas'                     => 'Número de páginas.',
		'formato'                     => 'Formato físico del libro.',
		'encuadernacion'              => 'Tipo de encuadernación.',
		'novedad'                     => 'Marca de novedad (respaldo de la categoría Novedades).',
		'dificultad'                  => 'Nivel de dificultad lectora.',
		'nivel_plan'                  => 'Nivel dentro del plan lector.',
		'liga_de_booktrailer'         => 'URL de YouTube del booktrailer.',
		'liga_audiolibros'            => 'URL del audiolibro.',
		'liga_podcast'                => 'URL del podcast relacionado.',
		'liga_ebook_amazon'           => 'URL del ebook en Amazon.',
	);
}

/**
 * Registra los metadatos para exponerlos en REST y dejar constancia del
 * modelo esperado. No cambia cómo se guardan: son los mismos post meta
 * que WooCommerce ya tiene.
 */
function literatura_sm_registrar_metadatos() {
	foreach ( literatura_sm_campos_editoriales() as $clave => $descripcion ) {
		register_post_meta(
			'product',
			$clave,
			array(
				'type'         => 'string',
				'description'  => $descripcion,
				'single'       => true,
				'show_in_rest' => true,
				'auth_callback' => static function () {
					return current_user_can( 'edit_products' ) || current_user_can( 'edit_posts' );
				},
			)
		);
	}
}
add_action( 'init', 'literatura_sm_registrar_metadatos' );

/**
 * Taxonomías de exploración del catálogo.
 *
 * `edad_lectora`, `tema` y `plan_lector` alimentan los filtros del
 * archivo con consultas eficientes y conteos por término. Se pueblan
 * desde los metadatos existentes con:
 *
 *     wp literatura-sm sincronizar-taxonomias
 */
function literatura_sm_registrar_taxonomias() {
	register_taxonomy(
		'edad_lectora',
		'product',
		array(
			'labels'            => array(
				'name'          => 'Edades lectoras',
				'singular_name' => 'Edad lectora',
				'menu_name'     => 'Edades lectoras',
			),
			'public'            => true,
			'hierarchical'      => false,
			'show_admin_column' => true,
			'show_in_rest'      => true,
			'rewrite'           => array( 'slug' => 'edad' ),
		)
	);

	register_taxonomy(
		'tema',
		'product',
		array(
			'labels'            => array(
				'name'          => 'Temas',
				'singular_name' => 'Tema',
				'menu_name'     => 'Temas',
			),
			'public'            => true,
			'hierarchical'      => false,
			'show_admin_column' => true,
			'show_in_rest'      => true,
			'rewrite'           => array( 'slug' => 'tema' ),
		)
	);

	register_taxonomy(
		'plan_lector',
		'product',
		array(
			'labels'            => array(
				'name'          => 'Planes lectores',
				'singular_name' => 'Plan lector',
				'menu_name'     => 'Planes lectores',
			),
			'public'            => true,
			'hierarchical'      => false,
			'show_admin_column' => true,
			'show_in_rest'      => true,
			'rewrite'           => array( 'slug' => 'plan' ),
		)
	);
}
add_action( 'init', 'literatura_sm_registrar_taxonomias', 5 );

/**
 * Respaldo sin WooCommerce: si el plugin no está activo, registra un tipo
 * `product` mínimo con las mismas taxonomías nativas para que el tema siga
 * funcionando (por ejemplo en un ambiente de revisión del área de
 * tecnología). Con WooCommerce activo esta función no hace nada.
 */
function literatura_sm_respaldo_sin_woocommerce() {
	if ( class_exists( 'WooCommerce' ) || post_type_exists( 'product' ) ) {
		return;
	}

	register_post_type(
		'product',
		array(
			'labels'       => array(
				'name'          => 'Libros',
				'singular_name' => 'Libro',
			),
			'public'       => true,
			'has_archive'  => true,
			'rewrite'      => array( 'slug' => 'producto' ),
			'menu_icon'    => 'dashicons-book-alt',
			'show_in_rest' => true,
			'supports'     => array( 'title', 'editor', 'excerpt', 'thumbnail', 'custom-fields' ),
		)
	);

	register_taxonomy(
		'product_cat',
		'product',
		array(
			'labels'            => array(
				'name'          => 'Categorías de libro',
				'singular_name' => 'Categoría de libro',
			),
			'public'            => true,
			'hierarchical'      => true,
			'show_admin_column' => true,
			'show_in_rest'      => true,
			'rewrite'           => array( 'slug' => 'categoria-producto' ),
		)
	);

	register_taxonomy(
		'product_tag',
		'product',
		array(
			'labels'            => array(
				'name'          => 'Etiquetas de libro',
				'singular_name' => 'Etiqueta de libro',
			),
			'public'            => true,
			'hierarchical'      => false,
			'show_in_rest'      => true,
			'rewrite'           => array( 'slug' => 'etiqueta-producto' ),
		)
	);
}
add_action( 'init', 'literatura_sm_respaldo_sin_woocommerce', 4 );

/**
 * Planes lectores presentes en un libro, derivados de sus categorías de
 * producto. Mismo criterio que extractPlans() del rediseño:
 * «Loran > Nivel», «Trotamundos Nivel», las categorías simples «Loran» y
 * «Trotamundos», y Cosmos cuando el nivel escolar es Bachillerato.
 *
 * @param int $libro_id ID del producto.
 * @return string[] Nombres de plan: Loran, Trotamundos, Cosmos.
 */
function literatura_sm_planes_del_libro( $libro_id ) {
	$planes     = array();
	$categorias = get_the_terms( $libro_id, 'product_cat' );
	if ( is_array( $categorias ) ) {
		foreach ( $categorias as $categoria ) {
			$nombre = trim( $categoria->name );
			if ( preg_match( '/^(Loran|Trotamundos)(?:\s*>|\s|$)/i', $nombre, $coincidencia ) ) {
				$planes[ literatura_sm_titulo_frase( $coincidencia[1] ) ] = true;
			}
		}
	}
	if ( false !== stripos( literatura_sm_meta( $libro_id, 'nivel_escolar' ), 'bachillerato' ) ) {
		$planes['Cosmos'] = true;
	}
	return array_keys( $planes );
}

/**
 * Sincroniza las taxonomías de exploración de un libro a partir de sus
 * metadatos y categorías actuales.
 *
 * @param int $libro_id ID del producto.
 */
function literatura_sm_sincronizar_libro( $libro_id ) {
	wp_set_object_terms( $libro_id, literatura_sm_grupo_edad( $libro_id ), 'edad_lectora', false );

	$temas = array_map( 'literatura_sm_titulo_frase', literatura_sm_temas( $libro_id ) );
	wp_set_object_terms( $libro_id, $temas, 'tema', false );

	wp_set_object_terms( $libro_id, literatura_sm_planes_del_libro( $libro_id ), 'plan_lector', false );
}

// Mantiene las taxonomías al día cuando se guarda un libro en el admin.
add_action(
	'save_post_product',
	static function ( $libro_id, $post, $actualizacion ) {
		if ( wp_is_post_revision( $libro_id ) || 'publish' !== $post->post_status ) {
			return;
		}
		literatura_sm_sincronizar_libro( $libro_id );
	},
	20,
	3
);

/*
 * Comando WP-CLI para el arranque inicial:
 *
 *     wp literatura-sm sincronizar-taxonomias
 *
 * Recorre todos los productos publicados y llena edad_lectora, tema y
 * plan_lector desde los metadatos/categorías existentes. Es idempotente:
 * puede correrse las veces que haga falta.
 */
if ( defined( 'WP_CLI' ) && WP_CLI ) {
	WP_CLI::add_command(
		'literatura-sm sincronizar-taxonomias',
		static function () {
			$consulta = new WP_Query(
				array(
					'post_type'      => 'product',
					'post_status'    => 'publish',
					'posts_per_page' => -1,
					'fields'         => 'ids',
					'no_found_rows'  => true,
				)
			);
			$total = count( $consulta->posts );
			$barra = \WP_CLI\Utils\make_progress_bar( 'Sincronizando taxonomías', $total );
			foreach ( $consulta->posts as $libro_id ) {
				literatura_sm_sincronizar_libro( $libro_id );
				$barra->tick();
			}
			$barra->finish();
			WP_CLI::success( sprintf( '%d libros sincronizados en edad_lectora, tema y plan_lector.', $total ) );
		}
	);
}
