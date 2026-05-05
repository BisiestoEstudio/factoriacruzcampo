<?php
defined('ABSPATH') || exit;

$image_id           = $attributes['image'] ?? 0;
$vertical_alignment = $attributes['verticalAlignment'] ?? 'center';
$image_position     = $attributes['imagePosition'] ?? 'left';
$extra_classes      = 'is-vertically-aligned-' . esc_attr($vertical_alignment) . ' is-image-position-' . esc_attr($image_position);
$variation          = bis_get_block_variation($attributes);
$variation_align_classes = 'alignwide';
if($variation === 'wide') {
	$variation_align_classes = 'alignfull';
}elseif($variation === 'garabato') {
	$variation_align_classes = 'alignmedium';
}

 

?>

<div <?php echo bis_get_block_prop($block, true, ['class' => $extra_classes]); ?>>
	<div class="b-imagen-texto__wrapper <?= $variation_align_classes; ?>">

		<div class="b-imagen-texto__content is-prose">
			<?php echo $content; ?>
		</div>
		<div class="b-imagen-texto__image">
			<?php if ($image_id) : ?>
				<?php echo wp_get_attachment_image($image_id, 'full', false, ['loading' => 'lazy']); ?>
			<?php endif; ?>
		</div>
	</div>
</div>