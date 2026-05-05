<?php
defined( 'ABSPATH' ) || exit;

/** @var array $attributes */
/** @var WP_Block|null $block */

$gap         = $attributes['gap'] ?? '';
$contentSize = $attributes['contentSize'] ?? 'wide';

bis_debug($attributes);

$contentClass = 'align' . $contentSize;
$gapStyles    = $gap ? ' style="--section-gap: ' . esc_attr( $gap ) . ';"' : '';
?>

<section <?php echo bis_get_block_prop( $block, true ); ?>>
	<div class="b-section__content has-h2-uppercase <?php echo esc_attr( $contentClass ); ?>"<?php echo $gapStyles; ?>>
		<?php echo $content; ?>
	</div>
</section>
