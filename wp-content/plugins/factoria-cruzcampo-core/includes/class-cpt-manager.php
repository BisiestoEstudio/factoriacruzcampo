<?php
defined( 'ABSPATH' ) || exit;

class FCC_CPT_Manager {

	public static function register() {
		self::register_experience();
	}

	private static function register_experience() {
		$labels = array(
			'name'                     => _x( 'Experiencias', 'post type general name', 'factoria-cruzcampo-core' ),
			'singular_name'            => _x( 'Experiencia', 'post type singular name', 'factoria-cruzcampo-core' ),
			'menu_name'                => __( 'Experiencias', 'factoria-cruzcampo-core' ),
			'add_new_item'             => __( 'Añadir nueva experiencia', 'factoria-cruzcampo-core' ),
			'edit_item'                => __( 'Editar experiencia', 'factoria-cruzcampo-core' ),
			'not_found'                => __( 'No se encontraron experiencias', 'factoria-cruzcampo-core' ),
			'item_link'                => _x( 'Enlace a experiencia', 'navigation link block title', 'factoria-cruzcampo-core' ),
			'item_link_description'    => _x( 'Un enlace a una experiencia', 'navigation link block description', 'factoria-cruzcampo-core' ),
		);

		register_post_type( 'experience', array(
			'labels'              => $labels,
			'public'              => true,
			'has_archive'         => false,
			'rewrite'             => array( 'slug' => 'experiencia' ),
			'supports'            => array( 'title', 'editor', 'thumbnail', 'excerpt', 'custom-fields' ),
			'menu_icon'           => 'dashicons-star-filled',
			'show_in_rest'        => true,
			'show_in_nav_menus'   => true,
		) );

		register_post_meta( 'experience', 'product_id', array(
			'type'         => 'string',
			'single'       => true,
			'show_in_rest' => true,
		) );

		register_post_meta( 'experience', 'precio', array(
			'type'         => 'number',
			'single'       => true,
			'show_in_rest' => true,
		) );

		register_post_meta( 'experience', 'dias', array(
			'type'         => 'string',
			'single'       => true,
			'show_in_rest' => true,
		) );

		register_post_meta( 'experience', 'duracion', array(
			'type'         => 'string',
			'single'       => true,
			'show_in_rest' => true,
		) );

		register_post_meta( 'experience', 'active_in_calendar', array(
			'type'         => 'boolean',
			'single'       => true,
			'show_in_rest' => true,
			'default'      => false,
		) );

		register_post_meta( 'experience', 'booking_engine_disabled', array(
			'type'         => 'boolean',
			'single'       => true,
			'show_in_rest' => true,
			'default'      => false,
		) );
	}

	/**
	 * Experiencias publicadas cuyo product_id está en la lista dada, indexadas por product_id.
	 * Si $only_active_in_calendar es true, solo cuentan las marcadas para aparecer en el
	 * calendario/agenda general (no aplica cuando ya se pide una experiencia concreta).
	 *
	 * @param int[] $product_ids
	 * @param bool  $only_active_in_calendar
	 * @return WP_Post[] Indexado por product_id.
	 */
	public static function get_experiences_by_product_ids( array $product_ids, $only_active_in_calendar = true ) {
		if ( empty( $product_ids ) ) {
			return array();
		}

		$meta_query = array(
			array(
				'key'     => 'product_id',
				'value'   => $product_ids,
				'compare' => 'IN',
			),
		);

		if ( $only_active_in_calendar ) {
			$meta_query[] = array(
				'key'   => 'active_in_calendar',
				'value' => '1',
			);
		}

		$posts = get_posts( array(
			'post_type'      => 'experience',
			'post_status'    => 'publish',
			'posts_per_page' => -1,
			'no_found_rows'  => true,
			'meta_query'     => $meta_query,
		) );

		$by_product = array();

		foreach ( $posts as $post ) {
			$product_id = (int) get_post_meta( $post->ID, 'product_id', true );

			if ( $product_id ) {
				$by_product[ $product_id ] = $post;
			}
		}

		return $by_product;
	}
}
