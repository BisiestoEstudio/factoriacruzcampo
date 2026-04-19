<?php
defined( 'ABSPATH' ) || exit;

$now        = new DateTimeImmutable( 'now', new DateTimeZone( 'Europe/Madrid' ) );
$year       = (int) $now->format( 'Y' );
$month      = (int) $now->format( 'n' );
$date_start = sprintf( '%04d-%02d-01', $year, $month );
$date_end   = ( new DateTimeImmutable( "last day of {$date_start}" ) )->format( 'Y-m-d' );
$today      = $now->format( 'Y-m-d' );

$cache_key    = "fcc_calendar_{$year}_{$month}";
$cached       = get_transient( $cache_key );

if ( false !== $cached ) {
	$dates = $cached['dates'] ?? array();
} else {
	$api_response = FCC_CoverManager::get_availability_calendar( 1, $date_start, $date_end );
	$dates        = ( ! is_wp_error( $api_response ) && isset( $api_response['calendar'] ) )
		? $api_response['calendar']
		: array();

	if ( ! is_wp_error( $api_response ) ) {
		set_transient( $cache_key, array( 'dates' => $dates ), HOUR_IN_SECONDS );
	}
}

$calendar_data = wp_json_encode( array(
	'year'    => $year,
	'month'   => $month,
	'dates'   => $dates,
	'today'   => $today,
	'restUrl' => rest_url( 'factoria-cruzcampo/v1/calendar' ),
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

		$html .= "<button {$attrs}><span>{$day}</span></button>";
	}

	$html .= '</div>';
	return $html;
};
?>
<section <?php echo bis_get_block_prop( $block, true ); ?>
	data-calendar="<?php echo esc_attr( $calendar_data ); ?>">

	<div class="b-calendario-reserva__nav" aria-label="Navegación del calendario">
		<button class="b-calendario-reserva__nav-prev" aria-label="Mes anterior" disabled>
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
				<path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
			</svg>
		</button>
		<span class="b-calendario-reserva__nav-month">
			<?php echo esc_html( $month_names[ $month ] ); ?>
		</span>
		<button class="b-calendario-reserva__nav-next" aria-label="Mes siguiente">
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

</section>
