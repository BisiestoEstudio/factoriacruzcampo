<?php
defined( 'ABSPATH' ) || exit;

class FCC_API {

	const NAMESPACE = 'factoria-cruzcampo/v1';

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
				'product_id' => array(
					'required'          => false,
					'sanitize_callback' => 'absint',
				),
				'experience' => array(
					'required'          => false,
					'sanitize_callback' => 'rest_sanitize_boolean',
				),
			),
		) );

		register_rest_route( self::NAMESPACE, '/day', array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => array( __CLASS__, 'get_day' ),
			'permission_callback' => '__return_true',
			'args'                => array(
				'date' => array(
					'required'          => true,
					'sanitize_callback' => 'sanitize_text_field',
					'validate_callback' => function( $value ) {
						return (bool) preg_match( '/^\d{4}-\d{2}-\d{2}$/', $value );
					},
				),
				'product_id' => array(
					'required'          => false,
					'sanitize_callback' => 'absint',
				),
			),
		) );

		register_rest_route( self::NAMESPACE, '/availability', array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => array( __CLASS__, 'get_availability' ),
			'permission_callback' => '__return_true',
			'args'                => array(
				'date' => array(
					'required'          => true,
					'sanitize_callback' => 'sanitize_text_field',
					'validate_callback' => function( $value ) {
						return (bool) preg_match( '/^\d{4}-\d{2}-\d{2}$/', $value );
					},
				),
				'product_id' => array(
					'required'          => true,
					'sanitize_callback' => 'absint',
				),
			),
		) );
	}

	public static function get_calendar( WP_REST_Request $request ) {
		$is_experience = (bool) $request->get_param( 'experience' );
		$product_id    = absint( $request->get_param( 'product_id' ) );

		$bounds = FCC_Availability_Store::get_availability_bounds_for( $is_experience, $product_id );

		$year  = $request->get_param( 'year' )  ?: (int) gmdate( 'Y' );
		$month = $request->get_param( 'month' ) ?: (int) gmdate( 'n' );
		$month = max( 1, min( $month, 12 ) );

		// No dejar navegar fuera del rango con disponibilidad real: se acota al mes más cercano dentro de los límites.
		if ( $bounds['min'] && $bounds['max'] ) {
			$requested = new DateTimeImmutable( sprintf( '%04d-%02d-01', $year, $month ) );
			$min_month = ( new DateTimeImmutable( $bounds['min'] ) )->modify( 'first day of this month' );
			$max_month = ( new DateTimeImmutable( $bounds['max'] ) )->modify( 'first day of this month' );

			if ( $requested < $min_month ) {
				$requested = $min_month;
			} elseif ( $requested > $max_month ) {
				$requested = $max_month;
			}

			$year  = (int) $requested->format( 'Y' );
			$month = (int) $requested->format( 'n' );
		}

		$date_start = sprintf( '%04d-%02d-01', $year, $month );
		$date_end   = gmdate( 'Y-m-d', mktime( 0, 0, 0, $month + 1, 0, $year ) );

		$dates = FCC_Availability_Store::get_calendar_state_for( $is_experience, $product_id, $date_start, $date_end );

		$data = array(
			'year'       => $year,
			'month'      => $month,
			'dates'      => $dates,
			'experience' => $is_experience,
			'productId'  => $product_id,
			'boundsMin'  => $bounds['min'],
			'boundsMax'  => $bounds['max'],
		);

		return rest_ensure_response( $data );
	}

	/**
	 * Experiencias agendadas un día concreto (disponibles o no), con los datos
	 * crudos que necesita la card: título, imagen ya renderizada (imageHtml),
	 * horas (meta "horas" de la experiencia si está rellena, si no vacío), precio
	 * (meta "precio", sin formatear), product_id y si tiene hueco ese día. El
	 * formateo de horas/precio para mostrar y el estado clicable/atenuado según
	 * "available" es cosa de la presentación.
	 */
	public static function get_day( WP_REST_Request $request ) {
		$date       = $request->get_param( 'date' );
		$product_id = absint( $request->get_param( 'product_id' ) );

		$rows = array_filter( FCC_Availability_Store::get_day( $date ), function( $row ) use ( $product_id ) {
			return ! $product_id || (int) $row['product_id'] === $product_id;
		} );

		if ( empty( $rows ) ) {
			return rest_ensure_response( array( 'date' => $date, 'cards' => array() ) );
		}

		// Sin producto concreto (calendario general): solo las experiencias marcadas para el calendario.
		$experiences = FCC_CPT_Manager::get_experiences_by_product_ids( wp_list_pluck( $rows, 'product_id' ), ! $product_id );

		$cards = array();

		foreach ( $rows as $row ) {
			$pid = (int) $row['product_id'];

			if ( ! isset( $experiences[ $pid ] ) ) {
				continue;
			}

			$post     = $experiences[ $pid ];
			$thumb_id = get_post_thumbnail_id( $post );
			$euros    = (float) get_post_meta( $post->ID, 'precio', true );

			// Horas propias de la experiencia; si no las tiene, no se muestran (no las de la tabla).
			$experience_hours = get_post_meta( $post->ID, 'horas', true );

			$cards[] = array(
				'productId' => $pid,
				'title'     => get_the_title( $post ),
				'imageHtml' => $thumb_id ? wp_get_attachment_image( $thumb_id, 'medium', false ) : '',
				'hours'     => ( ! empty( $experience_hours ) && is_array( $experience_hours ) ) ? array_values( $experience_hours ) : array(),
				'price'     => $euros > 0 ? $euros : null,
				'available' => (bool) $row['availability'],
			);
		}

		return rest_ensure_response( array( 'date' => $date, 'cards' => $cards ) );
	}

	/**
	 * Disponibilidad en vivo (hora × personas) de un producto un día concreto, para
	 * arrancar el formulario de reserva. A diferencia de /day (tabla cacheada, base
	 * de 1 persona), esto sí llama en vivo a CoverManager: el aforo exacto por
	 * franja solo se conoce pidiéndolo (ver skill covermanager, sección de sync).
	 */
	public static function get_availability( WP_REST_Request $request ) {
		$date       = $request->get_param( 'date' );
		$product_id = absint( $request->get_param( 'product_id' ) );

		$response = FCC_CoverManager::get_availability_extended( $date, null );
		$matrix   = is_wp_error( $response ) ? array() : self::build_availability_matrix( $response, $product_id );

		return rest_ensure_response( array(
			'date'      => $date,
			'productId' => $product_id,
			'matrix'    => empty( $matrix ) ? new stdClass() : $matrix,
		) );
	}

	/**
	 * De la respuesta de availability_extended, construye personas => horas donde
	 * ESE producto sigue teniendo hueco (igual que en FCC_Availability_Store::
	 * parse_extended_products(), un producto sin hueco simplemente no aparece).
	 *
	 * @param array $response  Respuesta decodificada de get_availability_extended().
	 * @param int   $product_id
	 * @return array<int, array<int, string>> Personas => horas ordenadas, solo con hueco.
	 */
	private static function build_availability_matrix( array $response, $product_id ) {
		$people_data = $response['availability']['people'] ?? array();
		$matrix      = array();

		foreach ( $people_data as $people_count => $hours ) {
			if ( ! is_array( $hours ) ) {
				continue;
			}

			foreach ( $hours as $hour => $info ) {
				if ( empty( $info['availability'] ) || empty( $info['products'] ) ) {
					continue;
				}

				foreach ( $info['products'] as $product ) {
					if ( (int) ( $product['id_product'] ?? 0 ) === $product_id ) {
						$matrix[ (int) $people_count ][] = $hour;
						break;
					}
				}
			}
		}

		ksort( $matrix, SORT_NUMERIC );

		foreach ( $matrix as &$hours_list ) {
			sort( $hours_list );
		}
		unset( $hours_list );

		return $matrix;
	}
}
