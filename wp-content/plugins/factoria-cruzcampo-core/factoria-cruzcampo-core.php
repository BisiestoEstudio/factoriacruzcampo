<?php
/**
 * Plugin Name:       Factoria Cruzcampo Core
 * Plugin URI:        https://factoria.es
 * Description:       Plugin principal del proyecto Cruzcampo. Gestiona CPTs y funcionalidades core.
 * Version:           1.0.0
 * Author:            Factoria
 * Author URI:        https://factoria.es
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       factoria-cruzcampo-core
 * Domain Path:       /languages
 */

defined( 'ABSPATH' ) || exit;

define( 'FCC_VERSION', '1.0.0' );
define( 'FCC_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'FCC_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

require_once FCC_PLUGIN_DIR . 'includes/config.php';
require_once FCC_PLUGIN_DIR . 'includes/class-loader.php';

register_activation_hook( __FILE__, array( 'FCC_Loader', 'activate' ) );
register_deactivation_hook( __FILE__, array( 'FCC_Loader', 'deactivate' ) );

FCC_Loader::init();
