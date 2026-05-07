<?php
defined( 'ABSPATH' ) || exit;

/** @var array $attributes */
/** @var WP_Block|null $block */

$center1 = isset( $attributes['center1'] ) && is_array( $attributes['center1'] ) ? $attributes['center1'] : array();
$center2 = isset( $attributes['center2'] ) && is_array( $attributes['center2'] ) ? $attributes['center2'] : array();

$icon_left_id  = isset( $attributes['iconLeft'] ) ? (int) $attributes['iconLeft'] : 0;
$icon_right_id = isset( $attributes['iconRight'] ) ? (int) $attributes['iconRight'] : 0;

?>

<div <?php echo bis_get_block_prop( $block, false ); ?>>
		<div class="b-layout-2-fotos__grid">
			<div class="b-layout-2-fotos__icon b-layout-2-fotos__icon--left">
				<?php
				if ( $icon_left_id ) {
					echo wp_get_attachment_image(
						$icon_left_id,
						'full',
						false,
						array(
							'class'   => 'b-layout-2-fotos__icon-el',
							'loading' => 'lazy',
						)
					);
				}
				?>
			</div>

			<?php bis_paint_media( $center1, 'b-layout-2-fotos__media--1' ); ?>
			<?php bis_paint_media( $center2, 'b-layout-2-fotos__media--2' ); ?>

			<div class="b-layout-2-fotos__icon b-layout-2-fotos__icon--right">
				<?php
				if ( $icon_right_id ) {
					echo wp_get_attachment_image(
						$icon_right_id,
						'full',
						false,
						array(
							'class'   => 'b-layout-2-fotos__icon-el',
							'loading' => 'lazy',
						)
					);
				}
				?>
			</div>
		</div>
</div>

