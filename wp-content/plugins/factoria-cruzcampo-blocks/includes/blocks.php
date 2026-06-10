<?php
namespace FCB_Blocks;
defined( 'ABSPATH' ) || exit;

class Blocks {
	function __construct() {
		add_action( 'init', array( $this, 'register_blocks' ) );
		add_action( 'init', array( $this, 'register_patterns' ) );
		add_action( 'block_categories_all', array( $this, 'register_category' ), 10, 1 );
		add_action( 'wp_enqueue_scripts', array( $this, 'register_swiper' ) );
		add_action( 'enqueue_block_editor_assets', array( $this, 'register_editor_scripts' ) );
	}

	function register_editor_scripts() {
		$asset_file = FCB_PLUGIN_DIR . 'build/index.asset.php';
		if ( ! file_exists( $asset_file ) ) {
			return;
		}
		$asset = include $asset_file;
		wp_enqueue_script(
			'fcb-editor-scripts',
			FCB_PLUGIN_URL . 'build/index.js',
			$asset['dependencies'],
			$asset['version']
		);
	}

	function register_swiper() {
		wp_register_script(
			'fcb-swiper',
			FCB_PLUGIN_URL . 'assets/js/swiper-bundle.min.js',
			[],
			FCB_VERSION,
			true
		);
		wp_register_style(
			'fcb-swiper',
			FCB_PLUGIN_URL . 'assets/css/swiper-bundle.min.css',
			[],
			FCB_VERSION
		);
	}

	function register_category( $categories ) {
		return array_merge(
			array(
				array(
					'slug'  => 'bisiesto',
					'title' => 'Factoría Cruzcampo',
					'icon'  => null,
				),
			),
			$categories
		);
	}

	function register_patterns() {
		register_block_pattern_category( 'cruzcampo', array(
			'label' => __( 'Factoría Cruzcampo', 'factoria-cruzcampo-blocks' ),
		) );

		$patterns_dir = FCB_PLUGIN_DIR . 'patterns/';
		if ( ! is_dir( $patterns_dir ) ) {
			return;
		}

		foreach ( glob( $patterns_dir . '*.php' ) as $file ) {
			$headers = get_file_data( $file, array(
				'title'       => 'Title',
				'slug'        => 'Slug',
				'categories'  => 'Categories',
				'blockTypes'  => 'Block Types',
				'description' => 'Description',
			) );

			if ( empty( $headers['title'] ) || empty( $headers['slug'] ) ) {
				continue;
			}

			ob_start();
			include $file;
			$content = trim( ob_get_clean() );

			$args = array( 'title' => $headers['title'], 'content' => $content );

			if ( ! empty( $headers['categories'] ) ) {
				$args['categories'] = array_map( 'trim', explode( ',', $headers['categories'] ) );
			}
			if ( ! empty( $headers['blockTypes'] ) ) {
				$args['blockTypes'] = array_map( 'trim', explode( ',', $headers['blockTypes'] ) );
			}
			if ( ! empty( $headers['description'] ) ) {
				$args['description'] = $headers['description'];
			}

			register_block_pattern( $headers['slug'], $args );
		}
	}

	function register_blocks() {
		$build_blocks  = plugin_dir_path( __FILE__ ) . '../build/blocks';
		$manifest_path = plugin_dir_path( __FILE__ ) . '../build/blocks-manifest.php';

		if ( function_exists( 'wp_register_block_types_from_metadata_collection' ) && file_exists( $manifest_path ) ) {
			wp_register_block_types_from_metadata_collection( $build_blocks, $manifest_path );
			return;
		}

		// Fallback: scan build/blocks/*/block.json
		if ( ! is_dir( $build_blocks ) ) {
			return;
		}
		foreach ( glob( $build_blocks . '/*/block.json' ) as $block_json ) {
			register_block_type( dirname( $block_json ) );
		}
	}
}

new Blocks();
