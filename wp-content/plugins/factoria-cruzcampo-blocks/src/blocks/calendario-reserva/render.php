<?php
defined( 'ABSPATH' ) || exit;

/** @var array $attributes */
/** @var WP_Block|null $block */

$now   = new DateTimeImmutable( 'now', new DateTimeZone( 'Europe/Madrid' ) );
$today = $now->format( 'Y-m-d' );

// Dentro de una experiencia: solo su agenda. En cualquier otro sitio: cualquier experiencia agendada.
$post_id       = $block->context['postId'] ?? get_the_ID();
$post_type     = $post_id ? get_post_type( $post_id ) : null;
$is_experience = ( 'experience' === $post_type );
$product_id    = $is_experience ? (int) get_post_meta( $post_id, 'product_id', true ) : 0;

$bounds = FCC_Availability_Store::get_availability_bounds_for( $is_experience, $product_id );

// El calendario arranca en el primer mes con disponibilidad (y no antes de hoy, aunque
// eso ya lo garantiza el purgado de fechas pasadas en FCC_Availability_Store::sync()).
if ( $bounds['min'] ) {
	$first_available = new DateTimeImmutable( $bounds['min'] );
	$year            = (int) $first_available->format( 'Y' );
	$month           = (int) $first_available->format( 'n' );
} else {
	$year  = (int) $now->format( 'Y' );
	$month = (int) $now->format( 'n' );
}

$date_start = sprintf( '%04d-%02d-01', $year, $month );
$date_end   = ( new DateTimeImmutable( "last day of {$date_start}" ) )->format( 'Y-m-d' );

$dates = FCC_Availability_Store::get_calendar_state_for( $is_experience, $product_id, $date_start, $date_end );

// Al cargar siempre estamos ya en el primer mes disponible, así que "anterior" arranca deshabilitado;
// "siguiente" se deshabilita si ese primer mes coincide con el último mes con disponibilidad (o si no hay ninguna).
$next_disabled = true;

if ( $bounds['min'] && $bounds['max'] ) {
	$last_available = new DateTimeImmutable( $bounds['max'] );
	$last_year       = (int) $last_available->format( 'Y' );
	$last_month      = (int) $last_available->format( 'n' );
	$next_disabled   = ( $year > $last_year ) || ( $year === $last_year && $month >= $last_month );
}

$calendar_data = wp_json_encode( array(
	'year'       => $year,
	'month'      => $month,
	'dates'      => $dates,
	'today'      => $today,
	'experience' => $is_experience,
	'productId'  => $product_id,
	'boundsMin'  => $bounds['min'],
	'boundsMax'  => $bounds['max'],
	'restUrl'         => rest_url( 'factoria-cruzcampo/v1/calendar' ),
	'dayUrl'          => rest_url( 'factoria-cruzcampo/v1/day' ),
	'availabilityUrl' => rest_url( 'factoria-cruzcampo/v1/availability' ),
) );

$month_names = array(
	1  => 'enero', 2  => 'febrero', 3  => 'marzo',    4  => 'abril',
	5  => 'mayo',  6  => 'junio',   7  => 'julio',     8  => 'agosto',
	9  => 'septiembre', 10 => 'octubre', 11 => 'noviembre', 12 => 'diciembre',
);

