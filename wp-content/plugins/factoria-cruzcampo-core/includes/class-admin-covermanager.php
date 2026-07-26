<?php
defined( 'ABSPATH' ) || exit;

class FCC_Admin_CoverManager {

	public static function register() {
		add_action( 'admin_menu', array( __CLASS__, 'add_menu_page' ) );
	}

	public static function add_menu_page() {
		add_menu_page(
			'Covermanager',
			'Covermanager',
			'manage_options',
			'fcc-covermanager',
			array( __CLASS__, 'render_page' ),
			'dashicons-store',
			58
		);
	}

	public static function render_page() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		$response = FCC_CoverManager::get_products();

		echo '<div class="wrap">';
		echo '<h1>' . esc_html__( 'Productos activos registrados en covermanager', 'factoria-cruzcampo-core' ) . '</h1>';

		if ( is_wp_error( $response ) ) {
			echo '<div class="notice notice-error"><p>' . esc_html( $response->get_error_message() ) . '</p></div>';
			echo '</div>';
			return;
		}

		$products       = self::get_active_products( $response['products'] ?? array() );
		$experience_map = self::get_experience_map();

		echo '<table class="wp-list-table widefat fixed striped">';
		echo '<thead><tr>';
		echo '<th>' . esc_html__( 'ID', 'factoria-cruzcampo-core' ) . '</th>';
		echo '<th>' . esc_html__( 'Nombre', 'factoria-cruzcampo-core' ) . '</th>';
		echo '<th>' . esc_html__( 'Precio', 'factoria-cruzcampo-core' ) . '</th>';
		echo '<th>' . esc_html__( 'Experiencia', 'factoria-cruzcampo-core' ) . '</th>';
		echo '</tr></thead>';
		echo '<tbody>';

		if ( empty( $products ) ) {
			echo '<tr><td colspan="4">' . esc_html__( 'No hay productos activos.', 'factoria-cruzcampo-core' ) . '</td></tr>';
		} else {
			foreach ( $products as $product ) {
				$experience = $experience_map[ $product['id'] ] ?? null;

				echo '<tr>';
				echo '<td>' . esc_html( $product['id'] ) . '</td>';
				echo '<td>' . esc_html( $product['name'] ) . '</td>';
				echo '<td>' . esc_html( $product['price'] ) . '</td>';
				echo '<td>';
				if ( $experience ) {
					echo '<a href="' . esc_url( get_edit_post_link( $experience->ID ) ) . '">' . esc_html( get_the_title( $experience ) ) . '</a>';
				} else {
					echo '&#8212;';
				}
				echo '</td>';
				echo '</tr>';
			}
		}

		echo '</tbody></table>';
		echo '</div>';
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
