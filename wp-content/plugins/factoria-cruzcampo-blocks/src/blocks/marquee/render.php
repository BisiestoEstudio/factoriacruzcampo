<?php
/**
 * Block render callback.
 *
 * @param array $attributes The block attributes.
 * @param string $content The block content.
 * @param WP_Block $block The block object.
 *
 * @package wpdev
 */

$marquee_text = $attributes['marqueeText'] ?? '';
$speed_index = $attributes['speed'] ?? 0;
$letter_count = strlen($marquee_text);
$repeat_text = strlen($marquee_text) > 35 ? 3 : 2;

$speed = $letter_count * $repeat_text * 250;

if($speed_index != 0){
    $speed = $speed_index > 0 ? $speed / $speed_index : $speed * $speed_index * -1;
    $speed = (int) $speed;
}

$animation_duration = 'style="animation-duration:' .$speed . 'ms"';

$speed = $attributes['speed'] ?? 1;
$invert_direction = $attributes['invertDirection'] ?? false;
$direction_class = $invert_direction ? ' b-marquee--invert' : '';

// Sanitize the marquee text
$marquee_text = wp_strip_all_tags($marquee_text);
$star_svg = file_get_contents( FCB_PLUGIN_DIR . 'assets/images/star.svg' );

?>

<div <?php echo bis_get_block_prop($block, false, array('class' => $direction_class)); ?>>
	<?php for($i = 0; $i < $repeat_text; $i++): ?>
	<div class="b-marquee__item" <?php echo $animation_duration; ?>>
		<span class="b-marquee__text is-style-display_xl">
			<?php echo esc_html($marquee_text); ?>
		</span>
		<span class="b-marquee__separator" aria-hidden="true">
			<?php echo $star_svg; ?>
		</span>
	</div>
	<?php endfor; ?>
</div>