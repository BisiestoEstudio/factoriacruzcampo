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
		add_action( 'admin_enqueue_scripts', array( __CLASS__, 'enqueue_script' ) );
		add_action( 'save_post_experience', array( __CLASS__, 'save' ), 10, 2 );
	}

	public static function add_columns( $columns ) {
		$columns['active_in_calendar']     = __( 'Activar en el calendario', 'factoria-cruzcampo-core' );
		$columns['booking_engine_disabled'] = __( 'Desactivar en motor de reservas', 'factoria-cruzcampo-core' );

		return $columns;
	}

	public static function render_column( $column, $post_id ) {
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

		if ( 'active_in_calendar' === $column ) {
			wp_nonce_field( 'fcc_quick_edit_save', 'fcc_quick_edit_nonce' );
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

	public static function enqueue_script( $hook ) {
		if ( 'edit.php' !== $hook ) {
			return;
		}

		$screen = get_current_screen();

		if ( ! $screen || 'experience' !== $screen->post_type ) {
			return;
		}

		wp_enqueue_script(
			'fcc-quick-edit',
			FCC_PLUGIN_URL . 'assets/js/quick-edit.js',
			array( 'jquery', 'inline-edit-post' ),
			FCC_VERSION,
			true
		);
	}

	public static function save( $post_id, $post ) {
		if ( ! isset( $_POST['fcc_quick_edit_nonce'] ) || ! wp_verify_nonce( $_POST['fcc_quick_edit_nonce'], 'fcc_quick_edit_save' ) ) {
			return;
		}

		if ( ! current_user_can( 'edit_post', $post_id ) ) {
			return;
		}

		update_post_meta( $post_id, 'active_in_calendar', isset( $_POST['fcc_active_in_calendar'] ) ? 1 : 0 );
		update_post_meta( $post_id, 'booking_engine_disabled', isset( $_POST['fcc_booking_engine_disabled'] ) ? 1 : 0 );
	}
}
