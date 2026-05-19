<?php
defined( 'ABSPATH' ) || exit;

/** @var array $attributes */
/** @var string $content */
/** @var WP_Block|null $block */

$card_type  = $block->context['bisiesto/cardType'] ?? 'card-image';
$card_typte_class = 'is-style-' . $card_type;
$show_image = $card_type === 'card-image';
$show_title = $card_type === 'card-square';
$image_id   = $attributes['image'] ?? 0;
$card_title = $attributes['cardTitle'] ?? '';
$link       = $attributes['link'] ?? [];
$link_url   = $link['url'] ?? '';

$tag        = $link_url ? 'a' : 'div';
$attrs = $link_url ? bis_get_link_attributes( $link ) : [];
$attrs['class'] = $card_typte_class;

if( $card_type != 'card-image' ) {
	$attrs['class'] .= ' has-red-background-color has-white-color';
}


?>

<<?php echo $tag; ?> <?php echo bis_get_block_prop( $block, false, $attrs ); ?>>
	<?php if ( $show_image && $image_id ) : ?>
		<div class="b-card__image">
			<?php echo wp_get_attachment_image( $image_id, 'large', false, [ 'class' => 'b-card__img' ] ); ?>
		</div>
	<?php endif; ?>

	<?php if ( $show_title && $card_title ) : ?>
		<h3 class="b-card__title has-h-2-font-size"><?php echo wp_kses_post( $card_title ); ?></h3>
	<?php endif; ?>

	<div class="b-card__content">
		<?php echo $content; ?>
	</div>
</<?php echo $tag; ?>>
