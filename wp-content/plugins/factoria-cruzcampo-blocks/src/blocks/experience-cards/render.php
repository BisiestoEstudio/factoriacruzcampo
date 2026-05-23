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
		// Nada seleccionado: no mostrar nada.
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
?>

<div <?php echo bis_get_block_prop( $block, true ); ?>>
	<?php if ( $experiences->have_posts() ) : ?>
		<?php while ( $experiences->have_posts() ) : $experiences->the_post(); ?>
			<a class="b-experience-cards__item" href="<?php the_permalink(); ?>" aria-label="<?php the_title_attribute(); ?>">
				<?php if ( has_post_thumbnail() ) : ?>
					<div class="b-experience-cards__image">
						<?php echo wp_get_attachment_image( get_post_thumbnail_id(), 'large', false, [ 'class' => 'b-experience-cards__img' ] ); ?>
					</div>
				<?php endif; ?>
				<div class="b-experience-cards__body">
					<h3 class="b-experience-cards__title"><?php the_title(); ?></h3>
					<?php if ( has_excerpt() ) : ?>
						<p class="b-experience-cards__excerpt"><?php echo wp_kses_post( get_the_excerpt() ); ?></p>
					<?php endif; ?>
				</div>
			</a>
		<?php endwhile; ?>
		<?php wp_reset_postdata(); ?>
	<?php else : ?>
		<p class="b-experience-cards__empty"><?php esc_html_e( 'No hay experiencias disponibles.', 'factoria-cruzcampo-blocks' ); ?></p>
	<?php endif; ?>
</div>
