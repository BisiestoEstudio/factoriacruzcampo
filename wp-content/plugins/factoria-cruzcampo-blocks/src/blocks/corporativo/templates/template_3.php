<?php
defined( 'ABSPATH' ) || exit;

/** @var array $attributes */
/** @var WP_Block|null $block */

$media  = isset( $attributes['media'] ) && is_array( $attributes['media'] ) ? $attributes['media'] : array();
$anchor = isset( $attributes['anchor'] ) ? trim( (string) $attributes['anchor'] ) : '';
?>

<div class="b-bisiesto b-corporativo-3 alignfull"<?php if ( $anchor ) : ?> id="<?php echo esc_attr( $anchor ); ?>"<?php endif; ?>>
	<div class="b-corporativo-3__media">
		<?php bis_paint_media( $media ); ?>
	</div>
	<canvas class="b-corporativo-3__mask" aria-hidden="true"></canvas>
	<script>
	(function() {
		const canvas = document.currentScript.previousElementSibling;
		const ctx    = canvas.getContext( '2d' );
		const red    = getComputedStyle( document.documentElement ).getPropertyValue( '--red' ).trim() || '#d71920';

		function getLayoutMargin() {
			const el = document.createElement( 'div' );
			el.style.cssText = 'position:absolute;visibility:hidden;width:var(--layout-margin)';
			document.body.appendChild( el );
			const value = parseFloat( getComputedStyle( el ).width ) || 0;
			el.remove();
			return value;
		}

		function draw() {
			const dpr       = window.devicePixelRatio || 1;
			const cssWidth  = canvas.offsetWidth;
			const cssHeight = canvas.offsetHeight;

			if ( ! cssWidth || ! cssHeight ) return;

			canvas.width  = cssWidth * dpr;
			canvas.height = cssHeight * dpr;
			ctx.scale( dpr, dpr );

			ctx.fillStyle = red;
			ctx.fillRect( 0, 0, cssWidth, cssHeight );

			// Calcular fontSize para que el texto ocupe cssWidth - 2 * --layout-margin
			const margin     = getLayoutMargin();
			const availWidth = cssWidth - 2 * margin;
			ctx.font = '100px Gobold, sans-serif';
			const fontSize = Math.floor( 100 * availWidth / ctx.measureText( 'FACTORÍA' ).width );

			ctx.globalCompositeOperation = 'destination-out';
			ctx.font         = `${ fontSize }px Gobold, sans-serif`;
			ctx.textAlign    = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillStyle    = '#000';
			ctx.fillText( 'FACTORÍA', cssWidth / 2, cssHeight / 2 );
		}

		document.fonts.ready.then( () => {
			draw();
			new ResizeObserver( draw ).observe( canvas );
		} );
	})();
	</script>
</div>
