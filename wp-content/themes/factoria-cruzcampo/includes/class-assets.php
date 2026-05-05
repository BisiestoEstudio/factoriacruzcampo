<?php
/**
 * This class is responsible for enqueuing the theme's assets.
 */

defined( 'ABSPATH' ) || exit;

class Bisiestheme_Assets {

    public static function init() {
        add_action( 'wp_enqueue_scripts', array( __CLASS__, 'enqueue_scripts' ) );
        add_action( 'after_setup_theme', array( __CLASS__, 'enqueue_editor_styles' ) );
        add_action( 'enqueue_block_editor_assets', array( __CLASS__, 'enqueue_editor_assets' ) );
    }

	public static function enqueue_scripts() {
		// CSS
		wp_enqueue_style( 'bisiestheme-framework', BISIESTHEME_URI . '/assets/css/framework.min.css', array(), BISIESTHEME_VERSION );
		wp_enqueue_style( 'bisiestheme-main', BISIESTHEME_URI . '/assets/css/main.min.css', array( 'bisiestheme-framework' ), BISIESTHEME_VERSION );
		wp_enqueue_style( 'bisiestheme-blocks', BISIESTHEME_URI . '/assets/css/blocks.css', array( 'bisiestheme-main' ), BISIESTHEME_VERSION );

		// JS
		wp_enqueue_script( 'lenis', BISIESTHEME_URI . '/assets/js/vendor/lenis.min.js', array(), '1.3.23', true );
		wp_enqueue_script( 'bisiestheme-main', BISIESTHEME_URI . '/assets/js/main.js', array( 'lenis' ), BISIESTHEME_VERSION, true );
	}

	public static function enqueue_editor_styles() {
		add_editor_style( 'assets/css/framework.min.css' );
		add_editor_style( 'assets/css/blocks.css' );
		add_editor_style( 'assets/css/editor.min.css' );
	}

	public static function enqueue_editor_assets() {
		wp_enqueue_style( 'bisiestheme-framework', BISIESTHEME_URI . '/assets/css/framework.min.css', array(), BISIESTHEME_VERSION );
		wp_enqueue_style( 'bisiestheme-blocks', BISIESTHEME_URI . '/assets/css/blocks.css', array( 'bisiestheme-framework' ), BISIESTHEME_VERSION );
		wp_enqueue_style( 'bisiestheme-editor', BISIESTHEME_URI . '/assets/css/editor.min.css', array( 'bisiestheme-blocks' ), BISIESTHEME_VERSION );

		wp_enqueue_script(
			'bisiestheme-custom-block',
			BISIESTHEME_URI . '/assets/js/custom-block.js',
			array( 'wp-blocks', 'wp-dom-ready' ),
			BISIESTHEME_VERSION,
			true
		);
	}
}

Bisiestheme_Assets::init();