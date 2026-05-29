<?php
defined( 'ABSPATH' ) || exit;

/** @var array    $attributes */
/** @var WP_Block $block */
/** @var string   $content */

$post_id  = get_the_ID();
$title    = get_the_title( $post_id );
$image_id = get_post_thumbnail_id( $post_id );
$precio   = get_post_meta( $post_id, 'precio', true );
$dias     = get_post_meta( $post_id, 'dias', true );
$duracion = get_post_meta( $post_id, 'duracion', true );

$icon_url = FCB_PLUGIN_URL . 'assets/images/';

$precio_display = '';
if ( $precio ) {
	$f              = (float) $precio;
	$precio_display = ( $f === (float) (int) $f )
		? (int) $f . '€'
		: number_format( $f, 2, ',', '.' ) . '€';
}
?>

<section <?php echo bis_get_block_prop( $block, false, [ 'class' => 'alignwide' ] ); ?>>

		<h1 class="b-experience-header__title has-display-l-font-size"><?php echo esc_html( $title ); ?></h1>

		<div class="b-experience-header__body">

			<div class="b-experience-header__image">
				<?php if ( $image_id ) : ?>
					<?php echo wp_get_attachment_image( $image_id, 'large', false, [ 'class' => 'b-experience-header__img' ] ); ?>
				<?php endif; ?>
			</div>

			<div class="b-experience-header__content">

				<?php if ( $precio_display || $dias || $duracion ) : ?>
					<div class="b-experience-header__details has-red-color">

						<?php if ( $precio_display ) : ?>
							<div class="b-experience-header__detail">
								<img
									class="b-experience-header__icon"
									src="<?php echo esc_url( $icon_url . 'money-icon.svg' ); ?>"
									alt=""
									aria-hidden="true"
									width="60"
									height="60"
								/>
								<span class="b-experience-header__detail-text has-display-xs-font-size"><?php echo esc_html( $precio_display ); ?></span>
							</div>
						<?php endif; ?>

						<?php if ( $dias ) : ?>
							<div class="b-experience-header__detail">
								<img
									class="b-experience-header__icon"
									src="<?php echo esc_url( $icon_url . 'calendar-icon.svg' ); ?>"
									alt=""
									aria-hidden="true"
									width="60"
									height="60"
								/>
								<span class="b-experience-header__detail-text has-display-xs-font-size"><?php echo esc_html( $dias ); ?></span>
							</div>
						<?php endif; ?>

						<?php if ( $duracion ) : ?>
							<div class="b-experience-header__detail">
								<img
									class="b-experience-header__icon"
									src="<?php echo esc_url( $icon_url . 'time-icon.svg' ); ?>"
									alt=""
									aria-hidden="true"
									width="60"
									height="60"
								/>
								<span class="b-experience-header__detail-text has-display-xs-font-size"><?php echo esc_html( $duracion ); ?></span>
							</div>
						<?php endif; ?>

					</div>
				<?php endif; ?>
				<div class="b-experience-header__content-inner is-prose">
				<?php echo $content; ?>
				</div>
		</div>
	</div>
</section>
