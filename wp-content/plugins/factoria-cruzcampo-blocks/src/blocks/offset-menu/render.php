<?php
defined( 'ABSPATH' ) || exit;

/** @var array    $attributes */
/** @var WP_Block $block */

$logo_id     = (int) ( $attributes['logoId'] ?? 0 );
$menu_id     = (int) ( $attributes['menuId'] ?? 0 );
$cta_buttons = $attributes['ctaButtons'] ?? [];
?>

<header <?php echo bis_get_block_prop( $block, false, [ 'class' => 'alignfull' ] ); ?>>

	<div class="b-offset-menu__bar">
		<div class="b-offset-menu__logo">
			<?php if ( $logo_id ) : ?>
				<a href="<?php echo esc_url( home_url( '/' ) ); ?>" aria-label="<?php esc_attr_e( 'Ir a inicio', 'factoria-cruzcampo-blocks' ); ?>">
					<?php echo wp_get_attachment_image( $logo_id, 'full', false, [ 'class' => 'b-offset-menu__logo-img', 'loading' => 'eager' ] ); ?>
				</a>
			<?php endif; ?>
		</div>

		<button
			class="b-offset-menu__toggle"
			aria-expanded="false"
			aria-controls="offset-menu-panel"
			aria-label="<?php esc_attr_e( 'Abrir menú', 'factoria-cruzcampo-blocks' ); ?>"
		>
			<span class="b-offset-menu__toggle-label" aria-hidden="true"><?php esc_html_e( 'Menú', 'factoria-cruzcampo-blocks' ); ?></span>
			<span class="b-offset-menu__toggle-icon" aria-hidden="true">
				<span></span>
				<span></span>
			</span>
		</button>
	</div>

	<div class="b-offset-menu__panel" id="offset-menu-panel" aria-hidden="true" aria-label="<?php esc_attr_e( 'Menú principal', 'factoria-cruzcampo-blocks' ); ?>">
		<div class="b-offset-menu__panel-inner">

			<?php if ( $menu_id ) : ?>
				<nav class="b-offset-menu__nav" aria-label="<?php esc_attr_e( 'Navegación principal', 'factoria-cruzcampo-blocks' ); ?>">
					<?php
					wp_nav_menu( [
						'menu'        => $menu_id,
						'menu_class'  => 'b-offset-menu__menu',
						'container'   => false,
						'items_wrap'  => '<ul class="%2$s">%3$s</ul>',
						'depth'       => 1,
					] );
					?>
				</nav>
			<?php endif; ?>

			<?php if ( ! empty( $cta_buttons ) ) : ?>
				<div class="b-offset-menu__cta">
					<?php foreach ( $cta_buttons as $btn ) :
						if ( empty( $btn['label'] ) && empty( $btn['url'] ) ) continue;
						$target = ! empty( $btn['target'] ) ? $btn['target'] : '_self';
						$rel    = $target === '_blank' ? 'noopener noreferrer' : '';
					?>
						<a
							href="<?php echo esc_url( $btn['url'] ?? '#' ); ?>"
							class="b-offset-menu__cta-btn"
							target="<?php echo esc_attr( $target ); ?>"
							<?php if ( $rel ) echo 'rel="' . esc_attr( $rel ) . '"'; ?>
						>
							<span><?php echo esc_html( $btn['label'] ); ?></span>
							<span aria-hidden="true">→</span>
						</a>
					<?php endforeach; ?>
				</div>
			<?php endif; ?>

		</div>
	</div>

</header>
