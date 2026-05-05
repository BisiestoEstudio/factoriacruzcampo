<?php
defined( 'ABSPATH' ) || exit;
/**
 * Función para debuggear. Saca los datos en un formato más legible.
 */
function bis_debug($datos){
    echo '<pre>';
    print_r($datos);
    echo '</pre>';
}

function bis_get_block_variation( $block_attrs ) {
    $class_name = $block_attrs['className'] ?? '';
    if ( preg_match( '/\bis-style-([\w-]+)\b/', $class_name, $matches ) ) {
        return $matches[1];
    }
    return null;
}