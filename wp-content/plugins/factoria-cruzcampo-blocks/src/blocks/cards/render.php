<?php
defined( 'ABSPATH' ) || exit;

/** @var array $attributes */
/** @var string $content */
/** @var WP_Block|null $block */

$card_type_class = "is-type-" . $attributes['cardType'] ?? "";
$atts = array(
	'class' => $card_type_class
)
?>



<div <?php echo bis_get_block_prop( $block, false, $atts ); ?> >
	<?php echo $content; ?>
</div>
