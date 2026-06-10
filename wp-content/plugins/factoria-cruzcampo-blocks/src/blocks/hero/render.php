<?php
defined( 'ABSPATH' ) || exit;

/** @var array    $attributes */
/** @var WP_Block $block */

$claim               = $attributes['claim'] ?? '';
$link                = $attributes['link'] ?? [];
$menu_id             = (int) ( $attributes['menuId'] ?? 0 );
$media               = $attributes['media'] ?? [];
$overlay_color_slug  = $attributes['overlayColor'] ?? '';
$custom_overlay_color = $attributes['customOverlayColor'] ?? '';
$dim_ratio           = isset( $attributes['dimRatio'] ) ? (int) $attributes['dimRatio'] : 50;
$has_overlay         = $overlay_color_slug || $custom_overlay_color;
$overlay_style       = '';
$claim_size = (float) ( $attributes['claimFontSize'] ?? 11 );
$claim_min  = isset( $attributes['claimFontSizeMin'] ) ? (int) $attributes['claimFontSizeMin'] : null;
$claim_max  = isset( $attributes['claimFontSizeMax'] ) ? (int) $attributes['claimFontSizeMax'] : null;

if ( $claim_min !== null && $claim_max !== null ) {
	$claim_font_size = "clamp({$claim_min}px, {$claim_size}vw, {$claim_max}px)";
} elseif ( $claim_min !== null ) {
	$claim_font_size = "max({$claim_min}px, {$claim_size}vw)";
} elseif ( $claim_max !== null ) {
	$claim_font_size = "min({$claim_size}vw, {$claim_max}px)";
} else {
	$claim_font_size = "{$claim_size}vw";
}

if ( $has_overlay ) {
	$overlay_bg    = $custom_overlay_color
		? 'background-color:' . sanitize_hex_color( $custom_overlay_color ) . ';'
		: 'background-color:var(--wp--preset--color--' . sanitize_html_class( $overlay_color_slug ) . ');';
	$overlay_style = $overlay_bg . 'opacity:' . round( $dim_ratio / 100, 2 ) . ';';
}

if ( empty( $link['title'] ) ) {
	$link['title'] = __( 'Reserva ahora', 'factoria-cruzcampo-blocks' );
}
?>

<section <?php echo bis_get_block_prop( $block, false, ['class' => 'alignfull'] ); ?>>

	<div class="b-hero__bg alignfull">
		<?php bis_paint_media( $media ); ?>
		<?php if ( $has_overlay ) : ?>
			<div class="b-hero__overlay" style="<?php echo esc_attr( $overlay_style ); ?>"></div>
		<?php endif; ?>
	</div>

	<div class="b-hero__content alignexpand">
		<?php if ( $claim ) : ?>
			<h1 class="b-hero__claim" style="font-size:<?php echo esc_attr( $claim_font_size ); ?>"><?php echo wp_kses_post( $claim ); ?></h1>
		<?php endif; ?>
	</div>

	<div class="b-hero__bottom alignfull">
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
