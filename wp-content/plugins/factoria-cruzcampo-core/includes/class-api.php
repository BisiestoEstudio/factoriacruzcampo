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
	}

	public static function get_calendar( WP_REST_Request $request ) {
		$is_experience = (bool) $request->get_param( 'experience' );
		$product_id    = absint( $request->get_param( 'product_id' ) );

		$bounds = ( $is_experience && ! $product_id )
			? array( 'min' => null, 'max' => null )
			: FCC_Availability_Store::get_availability_bounds( $is_experience ? $product_id : null );

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

		if ( $is_experience ) {
			// Calendario de una experiencia concreta: sin producto asignado no hay nada que mostrar.
			$dates = $product_id ? FCC_Availability_Store::get_calendar_state( $date_start, $date_end, $product_id ) : array();
		} else {
			$dates = FCC_Availability_Store::get_calendar_state( $date_start, $date_end );
		}

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
	 * Experiencias agendadas y con hueco un día concreto, con los datos que necesita
	 * la card: título e imagen (de la experiencia), horas (meta "horas" de la experiencia
	 * si está rellena; si no, las de FCC_Availability_Store) y precio (meta "precio").
	 */
	public static function get_day( WP_REST_Request $request ) {
		$date       = $request->get_param( 'date' );
		$product_id = absint( $request->get_param( 'product_id' ) );

		$rows = array_filter( FCC_Availability_Store::get_day( $date ), function( $row ) use ( $product_id ) {
			if ( ! $row['availability'] ) {
				return false;
			}
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

			// Sin coste: no se muestra precio, no un "0€".
			$price = '';
			if ( $euros > 0 ) {
				$price = ( (float) $euros === floor( $euros ) )
					? number_format( $euros, 0, ',', '.' )
					: number_format( $euros, 2, ',', '.' );
				$price .= '€';
			}

			// Horas propias de la experiencia; si no las tiene, no se muestran (no las de la tabla).
			$experience_hours = get_post_meta( $post->ID, 'horas', true );
			$hours            = ( ! empty( $experience_hours ) && is_array( $experience_hours ) ) ? implode( ' · ', $experience_hours ) : '';

			$cards[] = array(
				'title'     => get_the_title( $post ),
				'permalink' => get_permalink( $post ),
				'imageHtml' => $thumb_id ? wp_get_attachment_image( $thumb_id, 'medium', false ) : '',
				'hours'     => $hours,
				'price'     => $price,
			);
		}

		return rest_ensure_response( array( 'date' => $date, 'cards' => $cards ) );
	}
}
