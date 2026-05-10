<?php
defined( 'ABSPATH' ) || exit;

/** @var array $attributes */
/** @var WP_Block|null $block */
/** @var string $content */

$link        = $attributes['link'] ?? [];
$link_url    = $link['url'] ?? '';

?>

<div <?php echo bis_get_block_prop( $block, false ); ?>>
	<div class="b-text-button__content is-prose">
		<?php echo $content; ?>
	</div>

	<?php if ( $link_url ) : ?>
	<div class="b-text-button__button">
		<?php bis_paint_button($link, 'small', 'b-text-button__link'); ?>
	</div>
	<?php endif; ?>
</div>
