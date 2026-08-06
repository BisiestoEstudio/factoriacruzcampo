<?php
defined( 'ABSPATH' ) || exit;

/**
 * Caché en base de datos de la disponibilidad de CoverManager.
 *
 * Guarda, por fecha y producto, a qué horas está agendado (columna `hours`,
 * horas separadas por comas, ej. "11:00,14:00") y si sigue teniendo hueco
 * (columna `availability`). Se alimenta de availability_calendar (qué días
 * tienen alguna disponibilidad) y availability_extended (horas y productos
 * de cada día), usando siempre el aforo mínimo (1 persona) como base: no
 * distinguimos por número de personas, solo necesitamos saber a qué horas
 * está agendado cada producto. El precio es el mismo en todas las franjas
 * de un producto, así que se guarda una vez.
 *
 * availability_extended solo incluye en "products" los que tienen hueco: un
 * producto agotado simplemente desaparece de la respuesta, no se marca como
 * no disponible. Por eso el registro no se borra al desaparecer: se mantiene
 * la fila y se marca `availability = 0`, conservando `hours` (que solo crece,
 * nunca se reduce, aunque una franja concreta se agote) para no perder el
 * histórico de a qué horas se ha ofrecido ese producto ese día.
 */
class FCC_Availability_Store {

	const DB_VERSION = '1.3';
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
			availability TINYINT(1) NOT NULL DEFAULT 1,
			updated_at DATETIME NOT NULL,
			PRIMARY KEY  (id),
			UNIQUE KEY date_product (date, product_id),
			KEY product_date_idx (product_id, date)
		) {$charset_collate};";

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		dbDelta( $sql );

		update_option( self::DB_VERSION_OPTION, self::DB_VERSION );
	}

	/**
	 * Sincroniza con CoverManager: días candidatos del calendario más los que
	 * ya tuviéramos en caché (para poder detectar los que se han quedado sin
	 * ningún producto disponible y ya no aparecen en el calendario).
	 * Pensado para ejecutarse por WP-Cron, no en el path de una petición de usuario.
	 */
	public static function sync() {
		$today = gmdate( 'Y-m-d' );

		self::purge_past_dates( $today );

		$calendar = FCC_CoverManager::get_availability_calendar( 1 );

		if ( is_wp_error( $calendar ) ) {
			return $calendar;
		}

		$calendar_dates = isset( $calendar['calendar'] ) && is_array( $calendar['calendar'] )
			? array_keys( $calendar['calendar'] )
			: array();

		$dates = array_unique( array_merge( $calendar_dates, self::get_all_cached_dates() ) );

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
	 * Elimina de la caché cualquier registro de fecha anterior a hoy.
	 *
	 * @param string $today 'YYYY-MM-DD'.
	 */
	private static function purge_past_dates( $today ) {
		global $wpdb;
		$table_name = self::table_name();

		$wpdb->query( $wpdb->prepare( "DELETE FROM {$table_name} WHERE date < %s", $today ) );
	}

	/**
	 * Todas las fechas presentes actualmente en la caché, disponibles o no.
	 * Sirve para poder revisar en el próximo sync los días que ya no aparecen
	 * en availability_calendar porque se quedaron sin ningún producto disponible.
	 *
	 * @return string[]
	 */
	public static function get_all_cached_dates() {
		global $wpdb;
		$table_name = self::table_name();

		return $wpdb->get_col( "SELECT DISTINCT date FROM {$table_name}" );
	}

	/**
	 * Sincroniza un único día: hace upsert de los productos encontrados y
	 * marca como no disponibles (sin borrarlos) los que ya no aparecen.
	 *
	 * @param string $date 'YYYY-MM-DD'.
	 * @return true|WP_Error
	 */
	public static function sync_day( $date ) {
		$extended = FCC_CoverManager::get_availability_extended( $date );

		if ( is_wp_error( $extended ) ) {
			return $extended;
		}

		$found = self::parse_extended_products( $extended );

		global $wpdb;
		$table_name = self::table_name();
		$now        = current_time( 'mysql', true );

		$existing = $wpdb->get_results( $wpdb->prepare(
			"SELECT product_id, hours FROM {$table_name} WHERE date = %s",
			$date
		), OBJECT_K );

		$found_ids = array();

		foreach ( $found as $product_id => $product ) {
			$found_ids[] = $product_id;
			$hours       = $product['hours'];

			if ( isset( $existing[ $product_id ] ) ) {
				$hours = array_unique( array_merge( explode( ',', $existing[ $product_id ]->hours ), $hours ) );
				sort( $hours );

				$wpdb->update(
					$table_name,
					array(
						'product_name' => $product['product_name'],
						'hours'        => implode( ',', $hours ),
						'amount_total' => $product['amount_total'],
						'availability' => 1,
						'updated_at'   => $now,
					),
					array( 'date' => $date, 'product_id' => $product_id ),
					array( '%s', '%s', '%d', '%d', '%s' ),
					array( '%s', '%d' )
				);
			} else {
				$wpdb->insert(
					$table_name,
					array(
						'date'         => $date,
						'product_id'   => $product_id,
						'product_name' => $product['product_name'],
						'hours'        => implode( ',', $hours ),
						'amount_total' => $product['amount_total'],
						'availability' => 1,
						'updated_at'   => $now,
					),
					array( '%s', '%d', '%s', '%s', '%d', '%d', '%s' )
				);
			}
		}

		// Productos que ya no aparecen en la respuesta: se marcan agotados, sin tocar hours/product_name.
		$missing_ids = array_diff( array_keys( $existing ), $found_ids );

		foreach ( $missing_ids as $product_id ) {
			$wpdb->update(
				$table_name,
				array( 'availability' => 0, 'updated_at' => $now ),
				array( 'date' => $date, 'product_id' => $product_id ),
				array( '%d', '%s' ),
				array( '%s', '%d' )
			);
		}

		return true;
	}

	/**
	 * Extrae de la respuesta de availability_extended los productos agendados
	 * ese día, con sus horas agrupadas. Usa el aforo de 1 persona como base.
	 *
	 * @param array $extended Respuesta decodificada de get_availability_extended().
	 * @return array[] Indexado por product_id, cada uno con product_name, hours (array ordenado), amount_total.
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

		return $products;
	}

	/**
	 * Fechas con al menos un producto agendado en el rango dado.
	 *
	 * @param string $start          'YYYY-MM-DD'.
	 * @param string $end            'YYYY-MM-DD'.
	 * @param bool   $only_available Si es true (por defecto), solo cuentan fechas con algún producto todavía disponible.
	 * @return string[]
	 */
	public static function get_calendar_dates( $start, $end, $only_available = true ) {
		global $wpdb;
		$table_name = self::table_name();

		$availability_clause = $only_available ? 'AND availability = 1' : '';

		return $wpdb->get_col( $wpdb->prepare(
			"SELECT DISTINCT date FROM {$table_name} WHERE date BETWEEN %s AND %s {$availability_clause} ORDER BY date",
			$start,
			$end
		) );
	}

	/**
	 * Primera y última fecha con disponibilidad real (availability = 1), para
	 * saber entre qué meses tiene sentido dejar navegar el calendario. Sin
	 * $product_id, considera cualquier producto (calendario general); con
	 * $product_id, solo ese producto (calendario de una experiencia).
	 *
	 * @param int|null $product_id Restringe a un producto si se indica.
	 * @return array{min: string|null, max: string|null} 'YYYY-MM-DD' o null si no hay ninguna fecha disponible.
	 */
	public static function get_availability_bounds( $product_id = null ) {
		global $wpdb;
		$table_name = self::table_name();

		if ( $product_id ) {
			$row = $wpdb->get_row( $wpdb->prepare(
				"SELECT MIN(date) AS min_date, MAX(date) AS max_date FROM {$table_name}
				WHERE product_id = %d AND availability = 1",
				$product_id
			), ARRAY_A );
		} else {
			$row = $wpdb->get_row(
				"SELECT MIN(date) AS min_date, MAX(date) AS max_date FROM {$table_name} WHERE availability = 1",
				ARRAY_A
			);
		}

		return array(
			'min' => $row['min_date'] ?? null,
			'max' => $row['max_date'] ?? null,
		);
	}

	/**
	 * Mapa fecha => 1|0 para pintar un calendario: 1 disponible, 0 agotado.
	 * Sin $product_id, cuenta cualquier producto agendado ese día (calendario
	 * general); con $product_id, restringe a ese producto (calendario de una
	 * experiencia concreta). Las fechas sin ninguna fila no aparecen en el mapa.
	 *
	 * @param string   $start      'YYYY-MM-DD'.
	 * @param string   $end        'YYYY-MM-DD'.
	 * @param int|null $product_id Restringe a un producto si se indica.
	 * @return array<string,int> Fecha => 1 (disponible) | 0 (agotado).
	 */
	public static function get_calendar_state( $start, $end, $product_id = null ) {
		global $wpdb;
		$table_name = self::table_name();

		if ( $product_id ) {
			$rows = $wpdb->get_results( $wpdb->prepare(
				"SELECT date, MAX(availability) AS available FROM {$table_name}
				WHERE product_id = %d AND date BETWEEN %s AND %s
				GROUP BY date ORDER BY date",
				$product_id,
				$start,
				$end
			), ARRAY_A );
		} else {
			$rows = $wpdb->get_results( $wpdb->prepare(
				"SELECT date, MAX(availability) AS available FROM {$table_name}
				WHERE date BETWEEN %s AND %s
				GROUP BY date ORDER BY date",
				$start,
				$end
			), ARRAY_A );
		}

		$map = array();
		foreach ( $rows as $row ) {
			$map[ $row['date'] ] = (int) $row['available'];
		}

		return $map;
	}

	/**
	 * Envoltorio de get_availability_bounds() para el caso común "calendario general
	 * vs. calendario de una experiencia": si es de experiencia pero no tiene producto
	 * asignado, no hay nada que mostrar (no cae al calendario general).
	 *
	 * @param bool     $is_experience
	 * @param int|null $product_id
	 * @return array{min: string|null, max: string|null}
	 */
	public static function get_availability_bounds_for( $is_experience, $product_id ) {
		if ( $is_experience && ! $product_id ) {
			return array( 'min' => null, 'max' => null );
		}

		return self::get_availability_bounds( $is_experience ? $product_id : null );
	}

	/**
	 * Envoltorio de get_calendar_state() con la misma regla que get_availability_bounds_for().
	 *
	 * @param bool     $is_experience
	 * @param int|null $product_id
	 * @param string   $start 'YYYY-MM-DD'.
	 * @param string   $end   'YYYY-MM-DD'.
	 * @return array<string,int>
	 */
	public static function get_calendar_state_for( $is_experience, $product_id, $start, $end ) {
		if ( $is_experience && ! $product_id ) {
			return array();
		}

		return self::get_calendar_state( $start, $end, $is_experience ? $product_id : null );
	}

	/**
	 * Productos agendados en un día concreto, con sus horas y disponibilidad.
	 *
	 * @param string $date 'YYYY-MM-DD'.
	 * @return array[] Cada fila con product_id, product_name, hours (array), amount_total, availability (bool).
	 */
	public static function get_day( $date ) {
		global $wpdb;
		$table_name = self::table_name();

		$rows = $wpdb->get_results( $wpdb->prepare(
			"SELECT product_id, product_name, hours, amount_total, availability
			FROM {$table_name}
			WHERE date = %s
			ORDER BY product_name",
			$date
		), ARRAY_A );

		foreach ( $rows as &$row ) {
			$row['hours']        = explode( ',', $row['hours'] );
			$row['availability'] = (bool) $row['availability'];
		}
		unset( $row );

		return $rows;
	}

	/**
	 * Fechas (dentro de la ventana cacheada) en las que un producto sigue disponible.
	 *
	 * @param int $product_id
	 * @return string[] Fechas ordenadas cronológicamente.
	 */
	public static function get_available_dates_for_product( $product_id ) {
		global $wpdb;
		$table_name = self::table_name();

		return $wpdb->get_col( $wpdb->prepare(
			"SELECT date FROM {$table_name}
			WHERE product_id = %d AND date >= %s AND availability = 1
			ORDER BY date",
			$product_id,
			gmdate( 'Y-m-d' )
		) );
	}

	/**
	 * Todos los product_id presentes en la caché (agendados en algún momento
	 * dentro de la ventana cacheada), con independencia de si siguen disponibles.
	 *
	 * @return int[]
	 */
	public static function get_all_product_ids() {
		global $wpdb;
		$table_name = self::table_name();

		return array_map( 'intval', $wpdb->get_col( "SELECT DISTINCT product_id FROM {$table_name}" ) );
	}

	/**
	 * Horas a las que está agendado un producto (dentro de la ventana cacheada), sin duplicados.
	 * Pensado para mostrarse en la ficha de la experiencia; no filtra por disponibilidad
	 * porque representa el horario habitual del producto, no el estado de reserva del momento.
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
