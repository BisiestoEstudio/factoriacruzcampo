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

add_shortcode( 'year', function() {
    return date_i18n( 'Y' );
} );
