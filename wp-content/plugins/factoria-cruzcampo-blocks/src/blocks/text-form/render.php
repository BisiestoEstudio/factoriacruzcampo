<?php
defined( 'ABSPATH' ) || exit;

/** @var array $attributes */
/** @var string $content */
/** @var WP_Block|null $block */

$form_id = intval( $attributes['formId'] ?? 0 );
?>

<div <?php echo bis_get_block_prop( $block, true ); ?>>
	<div class="b-text-form__wrapper alignwide">
		<div class="b-text-form__content">
			<?php echo $content; ?>
		</div>
		<div class="b-text-form__form">
			<?php if ( $form_id > 0 ) : ?>
				<?php echo do_shortcode( '[contact-form-7 id="' . $form_id . '"]' ); ?>
			<?php endif; ?>
		</div>
	</div>
</div>
