<?php
defined( 'ABSPATH' ) || exit;

/** @var array $attributes */
/** @var WP_Block|null $block */

$option = isset( $attributes['option'] ) ? (string) $attributes['option'] : '1';
$template_name = 'templates/template_' . esc_attr( $option ) . '.php';

if ( file_exists( __DIR__ . '/' . $template_name ) ) {
	include __DIR__ . '/' . $template_name;
}




