<?php
defined( 'ABSPATH' ) || exit;

/** @var array $attributes */
/** @var WP_Block|null $block */

$image_id = $attributes['image'] ?? 0;
?>

<div <?php echo bis_get_block_prop( $block, false ); ?>>
	<div class="b-banner__content is-prose has-background-color has-red-background-color has-white-color">
		<?php echo $content; ?>
	</div>
	<div class="b-banner__image">
		<?php if ( $image_id ) : ?>
			<?php echo wp_get_attachment_image( $image_id, 'full', false, [ 'loading' => 'lazy' ] ); ?>
		<?php endif; ?>
	</div>
</div>
