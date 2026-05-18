<?php
defined( 'ABSPATH' ) || exit;

/** @var array $attributes */
/** @var string $content */
/** @var WP_Block|null $block */

$image_id = $attributes['image'] ?? 0;
$link     = $attributes['link'] ?? [];
$link_url = ! empty( $link['url'] ) ? $link['url'] : '';

$extra_classes = $link_url ? 'has-link' : '';
$tag           = $link_url ? 'a' : 'div';

$link_attrs = '';
if ( $link_url ) {
	$link_attrs .= ' href="' . esc_url( $link_url ) . '"';
	if ( ! empty( $link['target'] ) ) {
		$link_attrs .= ' target="' . esc_attr( $link['target'] ) . '"';
	}
	if ( ! empty( $link['rel'] ) ) {
		$link_attrs .= ' rel="' . esc_attr( $link['rel'] ) . '"';
	}
	if ( ! empty( $link['title'] ) ) {
		$link_attrs .= ' title="' . esc_attr( $link['title'] ) . '"';
	}
}
?>

<<?php echo $tag; ?> <?php echo bis_get_block_prop( $block, true, [ 'class' => $extra_classes ] ); ?><?php echo $link_attrs; ?>>
	<?php if ( $image_id ) : ?>
		<div class="b-card-image__image">
			<?php echo wp_get_attachment_image( $image_id, 'large', false, [ 'loading' => 'lazy' ] ); ?>
		</div>
	<?php endif; ?>

	<div class="b-card-image__content">
		<?php echo $content; ?>
	</div>
</<?php echo $tag; ?>>
