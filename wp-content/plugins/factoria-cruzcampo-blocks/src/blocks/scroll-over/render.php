<?php
defined( 'ABSPATH' ) || exit;

/** @var array $attributes */
/** @var WP_Block|null $block */

$image_id  = $attributes['imageId'] ?? 0;
$image_url = $image_id ? wp_get_attachment_image_url( $image_id, 'full' ) : '';
$image_alt = $image_id ? (string) get_post_meta( $image_id, '_wp_attachment_image_alt', true ) : '';
?>

<section <?php echo bis_get_block_prop( $block, true ); ?>>
	<div class="b-scroll-over__image-wrap">
		<?php if ( $image_url ) : ?>
			<img
				class="b-scroll-over__image"
				src="<?php echo esc_url( $image_url ); ?>"
				alt="<?php echo esc_attr( $image_alt ); ?>"
			/>
		<?php endif; ?>
	</div>
	<div class="b-scroll-over__content">
		<?php echo $content; ?>
	</div>
</section>
