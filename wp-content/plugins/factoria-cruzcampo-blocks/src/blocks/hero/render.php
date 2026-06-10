<?php
defined( 'ABSPATH' ) || exit;

/** @var array    $attributes */
/** @var WP_Block $block */

$claim   = $attributes['claim'] ?? '';
$link    = $attributes['link'] ?? [];
$menu_id = (int) ( $attributes['menuId'] ?? 0 );
$media   = $attributes['media'] ?? [];

if ( empty( $link['title'] ) ) {
	$link['title'] = __( 'Reserva ahora', 'factoria-cruzcampo-blocks' );
}
?>

<section <?php echo bis_get_block_prop( $block, false, ['class' => 'alignfull'] ); ?>>

	<div class="b-hero__bg alignfull">
		<?php bis_paint_media( $media ); ?>
	</div>

	<div class="b-hero__content alignexpand">
		<?php if ( $claim ) : ?>
			<h1 class="b-hero__claim"><?php echo wp_kses_post( $claim ); ?></h1>
		<?php endif; ?>
	</div>

	<div class="b-hero__bottom alignexpand">
		<?php bis_paint_button( $link, 'large', 'b-hero__cta' ); ?>

		<?php if ( $menu_id ) : ?>
			<nav class="b-hero__nav" aria-label="<?php esc_attr_e( 'Navegación', 'factoria-cruzcampo-blocks' ); ?>">
				<?php
				wp_nav_menu( [
					'menu'        => $menu_id,
					'menu_class'  => 'b-hero__menu',
					'container'   => false,
					'items_wrap'  => '<ul class="%2$s">%3$s</ul>',
					'depth'       => 1,
				] );
				?>
			</nav>
		<?php endif; ?>
	</div>

</section>
