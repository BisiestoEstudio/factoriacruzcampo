<?php
/**
 * Title: Imagen Texto — imagen a la derecha
 * Slug: factoria-cruzcampo/imagen-texto-derecha
 * Categories: featured
 * Description: Sección con texto a la izquierda e imagen a la derecha.
 * Keywords: imagen, texto, sección
 */

$attrs = wp_json_encode( [
	'image'         => get_theme_file_uri( 'assets/images/patterns/placeholder.svg' ),
	'imagePosition' => 'right',
] );
?>
<!-- wp:bisiesto/imagen-texto <?= $attrs; ?> -->
<!-- wp:heading -->
<h2 class="wp-block-heading">Título de la sección</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Escribe aquí el texto descriptivo. Sustituye la imagen por una de tu biblioteca de medios usando el panel lateral.</p>
<!-- /wp:paragraph -->

<!-- wp:buttons -->
<div class="wp-block-buttons"><!-- wp:button -->
<div class="wp-block-button"><a class="wp-block-button__link wp-element-button">Reserva ahora</a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons -->
<!-- /wp:bisiesto/imagen-texto -->
