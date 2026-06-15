<?php
defined( 'ABSPATH' ) || exit;

class FCB_Editor_Plugins {

	function __construct() {
		add_action( 'init',                        [ $this, 'register_meta' ] );
		add_action( 'enqueue_block_editor_assets', [ $this, 'enqueue_editor_script' ] );
		add_filter( 'body_class',                  [ $this, 'body_class' ] );
	}

	function register_meta() {
		foreach ( [ 'page', 'post', 'experience' ] as $type ) {
			register_post_meta( $type, '_header_color_white', [
				'type'          => 'boolean',
				'default'       => false,
				'single'        => true,
				'show_in_rest'  => true,
				'auth_callback' => function() {
					return current_user_can( 'edit_posts' );
				},
			] );
		}
	}

	function enqueue_editor_script() {
		$asset_file = FCB_PLUGIN_DIR . 'build/index.asset.php';
		if ( ! file_exists( $asset_file ) ) {
			return;
		}
		$asset = require $asset_file;
		wp_enqueue_script(
			'fcb-editor-plugins',
			FCB_PLUGIN_URL . 'build/index.js',
			$asset['dependencies'],
			$asset['version'],
			true
		);
	}

	function body_class( $classes ) {
		if ( is_singular( [ 'page', 'post', 'experience' ] ) ) {
			if ( get_post_meta( get_the_ID(), '_header_color_white', true ) ) {
				$classes[] = 'has-header-white';
			}
		}
		return $classes;
	}
}

new FCB_Editor_Plugins();
