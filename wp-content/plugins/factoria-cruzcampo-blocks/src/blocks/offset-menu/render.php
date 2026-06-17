<?php
defined( 'ABSPATH' ) || exit;

/** @var array    $attributes */
/** @var string   $content */
/** @var WP_Block $block */

$logo = $attributes['logoId'] ?? 0;
?>

<header <?php echo bis_get_block_prop( $block, false, [ 'class' => 'alignfull' ] ); ?>>

	<div class="b-offset-menu__bar">
		<div class="b-offset-menu__logo">
			<?php if ( $logo ) : ?>
				<a href="<?php echo esc_url( home_url( '/' ) ); ?>" aria-label="<?php esc_attr_e( 'Ir a inicio', 'factoria-cruzcampo-blocks' ); ?>">
					<?php bis_paint_image( is_numeric( $logo ) ? intval( $logo ) : $logo, 'b-offset-menu__logo-img' ); ?>
				</a>
			<?php endif; ?>
		</div>

		<button
			class="b-offset-menu__toggle"
			aria-expanded="false"
			aria-controls="offset-menu-panel"
			aria-label="<?php esc_attr_e( 'Abrir menú', 'factoria-cruzcampo-blocks' ); ?>"
		>
			<span class="b-offset-menu__toggle-label has-base-font-size u_bold" aria-hidden="true"><?php esc_html_e( 'Menú', 'factoria-cruzcampo-blocks' ); ?></span>
			<span class="b-offset-menu__toggle-icon" aria-hidden="true">
				<span></span>
				<span></span>
			</span>
		</button>
	</div>

	<div class="b-offset-menu__panel has-red-background-color has-white-color has-background has-text-color" id="offset-menu-panel" aria-hidden="true" aria-label="<?php esc_attr_e( 'Menú principal', 'factoria-cruzcampo-blocks' ); ?>">
		<div class="b-offset-menu__panel-inner">
			<?php echo $content; ?>
		</div>
	</div>

</header>
