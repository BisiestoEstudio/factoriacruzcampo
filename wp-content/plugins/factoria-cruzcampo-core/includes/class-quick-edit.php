<?php
defined( 'ABSPATH' ) || exit;

/**
 * Columnas y campos de Quick Edit para "active_in_calendar" y
 * "booking_engine_disabled" en el listado de experiencias.
 */
class FCC_Quick_Edit {

	public static function register() {
		add_filter( 'manage_experience_posts_columns', array( __CLASS__, 'add_columns' ) );
		add_action( 'manage_experience_posts_custom_column', array( __CLASS__, 'render_column' ), 10, 2 );
		add_action( 'quick_edit_custom_box', array( __CLASS__, 'render_quick_edit_field' ), 10, 2 );
		add_action( 'bulk_edit_custom_box', array( __CLASS__, 'render_bulk_edit_field' ), 10, 2 );
		add_action( 'admin_enqueue_scripts', array( __CLASS__, 'enqueue_script' ) );
		add_action( 'save_post_experience', array( __CLASS__, 'save' ), 10, 2 );
	}

	public static function add_columns( $columns ) {
		$columns['product_id']              = __( 'Product ID', 'factoria-cruzcampo-core' );
		$columns['active_in_calendar']      = __( 'Activar en el calendario', 'factoria-cruzcampo-core' );
		$columns['booking_engine_disabled'] = __( 'Desactivar en motor de reservas', 'factoria-cruzcampo-core' );

		return $columns;
	}

	public static function render_column( $column, $post_id ) {
		if ( 'product_id' === $column ) {
			$value = get_post_meta( $post_id, 'product_id', true );

			printf(
				'<span class="fcc-quick-edit-value" data-field="product_id" data-value="%1$s">%2$s</span>',
				esc_attr( $value ),
				esc_html( $value )
			);

			return;
		}

		if ( 'active_in_calendar' !== $column && 'booking_engine_disabled' !== $column ) {
			return;
		}

		$value = (bool) get_post_meta( $post_id, $column, true );

		printf(
			'<span class="fcc-quick-edit-value" data-field="%1$s" data-value="%2$s">%3$s</span>',
			esc_attr( $column ),
			esc_attr( $value ? '1' : '0' ),
			$value ? esc_html__( 'Sí', 'factoria-cruzcampo-core' ) : esc_html__( 'No', 'factoria-cruzcampo-core' )
		);
	}

	public static function render_quick_edit_field( $column, $post_type ) {
		if ( 'experience' !== $post_type ) {
			return;
		}

		if ( 'product_id' === $column ) {
			wp_nonce_field( 'fcc_quick_edit_save', 'fcc_quick_edit_nonce' );
			?>
			<fieldset class="inline-edit-col-right">
				<div class="inline-edit-col">
					<label class="alignleft">
						<span class="title"><?php esc_html_e( 'Product ID', 'factoria-cruzcampo-core' ); ?></span>
						<span class="input-text-wrap">
							<input type="text" name="fcc_product_id" class="fcc-product-id" value="" />
						</span>
					</label>
				</div>
			</fieldset>
			<?php
		}

		if ( 'active_in_calendar' === $column ) {
			?>
			<fieldset class="inline-edit-col-right">
				<div class="inline-edit-col">
					<label class="alignleft">
						<input type="checkbox" name="fcc_active_in_calendar" value="1" />
						<span class="checkbox-title"><?php esc_html_e( 'Activar en el calendario', 'factoria-cruzcampo-core' ); ?></span>
					</label>
				</div>
			</fieldset>
			<?php
		}

		if ( 'booking_engine_disabled' === $column ) {
			?>
			<fieldset class="inline-edit-col-right">
				<div class="inline-edit-col">
					<label class="alignleft">
						<input type="checkbox" name="fcc_booking_engine_disabled" value="1" />
						<span class="checkbox-title"><?php esc_html_e( 'Desactivar en motor de reservas', 'factoria-cruzcampo-core' ); ?></span>
					</label>
				</div>
			</fieldset>
			<?php
		}
	}

