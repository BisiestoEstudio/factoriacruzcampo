<?php
defined( 'ABSPATH' ) || exit;

/*********************************
 * DEFINES
***********************************/
define( 'BISIESTHEME_VERSION', wp_get_theme()->get( 'Version' ) );
define( 'BISIESTHEME_DIR', get_template_directory() );
define( 'BISIESTHEME_URI', get_template_directory_uri() );


/**********************************
 * INCLUDES
***********************************/
include_once get_template_directory() . '/includes/utils.php';
include_once get_template_directory() . '/includes/class-config.php';
include_once get_template_directory() . '/includes/class-assets.php';


