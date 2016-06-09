<?php

/**
 * Plugin Name: GA Section Tracker
 * Plugin URI: http://codigo5.com.br
 * Description: Automagically plugin that tracks on Google Analytics through your scroll for one-page layouts.
 * Version: 1.0.0
 * Author: Dhyego Fernando at Codigo5.com.br
 * Author URI: https://github.com/dhyegofernando
 * License: MIT
 */

wp_register_style( 'ga-section-tracker', plugins_url( 'ga-section-tracker/assets/css/ga-section-tracker.css' ) );

wp_register_script( 'jquery-throttle-debounce', plugins_url( 'ga-section-tracker/lib/jquery.ba-throttle-debounce.min.js' ), array( 'jquery' ) );
wp_register_script( 'scroll-tracker', plugins_url( 'ga-section-tracker/assets/js/scroll-tracker.js' ), array( 'jquery-throttle-debounce' ) );
wp_register_script( 'ga-detector', plugins_url( 'ga-section-tracker/assets/js/ga-detector.js' ), array( 'jquery' ) );
wp_register_script( 'ga-section-tracker', plugins_url( 'ga-section-tracker/assets/js/ga-section-tracker.js' ), array(
  'ga-detector',
  'scroll-tracker'
), true );

wp_enqueue_style( 'ga-section-tracker' );
wp_enqueue_script( 'jquery-throttle-debounce' );
wp_enqueue_script( 'scroll-tracker' );
wp_enqueue_script( 'ga-detector' );
wp_enqueue_script( 'ga-section-tracker' );
