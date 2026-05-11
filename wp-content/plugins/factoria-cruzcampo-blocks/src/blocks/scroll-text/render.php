<?php
defined( 'ABSPATH' ) || exit;

/** @var array $attributes */
/** @var WP_Block|null $block */

$text1     = wp_strip_all_tags( $attributes['text1'] ?? '' );
$text2     = wp_strip_all_tags( $attributes['text2'] ?? '' );
$text3     = wp_strip_all_tags( $attributes['text3'] ?? '' );
$media1 = $attributes['media1'] ?? [];
$media2 = $attributes['media2'] ?? [];

$speed1 = (int) ( $attributes['speed1'] ?? 0 );
$speed2 = (int) ( $attributes['speed2'] ?? 0 );
$speed3 = (int) ( $attributes['speed3'] ?? 0 );

$bands = [
	[ 'text' => $text1, 'invert' => false, 'speed' => $speed1 ],
	[ 'text' => $text2, 'invert' => true,  'speed' => $speed2 ],
	[ 'text' => $text3, 'invert' => false, 'speed' => $speed3 ],
];
?>

<section <?php echo bis_get_block_prop( $block, false, array( 'class' => 'alignfull' ) ); ?>>
	<div class="b-scroll-text__bands">
		<?php foreach ( $bands as $band ) :
			$t = $band['text'];
			if ( empty( $t ) ) continue;
			$duration    = max( 8000, mb_strlen( $t ) * 400 );
			$speed_index = $band['speed'];
			if ( $speed_index !== 0 ) {
				$duration = $speed_index > 0 ? $duration / $speed_index : $duration * $speed_index * -1;
				$duration = (int) $duration;
			}
			$band_class = 'b-scroll-text__band' . ( $band['invert'] ? ' b-scroll-text__band--invert' : '' );
		?>
		<div class="<?php echo esc_attr( $band_class ); ?>">
			<?php for ( $i = 0; $i < 5; $i++ ) : ?>
			<div class="b-scroll-text__track" style="animation-duration:<?php echo (int) $duration; ?>ms">
				<span class="b-scroll-text__text"><?php echo esc_html( $t ); ?></span>
				<span class="b-scroll-text__sep" aria-hidden="true">  ·  </span>
			</div>
			<?php endfor; ?>
		</div>
		<?php endforeach; ?>
	</div>

	<?php if ( ! empty( $media1['imageId'] ) || ! empty( $media1['videoUrl'] ) ) : ?>
	<div class="b-scroll-text__media b-scroll-text__media--1">
		<?php bis_paint_media( $media1 ); ?>
	</div>
	<?php endif; ?>

	<?php if ( ! empty( $media2['imageId'] ) || ! empty( $media2['videoUrl'] ) ) : ?>
	<div class="b-scroll-text__media b-scroll-text__media--2">
		<?php bis_paint_media( $media2 ); ?>
	</div>
	<?php endif; ?>
</section>
