<?php
defined( 'ABSPATH' ) || exit;

/** @var array $attributes */
/** @var string $content */
/** @var WP_Block|null $block */
?>

<div <?php echo bis_get_block_prop( $block, true ); ?>>
	<?php echo $content; ?>
</div>
