<?php
defined( 'ABSPATH' ) || exit;

class FCC_Loader {

	const SYNC_INTERVAL = 'fcc_six_hours';

	public static function init() {
		require_once FCC_PLUGIN_DIR . 'includes/class-cpt-manager.php';
		require_once FCC_PLUGIN_DIR . 'includes/class-taxonomy-manager.php';
		require_once FCC_PLUGIN_DIR . 'includes/class-meta-boxes.php';
		require_once FCC_PLUGIN_DIR . 'includes/class-covermanager.php';
		require_once FCC_PLUGIN_DIR . 'includes/class-availability-store.php';
		require_once FCC_PLUGIN_DIR . 'includes/class-debug.php';
		require_once FCC_PLUGIN_DIR . 'includes/class-api.php';

		add_action( 'init', array( 'FCC_CPT_Manager', 'register' ) );
		add_action( 'init', array( 'FCC_Taxonomy_Manager', 'register' ) );
		add_action( 'init', array( 'FCC_Meta_Boxes', 'register' ) );
		add_action( 'init', array( 'FCC_Availability_Store', 'maybe_create_table' ) );
		add_action( 'init', array( __CLASS__, 'maybe_schedule_sync' ) );
		add_filter( 'cron_schedules', array( __CLASS__, 'add_cron_interval' ) );
		add_action( FCC_Availability_Store::SYNC_HOOK, array( 'FCC_Availability_Store', 'sync' ) );
		FCC_Debug::init();
		FCC_API::register();
	}

	/**
	 * @param array $schedules
	 * @return array
	 */
	public static function add_cron_interval( $schedules ) {
		$schedules[ self::SYNC_INTERVAL ] = array(
			'interval' => 6 * HOUR_IN_SECONDS,
			'display'  => __( 'Cada 6 horas', 'factoria-cruzcampo-core' ),
		);

		return $schedules;
	}

	/**
	 * Red de seguridad: si el plugin ya estaba activo cuando se añadió el cron
	 * (por lo que activate() no se re-ejecuta), lo programa igualmente.
	 */
	public static function maybe_schedule_sync() {
		if ( ! wp_next_scheduled( FCC_Availability_Store::SYNC_HOOK ) ) {
			wp_schedule_event( time(), self::SYNC_INTERVAL, FCC_Availability_Store::SYNC_HOOK );
		}
	}

	public static function activate() {
		require_once FCC_PLUGIN_DIR . 'includes/class-availability-store.php';

		FCC_CPT_Manager::register();
		FCC_Taxonomy_Manager::register();
		FCC_Availability_Store::maybe_create_table();
		self::maybe_schedule_sync();

		flush_rewrite_rules();
	}

	public static function deactivate() {
		wp_clear_scheduled_hook( FCC_Availability_Store::SYNC_HOOK );
		flush_rewrite_rules();
	}
}
