<?php
defined( 'ABSPATH' ) || exit;

/** @var array $attributes */
/** @var WP_Block|null $block */

$center1 = isset( $attributes['center1'] ) && is_array( $attributes['center1'] ) ? $attributes['center1'] : array();
$center2 = isset( $attributes['center2'] ) && is_array( $attributes['center2'] ) ? $attributes['center2'] : array();

$icon_left_id  = isset( $attributes['iconLeft'] ) ? (int) $attributes['iconLeft'] : 0;
$icon_right_id = isset( $attributes['iconRight'] ) ? (int) $attributes['iconRight'] : 0;

function fcb_layout_2_fotos_render_media( $media ) {
	$type     = isset( $media['mediaType'] ) ? (string) $media['mediaType'] : 'image';
	$image_id = isset( $media['imageId'] ) ? (int) $media['imageId'] : 0;
	$video_url = isset( $media['videoUrl'] ) ? trim( (string) $media['videoUrl'] ) : '';
	$poster_id = isset( $media['posterId'] ) ? (int) $media['posterId'] : 0;

	if ( $type === 'video' && $video_url ) {
		$poster_url = $poster_id ? wp_get_attachment_image_url( $poster_id, 'full' ) : '';
		?>
		<video
			class="b-layout-2-fotos__media-el"
			src="<?php echo esc_url( $video_url ); ?>"
			<?php if ( $poster_url ) : ?>
				poster="<?php echo esc_url( $poster_url ); ?>"
			<?php endif; ?>
			autoplay
			muted
			loop
			playsinline
		></video>
		<?php
		return;
	}

	if ( $image_id ) {
		echo wp_get_attachment_image(
			$image_id,
			'full',
			false,
			array(
				'class'   => 'b-layout-2-fotos__media-el',
				'loading' => 'lazy',
			)
		);
	}
}

?>

<div <?php echo bis_get_block_prop( $block, true ); ?>>
	<div class="b-layout-2-fotos">
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

			<div class="b-layout-2-fotos__media b-layout-2-fotos__media--1">
				<?php fcb_layout_2_fotos_render_media( $center1 ); ?>
			</div>

			<div class="b-layout-2-fotos__media b-layout-2-fotos__media--2">
				<?php fcb_layout_2_fotos_render_media( $center2 ); ?>
			</div>

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
</div>

