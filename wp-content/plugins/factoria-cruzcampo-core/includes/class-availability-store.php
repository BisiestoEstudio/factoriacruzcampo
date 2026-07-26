<?php
defined( 'ABSPATH' ) || exit;

/**
 * Caché en base de datos de la disponibilidad de CoverManager.
 *
 * Guarda, por fecha y producto, a qué horas está agendado (columna `hours`,
 * horas separadas por comas, ej. "11:00,14:00"). Se alimenta de
 * availability_calendar (qué días tienen alguna disponibilidad) y
 * availability_extended (horas y productos de cada día), usando siempre el
 * aforo mínimo (1 persona) como base: no distinguimos por número de personas,
 * solo necesitamos saber a qué horas está agendado cada producto. El precio
 * es el mismo en todas las franjas de un producto, así que se guarda una vez.
 */
class FCC_Availability_Store {

	const DB_VERSION = '1.1';
	const DB_VERSION_OPTION = 'fcc_availability_db_version';
	const SYNC_HOOK = 'fcc_availability_sync';

	public static function table_name() {
		global $wpdb;
		return $wpdb->prefix . 'fcc_availability';
	}

	/**
	 * Crea o actualiza la tabla si la versión de esquema ha cambiado.
	 * Al ser una caché (no datos del usuario), un cambio de versión recrea
	 * la tabla desde cero; el siguiente sync la vuelve a rellenar.
	 */
	public static function maybe_create_table() {
		if ( get_option( self::DB_VERSION_OPTION ) === self::DB_VERSION ) {
			return;
		}

		global $wpdb;
		$table_name      = self::table_name();
		$charset_collate = $wpdb->get_charset_collate();

		$wpdb->query( "DROP TABLE IF EXISTS {$table_name}" );

		$sql = "CREATE TABLE {$table_name} (
			id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
			date DATE NOT NULL,
			product_id BIGINT UNSIGNED NOT NULL,
			product_name VARCHAR(255) NOT NULL,
			hours VARCHAR(100) NOT NULL,
			amount_total INT UNSIGNED NOT NULL DEFAULT 0,
			updated_at DATETIME NOT NULL,
			PRIMARY KEY  (id),
			UNIQUE KEY date_product (date, product_id),
			KEY date_idx (date),
			KEY product_idx (product_id)
		) {$charset_collate};";

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		dbDelta( $sql );

