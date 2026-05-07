<?php
defined( 'ABSPATH' ) || exit;

/**
 * Genera los atributos HTML del wrapper del bloque.
 * Convierte wp-block-{namespace}-{name} → b-{namespace} b-{name}
 * Añade alignfull e is-layout-constrained si $is_layout_constrained=true.
 */
function bis_get_block_prop( $block, $is_layout_constrained = false, $extra_attributes = [] ) {
	$parts     = explode( '/', $block->name );
	$namespace = $parts[0];
	$name      = $parts[1];

	$props     = get_block_wrapper_attributes() ?? '';
	$prop_list = [];

	if ( ! empty( $props ) ) {
		preg_match_all( '/(\w[\w-]*)=["\']([^"\']*)["\']/', $props, $matches, PREG_SET_ORDER );
		foreach ( $matches as $match ) {
			$prop_list[ $match[1] ] = $match[2];
		}
	}

	$classes     = $prop_list['class'] ?? '';
	$new_classes = [ "b-{$namespace}", "b-{$name}" ];

	if ( $is_layout_constrained ) {
		$new_classes[] = 'alignfull';
		$new_classes[] = 'is-layout-constrained';
		$new_classes[] = 'has-global-padding';
	}



	if ( ! empty( $extra_attributes['class'] ) ) {
		$new_classes[] = $extra_attributes['class'];
	}

	$wp_class          = "wp-block-{$namespace}-{$name}";
	$bis_class         = implode( ' ', $new_classes );
	$prop_list['class'] = $classes !== ''
		? str_replace( $wp_class, $bis_class, $classes )
		: $bis_class;

	$anchor = $block->attributes['anchor'] ?? false;
	if ( $anchor ) {
		$prop_list['id'] = $anchor;
	}

	foreach ( $extra_attributes as $attr => $value ) {
		if ( $attr === 'class' ) continue;
		if ( $attr === 'style' ) {
			$prop_list['style'] = trim( ( $prop_list['style'] ?? '' ) . ' ' . $value );
			continue;
		}
		$prop_list[ $attr ] = $value;
	}

	$html = '';
	foreach ( $prop_list as $attr => $value ) {
		$html .= ' ' . $attr . '="' . esc_attr( $value ) . '"';
	}

	return trim( $html );
}

function bis_get_block_classes( $block, $is_layout_constrained = false ) {
	$parts     = explode( '/', $block->name );
	$namespace = $parts[0];
	$name      = $parts[1];

	$classes = [ "b-{$namespace}", "b-{$name}" ];

	if ( $is_layout_constrained ) {
		$classes[] = 'alignfull';
		$classes[] = 'is-layout-constrained';
	}

	return implode( ' ', $classes );
}

function bis_get_block_inline_styles( $block ) {
	$props = get_block_wrapper_attributes() ?? '';
	if ( preg_match( '/style=["\']([^"\']*)["\']/', $props, $match ) ) {
		return $match[1];
	}
	return '';
}

/**
 * Pinta el elemento media (imagen o vídeo) de un MediaPicker con soporte a vídeo.
 * $media: array con mediaType, imageId, videoUrl, posterId.
 * $class: clase CSS aplicada al elemento resultante.
 */
function bis_paint_media( $media, $class = '' ) {
	$type      = isset( $media['mediaType'] ) ? (string) $media['mediaType'] : 'image';
	$image_id  = isset( $media['imageId'] ) ? (int) $media['imageId'] : 0;
	$video_url = isset( $media['videoUrl'] ) ? trim( (string) $media['videoUrl'] ) : '';
	$poster_id = isset( $media['posterId'] ) ? (int) $media['posterId'] : 0;

	if ( $type === 'video' && $video_url ) {
		$poster_url = $poster_id ? wp_get_attachment_image_url( $poster_id, 'full' ) : '';
		?>
		<div class="c-media <?php echo esc_attr( $class ); ?>">
		<video
			class="c-media__item c-media__item--video"
			src="<?php echo esc_url( $video_url ); ?>"
			<?php if ( $poster_url ) : ?>poster="<?php echo esc_url( $poster_url ); ?>"<?php endif; ?>
			autoplay
			muted
			loop
			playsinline
		></video>
		</div>
		<?php
		return;
	}

	if ( $image_id ) {
		?>
		<div class="c-media <?php echo esc_attr( $class ); ?>">
		<?php echo wp_get_attachment_image( $image_id, 'full', false, [ 'class' => 'c-media__item', 'loading' => 'lazy' ] ); ?>
		</div>
		<?php
	}
}

function bis_get_link_attributes( $link ) {
	if ( empty( $link['url'] ) ) {
		return [];
	}

	$attrs = [
		'href'  => esc_url( $link['url'] ),
		'title' => ! empty( $link['title'] ) ? esc_attr( $link['title'] ) : false,
	];

	if ( ! empty( $link['target'] ) && $link['target'] === '_blank' ) {
		$attrs['target'] = '_blank';
		$attrs['rel']    = 'noopener noreferrer';
	}

	return array_filter( $attrs );
}
