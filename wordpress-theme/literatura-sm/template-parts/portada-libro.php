<?php
/**
 * Portada de libro: imagen real si el producto la tiene; si no, la
 * portada conceptual con la paleta derivada del ID (misma que el rediseño).
 *
 * Uso: get_template_part( 'template-parts/portada-libro', null, array(
 *     'libro_id' => 123,
 *     'grande'   => true, // opcional
 * ) );
 *
 * @package Literatura_SM
 */

defined( 'ABSPATH' ) || exit;

$libro_id = isset( $args['libro_id'] ) ? absint( $args['libro_id'] ) : get_the_ID();
$grande   = ! empty( $args['grande'] );
$titulo   = get_the_title( $libro_id );
$autor    = literatura_sm_autor( $libro_id );
$paleta   = literatura_sm_paleta( $libro_id );
$portada  = get_the_post_thumbnail_url( $libro_id, $grande ? 'large' : 'medium_large' );
?>
<?php if ( $portada ) : ?>
	<div class="book-cover book-cover-real <?php echo $grande ? 'book-cover-large' : ''; ?>" style="background: <?php echo esc_attr( $paleta[0] ); ?>">
		<img class="cover-image" src="<?php echo esc_url( $portada ); ?>" alt="<?php echo esc_attr( 'Portada de ' . $titulo ); ?>" loading="lazy" decoding="async" />
	</div>
<?php else : ?>
	<div class="book-cover <?php echo $grande ? 'book-cover-large' : ''; ?>" style="background: <?php echo esc_attr( $paleta[0] ); ?>" aria-label="<?php echo esc_attr( 'Portada conceptual de ' . $titulo ); ?>">
		<span class="cover-sun" style="background: <?php echo esc_attr( $paleta[1] ); ?>"></span>
		<span class="cover-mark" style="color: <?php echo esc_attr( $paleta[1] ); ?>">SM</span>
		<div class="cover-title" style="color: <?php echo esc_attr( $paleta[1] ); ?>"><?php echo esc_html( $titulo ); ?></div>
		<?php if ( $autor ) : ?>
			<div class="cover-author" style="color: <?php echo esc_attr( $paleta[1] ); ?>"><?php echo esc_html( $autor ); ?></div>
		<?php endif; ?>
		<span class="cover-line" style="background: <?php echo esc_attr( $paleta[1] ); ?>"></span>
	</div>
<?php endif; ?>