		update_option( self::DB_VERSION_OPTION, self::DB_VERSION );
	}

	/**
	 * Sincroniza los días candidatos con CoverManager.
	 * Pensado para ejecutarse por WP-Cron, no en el path de una petición de usuario.
	 */
	public static function sync() {
		$today    = gmdate( 'Y-m-d' );
		$calendar = FCC_CoverManager::get_availability_calendar( 1 );

		if ( is_wp_error( $calendar ) ) {
			return $calendar;
		}

		$dates = isset( $calendar['calendar'] ) && is_array( $calendar['calendar'] )
			? array_keys( $calendar['calendar'] )
			: array();

		// El calendario puede incluir fechas ya pasadas; se descartan.
		$dates = array_values( array_filter( $dates, function( $date ) use ( $today ) {
			return $date >= $today;
		} ) );

		foreach ( $dates as $date ) {
			self::sync_day( $date );
		}

		return true;
	}

	/**
	 * Sincroniza un único día: sustituye sus filas por el estado actual.
	 *
	 * @param string $date 'YYYY-MM-DD'.
	 * @return array|WP_Error
	 */
	public static function sync_day( $date ) {
		$extended = FCC_CoverManager::get_availability_extended( $date );

		if ( is_wp_error( $extended ) ) {
			return $extended;
		}

		$products = self::parse_extended_products( $extended );

		global $wpdb;
		$table_name = self::table_name();
		$now        = current_time( 'mysql', true );

		$wpdb->query( $wpdb->prepare( "DELETE FROM {$table_name} WHERE date = %s", $date ) );

		foreach ( $products as $product ) {
			$wpdb->insert(
				$table_name,
				array(
					'date'         => $date,
					'product_id'   => $product['product_id'],
					'product_name' => $product['product_name'],
					'hours'        => implode( ',', $product['hours'] ),
					'amount_total' => $product['amount_total'],
					'updated_at'   => $now,
				),
				array( '%s', '%d', '%s', '%s', '%d', '%s' )
			);
		}

		return $products;
	}

	/**
	 * Extrae de la respuesta de availability_extended la lista de productos
	 * agendados ese día, con sus horas agrupadas. Usa el aforo de 1 persona
	 * como base.
	 *
	 * @param array $extended Respuesta decodificada de get_availability_extended().
	 * @return array[] Lista de arrays con product_id, product_name, hours (array ordenado), amount_total.
	 */
	private static function parse_extended_products( array $extended ) {
		$hours = $extended['availability']['people']['1'] ?? array();

		if ( ! is_array( $hours ) || empty( $hours ) ) {
			return array();
		}

		$products = array();

		foreach ( $hours as $hour => $info ) {
			if ( empty( $info['products'] ) || ! is_array( $info['products'] ) ) {
				continue;
			}

			foreach ( $info['products'] as $product ) {
				if ( empty( $product['id_product'] ) ) {
					continue;
				}

				$product_id = (int) $product['id_product'];

				if ( ! isset( $products[ $product_id ] ) ) {
					$products[ $product_id ] = array(
						'product_id'   => $product_id,
						'product_name' => (string) ( $product['product_name'] ?? '' ),
						'amount_total' => (int) ( $product['amount_total'] ?? 0 ),
						'hours'        => array(),
					);
				}

				$products[ $product_id ]['hours'][] = $hour;
			}
		}

		foreach ( $products as &$product ) {
			sort( $product['hours'] );
		}
		unset( $product );

		return array_values( $products );
	}

	/**
	 * Fechas con al menos un producto agendado en el rango dado.
	 *
	 * @param string $start 'YYYY-MM-DD'.
	 * @param string $end   'YYYY-MM-DD'.
	 * @return string[]
	 */
	public static function get_calendar_dates( $start, $end ) {
		global $wpdb;
		$table_name = self::table_name();

		return $wpdb->get_col( $wpdb->prepare(
			"SELECT DISTINCT date FROM {$table_name} WHERE date BETWEEN %s AND %s ORDER BY date",
			$start,
			$end
		) );
	}

	/**
	 * Productos agendados en un día concreto, con sus horas.
	 *
	 * @param string $date 'YYYY-MM-DD'.
	 * @return array[] Cada fila con product_id, product_name, hours (array), amount_total.
	 */
	public static function get_day( $date ) {
		global $wpdb;
		$table_name = self::table_name();

		$rows = $wpdb->get_results( $wpdb->prepare(
			"SELECT product_id, product_name, hours, amount_total
			FROM {$table_name}
			WHERE date = %s
			ORDER BY product_name",
			$date
		), ARRAY_A );

		foreach ( $rows as &$row ) {
			$row['hours'] = explode( ',', $row['hours'] );
		}
		unset( $row );

		return $rows;
	}

	/**
	 * Horas a las que está agendado un producto (dentro de la ventana cacheada), sin duplicados.
	 * Pensado para mostrarse en la ficha de la experiencia.
	 *
	 * @param int $product_id
	 * @return string[] Horas ordenadas, ej. ['14:00', '20:00'].
	 */
	public static function get_hours_for_product( $product_id ) {
		global $wpdb;
		$table_name = self::table_name();

		$hours_lists = $wpdb->get_col( $wpdb->prepare(
			"SELECT hours FROM {$table_name} WHERE product_id = %d AND date >= %s",
			$product_id,
			gmdate( 'Y-m-d' )
		) );

		$hours = array();
		foreach ( $hours_lists as $hours_list ) {
			$hours = array_merge( $hours, explode( ',', $hours_list ) );
		}

		$hours = array_unique( $hours );
		sort( $hours );

		return $hours;
	}
}
