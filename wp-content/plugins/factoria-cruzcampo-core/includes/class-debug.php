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

		add_action( 'wp_footer', array( __CLASS__, 'render' ) );
	}

	public static function render() {
		$raw_products     = self::raw_post( '/api/pays/get_products', array(
			'restaurant' => FCC_COVERMANAGER_RESTAURANT,
		) );
		$raw_availability = self::raw_post( '/api/reserv/availability_calendar', array(
			'restaurant' => FCC_COVERMANAGER_RESTAURANT,
			'people'     => '2',
			'discount'   => 'all',
		) );
		?>
		<style>
			#fcc-debug { position:fixed; bottom:0; left:0; right:0; max-height:40vh; overflow-y:auto; background:#1e1e1e; color:#d4d4d4; font:12px/1.5 monospace; padding:16px; z-index:99999; border-top:3px solid #f0a500; }
			#fcc-debug summary { cursor:pointer; color:#f0a500; font-weight:bold; margin-bottom:8px; }
			#fcc-debug pre { margin:0; white-space:pre-wrap; word-break:break-all; }
		</style>
		<details id="fcc-debug" open>
			<summary>FCC Debug — respuesta cruda</summary>
			<p style="color:#f0a500;margin:0 0 4px"><strong>get_products</strong></p>
			<pre><?php echo esc_html( $raw_products ); ?></pre>
			<p style="color:#f0a500;margin:12px 0 4px"><strong>get_availability_calendar</strong> (<?php echo esc_html( gmdate( 'Y-m' ) ); ?>, 2 personas)</p>
			<pre><?php echo esc_html( $raw_availability ); ?></pre>
		</details>
		<?php
	}

	private static function raw_post( $endpoint, array $body ) {
		$response = wp_remote_post( FCC_CoverManager::BASE_URL . $endpoint, array(
			'headers' => array(
				'Content-Type' => 'application/json',
				'apikey'       => FCC_COVERMANAGER_API_KEY,
			),
			'body'    => wp_json_encode( $body ),
			'timeout' => 15,
		) );

		if ( is_wp_error( $response ) ) {
			return 'WP_Error: ' . $response->get_error_message();
		}

		$code = wp_remote_retrieve_response_code( $response );
		$body = wp_remote_retrieve_body( $response );
		$decoded = json_decode( $body, true );

		return 'HTTP ' . $code . "\n" . wp_json_encode( $decoded ?? $body, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE );
	}

	private static function format( $data ) {
		if ( is_wp_error( $data ) ) {
			return 'WP_Error: ' . $data->get_error_message();
		}
		return wp_json_encode( $data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE );
	}

	private static function is_enabled() {
		return defined( 'FCC_DEBUG' ) && FCC_DEBUG;
	}
}