	public static function render_bulk_edit_field( $column, $post_type ) {
		if ( 'experience' !== $post_type ) {
			return;
		}

		if ( 'active_in_calendar' === $column ) {
			wp_nonce_field( 'fcc_bulk_edit_save', 'fcc_bulk_edit_nonce' );
			?>
			<fieldset class="inline-edit-col-right">
				<div class="inline-edit-col">
					<label class="alignleft">
						<span class="title"><?php esc_html_e( 'Activar en el calendario', 'factoria-cruzcampo-core' ); ?></span>
						<select name="fcc_bulk_active_in_calendar">
							<option value="-1"><?php esc_html_e( '— Sin cambios —', 'factoria-cruzcampo-core' ); ?></option>
							<option value="1"><?php esc_html_e( 'Sí', 'factoria-cruzcampo-core' ); ?></option>
							<option value="0"><?php esc_html_e( 'No', 'factoria-cruzcampo-core' ); ?></option>
						</select>
					</label>
				</div>
			</fieldset>
			<?php
		}

		if ( 'booking_engine_disabled' === $column ) {
			?>
			<fieldset class="inline-edit-col-right">
				<div class="inline-edit-col">
					<label class="alignleft">
						<span class="title"><?php esc_html_e( 'Desactivar en motor de reservas', 'factoria-cruzcampo-core' ); ?></span>
						<select name="fcc_bulk_booking_engine_disabled">
							<option value="-1"><?php esc_html_e( '— Sin cambios —', 'factoria-cruzcampo-core' ); ?></option>
							<option value="1"><?php esc_html_e( 'Sí', 'factoria-cruzcampo-core' ); ?></option>
							<option value="0"><?php esc_html_e( 'No', 'factoria-cruzcampo-core' ); ?></option>
						</select>
					</label>
				</div>
			</fieldset>
			<?php
		}
	}

	public static function enqueue_script( $hook ) {
		if ( 'edit.php' !== $hook ) {
			return;
		}

		$screen = get_current_screen();

		if ( ! $screen || 'experience' !== $screen->post_type ) {
			return;
		}

		$script_path = FCC_PLUGIN_DIR . 'assets/js/quick-edit.js';

		wp_enqueue_script(
			'fcc-quick-edit',
			FCC_PLUGIN_URL . 'assets/js/quick-edit.js',
			array( 'jquery', 'inline-edit-post' ),
			file_exists( $script_path ) ? filemtime( $script_path ) : FCC_VERSION,
			true
		);
	}

	public static function save( $post_id, $post ) {
		// Quick Edit guarda por AJAX (POST), pero el listado de edit.php usa
		// method="get", así que el submit de Bulk Edit llega por $_GET.
		// $_REQUEST cubre ambos casos.
		if ( isset( $_REQUEST['fcc_quick_edit_nonce'] ) && wp_verify_nonce( $_REQUEST['fcc_quick_edit_nonce'], 'fcc_quick_edit_save' ) ) {
			if ( ! current_user_can( 'edit_post', $post_id ) ) {
				return;
			}

			update_post_meta( $post_id, 'active_in_calendar', isset( $_REQUEST['fcc_active_in_calendar'] ) ? 1 : 0 );
			update_post_meta( $post_id, 'booking_engine_disabled', isset( $_REQUEST['fcc_booking_engine_disabled'] ) ? 1 : 0 );

			if ( isset( $_REQUEST['fcc_product_id'] ) ) {
				update_post_meta( $post_id, 'product_id', sanitize_text_field( wp_unslash( $_REQUEST['fcc_product_id'] ) ) );
			}

			return;
		}

		if ( isset( $_REQUEST['fcc_bulk_edit_nonce'] ) && wp_verify_nonce( $_REQUEST['fcc_bulk_edit_nonce'], 'fcc_bulk_edit_save' ) ) {
			if ( ! current_user_can( 'edit_post', $post_id ) ) {
				return;
			}

			if ( isset( $_REQUEST['fcc_bulk_active_in_calendar'] ) && '-1' !== $_REQUEST['fcc_bulk_active_in_calendar'] ) {
				update_post_meta( $post_id, 'active_in_calendar', '1' === $_REQUEST['fcc_bulk_active_in_calendar'] ? 1 : 0 );
			}

			if ( isset( $_REQUEST['fcc_bulk_booking_engine_disabled'] ) && '-1' !== $_REQUEST['fcc_bulk_booking_engine_disabled'] ) {
				update_post_meta( $post_id, 'booking_engine_disabled', '1' === $_REQUEST['fcc_bulk_booking_engine_disabled'] ? 1 : 0 );
			}
		}
	}
}
