<?php
defined( 'ABSPATH' ) || exit;

/** @var array $attributes */
/** @var WP_Block|null $block */

$map_url = isset( $attributes['mapUrl'] ) ? trim( (string) $attributes['mapUrl'] ) : '';

// Best-effort allowlist: only render if it's a Google Maps URL.
$is_google_embed = false;
if ( $map_url ) {
	$parts = wp_parse_url( $map_url );
	$scheme = strtolower( (string) ( $parts['scheme'] ?? '' ) );
	$host  = $parts['host'] ?? '';
	$path  = $parts['path'] ?? '';

	// Common valid hosts:
	// - www.google.com, maps.google.com, www.google.es, etc.
	$is_google_host = (bool) preg_match( '/(^|\.)google\.[a-z.]+$/i', $host );
	$is_maps_path   = ( substr( $path, 0, 5 ) === '/maps' );
	$is_google_embed = ( $scheme === 'https' || $scheme === 'http' ) && $is_google_host && $is_maps_path;
}


?>

<section <?php echo bis_get_block_prop( $block, true, array( 'class' => 'has-background-color has-red-background-color has-white-color' ) ); ?>>
	<div class="b-maps__grid alignwide">
		<div class="b-maps__content-wrapper">
		<div class="b-maps__content is-prose">
				<?php echo $content; ?>
			</div>
			<img
				class="b-maps__arrow"
				src="<?php echo FCB_PLUGIN_URL . 'assets/images/maps-arrow.svg'; ?>"
				width="99"
				height="127"
				alt=""
				aria-hidden="true"
			/>
		</div>
		<div class="b-maps__map">
			<?php if ( $map_url && $is_google_embed ) : ?>
				<iframe
					class="b-maps__iframe"
					src="<?php echo esc_url( $map_url ); ?>"
					loading="lazy"
					referrerpolicy="no-referrer-when-downgrade"
					allowfullscreen
					title="<?php echo esc_attr__( 'Mapa', 'factoria-cruzcampo-blocks' ); ?>"
				></iframe>
			<?php endif; ?>

		</div>
	</div>
</section>

