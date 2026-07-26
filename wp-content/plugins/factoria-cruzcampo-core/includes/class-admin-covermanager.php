<?php
defined( 'ABSPATH' ) || exit;

class FCC_Admin_CoverManager {

	const TRANSIENT_KEY    = 'fcc_cm_products';
	const SYNCED_AT_OPTION = 'fcc_cm_products_synced_at';
	const CACHE_TTL        = DAY_IN_SECONDS;

	public static function register() {
		add_action( 'admin_menu', array( __CLASS__, 'add_menu_page' ) );
	}

	public static function add_menu_page() {
		$hook = add_menu_page(
			'Covermanager',
			'Covermanager',
			'manage_options',
			'fcc-covermanager',
			array( __CLASS__, 'render_page' ),
			'dashicons-store',
			58
		);

		add_action( "load-{$hook}", array( __CLASS__, 'maybe_handle_sync' ) );
	}

	/**
	 * Procesa el botón "Sincronizar". Se engancha a load-{page} (antes de que
	 * se envíen cabeceras) para poder redirigir tras el POST.
	 */
	public static function maybe_handle_sync() {
		if ( ! isset( $_POST['fcc_cm_sync'] ) || ! current_user_can( 'manage_options' ) ) {
			return;
		}

		check_admin_referer( 'fcc_cm_sync_products' );

		$response = FCC_CoverManager::get_products();

		if ( is_wp_error( $response ) ) {
			self::set_notice( 'error', $response->get_error_message() );
		} else {
			set_transient( self::TRANSIENT_KEY, $response, self::CACHE_TTL );
			update_option( self::SYNCED_AT_OPTION, time() );
			self::set_notice( 'success', __( 'Productos sincronizados correctamente.', 'factoria-cruzcampo-core' ) );
		}

		wp_safe_redirect( menu_page_url( 'fcc-covermanager', false ) );
		exit;
	}

	public static function render_page() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		$response       = self::get_products_data();
		$experience_map = self::get_experience_map();

		echo '<div class="wrap">';
		echo '<h1>' . esc_html__( 'Productos activos registrados en covermanager', 'factoria-cruzcampo-core' ) . '</h1>';

		self::render_notice();
		self::render_sync_form();

		if ( is_wp_error( $response ) ) {
			echo '<div class="notice notice-error"><p>' . esc_html( $response->get_error_message() ) . '</p></div>';
		} else {
			$products      = self::get_active_products( $response['products'] ?? array() );
			$scheduled_ids = self::get_scheduled_product_ids();

			self::render_products_table( $products, $experience_map, $scheduled_ids );
		}

		self::render_free_products_table( $experience_map );

