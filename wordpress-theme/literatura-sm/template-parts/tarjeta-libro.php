<?php
/**
 * Tarjeta de libro para retículas de catálogo.
 *
 * Uso: get_template_part( 'template-parts/tarjeta-libro', null, array(
 *     'libro_id' => 123,
 * ) );
 *
 * @package Literatura_SM
 */

defined( 'ABSPATH' ) || exit;

$libro_id  = isset( $args['libro_id'] ) ? absint( $args['libro_id'] ) : get_the_ID();
$titulo    = get_the_title( $libro_id );
$enlace    = get_permalink( $libro_id );
$autor     = literatura_sm_autor( $libro_id );
$edad      = literatura_sm_edad_legible( $libro_id );
$nivel     = literatura_sm_meta( $libro_id, 'grado_escolar', literatura_sm_meta( $libro_id, 'nivel_escolar', 'Lectura libre' ) );
$coleccion = literatura_sm_coleccion( $libro_id );
?>
<article class="book-card">
	<a class="card-main-link" href="<?php echo esc_url( $enlace ); ?>">
		<?php get_template_part( 'template-parts/portada-libro', null, array( 'libro_id' => $libro_id ) ); ?>
		<div class="book-card-info">
			<span class="book-tag"><?php echo esc_html( literatura_sm_tema_principal( $libro_id ) ); ?></span>
			<strong class="book-card-title"><?php echo esc_html( $titulo ); ?></strong>
			<span class="book-card-author"><?php echo esc_html( $autor ); ?></span>
			<div class="book-meta">
				<span><?php echo esc_html( $edad ); ?></span>
				<span><?php echo esc_html( literatura_sm_titulo_frase( $nivel ) ); ?></span>
				<span><?php echo esc_html( $coleccion ); ?></span>
			</div>
			<span class="card-detail-link">Ver ficha <span aria-hidden="true">↗</span></span>
		</div>
	</a>
</article>
