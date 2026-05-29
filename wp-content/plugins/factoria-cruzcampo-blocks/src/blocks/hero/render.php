<?php
defined( 'ABSPATH' ) || exit;

/** @var array    $attributes */
/** @var WP_Block $block */

$claim      = $attributes['claim'] ?? '';
$link       = $attributes['link'] ?? [];
$link_url   = $link['url'] ?? '';
$link_title = ! empty( $link['title'] ) ? $link['title'] : __( 'Reserva ahora', 'factoria-cruzcampo-blocks' );
$menu_id    = (int) ( $attributes['menuId'] ?? 0 );
$media      = $attributes['media'] ?? [];
?>

<section <?php echo bis_get_block_prop( $block, false ); ?>>

	<div class="b-hero__bg">
		<?php bis_paint_media( $media ); ?>
	</div>

	<div class="b-hero__content">
		<?php if ( $claim ) : ?>
			<h1 class="b-hero__claim"><?php echo wp_kses_post( $claim ); ?></h1>
		<?php endif; ?>
	</div>

	<div class="b-hero__bottom">
		<?php if ( $link_url ) : ?>
			<a class="b-hero__cta"
				href="<?php echo esc_url( $link_url ); ?>"
				<?php if ( ! empty( $link['target'] ) ) : ?>target="<?php echo esc_attr( $link['target'] ); ?>"<?php endif; ?>
				<?php if ( ! empty( $link['rel'] ) ) : ?>rel="<?php echo esc_attr( $link['rel'] ); ?>"<?php endif; ?>
			>
				<span class="b-hero__cta-text"><?php echo esc_html( $link_title ); ?></span>
				<span class="b-hero__cta-arrow" aria-hidden="true">↗</span>
			</a>
		<?php endif; ?>

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
