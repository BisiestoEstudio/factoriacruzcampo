<?php
defined( 'ABSPATH' ) || exit;

/**
 * Clase de debug. Activar definiendo FCC_DEBUG = true en wp-config.php.
 */
class FCC_Debug {

	public static function init() {
		if ( ! self::is_enabled() ) {
			return;
		}

		//add_action( 'wp_footer', array( __CLASS__, 'render' ) );
	}

	public static function render() {

		// Con fechas: mes actual.
		$cal_response    = FCC_CoverManager::get_availability_calendar( 1, gmdate( 'Y-m-01' ), gmdate( 'Y-m-t' ) );
		$raw_cal_dates   = self::format_response( $cal_response );
		$available_dates = self::available_dates( $cal_response );

		// Sin fechas: toda la disponibilidad.
		$cal_all_response = FCC_CoverManager::get_availability_calendar( 1 );
		$raw_cal_all      = self::format_response( $cal_all_response );

		// Respuesta cruda del primer día disponible para diagnosticar el formato real del endpoint.
		$raw_extended_first = '';
		if ( ! empty( $available_dates ) ) {
			$first_date         = $available_dates[0];
			$raw_http           = wp_remote_post( FCC_CoverManager::BASE_URL . '/apiV2/availability_extended', array(
				'headers' => array(
					'Content-Type' => 'application/json',
					'apikey'       => FCC_COVERMANAGER_API_KEY,
				),
				'body'    => wp_json_encode( array(
					'restaurant'    => FCC_COVERMANAGER_RESTAURANT,
					'date'          => $first_date,
					'number_people' => 1,
					'discount'      => '0',
					'product_type'  => '0',
					'show_zones'    => '1',
					'headerFormat'  => '0',
				) ),
				'timeout' => 15,
			) );
			$raw_body           = is_wp_error( $raw_http ) ? $raw_http->get_error_message() : wp_remote_retrieve_body( $raw_http );
			$decoded            = json_decode( $raw_body, true );
			$raw_extended_first = 'HTTP ' . ( is_wp_error( $raw_http ) ? 'ERR' : wp_remote_retrieve_response_code( $raw_http ) ) . "\n"
				. wp_json_encode( $decoded ?? $raw_body, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE );
		}

		$extended_results = array();
		foreach ( $available_dates as $date ) {
			$extended_results[ $date ] = self::format_response( FCC_CoverManager::get_availability_extended( $date, 1 ) );
		}
		?>
		<style>
			#fcc-debug { position:fixed; bottom:0; left:0; right:0; max-height:40vh; overflow-y:auto; background:#1e1e1e; color:#d4d4d4; font:12px/1.5 monospace; padding:16px; z-index:99999; border-top:3px solid #f0a500; }
			#fcc-debug summary { cursor:pointer; color:#f0a500; font-weight:bold; margin-bottom:8px; }
			#fcc-debug pre { margin:0; white-space:pre-wrap; word-break:break-all; }
		</style>
		<details id="fcc-debug" open>
			<summary>FCC Debug — respuesta cruda</summary>
			<p style="color:#f0a500;margin:12px 0 4px"><strong>get_availability_calendar</strong> — con fechas (<?php echo esc_html( gmdate( 'Y-m-01' ) ); ?> → <?php echo esc_html( gmdate( 'Y-m-t' ) ); ?>, 1 persona)</p>
			<pre><?php echo esc_html( $raw_cal_dates ); ?></pre>
			<p style="color:#f0a500;margin:12px 0 4px"><strong>get_availability_calendar</strong> — sin fechas (toda la disponibilidad, 1 persona)</p>
			<pre><?php echo esc_html( $raw_cal_all ); ?></pre>
			<?php if ( $raw_extended_first ) : ?>
				<p style="color:#9cdcfe;margin:12px 0 4px"><strong>availability_extended RAW</strong> — <?php echo esc_html( $available_dates[0] ?? '' ); ?> (sin procesar por FCC_CoverManager)</p>
				<pre><?php echo esc_html( $raw_extended_first ); ?></pre>
			<?php endif; ?>
			<?php if ( empty( $extended_results ) ) : ?>
				<p style="color:#f0a500;margin:12px 0 4px"><strong>availability_extended</strong> — sin fechas disponibles</p>
			<?php else : ?>
				<?php foreach ( $extended_results as $date => $raw ) : ?>
					<p style="color:#f0a500;margin:12px 0 4px"><strong>availability_extended</strong> — <?php echo esc_html( $date ); ?> (1 persona)</p>
					<pre><?php echo esc_html( $raw ); ?></pre>
				<?php endforeach; ?>
			<?php endif; ?>
		</details>
		<?php
	}

	/**
	 * Formatea la respuesta de FCC_CoverManager (array decodificado o WP_Error) como string para display.
	 *
	 * @param array|WP_Error $response
	 * @return string
	 */
	private static function format_response( $response ) {
		if ( is_wp_error( $response ) ) {
			return 'WP_Error: ' . $response->get_error_message();
		}

		return wp_json_encode( $response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE );
	}

	/**
	 * Extrae las fechas disponibles de la respuesta de get_availability_calendar.
	 *
	 * @param array|WP_Error $response
	 * @return string[]  Array de fechas 'YYYY-MM-DD'.
	 */
	private static function available_dates( $response ) {
		if ( is_wp_error( $response ) || empty( $response['calendar'] ) || ! is_array( $response['calendar'] ) ) {
			return array();
		}

		$dates = array_keys( $response['calendar'] );
		sort( $dates );

		return array_values( array_filter( $dates, function( $date ) use ( $response ) {
			return ! empty( $response['calendar'][ $date ] );
		} ) );
	}

	private static function is_enabled() {
		return defined( 'FCC_DEBUG' ) && FCC_DEBUG;
	}
}
