<?php
/**
 * Plugin Name:       Factoria Cruzcampo Blocks
 * Plugin URI:        https://factoriacruzcampo.es
 * Description:       Bloques Gutenberg del proyecto Factoría Cruzcampo.
 * Version:           1.0.0
 * Author:            Bisiesto
 * Author URI:        https://bisiesto.es
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       factoria-cruzcampo-blocks
 * Domain Path:       /languages
 */

defined( 'ABSPATH' ) || exit;

define( 'FCB_VERSION',    '1.0.0' );
define( 'FCB_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'FCB_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

include_once 'includes/utils.php';
include_once 'includes/blocks.php';
