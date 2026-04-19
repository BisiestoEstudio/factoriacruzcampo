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
