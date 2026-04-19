<?php
defined( 'ABSPATH' ) || exit;

class FCC_API {

	const NAMESPACE = 'factoria-cruzcampo/v1';
	const CACHE_TTL = HOUR_IN_SECONDS;

	public static function register() {
		add_action( 'rest_api_init', array( __CLASS__, 'register_routes' ) );
	}

	public static function register_routes() {
		register_rest_route( self::NAMESPACE, '/calendar', array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => array( __CLASS__, 'get_calendar' ),
			'permission_callback' => '__return_true',
			'args'                => array(
				'year'  => array(
					'required'          => false,
					'sanitize_callback' => 'absint',
				),
				'month' => array(
					'required'          => false,
					'sanitize_callback' => 'absint',
				),
			),
		) );
	}

	public static function get_calendar( WP_REST_Request $request ) {
		$year  = $request->get_param( 'year' )  ?: (int) gmdate( 'Y' );
		$month = $request->get_param( 'month' ) ?: (int) gmdate( 'n' );

		$year  = max( (int) gmdate( 'Y' ), min( $year, (int) gmdate( 'Y' ) + 2 ) );
		$month = max( 1, min( $month, 12 ) );

		$cache_key = "fcc_calendar_{$year}_{$month}";
		$cached    = get_transient( $cache_key );

		if ( false !== $cached ) {
			return rest_ensure_response( $cached );
		}

		$date_start = sprintf( '%04d-%02d-01', $year, $month );
		$date_end   = gmdate( 'Y-m-d', mktime( 0, 0, 0, $month + 1, 0, $year ) );

		$response = FCC_CoverManager::get_availability_calendar( 1, $date_start, $date_end );

		if ( is_wp_error( $response ) ) {
			return new WP_Error(
				'fcc_calendar_error',
				$response->get_error_message(),
				array( 'status' => 502 )
			);
		}

		$dates = isset( $response['calendar'] ) && is_array( $response['calendar'] )
			? $response['calendar']
			: array();

		$data = array(
			'year'  => $year,
			'month' => $month,
			'dates' => $dates,
		);

		set_transient( $cache_key, $data, self::CACHE_TTL );

		return rest_ensure_response( $data );
	}
}
