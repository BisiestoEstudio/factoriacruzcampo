<?php
namespace FCB_Blocks;
defined( 'ABSPATH' ) || exit;

class Blocks {
	function __construct() {
		add_action( 'init', array( $this, 'register_blocks' ) );
		add_action( 'block_categories_all', array( $this, 'register_category' ), 10, 1 );
	}

	function register_category( $categories ) {
		return array_merge(
			array(
				array(
					'slug'  => 'bisiesto',
					'title' => 'Proyecto',
					'icon'  => null,
				),
			),
			$categories
		);
	}

	function register_blocks() {
		if ( function_exists( 'wp_register_block_types_from_metadata_collection' ) ) {
			wp_register_block_types_from_metadata_collection(
				plugin_dir_path( __FILE__ ) . '../build/blocks',
				plugin_dir_path( __FILE__ ) . '../build/blocks-manifest.php'
			);
			return;
		}

		// Fallback para WP < 6.7
		$manifest_path = plugin_dir_path( __FILE__ ) . '../build/blocks-manifest.php';
		if ( ! file_exists( $manifest_path ) ) {
			return;
		}
		$manifest = require $manifest_path;
		foreach ( array_keys( $manifest ) as $block_type ) {
			register_block_type( plugin_dir_path( __FILE__ ) . "../build/blocks/{$block_type}" );
		}
	}
}

new Blocks();
