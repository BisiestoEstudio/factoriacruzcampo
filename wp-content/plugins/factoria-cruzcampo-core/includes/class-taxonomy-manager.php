<?php
defined( 'ABSPATH' ) || exit;

class FCC_Taxonomy_Manager {

	public static function register() {
		self::register_clasification();
	}

	private static function register_clasification() {
		$labels = array(
			'name'          => _x( 'Clasificaciones', 'taxonomy general name', 'factoria-cruzcampo-core' ),
			'singular_name' => _x( 'Clasificación', 'taxonomy singular name', 'factoria-cruzcampo-core' ),
			'menu_name'     => __( 'Clasificaciones', 'factoria-cruzcampo-core' ),
			'all_items'     => __( 'Todas las clasificaciones', 'factoria-cruzcampo-core' ),
			'edit_item'     => __( 'Editar clasificación', 'factoria-cruzcampo-core' ),
			'add_new_item'  => __( 'Añadir nueva clasificación', 'factoria-cruzcampo-core' ),
			'not_found'     => __( 'No se encontraron clasificaciones', 'factoria-cruzcampo-core' ),
		);

		register_taxonomy( 'clasification', 'experience', array(
			'labels'       => $labels,
			'public'       => true,
			'show_in_rest' => true,
			'hierarchical' => true,
			'rewrite'      => false,
			'query_var'    => false,
		) );
	}
}
