<?php
defined( 'ABSPATH' ) || exit;

/** @var array $attributes */
/** @var string $content */
/** @var WP_Block|null $block */

$card_type  = $block->context['bisiesto/cardType'] ?? 'card-image';
$card_typte_class = 'is-style-' . $card_type;
$show_image = $card_type === 'card-image';
$image_id   = $attributes['image'] ?? 0;
$link       = $attributes['link'] ?? [];
$link_url   = $link['url'] ?? '';

$tag        = $link_url ? 'a' : 'div';
$attrs = $link_url ? bis_get_link_attributes( $link ) : [];
$attrs['class'] = $card_typte_class;
?>

<<?php echo $tag; ?> <?php echo bis_get_block_prop( $block, false, $attrs ); ?>>
	<?php if ( $show_image && $image_id ) : ?>
		<div class="b-card__image">
			<?php echo wp_get_attachment_image( $image_id, 'large', false, [ 'class' => 'b-card__img' ] ); ?>
		</div>
	<?php endif; ?>

	<div class="b-card__content">
		<?php echo $content; ?>
	</div>
</<?php echo $tag; ?>>