		echo '</div>';
	}

	/**
	 * Tabla principal: productos activos devueltos por get_products().
	 *
	 * @param array $products       Ver get_active_products().
	 * @param array $experience_map Ver get_experience_map().
	 * @param array $scheduled_ids  Ver get_scheduled_product_ids().
	 */
	private static function render_products_table( array $products, array $experience_map, array $scheduled_ids ) {
		echo '<table class="wp-list-table widefat fixed striped">';
		echo '<thead><tr>';
		echo '<th>' . esc_html__( 'ID', 'factoria-cruzcampo-core' ) . '</th>';
		echo '<th>' . esc_html__( 'Nombre', 'factoria-cruzcampo-core' ) . '</th>';
		echo '<th>' . esc_html__( 'Precio', 'factoria-cruzcampo-core' ) . '</th>';
		echo '<th>' . esc_html__( 'Experiencia', 'factoria-cruzcampo-core' ) . '</th>';
		echo '<th>' . esc_html__( 'Actualmente agendado', 'factoria-cruzcampo-core' ) . '</th>';
		echo '</tr></thead>';
		echo '<tbody>';

		if ( empty( $products ) ) {
			echo '<tr><td colspan="5">' . esc_html__( 'No hay productos activos.', 'factoria-cruzcampo-core' ) . '</td></tr>';
		} else {
			foreach ( $products as $product ) {
				$experience   = $experience_map[ $product['id'] ] ?? null;
				$is_scheduled = isset( $scheduled_ids[ (string) $product['id'] ] );

				echo '<tr>';
				echo '<td>' . esc_html( $product['id'] ) . '</td>';
				echo '<td>' . esc_html( $product['name'] ) . '</td>';
				echo '<td>' . esc_html( $product['price'] ) . '</td>';
				echo '<td>' . self::experience_link( $experience ) . '</td>';
				echo '<td>';
				if ( $is_scheduled ) {
					echo '<span class="dashicons dashicons-yes-alt" style="color:#008a20"></span> ' . esc_html__( 'Sí', 'factoria-cruzcampo-core' );
				} else {
					echo '<span class="dashicons dashicons-marker" style="color:#a7aaad"></span> ' . esc_html__( 'No', 'factoria-cruzcampo-core' );
				}
				echo '</td>';
				echo '</tr>';
			}
		}

		echo '</tbody></table>';
	}

	/**
	 * Tabla secundaria: productos presentes en fcc_availability con amount_total = 0.
	 * get_products() solo devuelve productos con algún coste, así que estos productos
	 * agendados sin cobro nunca aparecerían en la tabla principal.
	 *
	 * @param array $experience_map Ver get_experience_map().
	 */
	private static function render_free_products_table( array $experience_map ) {
		$products = self::get_free_scheduled_products();

		echo '<h2>' . esc_html__( 'Otros productos agendados sin cobro', 'factoria-cruzcampo-core' ) . '</h2>';
		echo '<table class="wp-list-table widefat fixed striped">';
		echo '<thead><tr>';
		echo '<th>' . esc_html__( 'ID', 'factoria-cruzcampo-core' ) . '</th>';
		echo '<th>' . esc_html__( 'Nombre', 'factoria-cruzcampo-core' ) . '</th>';
		echo '<th>' . esc_html__( 'Experiencia', 'factoria-cruzcampo-core' ) . '</th>';
		echo '</tr></thead>';
		echo '<tbody>';

		if ( empty( $products ) ) {
			echo '<tr><td colspan="3">' . esc_html__( 'No hay productos agendados sin cobro.', 'factoria-cruzcampo-core' ) . '</td></tr>';
		} else {
			foreach ( $products as $product ) {
				$experience = $experience_map[ (string) $product['product_id'] ] ?? null;

				echo '<tr>';
				echo '<td>' . esc_html( $product['product_id'] ) . '</td>';
				echo '<td>' . esc_html( $product['product_name'] ) . '</td>';
				echo '<td>' . self::experience_link( $experience ) . '</td>';
				echo '</tr>';
			}
		}

		echo '</tbody></table>';
	}

	/**
	 * @param WP_Post|null $experience
	 * @return string HTML del enlace a la experiencia, o un guion si no hay coincidencia.
	 */
	private static function experience_link( $experience ) {
		if ( ! $experience ) {
			return '&#8212;';
		}

		return '<a href="' . esc_url( get_edit_post_link( $experience->ID ) ) . '">' . esc_html( get_the_title( $experience ) ) . '</a>';
	}

	/**
	 * Lista de productos cacheada en transient. Hace la llamada en vivo a la API
	 * solo si no hay caché o esta ha expirado (24h).
	 *
	 * @return array|WP_Error
	 */
	private static function get_products_data() {
		$cached = get_transient( self::TRANSIENT_KEY );

		if ( false !== $cached ) {
			return $cached;
		}

		$response = FCC_CoverManager::get_products();

		if ( ! is_wp_error( $response ) ) {
			set_transient( self::TRANSIENT_KEY, $response, self::CACHE_TTL );
			update_option( self::SYNCED_AT_OPTION, time() );
		}

		return $response;
	}

	private static function render_sync_form() {
		$synced_at = get_option( self::SYNCED_AT_OPTION );

		echo '<form method="post" style="margin:16px 0 20px;display:flex;align-items:center;gap:12px;">';
		wp_nonce_field( 'fcc_cm_sync_products' );
		echo '<button type="submit" name="fcc_cm_sync" value="1" class="button button-secondary">' . esc_html__( 'Sincronizar', 'factoria-cruzcampo-core' ) . '</button>';

		if ( $synced_at ) {
			echo '<span>' . esc_html(
				sprintf(
					/* translators: %s: fecha y hora de la última sincronización */
					__( 'Última sincronización: %s', 'factoria-cruzcampo-core' ),
					wp_date( 'd/m/Y H:i', $synced_at )
				)
			) . '</span>';
		}

		echo '</form>';
	}

	private static function set_notice( $type, $message ) {
		set_transient( 'fcc_cm_notice_' . get_current_user_id(), array(
			'type'    => $type,
			'message' => $message,
		), 30 );
	}

	private static function render_notice() {
		$key    = 'fcc_cm_notice_' . get_current_user_id();
		$notice = get_transient( $key );

		if ( ! $notice ) {
			return;
		}

		delete_transient( $key );

		echo '<div class="notice notice-' . esc_attr( $notice['type'] ) . ' is-dismissible"><p>' . esc_html( $notice['message'] ) . '</p></div>';
	}

	/**
	 * IDs de producto presentes en fcc_availability (agendados, con independencia
	 * de si siguen teniendo hueco disponible).
	 *
	 * @return array<string, true> Set indexado por product_id (como string) para lookup rápido.
	 */
	private static function get_scheduled_product_ids() {
		return array_fill_keys( array_map( 'strval', FCC_Availability_Store::get_all_product_ids() ), true );
	}

	/**
	 * Productos de fcc_availability agendados sin coste (amount_total = 0).
	 * get_products() no los devuelve, ya que solo incluye productos con precio.
	 *
	 * @return array[] Cada fila con product_id y product_name.
	 */
	private static function get_free_scheduled_products() {
		global $wpdb;
		$table_name = FCC_Availability_Store::table_name();

		return $wpdb->get_results(
			"SELECT product_id, MAX(product_name) AS product_name
			FROM {$table_name}
			WHERE amount_total = 0
			GROUP BY product_id
			ORDER BY product_name",
			ARRAY_A
		);
	}

	/**
	 * Mapa product_id => WP_Post de las experiencias (CPT 'experience') que lo tienen asignado.
	 *
	 * @return array<string, WP_Post>
	 */
	private static function get_experience_map() {
		$experiences = get_posts( array(
			'post_type'      => 'experience',
			'post_status'    => 'any',
			'posts_per_page' => -1,
			'meta_key'       => 'product_id',
		) );

		$map = array();

		foreach ( $experiences as $experience ) {
			$product_id = get_post_meta( $experience->ID, 'product_id', true );

			if ( '' !== $product_id ) {
				$map[ $product_id ] = $experience;
			}
		}

		return $map;
	}

	/**
	 * Filtra y da formato a los productos activos (no "NO DISPONIBLE" ni eliminados).
	 *
	 * @param array $raw_products Productos tal cual los devuelve get_products().
	 * @return array
	 */
	private static function get_active_products( array $raw_products ) {
		$products = array();

		foreach ( $raw_products as $raw_product ) {
			if ( ( $raw_product['deleted'] ?? '0' ) === '1' ) {
				continue;
			}

			$names = json_decode( $raw_product['name'] ?? '', true );
			$name  = trim( $names['spanish'] ?? '' );

			if ( '' === $name || str_starts_with( $name, 'NO DISPONIBLE' ) ) {
				continue;
			}

			$products[] = array(
				'id'    => $raw_product['id_product'] ?? '',
				'name'  => $name,
				'price' => number_format( ( (int) ( $raw_product['price'] ?? 0 ) ) / 100, 2, ',', '.' ) . ' €',
				'order' => (int) ( $raw_product['order_product'] ?? 0 ),
			);
		}

		usort( $products, function ( $a, $b ) {
			return $a['order'] <=> $b['order'];
		} );

		return $products;
	}
}