$render_grid = function( $year, $month, $dates, $today ) {
	$first_day     = new DateTimeImmutable( sprintf( '%04d-%02d-01', $year, $month ) );
	$days_in_month = (int) $first_day->format( 't' );
	$start_dow     = (int) $first_day->format( 'N' ) - 1; // Mon=0 … Sun=6

	$html = '<div class="b-calendario-reserva__grid" role="grid">';

	for ( $i = 0; $i < $start_dow; $i++ ) {
		$html .= '<div class="b-calendario-reserva__day b-calendario-reserva__day--empty" role="gridcell" aria-hidden="true"></div>';
	}

	for ( $day = 1; $day <= $days_in_month; $day++ ) {
		$date_str = sprintf( '%04d-%02d-%02d', $year, $month, $day );
		$is_past  = $date_str < $today;

		if ( $is_past || ! isset( $dates[ $date_str ] ) ) {
			$state = 'disabled';
		} elseif ( (int) $dates[ $date_str ] === 1 ) {
			$state = 'available';
		} else {
			$state = 'full';
		}

		$class = "b-calendario-reserva__day b-calendario-reserva__day--{$state}";
		$attrs = "class=\"{$class}\" role=\"gridcell\" data-date=\"{$date_str}\"";

		if ( $state === 'available' ) {
			$attrs .= ' tabindex="0" aria-label="' . esc_attr( $day . ' de ' . gmdate( 'F', mktime( 0, 0, 0, $month, 1, $year ) ) ) . '"';
		} else {
			$attrs .= ' aria-disabled="true"';
		}

		$html .= "<button {$attrs}><span class=\"has-display-xs-font-size\">{$day}</span></button>";
	}

	$html .= '</div>';
	return $html;
};
?>
<section <?php echo bis_get_block_prop( $block, true ); ?>
	data-calendar="<?php echo esc_attr( $calendar_data ); ?>">

	<div class="b-calendario-reserva__columns alignwide">
		<div class="b-calendario-reserva__col-calendar">
			<div class="b-calendario-reserva__nav" aria-label="Navegación del calendario">
				<button class="b-calendario-reserva__nav-prev" aria-label="Mes anterior" disabled>
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
						<path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				</button>
				<span class="b-calendario-reserva__nav-month has-display-xs-font-size">
					<?php echo esc_html( $month_names[ $month ] ); ?>
				</span>
				<button class="b-calendario-reserva__nav-next" aria-label="Mes siguiente" <?php echo $next_disabled ? 'disabled' : ''; ?>>
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
						<path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				</button>
			</div>

			<div class="b-calendario-reserva__calendar">
				<?php echo $render_grid( $year, $month, $dates, $today ); ?>
			</div>

			<div class="b-calendario-reserva__legend" aria-label="Leyenda">
				<span class="b-calendario-reserva__legend-item b-calendario-reserva__legend-item--available">abierto</span>
				<span class="b-calendario-reserva__legend-item b-calendario-reserva__legend-item--full">aforo completo</span>
			</div>

			<div class="b-calendario-reserva__disclaimer">
				<p>* No está permitido el acceso a menores de edad en experiencias que incluyan cata.</p>
				<p>* No se admitirán cambios ni devoluciones tras la reserva de experiencias con prepago.</p>
			</div>
		</div>

		<div class="b-calendario-reserva__col-day">
			<div class="b-calendario-reserva__day-header">
				<h2 class="b-calendario-reserva__day-title has-display-s-font-size">Selecciona un día</h2>
				<p class="b-calendario-reserva__day-subtitle">Elige una fecha disponible en el calendario</p>
			</div>
			<div class="b-calendario-reserva__day-cards" aria-live="polite"></div>
			<div class="b-calendario-reserva__booking" aria-live="polite" hidden></div>
		</div>
	</div>

	<div class="b-calendario-reserva__form-step alignwide" hidden>
		<div class="b-calendario-reserva__form-summary">
			<button type="button" class="b-calendario-reserva__form-back">
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
					<path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
				<?php esc_html_e( 'Volver', 'factoria-cruzcampo-blocks' ); ?>
			</button>

			<h2 class="b-calendario-reserva__form-title has-display-s-font-size"></h2>

			<ul class="b-calendario-reserva__form-meta">
				<li class="b-calendario-reserva__form-meta-item">
					<img src="<?php echo esc_url( FCB_PLUGIN_URL . 'assets/images/booking-dolar.svg' ); ?>" width="20" height="20" alt="" />
					<span data-field="price"></span>
				</li>
				<li class="b-calendario-reserva__form-meta-item">
					<img src="<?php echo esc_url( FCB_PLUGIN_URL . 'assets/images/booking-clock.svg' ); ?>" width="20" height="20" alt="" />
					<span data-field="hour"></span>
				</li>
				<li class="b-calendario-reserva__form-meta-item">
					<img src="<?php echo esc_url( FCB_PLUGIN_URL . 'assets/images/booking-smile.svg' ); ?>" width="20" height="20" alt="" />
					<span data-field="people"></span>
				</li>
			</ul>
		</div>

		<div class="b-calendario-reserva__form-fields">
			<h2 class="b-calendario-reserva__form-heading has-display-s-font-size">
				<?php esc_html_e( 'Datos de reserva', 'factoria-cruzcampo-blocks' ); ?>
			</h2>

			<form class="b-calendario-reserva__form" novalidate>
				<div class="b-calendario-reserva__form-row">
					<div class="b-calendario-reserva__form-field">
						<label for="fcb-nombre"><?php esc_html_e( 'Nombre', 'factoria-cruzcampo-blocks' ); ?></label>
						<input type="text" id="fcb-nombre" name="nombre" autocomplete="given-name" required />
					</div>
					<div class="b-calendario-reserva__form-field">
						<label for="fcb-apellidos"><?php esc_html_e( 'Apellidos', 'factoria-cruzcampo-blocks' ); ?></label>
						<input type="text" id="fcb-apellidos" name="apellidos" autocomplete="family-name" required />
					</div>
				</div>

				<div class="b-calendario-reserva__form-field">
					<label for="fcb-email"><?php esc_html_e( 'Email', 'factoria-cruzcampo-blocks' ); ?></label>
					<input type="email" id="fcb-email" name="email" autocomplete="email" required />
				</div>

				<div class="b-calendario-reserva__form-field">
					<label for="fcb-telefono"><?php esc_html_e( 'Teléfono', 'factoria-cruzcampo-blocks' ); ?></label>
					<div class="b-calendario-reserva__form-phone">
						<input type="tel" class="b-calendario-reserva__form-prefix" name="prefijo" value="+34" aria-label="<?php esc_attr_e( 'Prefijo', 'factoria-cruzcampo-blocks' ); ?>" />
						<input type="tel" id="fcb-telefono" name="telefono" autocomplete="tel-national" required />
					</div>
				</div>

				<div class="b-calendario-reserva__form-field">
					<label for="fcb-nacimiento"><?php esc_html_e( 'Fecha de nacimiento', 'factoria-cruzcampo-blocks' ); ?></label>
					<input type="date" id="fcb-nacimiento" name="fecha_nacimiento" required />
				</div>

				<fieldset class="b-calendario-reserva__form-field">
					<legend><?php esc_html_e( '¿Tiene algún comensal alguna intolerancia o alergia?', 'factoria-cruzcampo-blocks' ); ?></legend>
					<label class="b-calendario-reserva__form-radio">
						<input type="radio" name="alergia" value="si" />
						<?php esc_html_e( 'Sí', 'factoria-cruzcampo-blocks' ); ?>
					</label>
					<label class="b-calendario-reserva__form-radio">
						<input type="radio" name="alergia" value="no" />
						<?php esc_html_e( 'No', 'factoria-cruzcampo-blocks' ); ?>
					</label>
				</fieldset>

				<div class="b-calendario-reserva__form-field b-calendario-reserva__form-allergy-detail" hidden>
					<label for="fcb-alergia-detalle"><?php esc_html_e( 'Especifica la intolerancia o alergia', 'factoria-cruzcampo-blocks' ); ?></label>
					<textarea id="fcb-alergia-detalle" name="alergia_detalle" rows="3"></textarea>
				</div>

				<label class="b-calendario-reserva__form-check">
					<input type="checkbox" name="mayor_edad" required />
					<span><?php esc_html_e( 'Confirmo que soy mayor de edad', 'factoria-cruzcampo-blocks' ); ?></span>
				</label>

				<label class="b-calendario-reserva__form-check">
					<input type="checkbox" name="consentimiento_comercial" />
					<span><?php esc_html_e( 'Consiento la recepción de comunicaciones comerciales por e-mail y/o SMS', 'factoria-cruzcampo-blocks' ); ?></span>
				</label>

				<button type="submit" class="btn b-calendario-reserva__form-submit">
					<?php esc_html_e( 'Reserva ahora', 'factoria-cruzcampo-blocks' ); ?>
				</button>
			</form>

			<p class="b-calendario-reserva__form-disclaimer">
				<?php esc_html_e( '*Las experiencias de Factoría Cruzcampo están reservadas a mayores de 18 años. Cruzcampo recomienda el consumo responsable.', 'factoria-cruzcampo-blocks' ); ?>
			</p>
		</div>
	</div>

</section>

<?php if ( defined( 'FCC_DEBUG' ) && FCC_DEBUG ) : ?>
	<?php
	$debug = array(
		'post_id'                 => $post_id,
		'post_type'               => $post_type,
		'is_experience'           => $is_experience,
		'product_id'              => $product_id,
		'date_start'              => $date_start,
		'date_end'                => $date_end,
		'today'                   => $today,
		'bounds (get_availability_bounds)' => $bounds,
		'next_disabled'           => $next_disabled,
		'dates (get_calendar_state)' => $dates,
	);
	?>
	<style>
		#fcc-calendario-debug { margin-top: 24px; background:#1e1e1e; color:#d4d4d4; font:12px/1.5 monospace; padding:16px; border-top:3px solid #f0a500; }
		#fcc-calendario-debug summary { cursor:pointer; color:#f0a500; font-weight:bold; margin-bottom:8px; }
		#fcc-calendario-debug pre { margin:0; white-space:pre-wrap; word-break:break-all; }
	</style>
	<details id="fcc-calendario-debug" open>
		<summary>b-calendario-reserva — debug</summary>
		<pre><?php echo esc_html( wp_json_encode( $debug, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE ) ); ?></pre>
	</details>
<?php endif; ?>
