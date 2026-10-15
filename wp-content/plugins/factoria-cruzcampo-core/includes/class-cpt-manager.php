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

		// Horas a las que está programada la actividad (ej. ["11:00", "14:00", "20:00"]).
		// Se guarda como array plano; WP lo serializa/deserializa automáticamente en wp_postmeta.
		register_post_meta( 'experience', 'horas', array(
			'type'         => 'array',
			'single'       => true,
			'show_in_rest' => array(
				'schema' => array(
					'type'  => 'array',
					'items' => array( 'type' => 'string' ),
				),
			),
			'default'      => array(),
		) );
	}

	/**
	 * Experiencias publicadas cuyo product_id está en la lista dada, indexadas por product_id.
	 * Si $only_active_in_calendar es true, solo cuentan las marcadas para aparecer en el
	 * calendario/agenda general. Uso: bloque `agenda` (agregador general), donde
	 * active_in_calendar es precisamente el interruptor pensado para eso.
	 *
	 * @param int[] $product_ids
	 * @param bool  $only_active_in_calendar
	 * @return WP_Post[] Indexado por product_id.
	 */
	public static function get_experiences_by_product_ids( array $product_ids, $only_active_in_calendar = true ) {
		$extra_meta_query = $only_active_in_calendar
			? array( array( 'key' => 'active_in_calendar', 'value' => '1' ) )
			: array();

		return self::query_experiences_by_product_ids( $product_ids, $extra_meta_query );
	}

	/**
	 * Experiencias publicadas cuyo product_id está en la lista dada y que no tienen
	 * el motor de reservas desactivado, indexadas por product_id. A diferencia de
	 * get_experiences_by_product_ids(), NO filtra por active_in_calendar: ese meta
	 * solo controla si aparece en el calendario/agenda general, no si es reservable.
	 * Uso: bloque `calendario-reserva`, tanto en su modo general como dentro de una
	 * experiencia concreta — si esa experiencia tiene el motor desactivado, no debe
	 * poder reservarse ni siquiera desde su propia página.
	 *
	 * @param int[] $product_ids
	 * @return WP_Post[] Indexado por product_id.
	 */
	public static function get_bookable_experiences_by_product_ids( array $product_ids ) {
		// Sin fila de meta todavía = por defecto no desactivado (register_post_meta default: false).
		$extra_meta_query = array(
			array(
				'relation' => 'OR',
				array( 'key' => 'booking_engine_disabled', 'compare' => 'NOT EXISTS' ),
				array( 'key' => 'booking_engine_disabled', 'value' => '1', 'compare' => '!=' ),
			),
		);

		return self::query_experiences_by_product_ids( $product_ids, $extra_meta_query );
	}

	/**
	 * Consulta compartida: experiencias publicadas cuyo product_id está en la lista
	 * dada, con condiciones extra de meta_query, indexadas por product_id.
	 *
	 * @param int[]   $product_ids
	 * @param array[] $extra_meta_query Condiciones adicionales de meta_query.
	 * @return WP_Post[] Indexado por product_id.
	 */
	private static function query_experiences_by_product_ids( array $product_ids, array $extra_meta_query ) {
		if ( empty( $product_ids ) ) {
			return array();
		}

		$meta_query = array_merge(
			array(
				array(
					'key'     => 'product_id',
					'value'   => $product_ids,
					'compare' => 'IN',
				),
			),
			$extra_meta_query
		);

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
