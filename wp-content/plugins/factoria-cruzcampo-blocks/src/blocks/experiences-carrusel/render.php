<?php
defined( 'ABSPATH' ) || exit;

/** @var array $attributes */
/** @var WP_Block|null $block */

$mode          = $attributes['mode'] ?? 'category';
$clasification = $attributes['clasification'] ?? 'all';
$selected_ids  = array_map( 'intval', $attributes['selectedIds'] ?? [] );

$query_args = array(
	'post_type'      => 'experience',
	'post_status'    => 'publish',
	'posts_per_page' => -1,
	'no_found_rows'  => true,
);

if ( 'manual' === $mode ) {
	if ( empty( $selected_ids ) ) {
		$query_args['post__in'] = array( 0 );
	} else {
		$query_args['post__in'] = $selected_ids;
		$query_args['orderby']  = 'post__in';
	}
} elseif ( 'all' !== $clasification ) {
	$query_args['tax_query'] = array(
		array(
			'taxonomy' => 'clasification',
			'field'    => 'term_id',
			'terms'    => (int) $clasification,
		),
	);
}

$experiences = new WP_Query( $query_args );

wp_enqueue_script( 'fcb-swiper' );
wp_enqueue_style( 'fcb-swiper' );
?>

<section <?php echo bis_get_block_prop( $block, true ); ?>>
	<?php if ( $experiences->have_posts() ) : ?>
		<div class="b-experiences-carrusel__swiper swiper">
			<div class="swiper-wrapper">
				<?php while ( $experiences->have_posts() ) : $experiences->the_post(); ?>
					<div class="swiper-slide b-experiences-carrusel__slide">
						<a class="b-experiences-carrusel__item" href="<?php the_permalink(); ?>" aria-label="<?php the_title_attribute(); ?>">
							<?php if ( has_post_thumbnail() ) : ?>
								<div class="b-experiences-carrusel__image">
									<?php echo wp_get_attachment_image( get_post_thumbnail_id(), 'large', false, [ 'class' => 'b-experiences-carrusel__img' ] ); ?>
								</div>
							<?php endif; ?>
							<h3 class="b-experiences-carrusel__title has-display-xs-font-size"><?php the_title(); ?></h3>
						</a>
					</div>
				<?php endwhile; ?>
				<?php wp_reset_postdata(); ?>
			</div>

			<button class="swiper-button-prev b-experiences-carrusel__btn b-experiences-carrusel__btn--prev" aria-label="<?php esc_attr_e( 'Anterior', 'factoria-cruzcampo-blocks' ); ?>"></button>
			<button class="swiper-button-next b-experiences-carrusel__btn b-experiences-carrusel__btn--next" aria-label="<?php esc_attr_e( 'Siguiente', 'factoria-cruzcampo-blocks' ); ?>"></button>
			<div class="swiper-pagination b-experiences-carrusel__pagination"></div>
		</div>
	<?php else : ?>
		<p class="b-experiences-carrusel__empty"><?php esc_html_e( 'No hay experiencias disponibles.', 'factoria-cruzcampo-blocks' ); ?></p>
	<?php endif; ?>
</section>
