<?php
defined( 'ABSPATH' ) || exit;

$image_id           = $attributes['image'] ?? 0;
$vertical_alignment = $attributes['verticalAlignment'] ?? 'center';
$image_position     = $attributes['imagePosition'] ?? 'left';
$extra_classes      = 'is-vertically-aligned-' . esc_attr( $vertical_alignment ) . ' is-image-position-' . esc_attr( $image_position );
?>

<div <?php echo bis_get_block_prop( $block, false, [ 'class' => $extra_classes ] ); ?>>
	<div class="b-imagen-texto__image">
		<?php if ( $image_id ) : ?>
			<?php echo wp_get_attachment_image( $image_id, 'full', false, [ 'loading' => 'lazy' ] ); ?>
		<?php endif; ?>
	</div>
	<div class="b-imagen-texto__content">
		<?php echo $content; ?>
	</div>
</div>
