<?php
defined( 'ABSPATH' ) || exit;

/** @var array $attributes */
/** @var WP_Block|null $block */

$option = isset( $attributes['option'] ) ? (string) $attributes['option'] : '1';
if ( ! in_array( $option, array( '1', '2', '3' ), true ) ) {
	$option = '1';
}

$media = isset( $attributes['media'] ) && is_array( $attributes['media'] ) ? $attributes['media'] : array();
?>

<div <?php echo bis_get_block_prop( $block, false, array( 'class' => 'b-corporativo--option-' . esc_attr( $option ) ) ); ?>>
	<div class="b-corporativo__inner">
		<?php if ( $option === '3' ) : ?>
			<?php bis_paint_media( $media, 'b-corporativo__media' ); ?>
		<?php endif; ?>
	</div>
</div>
