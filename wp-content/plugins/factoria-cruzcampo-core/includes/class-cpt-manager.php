<?php
defined( 'ABSPATH' ) || exit;

class FCC_CPT_Manager {

	public static function register() {
		self::register_experience();
	}

	private static function register_experience() {
		$labels = array(
			'name'               => _x( 'Experiencias', 'post type general name', 'factoria-cruzcampo-core' ),
			'singular_name'      => _x( 'Experiencia', 'post type singular name', 'factoria-cruzcampo-core' ),
			'menu_name'          => __( 'Experiencias', 'factoria-cruzcampo-core' ),
			'add_new_item'       => __( 'Añadir nueva experiencia', 'factoria-cruzcampo-core' ),
			'edit_item'          => __( 'Editar experiencia', 'factoria-cruzcampo-core' ),
			'not_found'          => __( 'No se encontraron experiencias', 'factoria-cruzcampo-core' ),
		);

		register_post_type( 'experience', array(
			'labels'       => $labels,
			'public'       => true,
			'has_archive'  => false,
			'rewrite'      => array( 'slug' => 'experiencia' ),
			'supports'     => array( 'title', 'editor', 'thumbnail' ),
			'menu_icon'    => 'dashicons-star-filled',
			'show_in_rest' => true,
		) );

		register_post_meta( 'experience', 'product_id', array(
			'type'         => 'string',
			'single'       => true,
			'show_in_rest' => true,
		) );
	}
}
