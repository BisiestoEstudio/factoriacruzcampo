<?php
defined( 'ABSPATH' ) || exit;

/** @var array $attributes */
/** @var WP_Block|null $block */

$width         = $attributes['width'] ?? '';
$max_width     = $attributes['maxWidth'] ?? '';
$min_width     = $attributes['minWidth'] ?? '';
$justification = $attributes['justification'] ?? 'center';

$styles = [];
if ( $width ) {
	$styles[] = 'width: ' . esc_attr( $width );
}
if ( $max_width ) {
	$styles[] = 'max-width: ' . esc_attr( $max_width );
}
if ( $min_width ) {
	$styles[] = 'min-width: ' . esc_attr( $min_width );
}
?>

<div <?php echo bis_get_block_prop( $block, false, [
	'style'              => implode( '; ', $styles ),
	'data-justification' => $justification,
] ); ?>>
	<?php echo $content; ?>
</div>
