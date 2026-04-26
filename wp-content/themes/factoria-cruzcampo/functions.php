<?php
defined( 'ABSPATH' ) || exit;

add_action( 'wp_enqueue_scripts', function () {
	$uri     = get_template_directory_uri() . '/assets/css/';
	$js_uri  = get_template_directory_uri() . '/assets/js/';
	$version = wp_get_theme()->get( 'Version' );

	wp_enqueue_style( 'factoria-cruzcampo-framework', $uri . 'framework.min.css', array(), $version );
	wp_enqueue_style( 'factoria-cruzcampo-main', $uri . 'main.min.css', array( 'factoria-cruzcampo-framework' ), $version );
	wp_enqueue_style( 'factoria-cruzcampo-blocks', $uri . 'blocks.css', array( 'factoria-cruzcampo-main' ), $version );

	wp_enqueue_script( 'lenis', $js_uri . 'vendor/lenis.min.js', array(), '1.3.23', true );
	wp_enqueue_script( 'factoria-cruzcampo-main', $js_uri . 'main.js', array( 'lenis' ), $version, true );
} );

add_action( 'after_setup_theme', function () {
	add_editor_style( 'assets/css/framework.min.css' );
	add_editor_style( 'assets/css/blocks.css' );
	add_editor_style( 'assets/css/editor.min.css' );
} );

add_action( 'enqueue_block_editor_assets', function () {
	$uri     = get_template_directory_uri() . '/assets/css/';
	$version = wp_get_theme()->get( 'Version' );

	wp_enqueue_style( 'factoria-cruzcampo-framework', $uri . 'framework.min.css', array(), $version );
	wp_enqueue_style( 'factoria-cruzcampo-blocks', $uri . 'blocks.css', array( 'factoria-cruzcampo-framework' ), $version );
	wp_enqueue_style( 'factoria-cruzcampo-editor', $uri . 'editor.min.css', array( 'factoria-cruzcampo-blocks' ), $version );

	wp_enqueue_script(
		'factoria-cruzcampo-custom-block',
		get_template_directory_uri() . '/assets/js/custom-block.js',
		array( 'wp-blocks', 'wp-dom-ready' ),
		$version,
		true
	);
} );
