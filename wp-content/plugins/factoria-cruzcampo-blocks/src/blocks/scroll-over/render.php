<?php
defined( 'ABSPATH' ) || exit;

/** @var array $attributes */
/** @var WP_Block|null $block */

$image_id = $attributes['imageId'] ?? 0;
?>

<section <?php echo bis_get_block_prop( $block, true); ?>>
	<div class="b-scroll-over__image-wrap alignfull">
		<?php if ( $image_id ) : ?>
			<?php echo wp_get_attachment_image( $image_id, 'full', false, [ 'class' => 'b-scroll-over__image' ] ); ?>
		<?php endif; ?>
	</div>
	<div class="b-scroll-over__content alignwide">
		<?php echo $content; ?>
		<div class="b-scroll-over__spacer" style="height: 100vh; width: 100%;"></div>
	</div>
</section>
