<?php
defined( 'ABSPATH' ) || exit;

/**
 * Campo de color por término de experience_category, usado para pintar
 * el chip de categoría en el bloque de agenda.
 */
class FCC_Taxonomy_Meta {

	const TAXONOMY = 'experience_category';
	const META_KEY = 'color';

	public static function register() {
		register_term_meta( self::TAXONOMY, self::META_KEY, array(
			'type'              => 'string',
			'single'            => true,
			'show_in_rest'      => true,
			'sanitize_callback' => 'sanitize_hex_color',
			'default'           => '',
		) );

		add_action( self::TAXONOMY . '_add_form_fields', array( __CLASS__, 'render_add_field' ) );
		add_action( self::TAXONOMY . '_edit_form_fields', array( __CLASS__, 'render_edit_field' ) );
		add_action( 'created_' . self::TAXONOMY, array( __CLASS__, 'save_field' ) );
		add_action( 'edited_' . self::TAXONOMY, array( __CLASS__, 'save_field' ) );
	}

	public static function render_add_field() {
		?>
		<div class="form-field term-color-wrap">
			<label for="term-color"><?php esc_html_e( 'Color', 'factoria-cruzcampo-core' ); ?></label>
			<input type="color" name="term_color" id="term-color" value="#d71920" />
			<p><?php esc_html_e( 'Color del chip de esta categoría en la agenda de experiencias.', 'factoria-cruzcampo-core' ); ?></p>
		</div>
		<?php
	}

	public static function render_edit_field( $term ) {
		$color = get_term_meta( $term->term_id, self::META_KEY, true );
		$color = $color ? $color : '#d71920';
		?>
		<tr class="form-field term-color-wrap">
			<th scope="row"><label for="term-color"><?php esc_html_e( 'Color', 'factoria-cruzcampo-core' ); ?></label></th>
			<td>
				<input type="color" name="term_color" id="term-color" value="<?php echo esc_attr( $color ); ?>" />
				<p class="description"><?php esc_html_e( 'Color del chip de esta categoría en la agenda de experiencias.', 'factoria-cruzcampo-core' ); ?></p>
			</td>
		</tr>
		<?php
	}

	public static function save_field( $term_id ) {
		if ( ! isset( $_POST['term_color'] ) ) {
			return;
		}

		$color = sanitize_hex_color( wp_unslash( $_POST['term_color'] ) );

		if ( $color ) {
			update_term_meta( $term_id, self::META_KEY, $color );
		} else {
			delete_term_meta( $term_id, self::META_KEY );
		}
	}
}
