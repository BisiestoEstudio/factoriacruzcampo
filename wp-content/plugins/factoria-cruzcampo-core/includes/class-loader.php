<?php
defined( 'ABSPATH' ) || exit;

class FCC_Loader {

	public static function init() {
		require_once FCC_PLUGIN_DIR . 'includes/class-cpt-manager.php';
		require_once FCC_PLUGIN_DIR . 'includes/class-meta-boxes.php';
		require_once FCC_PLUGIN_DIR . 'includes/class-covermanager.php';
		require_once FCC_PLUGIN_DIR . 'includes/class-debug.php';

		add_action( 'init', array( 'FCC_CPT_Manager', 'register' ) );
		add_action( 'init', array( 'FCC_Meta_Boxes', 'register' ) );
		FCC_Debug::init();
	}

	public static function activate() {
		FCC_CPT_Manager::register();
		flush_rewrite_rules();
	}

	public static function deactivate() {
		flush_rewrite_rules();
	}
}
