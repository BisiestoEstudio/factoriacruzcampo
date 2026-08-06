<?php
defined( 'ABSPATH' ) || exit;

class FCC_CoverManager {

	const BASE_URL = 'https://www.covermanager.com';

	/**
	 * Disponibilidad en rango de fechas. Ideal para vista de calendario mensual.
	 * Sin fechas devuelve toda la disponibilidad.
	 *
	 * @param int         $people      Número de personas.
	 * @param string|null $date_start  Fecha inicio: 'YYYY-MM-DD'. Opcional.
	 * @param string|null $date_end    Fecha fin: 'YYYY-MM-DD'. Opcional.
	 * @return array|WP_Error
	 */
	public static function get_availability_calendar( $people, $date_start = null, $date_end = null ) {
		$params = array(
			'restaurant' => FCC_COVERMANAGER_RESTAURANT,
			'people'     => (int) $people,
		);

		if ( $date_start !== null ) {
			$params['dateStart'] = $date_start;
		}
		if ( $date_end !== null ) {
			$params['dateEnd'] = $date_end;
		}

		return self::post( '/api/reserv/availability_calendar', $params );
	}

	/**
	 * Disponibilidad completa de un día: horas, productos, precios y tipo de reserva.
	 * Endpoint principal para la vista de día de la agenda.
	 *
	 * @param string   $date    Fecha: 'YYYY-MM-DD'.
	 * @param int|null $people  Número de personas. Opcional.
	 * @return array|WP_Error
	 */
	public static function get_availability_extended( $date, $people = null ) {
		$params = array(
			'restaurant'   => FCC_COVERMANAGER_RESTAURANT,
			'date'         => $date,
			'discount'     => 'all',
			'product_type' => '1'
		);

		if ( $people !== null ) {
			$params['number_people'] = (int) $people;
		}

		return self::post( '/apiV2/availability_extended', $params );
	}

	/**
	 * Lista de productos del restaurante.
	 *
	 * @return array|WP_Error
	 */
	public static function get_products() {
		return self::post( '/api/pays/get_products', array(
			'restaurant' => FCC_COVERMANAGER_RESTAURANT,
		) );
	}

	/**
	 * Crea una reserva.
	 *
	 * @param array $args {
	 *     @type string $date            'YYYY-MM-DD'. Requerido.
	 *     @type string $hour            'HH:MM'. Requerido.
	 *     @type int    $people          Número de personas. Requerido.
	 *     @type string $first_name      Requerido.
	 *     @type string $last_name       Requerido.
	 *     @type string $email
	 *     @type string $int_call_code   Prefijo telefónico sin '+', ej. "34".
	 *     @type string $phone
	 *     @type string $tags_client
	 *     @type string $source
	 *     @type string $commentary
	 *     @type string $language        Por defecto 'spanish'.
	 *     @type string $pending         '1' o '0'. Por defecto '1'.
	 *     @type string $discount        '0' si no hay descuento. Por defecto '0'.
	 *     @type string $not_notify      '1' o '0'. Por defecto '1'.
	 * }
	 * @return array|WP_Error
	 */
	public static function create_reservation( array $args ) {
		$defaults = array(
			'email'         => '',
			'int_call_code' => '',
			'phone'         => '',
			'tags_client'   => '',
			'source'        => '',
			'commentary'    => '',
			'language'      => 'spanish',
			'pending'       => '1',
			'discount'      => '0',
			'not_notify'    => '1',
		);

		$params = array_merge( $defaults, $args, array(
			'restaurant' => FCC_COVERMANAGER_RESTAURANT,
		) );

		return self::post( '/api/reserv/reserv', $params );
	}

	/**
	 * Realiza una petición POST a la API de CoverManager.
	 *
	 * @param string $endpoint  Ruta del endpoint (con / inicial).
	 * @param array  $body      Parámetros a enviar.
	 * @return array|WP_Error   Datos de la respuesta o WP_Error en caso de fallo.
	 */
	private static function post( $endpoint, array $body ) {
		$response = wp_remote_post( self::BASE_URL . $endpoint, array(
			'headers' => array(
				'Content-Type' => 'application/json',
				'apikey'       => FCC_COVERMANAGER_API_KEY,
			),
			'body'    => wp_json_encode( $body ),
			'timeout' => 15,
		) );

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		$data = json_decode( wp_remote_retrieve_body( $response ), true );

		if ( empty( $data ) ) {
			return new WP_Error( 'fcc_cm_empty_response', __( 'Respuesta vacía de CoverManager.', 'factoria-cruzcampo-core' ) );
		}

		if ( isset( $data['resp'] ) && 1 !== (int) $data['resp'] ) {
			$message = $data['status'] ?? $data['error'] ?? __( 'Error desconocido en CoverManager.', 'factoria-cruzcampo-core' );
			return new WP_Error( 'fcc_cm_api_error', $message );
		}

		return $data;
	}
}
