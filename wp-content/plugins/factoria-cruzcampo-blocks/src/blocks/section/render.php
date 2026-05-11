<?php
defined( 'ABSPATH' ) || exit;

/** @var array $attributes */
/** @var WP_Block|null $block */

$gap              = $attributes['gap'] ?? '';
$contentSize      = $attributes['contentSize'] ?? 'wide';
$background_video = $attributes['backgroundVideo'] ?? array();
$video_url        = $background_video['url'] ?? '';
$poster_id        = $background_video['posterId'] ?? 0;
$poster_url       = $poster_id ? wp_get_attachment_image_url( $poster_id, 'full' ) : '';

$contentClass = 'align' . $contentSize;
$gapStyles    = $gap ? ' style="--section-gap: ' . esc_attr( $gap ) . ';"' : '';

// Separate background-shape blocks so they render outside the content div.
$bg_shapes_html = '';
$content_html   = '';
foreach ( $block->inner_blocks as $inner_block ) {
	if ( $inner_block->name === 'bisiesto/background-shape' ) {
		$bg_shapes_html .= $inner_block->render();
	} else {
		$content_html .= $inner_block->render();
	}
}
?>

<section <?php echo bis_get_block_prop( $block, true ); ?>>
	<?php echo $bg_shapes_html; ?>
	<?php if ( $video_url ) : ?>
		<video
			class="b-section__video"
			autoplay muted loop playsinline
			<?php echo $poster_url ? 'poster="' . esc_url( $poster_url ) . '"' : ''; ?>
		>
			<source src="<?php echo esc_url( $video_url ); ?>" type="video/mp4">
		</video>
	<?php endif; ?>
	<div class="b-section__content has-h2-uppercase <?php echo esc_attr( $contentClass ); ?>"<?php echo $gapStyles; ?>>
		<?php echo $content_html; ?>
	</div>
</section>
