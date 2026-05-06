<?php
defined( 'ABSPATH' ) || exit;

/** @var array $attributes */
/** @var WP_Block|null $block */

$variation  = $attributes['variation'] ?? 'embellecedor';
$title      = $attributes['title'] ?? '';
$antetitulo = $attributes['antetitulo'] ?? '';
$star_url   = FCB_PLUGIN_URL . 'assets/images/star.svg';
?>

<div <?php echo bis_get_block_prop( $block, false, [ 'data-variation' => $variation ] ); ?>>

	<?php if ( $variation === 'embellecedor' ) : ?>

		<div class="b-custom-title__inner b-custom-title__inner--embellecedor">
			<?php if ( $title ) : ?>
				<p class="b-custom-title__title"><?php echo wp_kses_post( $title ); ?></p>
			<?php endif; ?>
			<img class="b-custom-title__star" src="<?php echo esc_url( $star_url ); ?>" alt="" aria-hidden="true" width="16" height="16" />
		</div>

	<?php elseif ( $variation === 'antetitulo' ) : ?>

		<div class="b-custom-title__inner b-custom-title__inner--antetitulo">
			<?php if ( $antetitulo ) : ?>
				<p class="b-custom-title__antetitulo has-h-2-font-size"><?php echo wp_kses_post( $antetitulo ); ?></p>
			<?php endif; ?>
			<?php if ( $title ) : ?>
				<h2 class="b-custom-title__title"><?php echo wp_kses_post( $title ); ?></h2>
			<?php endif; ?>
		</div>

	<?php endif; ?>

</div>
