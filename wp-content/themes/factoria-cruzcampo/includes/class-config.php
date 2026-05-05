<?php

class Bisiestheme_Config
{

    static function init()
    {
        add_action('init', array(__CLASS__, 'menu_register'));
        add_action('after_setup_theme', array(__CLASS__, 'customize_bisiestheme'));
        add_filter('style_loader_tag', array(__CLASS__, 'add_rel_preload'), 10, 4);
        add_action('init', array(__CLASS__, 'remove_headlinks'));
        add_filter('upload_mimes', array(__CLASS__, 'allow_svg'));
    }


    /**
     * Register menu for theme
     */
    static function menu_register()
    {
        register_nav_menus(
            array(
                'menu-principal'    =>  __('Main menu', 'factoria-cruzcampo'),
                'menu-footer'       =>  __('Footer menu', 'factoria-cruzcampo')
            )
        );
    }



    /**
     * Customize theme
     */
    static function customize_bisiestheme()
    {
        // Allow alignwide and fullalign Gutenberg
        add_theme_support('align-wide');
        // Allow post-thumbnail
        add_theme_support('post-thumbnails');
        add_theme_support('title-tag');
    }


    /**
     * Add preload to CSS files
     */
    static function add_rel_preload($html, $handle, $href, $media)
    {
        if (is_admin()) {
            return $html;
        }
        $assets = ['wp-block-library'];
        if (! in_array($handle, $assets)) {
            return $html;
        }
        $html = <<<EOT
<link rel='preload' as='style' id='$handle' href='$href' type='text/css' media='$media' />
EOT;
        return $html;
    }


    /**
     * Remove unnecessary links from the head
     */
    static function remove_headlinks()
    {
        remove_action('wp_head', 'wp_generator');
        remove_action('wp_head', 'rsd_link');
        remove_action('wp_head', 'print_emoji_detection_script', 7);
        remove_action('wp_print_styles', 'print_emoji_styles');
        remove_filter('wp_mail', 'wp_staticize_emoji_for_email');
    }



    /**
     * Allow SVG images
     */
    static function allow_svg($mimes = array())
    {
        $mimes['svg'] = 'image/svg+xml';
        $mimes['svgz'] = 'image/svg+xml';
        return $mimes;
    }
}

Bisiestheme_Config::init();