<?php
defined('ABSPATH') || exit;

/** @var array $attributes */
/** @var WP_Block|null $block */

$today    = gmdate('Y-m-d');
$end_date = gmdate('Y-m-d', strtotime('+2 years', strtotime($today)));

// Días con algún producto agendado, disponible o no: las fichas se muestran igualmente.
$dates = FCC_Availability_Store::get_calendar_dates($today, $end_date, false);

$days        = array();
$product_ids = array();

foreach ($dates as $date) {
	$rows = FCC_Availability_Store::get_day($date);

	if (empty($rows)) {
		continue;
	}

	$days[$date] = $rows;

	foreach ($rows as $row) {
		$product_ids[] = (int) $row['product_id'];
	}
}

$product_ids = array_unique($product_ids);


// Una única consulta (vía FCC_CPT_Manager) para todas las experiencias activas en calendario,
// indexada por product_id, para no repetir consultas por cada día en el que se repita la misma experiencia.
$experiences_by_product = array();

foreach (FCC_CPT_Manager::get_experiences_by_product_ids($product_ids, true) as $product_id => $post) {
	$terms = get_the_terms($post->ID, 'experience_category');
	$tags  = array();

	if (! is_wp_error($terms) && $terms) {
		foreach ($terms as $term) {
			$tags[] = array(
				'name'  => $term->name,
				'color' => get_term_meta($term->term_id, 'color', true),
			);
		}
	}

	// Horas propias de la experiencia; si no las tiene, no se muestran (no las de la tabla de disponibilidad).
	$horas = get_post_meta($post->ID, 'horas', true);

	$experiences_by_product[$product_id] = array(
		'title'     => get_the_title($post),
		'permalink' => get_permalink($post),
		'image_id'  => get_post_thumbnail_id($post),
		'tags'      => $tags,
		'hours'     => is_array($horas) ? $horas : array(),
	);
}

$day_names = array(
	1 => 'lunes',
	2 => 'martes',
	3 => 'miércoles',
	4 => 'jueves',
	5 => 'viernes',
	6 => 'sábado',
	7 => 'domingo',
);

$month_names = array(
	1  => 'enero',
	2  => 'febrero',
	3  => 'marzo',
	4  => 'abril',
	5  => 'mayo',
	6  => 'junio',
	7  => 'julio',
	8  => 'agosto',
	9  => 'septiembre',
	10 => 'octubre',
	11 => 'noviembre',
	12 => 'diciembre',
);

// Días que finalmente tienen alguna ficha que mostrar, y meses presentes entre esos días (para los chips de filtro).
$days_with_cards = array();
$months          = array();

foreach ($days as $date => $rows) {
	$cards = array();

	foreach ($rows as $row) {
		$product_id = (int) $row['product_id'];

		if (! isset($experiences_by_product[$product_id])) {
			continue;
		}

		$cards[] = $experiences_by_product[$product_id];
	}

	if (empty($cards)) {
		continue;
	}

	$days_with_cards[$date] = $cards;

	$year_month = substr($date, 0, 7);

	if (! isset($months[$year_month])) {
		$months[$year_month] = $month_names[(int) substr($date, 5, 2)];
	}
}

$title         = $attributes['title'] ?? '';
$days_per_page = (int) ($attributes['daysPerPage'] ?? 0);

$section_attrs = $days_per_page > 0 ? array('data-days-per-page' => $days_per_page, ) : array();
?>
<section <?php echo bis_get_block_prop($block, true, $section_attrs); ?>>
	<div class="b-agenda__header alignfull is-layout-constrained has-global-padding">
		<div class="b-agenda__header-inner alignmedium">
			<?php if ($title) : ?>
				<h1 class="b-agenda__title has-display-l-font-size"><?php echo wp_kses_post($title); ?></h2>
			<?php endif; ?>

			<?php if (! empty($months)) : ?>
				<div class="b-agenda__filters">
					<?php foreach ($months as $year_month => $label) : ?>
						<button type="button" class="b-agenda__filter has-base-font-size" data-month="<?php echo esc_attr($year_month); ?>" aria-pressed="false">
							<?php echo esc_html($label); ?>
						</button>
					<?php endforeach; ?>
				</div>
			<?php endif; ?>
		</div>
	</div>

	<div class="b-agenda__days alignmedium">
	<?php foreach ($days_with_cards as $date => $cards) :
		$year_month = substr($date, 0, 7);
		$date_obj   = new DateTimeImmutable($date);
		$day_title  = $day_names[(int) $date_obj->format('N')] . ' ' . (int) $date_obj->format('j') . ' ' . $month_names[(int) $date_obj->format('n')];
	?>
		<div class="b-agenda__day" data-month="<?php echo esc_attr($year_month); ?>">
			<h2 class="b-agenda__day-title has-display-s-font-size"><?php echo esc_html($day_title); ?></h2>

			<div class="b-agenda__grid">
				<?php foreach ($cards as $card) : ?>
					<div class="b-agenda__card">
						<?php if ($card['image_id']) : ?>
							<div class="b-agenda__card-image">
								<?php echo wp_get_attachment_image($card['image_id'], 'medium', false, ['class' => 'b-agenda__card-img']); ?>
							</div>
						<?php endif; ?>

						<div class="b-agenda__card-body">
							<div class="b-agenda__card-info">
							<?php if (! empty($card['tags'])) : ?>
								<div class="b-agenda__tags">
									<?php foreach ($card['tags'] as $tag) : ?>
										<span
											class="b-agenda__tag"
											<?php if ($tag['color']) : ?>style="background-color: <?php echo esc_attr($tag['color']); ?>; "<?php endif; ?>
										><?php echo esc_html($tag['name']); ?></span>
									<?php endforeach; ?>
								</div>
							<?php endif; ?>

							<h3 class="b-agenda__card-title has-display-s-font-size"><?php echo esc_html($card['title']); ?></h3>

							<?php if (! empty($card['hours'])) : ?>
								<p class="b-agenda__card-hours"><?php echo esc_html(implode(' · ', $card['hours'])); ?></p>
							<?php endif; ?>
							</div>

							<a class="b-agenda__card-link btn btn-small" href="<?php echo esc_url($card['permalink']); ?>">
								<?php esc_html_e('Ver info', 'factoria-cruzcampo-blocks'); ?>
							</a>
						</div>
					</div>
				<?php endforeach; ?>
			</div>
		</div>
		<?php endforeach; ?>
	</div>

	<?php if (empty($days_with_cards)) : ?>
		<p class="b-agenda__empty"><?php esc_html_e('No hay experiencias agendadas próximamente.', 'factoria-cruzcampo-blocks'); ?></p>
	<?php elseif ($days_per_page > 0 && count($days_with_cards) > $days_per_page) : ?>
		<button type="button" class="b-agenda__load-more btn btn-small">
			<?php esc_html_e('Ver más', 'factoria-cruzcampo-blocks'); ?>
		</button>
	<?php endif; ?>

</section>