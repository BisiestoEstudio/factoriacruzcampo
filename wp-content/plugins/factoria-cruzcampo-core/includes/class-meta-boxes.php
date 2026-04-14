<?php
defined( 'ABSPATH' ) || exit;

class FCC_Meta_Boxes {

	public static function register() {
		add_action( 'add_meta_boxes', array( __CLASS__, 'add' ) );
		add_action( 'save_post_experience', array( __CLASS__, 'save_experience' ), 10, 2 );
	}

	public static function add() {
		add_meta_box(
			'experience_details',
			__( 'Detalles de la experiencia', 'factoria-cruzcampo-core' ),
			array( __CLASS__, 'render_experience' ),
			'experience',
			'side',
			'high'
		);
	}

	public static function render_experience( $post ) {
		$product_id = get_post_meta( $post->ID, 'product_id', true );
		wp_nonce_field( 'experience_save', 'experience_nonce' );
		?>
		<p>
			<label for="fcc_product_id"><strong><?php esc_html_e( 'Product ID', 'factoria-cruzcampo-core' ); ?> <span style="color:red;">*</span></strong></label>
			<input
				type="text"
				id="fcc_product_id"
				name="fcc_product_id"
				value="<?php echo esc_attr( $product_id ); ?>"
				style="width:100%;margin-top:4px;"
			/>
		</p>
		<?php
	}

	public static function save_experience( $post_id, $post ) {
		if ( ! isset( $_POST['experience_nonce'] ) || ! wp_verify_nonce( $_POST['experience_nonce'], 'experience_save' ) ) {
			return;
		}

		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
			return;
		}

		if ( ! current_user_can( 'edit_post', $post_id ) ) {
			return;
		}

		$product_id = isset( $_POST['fcc_product_id'] ) ? sanitize_text_field( wp_unslash( $_POST['fcc_product_id'] ) ) : '';

		if ( empty( $product_id ) ) {
			// Campo requerido: revertir a borrador si se intenta publicar sin él.
			if ( 'publish' === $post->post_status ) {
				remove_action( 'save_post_experience', array( __CLASS__, 'save_experience' ), 10 );
				wp_update_post( array(
					'ID'          => $post_id,
					'post_status' => 'draft',
				) );
				add_action( 'save_post_experience', array( __CLASS__, 'save_experience' ), 10, 2 );
			}
			return;
		}

		update_post_meta( $post_id, 'product_id', $product_id );
	}
}
