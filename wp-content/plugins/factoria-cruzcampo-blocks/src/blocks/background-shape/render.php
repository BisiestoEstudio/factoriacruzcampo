<?php
defined( 'ABSPATH' ) || exit;

/** @var array $attributes */
/** @var WP_Block|null $block */

$image_id   = intval( $attributes['imageId'] ?? 0 );
$width      = $attributes['width'] ?? '';
$max_width  = $attributes['maxWidth'] ?? '';
$max_height = $attributes['maxHeight'] ?? '';
$anchor     = $attributes['anchor'] ?? 'top-left';
$offset_x   = $attributes['offsetX'] ?? array( 'value' => 0, 'unit' => 'px' );
$offset_y   = $attributes['offsetY'] ?? array( 'value' => 0, 'unit' => 'px' );
$rotation   = intval( $attributes['rotation'] ?? 0 );

if ( ! $image_id ) {
	return;
}

$image_url = wp_get_attachment_image_url( $image_id, 'full' );
if ( ! $image_url ) {
	return;
}

// Map anchor point to left/top percentages and translate correction.
$anchor_map = array(
	'top-left'      => array( 'x' => 0,   'y' => 0 ),
	'top-center'    => array( 'x' => 50,  'y' => 0 ),
	'top-right'     => array( 'x' => 100, 'y' => 0 ),
	'middle-left'   => array( 'x' => 0,   'y' => 50 ),
	'middle-center' => array( 'x' => 50,  'y' => 50 ),
	'middle-right'  => array( 'x' => 100, 'y' => 50 ),
	'bottom-left'   => array( 'x' => 0,   'y' => 100 ),
	'bottom-center' => array( 'x' => 50,  'y' => 100 ),
	'bottom-right'  => array( 'x' => 100, 'y' => 100 ),
);

$anchor_vals = $anchor_map[ $anchor ] ?? $anchor_map['top-left'];
$ax          = $anchor_vals['x'];
$ay          = $anchor_vals['y'];

// Sanitize and build offset CSS values.
$allowed_units = array( 'px', '%', 'vh', 'vw' );
$ox_unit  = in_array( $offset_x['unit'] ?? 'px', $allowed_units, true ) ? $offset_x['unit'] : 'px';
$oy_unit  = in_array( $offset_y['unit'] ?? 'px', $allowed_units, true ) ? $offset_y['unit'] : 'px';
$ox_value = intval( $offset_x['value'] ?? 0 );
$oy_value = intval( $offset_y['value'] ?? 0 );
$ox_css   = "{$ox_value}{$ox_unit}";
$oy_css   = "{$oy_value}{$oy_unit}";

// translate(-anchorX% + offsetX, -anchorY% + offsetY) to position the element
// relative to its own dimensions and then apply the user offset.
$translate_x = "calc(-{$ax}% + {$ox_css})";
$translate_y = "calc(-{$ay}% + {$oy_css})";
$transform   = "translate({$translate_x},{$translate_y})";
if ( $rotation !== 0 ) {
	$transform .= " rotate({$rotation}deg)";
}

// Sanitize CSS length values.
$safe = fn( $v ) => preg_replace( '/[^0-9.\-a-z%]/', '', strtolower( trim( $v ) ) );

$styles = array(
	"left:{$ax}%",
	"top:{$ay}%",
	"transform:{$transform}",
);

if ( $width !== '' ) {
	$styles[] = 'width:' . $safe( $width );
}
if ( $max_width !== '' ) {
	$styles[] = 'max-width:' . $safe( $max_width );
}
if ( $max_height !== '' ) {
	$styles[] = 'max-height:' . $safe( $max_height );
}

$style_attr = implode( ';', $styles );
?>
<div <?php echo bis_get_block_prop($block, false); ?> style="<?php echo esc_attr( $style_attr ); ?>">
	<img src="<?php echo esc_url( $image_url ); ?>" alt="" loading="lazy">
</div>
