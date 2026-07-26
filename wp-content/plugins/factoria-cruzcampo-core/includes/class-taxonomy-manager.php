<?php
defined( 'ABSPATH' ) || exit;

class FCC_Taxonomy_Manager {

	public static function register() {
		self::register_clasification();
	}

	private static function register_clasification() {
		$labels = array(
			'name'          => _x( 'Categorías', 'taxonomy general name', 'factoria-cruzcampo-core' ),
			'singular_name' => _x( 'Categoría', 'taxonomy singular name', 'factoria-cruzcampo-core' ),
			'menu_name'     => __( 'Categorías', 'factoria-cruzcampo-core' ),
			'all_items'     => __( 'Todas las categorías', 'factoria-cruzcampo-core' ),
			'edit_item'     => __( 'Editar categoría', 'factoria-cruzcampo-core' ),
			'add_new_item'  => __( 'Añadir nueva categoría', 'factoria-cruzcampo-core' ),
			'not_found'     => __( 'No se encontraron categorías', 'factoria-cruzcampo-core' ),
		);

		register_taxonomy( 'experience_category', 'experience', array(
			'labels'       => $labels,
			'public'       => true,
			'show_in_rest' => true,
			'hierarchical' => true,
			'rewrite'      => false,
			'query_var'    => false,
		) );
	}
}
